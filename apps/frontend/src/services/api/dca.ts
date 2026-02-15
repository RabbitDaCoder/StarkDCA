import { apiClient, unwrap } from './client';
import type {
  DCAPlan,
  CreatePlanRequest,
  ApiResponse,
  ExecutionLog,
} from '@stark-dca/shared-types';

export const dcaApi = {
  getPlans: async (): Promise<DCAPlan[]> => {
    const res = await apiClient.get<ApiResponse<DCAPlan[]>>('/plans');
    return unwrap(res);
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

  getExecutionLogs: async (planId: string): Promise<ExecutionLog[]> => {
    const res = await apiClient.get<ApiResponse<ExecutionLog[]>>(`/plans/${planId}/executions`);
    return unwrap(res);
  },
};
