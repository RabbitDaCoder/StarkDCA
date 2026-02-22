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

export const dcaApi = {
  getPlans: async (status?: string): Promise<DCAPlan[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<ApiResponse<{ items: DCAPlan[] }>>('/plans', { params });
    const data = unwrap(res);
    // Handle both array and paginated response
    return Array.isArray(data) ? data : data.items || [];
  },

  getPlan: async (planId: string): Promise<DCAPlan> => {
    const res = await apiClient.get<ApiResponse<DCAPlan>>(`/plans/${planId}`);
    return unwrap(res);
  },

  createPlan: async (body: CreatePlanRequest): Promise<DCAPlan> => {
    const res = await apiClient.post<ApiResponse<DCAPlan>>('/plans', body);
    return unwrap(res);
  },

  cancelPlan: async (planId: string): Promise<DCAPlan> => {
    const res = await apiClient.post<ApiResponse<DCAPlan>>(`/plans/${planId}/cancel`);
    return unwrap(res);
  },

  getExecutionLogs: async (
    planId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ExecutionLog>> => {
    const params: Record<string, string | number> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const res = await apiClient.get<ApiResponse<PaginatedResult<ExecutionLog>>>(
      `/plans/${planId}/executions`,
      { params },
    );
    return unwrap(res);
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
    const res = await apiClient.get<ApiResponse<PaginatedResult<ExecutionWithPlan>>>(
      '/plans/executions',
      { params },
    );
    return unwrap(res);
  },
};
