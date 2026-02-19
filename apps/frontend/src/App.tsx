import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Activity from '@/pages/Activity';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AuthCallback from '@/pages/AuthCallback';
import Waitlist from '@/pages/Waitlist';
import VerifyEmail from '@/pages/VerifyEmail';
import Admin from '@/pages/Admin';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/waitlist" element={<Waitlist />} />

      {/* Authenticated but pre-launch routes */}
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute skipLaunchCheck>
            <VerifyEmail />
          </ProtectedRoute>
        }
      />

      {/* Protected dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/plans" element={<Dashboard />} />
        <Route path="/dashboard/activity" element={<Activity />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>

      {/* Admin routes (protected + admin role required) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
