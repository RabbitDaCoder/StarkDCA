import { useState } from 'react';
import { Interval } from '@stark-dca/shared-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDcaStore } from '@/store/dca.store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanModal({ open, onOpenChange }: Props) {
  const { createPlan, loading } = useDcaStore();

  const [amount, setAmount] = useState('');
  const [executions, setExecutions] = useState('');
  const [interval, setIntervalValue] = useState<Interval>(Interval.Weekly);

  const isValid = amount && parseFloat(amount) > 0 && executions && parseInt(executions) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    await createPlan(amount, parseInt(executions, 10), interval);
    setAmount('');
    setExecutions('');
    setIntervalValue(Interval.Weekly);
    onOpenChange(false);
  };

  const totalCost =
    amount && executions ? (parseFloat(amount) * parseInt(executions)).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create DCA Plan</DialogTitle>
          <DialogDescription>
            Set up an automated recurring BTC purchase with USDT.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount per buy (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Executions */}
          <div className="grid gap-2">
            <Label htmlFor="executions">Number of buys</Label>
            <Input
              id="executions"
              type="number"
              placeholder="10"
              min="1"
              value={executions}
              onChange={(e) => setExecutions(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Select value={interval} onValueChange={(v) => setIntervalValue(v as Interval)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Interval.Daily}>Daily</SelectItem>
                <SelectItem value={Interval.Weekly}>Weekly</SelectItem>
                <SelectItem value={Interval.Biweekly}>Biweekly</SelectItem>
                <SelectItem value={Interval.Monthly}>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {amount && executions && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Total deposit:{' '}
                <span className="font-semibold text-foreground">${totalCost} USDT</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {executions} buys &times; ${amount} each &bull; {interval}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Creating...' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
