import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDcaStore } from '@/store/dca.store';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';

function timeAgo(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function shortenHash(hash: string): string {
  if (!hash) return '—';
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default function Activity() {
  const { user } = useAuthStore();
  const {
    executions,
    executionsLoading,
    hasMoreExecutions,
    portfolio,
    fetchExecutions,
    fetchPortfolio,
  } = useDcaStore();

  useEffect(() => {
    if (user) {
      fetchExecutions(true);
      fetchPortfolio();
    }
  }, [user, fetchExecutions, fetchPortfolio]);

  const successCount = portfolio?.successfulExecutions || 0;
  const failedCount = portfolio?.failedExecutions || 0;
  const totalVolume = portfolio?.totalInvested || 0;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
            <History className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground">View your DCA execution history</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-border/50 text-foreground hover:bg-surface-elevated"
          disabled
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass rounded-2xl border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful Executions</p>
                <p className="text-3xl font-heading font-bold text-green-500">{successCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Executions</p>
                <p className="text-3xl font-heading font-bold text-red-500">{failedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-2xl border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-3xl font-heading font-bold text-brand-gold">
                  {formatCurrency(totalVolume)}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution History Card */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-brand-orange" />
            </div>
            <CardTitle className="text-foreground font-heading">Execution History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {executions.length > 0 ? (
            <div className="space-y-3">
              {executions.map((exec) => {
                const isSuccess = exec.status === 'SUCCESS';
                const executedAt =
                  (exec as any).executedAt || (exec as any).executed_at || exec.executedAt;
                return (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl hover:bg-muted transition-colors border border-border/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">DCA Execution</p>
                          <Badge
                            variant="outline"
                            className={
                              isSuccess
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {isSuccess ? 'Success' : 'Failed'}
                          </Badge>
                          {(exec as any).executionNumber && (
                            <span className="text-xs text-muted-foreground">
                              #{(exec as any).executionNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {exec.txHash && (
                            <a
                              href={`https://starkscan.co/tx/${exec.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {shortenHash(exec.txHash)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {!isSuccess && (exec as any).errorMessage && (
                            <span className="text-sm text-red-400">
                              {(exec as any).errorMessage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isSuccess && exec.amountOut ? (
                        <>
                          <p className="font-semibold text-brand-gold">
                            +{parseFloat(exec.amountOut).toFixed(8)} BTC
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(parseFloat(exec.amountIn))} &bull;{' '}
                            {exec.priceAtExecution
                              ? `$${Number(exec.priceAtExecution).toLocaleString()}`
                              : ''}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(parseFloat(exec.amountIn || '0'))}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {executedAt ? timeAgo(executedAt) : ''}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Load more */}
              {hasMoreExecutions && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchExecutions(false)}
                    disabled={executionsLoading}
                    className="border-border/50"
                  >
                    {executionsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : executionsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading execution history...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
                <History className="h-10 w-10 text-brand-orange/40" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                No executions yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Execution logs will appear here once your first DCA plan runs. Create a plan to get
                started.
              </p>
              <Button className="mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl shadow-lg shadow-brand-orange/20">
                Create Your First Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
