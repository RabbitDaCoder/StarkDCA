import { create } from 'zustand';
import type {
  DCAPlan,
  Interval,
  PortfolioSummary,
  ExecutionWithPlan,
} from '@stark-dca/shared-types';
import { dcaApi } from '@/services/api';

interface DcaState {
  plans: DCAPlan[];
  portfolio: PortfolioSummary | null;
  executions: ExecutionWithPlan[];
  executionsCursor: string | null;
  hasMoreExecutions: boolean;
  loading: boolean;
  portfolioLoading: boolean;
  executionsLoading: boolean;
  error: string | null;
  fetchPlans: (status?: string) => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  fetchExecutions: (reset?: boolean) => Promise<void>;
  createPlan: (
    amountPerExecution: string,
    totalExecutions: number,
    interval: Interval,
  ) => Promise<void>;
  cancelPlan: (planId: string) => Promise<void>;
}

export const useDcaStore = create<DcaState>((set, get) => ({
  plans: [],
  portfolio: null,
  executions: [],
  executionsCursor: null,
  hasMoreExecutions: true,
  loading: false,
  portfolioLoading: false,
  executionsLoading: false,
  error: null,

  fetchPlans: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const plans = await dcaApi.getPlans(status);
      set({ plans, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchPortfolio: async () => {
    set({ portfolioLoading: true });
    try {
      const portfolio = await dcaApi.getPortfolioSummary();
      set({ portfolio, portfolioLoading: false });
    } catch (error: any) {
      set({ portfolioLoading: false, error: error.message });
    }
  },

  fetchExecutions: async (reset = false) => {
    const state = get();
    if (state.executionsLoading) return;
    if (!reset && !state.hasMoreExecutions) return;

    const cursor = reset ? undefined : state.executionsCursor || undefined;
    set({ executionsLoading: true });
    try {
      const result = await dcaApi.getAllExecutions(cursor, 20);
      set({
        executions: reset ? result.items : [...state.executions, ...result.items],
        executionsCursor: result.nextCursor,
        hasMoreExecutions: result.hasMore,
        executionsLoading: false,
      });
    } catch (error: any) {
      set({ executionsLoading: false, error: error.message });
    }
  },

  createPlan: async (amountPerExecution, totalExecutions, interval) => {
    set({ loading: true, error: null });
    try {
      const plan = await dcaApi.createPlan({ amountPerExecution, totalExecutions, interval });
      set({ plans: [...get().plans, plan], loading: false });
      // Refresh portfolio after creating a plan
      get().fetchPortfolio();
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  cancelPlan: async (planId) => {
    try {
      const updated = await dcaApi.cancelPlan(planId);
      set({
        plans: get().plans.map((p) => (p.id === planId ? updated : p)),
      });
      // Refresh portfolio after cancelling
      get().fetchPortfolio();
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
