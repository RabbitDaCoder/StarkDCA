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
    iconBg: 'bg-brand-orange/10',
    iconColor: 'text-brand-orange',
  },
  {
    key: 'active',
    label: 'Active Plans',
    icon: Repeat,
    format: (s: DashboardSummary) => String(s.activePlans),
    sub: 'Currently running',
    iconBg: 'bg-brand-blue/10',
    iconColor: 'text-brand-blue',
  },
  {
    key: 'btc',
    label: 'BTC Accumulated',
    icon: Bitcoin,
    format: (s: DashboardSummary) => formatBtc(s.btcAccumulated),
    sub: 'Total purchased',
    iconBg: 'bg-brand-gold/10',
    iconColor: 'text-gold',
  },
  {
    key: 'next',
    label: 'Next Execution',
    icon: Clock,
    format: (s: DashboardSummary) => timeUntil(s.nextExecutionIn),
    sub: 'Until next buy',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
] as const;

export function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.key} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{c.label}</p>
                <p className="text-2xl font-heading font-bold text-gold tracking-tight">
                  {c.format(summary)}
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
  );
}
