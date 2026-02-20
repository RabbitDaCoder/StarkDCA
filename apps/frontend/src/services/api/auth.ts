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
    const response = await apiClient.post('/v1/auth/signup', { name, email, password });
    return unwrap(response);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/v1/auth/login', { email, password });
    return unwrap(response);
  },

  async logout(): Promise<void> {
    await apiClient.post('/v1/auth/logout');
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post('/v1/auth/refresh');
    return unwrap(response);
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/v1/auth/me');
    return unwrap(response);
  },

  async verifyOtp(otp: string): Promise<VerifyOtpResponse> {
    const response = await apiClient.post('/v1/auth/verify-otp', { otp });
    return unwrap(response);
  },

  async resendOtp(): Promise<{ sent: boolean; message: string }> {
    const response = await apiClient.post('/v1/auth/resend-otp');
    return unwrap(response);
  },

  getGoogleAuthUrl(): string {
    // Reuse the same baseURL as the API client so we never double-prefix /api.
    // In dev it resolves to '/api', in prod to the full absolute URL
    // (e.g. 'https://…onrender.com/api').
    const baseUrl = apiClient.defaults.baseURL || '/api';
    return `${baseUrl}/v1/auth/google`;
  },
};
