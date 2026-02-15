// ─── DCA Plan ────────────────────────────────────────────────

export enum PlanStatus {
  Active = 'active',
  Paused = 'paused',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

export enum Interval {
  Daily = 'daily',
  Weekly = 'weekly',
  Biweekly = 'biweekly',
  Monthly = 'monthly',
}

export interface DCAPlan {
  id: string;
  owner: string; // Starknet address
  depositTokenAddress: string; // USDT contract address
  targetTokenAddress: string; // BTC (wrapped) contract address
  amountPerExecution: string; // Amount of USDT per buy (as string for bigint compat)
  totalDeposited: string;
  totalExecutions: number;
  executionsCompleted: number;
  interval: Interval;
  nextExecutionAt: number; // Unix timestamp
  status: PlanStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePlanRequest {
  amountPerExecution: string;
  totalExecutions: number;
  interval: Interval;
}

export interface CancelPlanRequest {
  planId: string;
}

// ─── API Responses ───────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Price ───────────────────────────────────────────────────

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
}

// ─── Execution Log ───────────────────────────────────────────

export interface ExecutionLog {
  id: string;
  planId: string;
  executedAt: number;
  amountIn: string; // USDT spent
  amountOut: string; // BTC received
  priceAtExecution: number;
  txHash: string;
}
