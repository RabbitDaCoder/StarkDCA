import { Bitcoin, Wallet, ChevronDown, LogOut, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <Bitcoin className="h-5 w-5 text-primary" />
        <span className="font-semibold">StarkDCA</span>
      </div>

      {/* Page context — empty for now, can be breadcrumbs */}
      <div className="hidden lg:block" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:inline-flex">
          Sepolia
        </Badge>

        {connected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                <Wallet className="h-3.5 w-3.5" />
                {shortenAddress(address)}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-mono text-xs font-normal text-muted-foreground">
                {shortenAddress(address, 6)}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://sepolia.voyager.online/contract/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnect} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" onClick={connect} className="gap-2">
            <Wallet className="h-3.5 w-3.5" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
