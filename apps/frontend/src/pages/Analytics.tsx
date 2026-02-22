import { useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Bitcoin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDcaStore } from '@/store/dca.store';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatBtc } from '@/lib/utils';

interface BarData {
  label: string;
  value: number;
  btc: number;
}

/**
 * Simple bar chart rendered with CSS (no chart library dependency).
 */
function MiniBarChart({ data, maxValue }: { data: BarData[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => {
        const height = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative group">
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-orange to-brand-orange/60 transition-all hover:from-brand-orange hover:to-brand-orange/80 cursor-default"
                style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px' }}
              />
              {/* Tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {formatCurrency(d.value)}
                <br />
                {d.btc.toFixed(8)} BTC
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuthStore();
  const {
    executions,
    portfolio,
    fetchExecutions,
    fetchPortfolio,
    executionsLoading,
    portfolioLoading,
  } = useDcaStore();

  useEffect(() => {
    if (user) {
      fetchPortfolio();
      fetchExecutions(true);
    }
  }, [user, fetchPortfolio, fetchExecutions]);

  // Group executions by week for chart
  const weeklyData = useMemo(() => {
    const successfulExecs = executions.filter((e) => e.status === 'SUCCESS');
    if (successfulExecs.length === 0) return [];

    const buckets: Record<string, { value: number; btc: number }> = {};

    for (const exec of successfulExecs) {
      const date = new Date((exec as any).executedAt || (exec as any).executed_at || Date.now());
      // Weekly bucket key: year-week
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

      if (!buckets[key]) buckets[key] = { value: 0, btc: 0 };
      buckets[key].value += parseFloat(exec.amountIn || '0');
      buckets[key].btc += parseFloat(exec.amountOut || '0');
    }

    return Object.entries(buckets)
      .slice(-8) // Last 8 weeks
      .map(([label, data]) => ({ label, ...data }));
  }, [executions]);

  const maxChartValue = Math.max(...weeklyData.map((d) => d.value), 1);

  const loading = portfolioLoading || executionsLoading;

  if (loading && !portfolio) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Charts and performance metrics for your DCA strategy
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalBtc = portfolio?.btcAccumulated || 0;
  const avgPrice = portfolio?.avgEntryPrice || 0;
  const totalInvested = portfolio?.totalInvested || 0;
  const successRate =
    portfolio && portfolio.totalExecutions > 0
      ? ((portfolio.successfulExecutions / portfolio.totalExecutions) * 100).toFixed(1)
      : '0';

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-brand-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Charts and performance metrics for your DCA strategy
          </p>
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Total BTC</p>
              <Bitcoin className="h-4 w-4 text-brand-gold" />
            </div>
            <p className="text-xl font-heading font-bold text-brand-gold">{formatBtc(totalBtc)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <DollarSign className="h-4 w-4 text-brand-blue" />
            </div>
            <p className="text-xl font-heading font-bold text-foreground">
              {formatCurrency(totalInvested)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Avg Entry Price</p>
              <TrendingUp className="h-4 w-4 text-brand-orange" />
            </div>
            <p className="text-xl font-heading font-bold text-foreground">
              {formatCurrency(avgPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              {parseFloat(successRate) >= 90 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xl font-heading font-bold text-foreground">{successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly accumulation chart */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <CardTitle className="text-foreground font-heading">Weekly Accumulation</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">USDT invested per week</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {weeklyData.length > 0 ? (
            <MiniBarChart data={weeklyData} maxValue={maxChartValue} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No execution data yet. Charts will appear after your first plan executes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution breakdown */}
      {portfolio && portfolio.totalExecutions > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Success/fail ratio */}
          <Card className="glass rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-heading text-foreground">
                Execution Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600 font-medium">Successful</span>
                    <span className="text-muted-foreground">{portfolio.successfulExecutions}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${(portfolio.successfulExecutions / portfolio.totalExecutions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-500 font-medium">Failed</span>
                    <span className="text-muted-foreground">{portfolio.failedExecutions}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{
                        width: `${(portfolio.failedExecutions / portfolio.totalExecutions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan overview */}
          <Card className="glass rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-heading text-foreground">Plan Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-heading font-bold text-brand-blue">
                    {portfolio.activePlans}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {portfolio.totalPlans}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2">
                  <p className="text-2xl font-heading font-bold text-brand-gold">
                    {formatCurrency(portfolio.totalDeposited)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Deposited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
