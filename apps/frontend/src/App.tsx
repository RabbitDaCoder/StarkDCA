import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Activity from '@/pages/Activity';
import Settings from '@/pages/Settings';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/plans" element={<Dashboard />} />
        <Route path="/dashboard/activity" element={<Activity />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
