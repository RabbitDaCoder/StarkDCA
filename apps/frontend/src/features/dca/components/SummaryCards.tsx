import { DollarSign, Repeat, Bitcoin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '../types';
import { formatCurrency, formatBtc, timeUntil } from '@/lib/utils';

interface Props {
  summary: DashboardSummary;
}

const cards = [
  {
    key: 'deposited',
    label: 'Total Deposited',
    icon: DollarSign,
    format: (s: DashboardSummary) => formatCurrency(s.totalDeposited),
    sub: 'USDT across all plans',
  },
  {
    key: 'active',
    label: 'Active Plans',
    icon: Repeat,
    format: (s: DashboardSummary) => String(s.activePlans),
    sub: 'Currently running',
  },
  {
    key: 'btc',
    label: 'BTC Accumulated',
    icon: Bitcoin,
    format: (s: DashboardSummary) => formatBtc(s.btcAccumulated),
    sub: 'Total purchased',
  },
  {
    key: 'next',
    label: 'Next Execution',
    icon: Clock,
    format: (s: DashboardSummary) => timeUntil(s.nextExecutionIn),
    sub: 'Until next buy',
  },
] as const;

export function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.key}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{c.format(summary)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
