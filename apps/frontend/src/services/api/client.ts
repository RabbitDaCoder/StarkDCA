import axios from 'axios';
import type { ApiResponse } from '@stark-dca/shared-types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach wallet address to requests
apiClient.interceptors.request.use((config) => {
  // Lazy import to avoid circular deps — address is read at call time
  const address = window.__STARK_DCA_WALLET_ADDRESS__;
  if (address) {
    config.headers['x-starknet-address'] = address;
  }
  return config;
});

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error((response.data as any).error || 'Request failed');
  }
  return response.data.data;
}

// Extend window to hold address for interceptor (avoids store circular dep)
declare global {
  interface Window {
    __STARK_DCA_WALLET_ADDRESS__?: string;
  }
}
