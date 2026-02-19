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

interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  source: string | null;
  createdAt: string;
}

interface AdminStats {
  totalWaitlist: number;
  totalUsers: number;
  verifiedUsers: number;
  waitlistToday: number;
  usersToday: number;
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

interface LaunchStatus {
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
  async getDashboardStats(): Promise<AdminStats> {
    const response = await apiClient.get('/v1/admin/stats');
    return unwrap(response);
  },

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

  async launchPlatform(): Promise<LaunchResult> {
    const response = await apiClient.post('/v1/admin/launch');
    return unwrap(response);
  },

  async getLaunchStatus(): Promise<LaunchStatus> {
    const response = await apiClient.get('/v1/admin/launch/status');
    return unwrap(response);
  },
};
