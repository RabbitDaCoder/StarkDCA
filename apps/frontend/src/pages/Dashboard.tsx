import { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryCards, PlansTable, CreatePlanModal, useDashboard } from '@/features/dca';

export default function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const { plans, summary, loading, cancelPlan } = useDashboard();

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-blue tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your DCA plans and track your BTC accumulation.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-brand-orange hover:bg-brand-orange/90 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} />

      {/* Plans table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-blue/10">
              <TrendingUp className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg text-brand-blue">Active Plans</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{plans.length} total plans</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading your plans...</p>
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
