import { useState, useEffect } from 'react';
import { Plus, Repeat, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlansTable, CreatePlanModal } from '@/features/dca';
import { useDcaStore } from '@/store/dca.store';
import { useAuthStore } from '@/store/auth.store';

export default function Plans() {
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { user } = useAuthStore();
  const { plans, loading, fetchPlans, cancelPlan } = useDcaStore();

  useEffect(() => {
    if (user) {
      fetchPlans(statusFilter === 'ALL' ? undefined : statusFilter);
    }
  }, [user, statusFilter, fetchPlans]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
            <Repeat className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">DCA Plans</h1>
            <p className="text-sm text-muted-foreground">Manage all your DCA plans in one place</p>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-brand-orange hover:bg-brand-orange/90 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Plans</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {plans.length} plan{plans.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Plans Table */}
      <Card className="glass rounded-2xl border-border/50">
        <CardContent className="px-0 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading plans...</p>
            </div>
          ) : (
            <PlansTable plans={plans} onCancel={cancelPlan} />
          )}
        </CardContent>
      </Card>

      <CreatePlanModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
