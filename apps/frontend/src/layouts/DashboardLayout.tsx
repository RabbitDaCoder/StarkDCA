import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Repeat, Activity, Settings, Trophy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import starkDCALogo from '@/assets/starkDCA.png';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/plans', icon: Repeat, label: 'DCA Plans' },
  { to: '/dashboard/activity', icon: Activity, label: 'Activity' },
  { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray">
      {/* Sidebar */}
      <aside className="hidden w-[240px] flex-shrink-0 flex-col bg-brand-blue lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
          <span className="font-heading text-lg font-bold text-white">StarkDCA</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-orange text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-white/60">Starknet Sepolia</p>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-brand-gray p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
