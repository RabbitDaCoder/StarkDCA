import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryCards, PlansTable, CreatePlanModal, useDashboard } from '@/features/dca';

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const { plans, summary, loading, cancelPlan } = useDashboard();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your DCA plans and BTC accumulation.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} />

      {/* Plans table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Active Plans</CardTitle>
          <p className="text-sm text-muted-foreground">{plans.length} total</p>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading plans...</p>
            </div>
          ) : (
            <PlansTable plans={plans} onCancel={cancelPlan} />
          )}
        </CardContent>
      </Card>

      {/* Create Plan Modal */}
      <CreatePlanModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
