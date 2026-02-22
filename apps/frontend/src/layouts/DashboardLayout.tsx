import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Repeat, Activity, Settings, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import starkDCALogo from '@/assets/starkDCA.png';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

const sidebarLinks = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/app/plans', icon: Repeat, label: 'DCA Plans' },
  { to: '/app/history', icon: Activity, label: 'Activity' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-4 py-6">
      {sidebarLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-accent text-white shadow-lg'
                : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground',
            )
          }
        >
          <link.icon className="h-5 w-5" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] flex-shrink-0 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
          <span className="font-heading text-lg font-bold text-sidebar-foreground">StarkDCA</span>
        </div>
        <SidebarNav />
        <div className="border-t border-sidebar-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-sidebar-foreground/60">Starknet Sepolia</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
            <span className="font-heading text-lg font-bold text-sidebar-foreground">StarkDCA</span>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-sidebar-border px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-sidebar-foreground/60">Starknet Sepolia</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
