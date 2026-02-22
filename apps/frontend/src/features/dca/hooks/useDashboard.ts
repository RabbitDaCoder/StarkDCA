import { useEffect } from 'react';
import { useDcaStore } from '@/store/dca.store';
import { useAuthStore } from '@/store/auth.store';
import { PlanStatus } from '@stark-dca/shared-types';
import type { DashboardSummary } from '../types';

export function useDashboard() {
  const { user } = useAuthStore();
  const { plans, portfolio, loading, portfolioLoading, fetchPlans, fetchPortfolio, cancelPlan } =
    useDcaStore();

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchPortfolio();
    }
  }, [user, fetchPlans, fetchPortfolio]);

  const activePlans = plans.filter((p) => p.status === PlanStatus.Active);

  // Build summary from portfolio or fallback to plan-level calculation
  const summary: DashboardSummary = portfolio
    ? {
        totalDeposited: portfolio.totalDeposited,
        activePlans: portfolio.activePlans,
        btcAccumulated: portfolio.btcAccumulated,
        nextExecutionIn: portfolio.nextExecutionAt || 0,
      }
    : {
        totalDeposited: plans.reduce((sum, p) => sum + parseFloat(p.totalDeposited), 0),
        activePlans: activePlans.length,
        btcAccumulated: 0,
        nextExecutionIn:
          activePlans.length > 0 ? Math.min(...activePlans.map((p) => p.nextExecutionAt)) : 0,
      };

  return {
    plans,
    summary,
    portfolio,
    loading,
    portfolioLoading,
    cancelPlan,
  };
}
