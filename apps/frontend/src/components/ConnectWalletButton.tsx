/**
 * ConnectWalletButton — Unified wallet connect/disconnect button.
 *
 * Opens starknetkit’s built-in modal popup (shows Argent + Braavos)
 * and connects through @starknet-react/core so all contract hooks work.
 */
import { useState } from 'react';
import { Wallet, Copy, Check, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { truncateAddress, useStarknetConnect } from '@/hooks';

interface ConnectWalletButtonProps {
  /** Compact mode for navbar */
  compact?: boolean;
}

export function ConnectWalletButton({ compact = false }: ConnectWalletButtonProps) {
  const { address, isConnected, isConnecting, connect, disconnect } = useStarknetConnect();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Connected state ──────────────────────────────────────────────
  if (isConnected && address) {
    if (compact) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-2.5 py-1.5">
          <Wallet className="h-3 w-3 text-brand-orange" />
          <code className="text-xs font-mono text-brand-orange">{truncateAddress(address)}</code>
          <button
            onClick={copyAddress}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/5 px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
        <code className="text-xs font-mono text-foreground">{truncateAddress(address)}</code>
        <button
          onClick={copyAddress}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  // ── Disconnected — open starknetkit wallet picker modal ───────
  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={connect}
        disabled={isConnecting}
        className="gap-1.5 text-xs text-muted-foreground hover:text-brand-orange"
      >
        <Wallet className="h-3.5 w-3.5" />
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="gap-2 border-brand-orange/50 text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange"
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      <span className="sm:hidden">{isConnecting ? '...' : 'Wallet'}</span>
    </Button>
  );
}
