// ─── Auth Callback Page ──────────────────────────────────────────────
// Handles OAuth callback redirects and token storage.
// Redirects to /waitlist (not dashboard) since dashboard is locked pre-launch.

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=oauth_failed');
        return;
      }

      if (token && userId) {
        try {
          // Temporarily set token so API calls work
          const tempUser = { id: userId, name: null, email: null, role: 'USER' };
          setAuth(tempUser, token);

          // Get full user profile (includes launchAccessGranted)
          const profile = await authApi.getProfile();

          setAuth(
            {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              emailVerified: profile.emailVerified,
              launchAccessGranted: profile.launchAccessGranted,
              waitlistPosition: profile.waitlistPosition,
            },
            token,
          );

          // Redirect based on launch access
          if (profile.role === 'ADMIN') {
            navigate('/admin');
          } else if (profile.launchAccessGranted) {
            navigate('/dashboard');
          } else {
            navigate('/waitlist');
          }
        } catch {
          navigate('/login?error=oauth_failed');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
