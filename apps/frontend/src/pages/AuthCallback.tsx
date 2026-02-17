// ─── Auth Callback Page ──────────────────────────────────────────────
// Handles OAuth callback redirects and token storage.

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
          // Get full user profile
          const profile = await authApi.getProfile();

          setAuth(
            {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
            },
            token,
          );

          navigate('/dashboard');
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
