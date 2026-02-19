// ─── Protected Route Component ───────────────────────────────────────
// Wraps routes that require authentication.
// Enforces dashboard lock: redirects to /waitlist if launchAccessGranted is false.
// Use skipLaunchCheck for pre-dashboard auth routes (e.g. verify-email).

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  skipLaunchCheck?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  skipLaunchCheck = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    // Redirect non-admins to waitlist (dashboard locked)
    return <Navigate to="/waitlist" replace />;
  }

  // Dashboard lock: if user doesn't have launch access, redirect to waitlist
  // Admins and routes with skipLaunchCheck bypass this check
  if (!requireAdmin && !skipLaunchCheck && user?.role !== 'ADMIN' && !user?.launchAccessGranted) {
    return <Navigate to="/waitlist" replace />;
  }

  return <>{children}</>;
}
