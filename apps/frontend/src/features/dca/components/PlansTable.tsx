import { MoreHorizontal, Pause, XCircle } from 'lucide-react';
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

const statusBadge: Record<PlanStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }> = {
  [PlanStatus.Active]: { label: 'Active', variant: 'success' },
  [PlanStatus.Paused]: { label: 'Paused', variant: 'warning' },
  [PlanStatus.Cancelled]: { label: 'Cancelled', variant: 'destructive' },
  [PlanStatus.Completed]: { label: 'Completed', variant: 'secondary' },
};

function planDisplayName(plan: DCAPlan): string {
  const freq = plan.interval.charAt(0).toUpperCase() + plan.interval.slice(1);
  return `${freq} BTC Buy`;
}

export function PlansTable({ plans, onCancel }: Props) {
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">No DCA plans yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first plan to start accumulating BTC automatically.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Next Execution</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => {
          const badge = statusBadge[plan.status];
          const progress = plan.totalExecutions > 0
            ? Math.round((plan.executionsCompleted / plan.totalExecutions) * 100)
            : 0;

          return (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{planDisplayName(plan)}</TableCell>
              <TableCell>{formatCurrency(parseFloat(plan.amountPerExecution))}</TableCell>
              <TableCell className="capitalize">{plan.interval}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {plan.executionsCompleted}/{plan.totalExecutions}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {plan.status === PlanStatus.Active ? timeUntil(plan.nextExecutionAt) : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </TableCell>
              <TableCell>
                {plan.status === PlanStatus.Active && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCancel(plan.id)}
                        className="text-destructive"
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
