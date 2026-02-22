import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Activity from '@/pages/Activity';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';
import Waitlist from '@/pages/Waitlist';
import VerifyEmail from '@/pages/VerifyEmail';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy-load admin pages
import { lazy, Suspense } from 'react';
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminPlans = lazy(() => import('@/pages/admin/AdminPlans'));
const AdminEmails = lazy(() => import('@/pages/admin/AdminEmails'));
const AdminSystem = lazy(() => import('@/pages/admin/AdminSystem'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));

function AdminFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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

      {/* Protected user dashboard routes (/app/*) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/plans" element={<Dashboard />} />
        <Route path="/app/history" element={<Activity />} />
        <Route path="/app/analytics" element={<Dashboard />} />
        <Route path="/app/settings" element={<Settings />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard/*" element={<Navigate to="/app/dashboard" replace />} />

      {/* Admin login (public, no auth required) */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLogin />
          </Suspense>
        }
      />

      {/* Admin routes (/admin/*) */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminUsers />
            </Suspense>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminPlans />
            </Suspense>
          }
        />
        <Route
          path="/admin/emails"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminEmails />
            </Suspense>
          }
        />
        <Route
          path="/admin/system"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminSystem />
            </Suspense>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminAnalytics />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
