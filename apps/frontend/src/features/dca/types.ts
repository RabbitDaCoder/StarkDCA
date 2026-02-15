import type {
  DCAPlan,
  CreatePlanRequest,
  Interval,
  ExecutionLog,
  PriceData,
} from '@stark-dca/shared-types';

// ─── Dashboard summary ──────────────────────────────────────

export interface DashboardSummary {
  totalDeposited: number;
  activePlans: number;
  btcAccumulated: number;
  nextExecutionIn: number; // timestamp
}

// ─── Plan table row (derived view) ──────────────────────────

export interface PlanRow {
  id: string;
  name: string;
  amountPerInterval: string;
  frequency: Interval;
  nextExecution: number;
  status: string;
  progress: number; // 0-100
}

// Re-export shared types for convenience
export type { DCAPlan, CreatePlanRequest, Interval, ExecutionLog, PriceData };
