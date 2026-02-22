import {
  DollarSign,
  Repeat,
  Bitcoin,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PortfolioSummary } from '@stark-dca/shared-types';
import type { DashboardSummary } from '../types';
import { formatCurrency, formatBtc, timeUntil } from '@/lib/utils';

interface Props {
  summary: DashboardSummary;
  portfolio?: PortfolioSummary | null;
}

export function SummaryCards({ summary, portfolio }: Props) {
  const cards = [
    {
      key: 'deposited',
      label: 'Total Deposited',
      icon: DollarSign,
      value: formatCurrency(summary.totalDeposited),
      sub: 'USDT across all plans',
      iconBg: 'bg-brand-orange/10',
      iconColor: 'text-brand-orange',
    },
    {
      key: 'active',
      label: 'Active Plans',
      icon: Repeat,
      value: String(summary.activePlans),
      sub: portfolio ? `${portfolio.totalPlans} total plans` : 'Currently running',
      iconBg: 'bg-brand-blue/10',
      iconColor: 'text-brand-blue',
    },
    {
      key: 'btc',
      label: 'BTC Accumulated',
      icon: Bitcoin,
      value: formatBtc(summary.btcAccumulated),
      sub: portfolio ? `Avg entry: ${formatCurrency(portfolio.avgEntryPrice)}` : 'Total purchased',
      iconBg: 'bg-brand-gold/10',
      iconColor: 'text-brand-gold',
    },
    {
      key: 'next',
      label: 'Next Execution',
      icon: Clock,
      value: summary.nextExecutionIn ? timeUntil(summary.nextExecutionIn) : '—',
      sub: summary.nextExecutionIn ? 'Until next buy' : 'No active plans',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.key} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{c.label}</p>
                  <p className="text-2xl font-heading font-bold text-foreground tracking-tight">
                    {c.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${c.iconBg}`}>
                  <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary stats row (only when portfolio data available) */}
      {portfolio && portfolio.totalExecutions > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-brand-blue/10">
                <BarChart3 className="h-4 w-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Invested</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {formatCurrency(portfolio.totalInvested)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Successful Buys</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {portfolio.successfulExecutions}
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    / {portfolio.totalExecutions}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-brand-gold/10">
                <TrendingUp className="h-4 w-4 text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Entry Price</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {formatCurrency(portfolio.avgEntryPrice)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
