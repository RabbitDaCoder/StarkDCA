import axios from 'axios';
import { PriceData } from '@stark-dca/shared-types';
import { config } from '../config';
import { logger } from '../utils/logger';

export class PriceService {
  private cache: PriceData | null = null;
  private cacheMaxAge = 60_000; // 1 minute

  async getBtcPrice(): Promise<PriceData> {
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheMaxAge) {
      return this.cache;
    }

    try {
      const { data } = await axios.get(
        `${config.price.apiUrl}/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true`,
        {
          headers: config.price.apiKey ? { 'x-cg-demo-api-key': config.price.apiKey } : undefined,
        },
      );

      const priceData: PriceData = {
        symbol: 'BTC',
        price: data.bitcoin.usd,
        timestamp: Date.now(),
        source: 'coingecko',
      };

      this.cache = priceData;
      logger.debug(`BTC price fetched: $${priceData.price}`);
      return priceData;
    } catch (error) {
      logger.error('Failed to fetch BTC price', error);

      if (this.cache) {
        logger.warn('Returning stale cached price');
        return this.cache;
      }

      throw new Error('Unable to fetch BTC price and no cache available');
    }
  }

  clearCache(): void {
    this.cache = null;
  }
}

export const priceService = new PriceService();
