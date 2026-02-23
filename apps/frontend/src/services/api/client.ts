import axios from 'axios';
import type { ApiResponse } from '@stark-dca/shared-types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true, // Enable cookies for refresh token
});

// Attach auth token to requests
apiClient.interceptors.request.use((config) => {
  // Try to get token from auth store
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Also attach wallet address if available (legacy support)
  const address = window.__STARK_DCA_WALLET_ADDRESS__;
  if (address) {
    config.headers['x-starknet-address'] = address;
  }

  // Auto-generate Idempotency-Key for POST requests
  if (config.method === 'post' && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
  }

  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Read refresh token from persisted auth store
        const authStorage = localStorage.getItem('auth-storage');
        let storedRefreshToken: string | null = null;
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            storedRefreshToken = state?.refreshToken ?? null;
          } catch {
            // ignore
          }
        }

        // Try to refresh token – send refreshToken in body (cross-origin safe)
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true },
        );

        const newToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;
        if (newToken) {
          // Update stored tokens
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            parsed.state.accessToken = newToken;
            if (newRefreshToken) {
              parsed.state.refreshToken = newRefreshToken;
            }
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth state
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error((response.data as any).error?.message || 'Request failed');
  }
  return response.data.data;
}

// Extend window to hold address for interceptor (avoids store circular dep)
declare global {
  interface Window {
    __STARK_DCA_WALLET_ADDRESS__?: string;
  }
}
