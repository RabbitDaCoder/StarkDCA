import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  BarChart3,
  Server,
  Mail,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/plans', icon: ScrollText, label: 'Plans' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/emails', icon: Mail, label: 'Emails' },
  { to: '/admin/system', icon: Server, label: 'System' },
];

function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-4 py-6">
      {adminLinks.map((link) => (
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

function AdminSidebarHeader() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
      <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
      <div className="flex flex-col">
        <span className="font-heading text-sm font-bold text-sidebar-foreground">StarkDCA</span>
        <span className="flex items-center gap-1 text-[10px] text-brand-orange font-semibold uppercase tracking-wider">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      </div>
    </div>
  );
}

function AdminSidebarFooter() {
  return (
    <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
      <a
        href="/app/dashboard"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs text-sidebar-foreground/60 hover:bg-white/10 hover:text-sidebar-foreground transition-colors"
      >
        ← Back to User Dashboard
      </a>
      <div className="flex items-center gap-2 px-4">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden w-[240px] flex-shrink-0 flex-col bg-sidebar lg:flex">
        <AdminSidebarHeader />
        <AdminSidebarNav />
        <AdminSidebarFooter />
      </aside>

      {/* Mobile Admin Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <AdminSidebarHeader />
          <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
          <AdminSidebarFooter />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <Shield className="h-5 w-5 text-brand-orange" />
            <h2 className="font-heading font-semibold text-foreground">Admin Panel</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-sm border-border">
                    <div className="h-6 w-6 rounded-full bg-brand-orange/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-orange">
                        {user.name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-foreground">{user.name || 'Admin'}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
