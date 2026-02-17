import { Wallet, ChevronDown, LogOut, User, ExternalLink, Menu } from 'lucide-react';
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
import { useWalletStore } from '@/store/wallet.store';
import { shortenAddress } from '@/lib/utils';

export function Navbar() {
  const { address, connected, connect, disconnect } = useWalletStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Mobile logo & menu */}
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src={starkDCALogo} alt="StarkDCA" className="h-8 w-auto" />
          <span className="font-heading font-bold text-brand-blue">StarkDCA</span>
        </div>
      </div>

      {/* Page context / breadcrumb */}
      <div className="hidden lg:block">
        <h2 className="font-heading font-semibold text-brand-blue">Dashboard</h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Badge
          variant="outline"
          className="hidden sm:inline-flex border-green-200 bg-green-50 text-green-700"
        >
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Sepolia
        </Badge>

        {connected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono text-xs border-brand-blue/20 hover:border-brand-orange hover:bg-brand-orange/5"
              >
                <Wallet className="h-4 w-4 text-brand-orange" />
                {shortenAddress(address)}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-mono text-xs font-normal text-muted-foreground">
                {shortenAddress(address, 6)}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://sepolia.voyager.online/contract/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={disconnect}
                className="text-destructive cursor-pointer focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            onClick={connect}
            className="gap-2 bg-brand-orange hover:bg-brand-orange/90"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
