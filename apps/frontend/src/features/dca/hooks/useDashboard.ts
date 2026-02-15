import { useEffect } from 'react';
import { useDcaStore } from '@/store/dca.store';
import { useWalletStore } from '@/store/wallet.store';
import { PlanStatus } from '@stark-dca/shared-types';
import type { DashboardSummary } from '../types';

// Realistic preview data for when API is not connected
const DEMO_PLANS = [
  {
    id: 'plan_demo_1',
    owner: '0x04a3…9b2f',
    depositTokenAddress: '0x_USDT',
    targetTokenAddress: '0x_WBTC',
    amountPerExecution: '100',
    totalDeposited: '1000',
    totalExecutions: 10,
    executionsCompleted: 4,
    interval: 'weekly' as const,
    nextExecutionAt: Date.now() + 9_240_000, // ~2.5 hours
    status: PlanStatus.Active,
    createdAt: Date.now() - 2_419_200_000,
    updatedAt: Date.now() - 604_800_000,
  },
  {
    id: 'plan_demo_2',
    owner: '0x04a3…9b2f',
    depositTokenAddress: '0x_USDT',
    targetTokenAddress: '0x_WBTC',
    amountPerExecution: '500',
    totalDeposited: '6000',
    totalExecutions: 12,
    executionsCompleted: 7,
    interval: 'monthly' as const,
    nextExecutionAt: Date.now() + 1_296_000_000, // ~15 days
    status: PlanStatus.Active,
    createdAt: Date.now() - 18_144_000_000,
    updatedAt: Date.now() - 2_592_000_000,
  },
  {
    id: 'plan_demo_3',
    owner: '0x04a3…9b2f',
    depositTokenAddress: '0x_USDT',
    targetTokenAddress: '0x_WBTC',
    amountPerExecution: '25',
    totalDeposited: '750',
    totalExecutions: 30,
    executionsCompleted: 18,
    interval: 'daily' as const,
    nextExecutionAt: Date.now() + 43_200_000, // ~12 hours
    status: PlanStatus.Active,
    createdAt: Date.now() - 1_555_200_000,
    updatedAt: Date.now() - 86_400_000,
  },
];

export function useDashboard() {
  const { address } = useWalletStore();
  const { plans: storePlans, loading, fetchPlans, cancelPlan } = useDcaStore();

  useEffect(() => {
    if (address) {
      fetchPlans();
    }
  }, [address, fetchPlans]);

  // Use demo data when no wallet connected or no plans from API
  const plans = storePlans.length > 0 ? storePlans : DEMO_PLANS;
  const activePlans = plans.filter((p) => p.status === PlanStatus.Active);

  const summary: DashboardSummary = {
    totalDeposited: plans.reduce((sum, p) => sum + parseFloat(p.totalDeposited), 0),
    activePlans: activePlans.length,
    btcAccumulated: 0.1847, // demo value
    nextExecutionIn:
      activePlans.length > 0 ? Math.min(...activePlans.map((p) => p.nextExecutionAt)) : 0,
  };

  return { plans, summary, loading, cancelPlan };
}
