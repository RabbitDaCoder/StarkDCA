import { apiClient, unwrap } from './client';
import type {
  DCAPlan,
  CreatePlanRequest,
  ApiResponse,
  ExecutionLog,
  PortfolioSummary,
  ExecutionWithPlan,
} from '@stark-dca/shared-types';

interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Normalise a plan from the API (backend uses UPPERCASE enums, frontend uses lowercase). */
function normalizePlan(plan: any): DCAPlan {
  return {
    ...plan,
    status: plan.status?.toLowerCase() ?? plan.status,
    interval: plan.interval?.toLowerCase() ?? plan.interval,
  };
}

/** Normalise a paginated result, handling both { items: [...] } and { data: [...] } shapes. */
function normalizePaginatedResult<T>(raw: any): PaginatedResult<T> {
  const items = raw.items ?? raw.data ?? [];
  return {
    items,
    nextCursor: raw.nextCursor ?? raw.pagination?.nextCursor ?? null,
    hasMore: raw.hasMore ?? raw.pagination?.hasMore ?? false,
  };
}

export const dcaApi = {
  getPlans: async (status?: string): Promise<DCAPlan[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<ApiResponse<any>>('/plans', { params });
    const data = unwrap(res);
    // Handle array, { items: [...] }, or { data: [...] } response shapes
    let plans: any[];
    if (Array.isArray(data)) plans = data;
    else if (data.items) plans = data.items;
    else if (data.data) plans = data.data;
    else plans = [];
    return plans.map(normalizePlan);
  },

  getPlan: async (planId: string): Promise<DCAPlan> => {
    const res = await apiClient.get<ApiResponse<DCAPlan>>(`/plans/${planId}`);
    return unwrap(res);
  },

  createPlan: async (body: CreatePlanRequest): Promise<DCAPlan> => {
    const res = await apiClient.post<ApiResponse<DCAPlan>>('/plans', body);
    return normalizePlan(unwrap(res));
  },

  cancelPlan: async (planId: string): Promise<DCAPlan> => {
    const res = await apiClient.post<ApiResponse<DCAPlan>>(`/plans/${planId}/cancel`);
    return normalizePlan(unwrap(res));
  },

  getExecutionLogs: async (
    planId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ExecutionLog>> => {
    const params: Record<string, string | number> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const res = await apiClient.get<ApiResponse<any>>(`/plans/${planId}/executions`, { params });
    const raw = unwrap(res);
    return normalizePaginatedResult(raw);
  },

  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    const res = await apiClient.get<ApiResponse<PortfolioSummary>>('/plans/portfolio');
    return unwrap(res);
  },

  getAllExecutions: async (
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ExecutionWithPlan>> => {
    const params: Record<string, string | number> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const res = await apiClient.get<ApiResponse<any>>('/plans/executions', { params });
    const raw = unwrap(res);
    return normalizePaginatedResult(raw);
  },
};
