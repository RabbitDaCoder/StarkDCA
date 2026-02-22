import { useState } from 'react';
import {
  Plus,
  TrendingUp,
  Activity,
  BarChart3,
  Wallet,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SummaryCards, PlansTable, CreatePlanModal, useDashboard } from '@/features/dca';
import { PlanStatus } from '@stark-dca/shared-types';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { plans, summary, portfolio, loading, cancelPlan } = useDashboard();
  const { user } = useAuthStore();
  const { address, connected, connecting, connect, disconnect } = useWalletStore();

  const activePlans = plans.filter((p) => p.status === PlanStatus.Active);
  const recentPlans = plans.slice(0, 5); // Show at most 5 on dashboard

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your DCA plans and track your BTC accumulation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Wallet connect / status */}
          {connected && address ? (
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
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={connecting}
              variant="outline"
              className="gap-2 border-brand-orange/50 text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange"
            >
              <Wallet className="h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <Link to="/app/history">
            <Button variant="outline" className="gap-2 border-border/50">
              <Activity className="h-4 w-4" />
              Activity
            </Button>
          </Link>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-brand-orange hover:bg-brand-orange/90 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Create New Plan
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="glass rounded-2xl border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-blue/10 via-brand-orange/5 to-brand-gold/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-brand-orange">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-heading font-bold text-foreground">
                {user?.name || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {user?.emailVerified && (
                  <Badge
                    variant="outline"
                    className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xs"
                  >
                    Email Verified
                  </Badge>
                )}
                {user?.launchAccessGranted && (
                  <Badge
                    variant="outline"
                    className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange text-xs"
                  >
                    Early Access
                  </Badge>
                )}
                {connected && address ? (
                  <Badge
                    variant="outline"
                    className="border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-xs gap-1"
                  >
                    <Wallet className="h-3 w-3" />
                    {truncateAddress(address)}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs text-muted-foreground">
                    No Wallet
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{plans.length}</p>
                <p className="text-xs text-muted-foreground">Total Plans</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{activePlans.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary cards with portfolio stats */}
      <SummaryCards summary={summary} portfolio={portfolio} />

      {/* Automation status banner */}
      {activePlans.length > 0 && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-brand-blue/5 to-brand-orange/5">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-foreground">Automation Active</p>
                  <p className="text-xs text-muted-foreground">
                    {activePlans.length} plan{activePlans.length !== 1 ? 's' : ''} running &bull;
                    DCA engine executing on schedule
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-600">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans table */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-orange/10">
              <TrendingUp className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg text-foreground">Your DCA Plans</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activePlans.length} active &bull; {plans.length} total
              </p>
            </div>
          </div>
          {plans.length > 5 && (
            <Link to="/app/plans">
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-orange hover:text-brand-orange/80"
              >
                View All
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="px-0 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading your plans...</p>
            </div>
          ) : (
            <PlansTable plans={recentPlans} onCancel={cancelPlan} />
          )}
        </CardContent>
      </Card>

      {/* Create Plan Modal */}
      <CreatePlanModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
