// ─── Waitlist API Service ────────────────────────────────────────────
// Handles waitlist API calls.

import { apiClient, unwrap } from './client';

interface WaitlistStats {
  totalCount: number;
  recentSignups: Array<{
    name: string;
    createdAt: string;
  }>;
}

interface JoinWaitlistResponse {
  id: string;
  name: string;
  email: string;
  message: string;
}

export const waitlistApi = {
  async join(name: string, email: string, source?: string): Promise<JoinWaitlistResponse> {
    const response = await apiClient.post('/v1/waitlist/join', { name, email, source });
    return unwrap(response);
  },

  async getStats(): Promise<WaitlistStats> {
    const response = await apiClient.get('/v1/waitlist/stats');
    return unwrap(response);
  },
};
