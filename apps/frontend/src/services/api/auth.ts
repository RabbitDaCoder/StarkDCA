// ─── Auth API Service ────────────────────────────────────────────────
// Handles authentication API calls.

import { apiClient, unwrap } from './client';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface RefreshResponse {
  accessToken: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: boolean;
  launchAccessGranted: boolean;
  waitlistPosition: number | null;
}

interface VerifyOtpResponse {
  verified: boolean;
  waitlistPosition: number;
  totalUsers: number;
  redirectTo: string;
}

export const authApi = {
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/signup', { name, email, password });
    return unwrap(response);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return unwrap(response);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post('/auth/refresh');
    return unwrap(response);
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/auth/me');
    return unwrap(response);
  },

  async verifyOtp(otp: string): Promise<VerifyOtpResponse> {
    const response = await apiClient.post('/auth/verify-otp', { otp });
    return unwrap(response);
  },

  async resendOtp(): Promise<{ sent: boolean; message: string }> {
    const response = await apiClient.post('/auth/resend-otp');
    return unwrap(response);
  },

  getGoogleAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL || '/api/v1';
    return `${baseUrl}/auth/google`;
  },

  async forgotPassword(email: string): Promise<{ sent: boolean; message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return unwrap(response);
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ reset: boolean; message: string }> {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return unwrap(response);
  },
};
