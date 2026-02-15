import { apiClient, unwrap } from './client';
import type { PriceData, ApiResponse } from '@stark-dca/shared-types';

export const priceApi = {
  getBtcPrice: async (): Promise<PriceData> => {
    const res = await apiClient.get<ApiResponse<PriceData>>('/price/btc');
    return unwrap(res);
  },
};
