import { ChevronDown, LogOut, User, Menu, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';
import { ThemeToggle } from '@/components/landing/ThemeToggle';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { address, connected, connecting, connect } = useWalletStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      {/* Mobile logo & menu */}
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <div className="flex items-center gap-2">
          <img src={starkDCALogo} alt="StarkDCA" className="h-8 w-auto" />
          <span className="font-heading font-bold text-foreground">StarkDCA</span>
        </div>
      </div>

      {/* Page context / breadcrumb */}
      <div className="hidden lg:block">
        <h2 className="font-heading font-semibold text-foreground">Dashboard</h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Wallet indicator */}
        {connected && address ? (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex border-brand-orange/30 bg-brand-orange/10 text-brand-orange gap-1.5"
          >
            <Wallet className="h-3 w-3" />
            {address.slice(0, 4)}...{address.slice(-3)}
          </Badge>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={connect}
            disabled={connecting}
            className="hidden sm:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-brand-orange"
          >
            <Wallet className="h-3.5 w-3.5" />
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}

        <Badge
          variant="outline"
          className="hidden sm:inline-flex border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
        >
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Sepolia
        </Badge>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-sm border-border hover:border-primary hover:bg-primary/5"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-foreground">
                  {user.name || user.email || 'Account'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive cursor-pointer focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
