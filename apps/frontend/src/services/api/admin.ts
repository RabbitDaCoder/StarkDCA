// ─── Admin API Service ───────────────────────────────────────────────
// Handles admin API calls.

import { apiClient, unwrap } from './client';

interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedPlansResponse {
  plans: AdminPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  source: string | null;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: boolean;
  starknetAddress: string | null;
  launchAccessGranted?: boolean;
  createdAt: string;
}

export interface AdminPlan {
  id: string;
  userId: string;
  amountPerExecution: string;
  totalDeposited: string;
  totalExecutions: number;
  executionsCompleted: number;
  interval: string;
  nextExecutionAt: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null };
  _count: { executions: number };
}

interface AdminStats {
  totalWaitlist: number;
  totalUsers: number;
  verifiedUsers: number;
  waitlistToday: number;
  usersToday: number;
}

export interface PlatformOverview {
  users: { total: number; today: number };
  plans: { total: number; active: number; today: number };
  executions: {
    total: number;
    successful: number;
    failed: number;
    today: number;
    successRate: number;
  };
  volume: {
    totalDeposited: number;
    totalBtcAccumulated: number;
  };
}

export interface SystemHealth {
  status: string;
  uptime: number;
  checks: Record<string, { status: string; latencyMs?: number; error?: string }>;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  nodeVersion: string;
  env: string;
}

export interface ExecutionAnalytics {
  date: string;
  total: number;
  success: number;
  failed: number;
  volume: number;
}

interface EmailResult {
  success: number;
  failed: number;
  total: number;
}

interface LaunchResult {
  message: string;
  usersUpdated: number;
  emailsQueued: number;
  launchedAt: string;
  launchedBy: string;
}

export interface LaunchStatus {
  launched: boolean;
  launchedAt: string | null;
  launchedBy: string | null;
  emailProgress: {
    total: number;
    sent: number;
    failed: number;
    inProgress: boolean;
  };
}

export const adminApi = {
  // ─── Dashboard Stats ──────────────────────────────────────────────
  async getDashboardStats(): Promise<AdminStats> {
    const response = await apiClient.get('/v1/admin/stats');
    return unwrap(response);
  },

  async getPlatformOverview(): Promise<PlatformOverview> {
    const response = await apiClient.get('/v1/admin/overview');
    return unwrap(response);
  },

  // ─── Waitlist ─────────────────────────────────────────────────────
  async getWaitlistUsers(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }): Promise<PaginatedResponse<WaitlistUser>> {
    const response = await apiClient.get('/v1/admin/waitlist', { params });
    return unwrap(response);
  },

  async exportWaitlistCsv(): Promise<Blob> {
    const response = await apiClient.get('/v1/admin/waitlist/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // ─── Users ────────────────────────────────────────────────────────
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    const response = await apiClient.get('/v1/admin/users', { params });
    return unwrap(response);
  },

  async suspendUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.post(`/v1/admin/users/${userId}/suspend`);
    return unwrap(response);
  },

  async reactivateUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.post(`/v1/admin/users/${userId}/reactivate`);
    return unwrap(response);
  },

  // ─── Plans ────────────────────────────────────────────────────────
  async getAllPlans(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedPlansResponse> {
    const response = await apiClient.get('/v1/admin/plans', { params });
    return unwrap(response);
  },

  // ─── Emails ───────────────────────────────────────────────────────
  async sendEmail(data: {
    recipients: string[];
    subject: string;
    template: 'announcement' | 'launch';
    variables?: Record<string, string>;
  }): Promise<EmailResult> {
    const response = await apiClient.post('/v1/admin/email/send', data);
    return unwrap(response);
  },

  async sendBulkEmail(data: {
    filter: 'all' | 'recent' | 'custom';
    recentDays?: number;
    subject: string;
    template: 'announcement' | 'launch';
    variables?: Record<string, string>;
  }): Promise<EmailResult> {
    const response = await apiClient.post('/v1/admin/email/bulk', data);
    return unwrap(response);
  },

  // ─── System ───────────────────────────────────────────────────────
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get('/v1/admin/system/health');
    return unwrap(response);
  },

  // ─── Analytics ────────────────────────────────────────────────────
  async getExecutionAnalytics(days?: number): Promise<ExecutionAnalytics[]> {
    const response = await apiClient.get('/v1/admin/analytics/executions', { params: { days } });
    return unwrap(response);
  },

  // ─── Launch ───────────────────────────────────────────────────────
  async launchPlatform(): Promise<LaunchResult> {
    const response = await apiClient.post('/v1/admin/launch');
    return unwrap(response);
  },

  async getLaunchStatus(): Promise<LaunchStatus> {
    const response = await apiClient.get('/v1/admin/launch/status');
    return unwrap(response);
  },
};
