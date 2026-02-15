import { create } from 'zustand';
import type { DCAPlan, Interval } from '@stark-dca/shared-types';
import { dcaApi } from '@/services/api';

interface DcaState {
  plans: DCAPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  createPlan: (
    amountPerExecution: string,
    totalExecutions: number,
    interval: Interval,
  ) => Promise<void>;
  cancelPlan: (planId: string) => Promise<void>;
}

export const useDcaStore = create<DcaState>((set, get) => ({
  plans: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await dcaApi.getPlans();
      set({ plans, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createPlan: async (amountPerExecution, totalExecutions, interval) => {
    set({ loading: true, error: null });
    try {
      const plan = await dcaApi.createPlan({ amountPerExecution, totalExecutions, interval });
      set({ plans: [...get().plans, plan], loading: false });
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
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
