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

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/v1/auth/me');
    return unwrap(response);
  },

  getGoogleAuthUrl(): string {
    // Use absolute backend URL for OAuth redirect (bypasses Vite proxy)
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${backendUrl}/api/v1/auth/google`;
  },
};
