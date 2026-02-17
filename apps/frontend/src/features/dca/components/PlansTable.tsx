import { MoreHorizontal, Pause, XCircle, Repeat } from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { PlanStatus, type DCAPlan } from '@stark-dca/shared-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, timeUntil } from '@/lib/utils';

interface Props {
  plans: DCAPlan[];
  onCancel: (planId: string) => void;
}

const statusBadge: Record<PlanStatus, { label: string; className: string }> = {
  [PlanStatus.Active]: {
    label: 'Active',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  [PlanStatus.Paused]: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  [PlanStatus.Cancelled]: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  [PlanStatus.Completed]: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

function planDisplayName(plan: DCAPlan): string {
  const freq = plan.interval.charAt(0).toUpperCase() + plan.interval.slice(1);
  return `${freq} BTC Buy`;
}

export function PlansTable({ plans, onCancel }: Props) {
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-gray flex items-center justify-center mb-4">
          <Repeat className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="font-heading font-semibold text-brand-blue mb-1">No DCA plans yet</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first plan to start accumulating BTC automatically.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-brand-gray/50 hover:bg-brand-gray/50">
          <TableHead className="font-heading text-brand-blue">Plan</TableHead>
          <TableHead className="font-heading text-brand-blue">Amount</TableHead>
          <TableHead className="font-heading text-brand-blue">Frequency</TableHead>
          <TableHead className="font-heading text-brand-blue">Progress</TableHead>
          <TableHead className="font-heading text-brand-blue">Next Execution</TableHead>
          <TableHead className="font-heading text-brand-blue">Status</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => {
          const badge = statusBadge[plan.status];
          const progress =
            plan.totalExecutions > 0
              ? Math.round((plan.executionsCompleted / plan.totalExecutions) * 100)
              : 0;

          return (
            <TableRow key={plan.id} className="hover:bg-brand-gray/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                    <img src={starkDCALogo} alt="" className="h-6 w-auto" />
                  </div>
                  <span className="font-medium">{planDisplayName(plan)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-gold">
                  {formatCurrency(parseFloat(plan.amountPerExecution))}
                </span>
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{plan.interval}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-brand-gray">
                    <div
                      className="h-full rounded-full bg-brand-orange transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {plan.executionsCompleted}/{plan.totalExecutions}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {plan.status === PlanStatus.Active ? (
                  <span className="font-medium text-brand-blue">
                    {timeUntil(plan.nextExecutionAt)}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={badge.className}>
                  {badge.label}
                </Badge>
              </TableCell>
              <TableCell>
                {plan.status === PlanStatus.Active && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-brand-gray">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled className="text-muted-foreground">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCancel(plan.id)}
                        className="text-destructive focus:bg-destructive/10"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
