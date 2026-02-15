// ─── Price Service ───────────────────────────────────────────────────
// Fetches BTC price with Redis-backed TTL caching and stale fallback.

import axios from 'axios';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { cacheGet, cacheSet } from '../../infrastructure/redis';
import { ServiceUnavailableError } from '../../utils/errors';

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
}

const PRICE_CACHE_KEY = 'price:btc:usd';
const STALE_CACHE_KEY = 'price:btc:usd:stale';

class PriceService {
  /**
   * Get BTC price with Redis caching.
   * Falls back to stale cache if API is unavailable.
   */
  async getBtcPrice(): Promise<PriceData> {
    // 1. Try fresh cache
    const cached = await cacheGet<PriceData>(PRICE_CACHE_KEY);
    if (cached) {
      logger.debug({ price: cached.price }, 'BTC price cache hit');
      return cached;
    }

    // 2. Fetch from API
    try {
      const priceData = await this.fetchFromApi();

      // Cache with TTL
      await cacheSet(PRICE_CACHE_KEY, priceData, config.price.cacheTtl);
      // Also store as stale fallback (longer TTL)
      await cacheSet(STALE_CACHE_KEY, priceData, config.price.cacheTtl * 60);

      return priceData;
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch BTC price from API');

      // 3. Fall back to stale cache
      const stale = await cacheGet<PriceData>(STALE_CACHE_KEY);
      if (stale) {
        logger.warn({ staleness: Date.now() - stale.timestamp }, 'Returning stale BTC price');
        return stale;
      }

      throw new ServiceUnavailableError('Unable to fetch BTC price and no cache available');
    }
  }

  /**
   * Invalidate price cache (used after manual price updates).
   */
  async invalidateCache(): Promise<void> {
    const { cacheDel } = await import('../../infrastructure/redis');
    await cacheDel(PRICE_CACHE_KEY);
    logger.info('BTC price cache invalidated');
  }

  // ─── Private ─────────────────────────────────────────────────────

  private async fetchFromApi(): Promise<PriceData> {
    const { data } = await axios.get(`${config.price.apiUrl}/simple/price`, {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd',
        include_last_updated_at: true,
      },
      headers: config.price.apiKey ? { 'x-cg-demo-api-key': config.price.apiKey } : undefined,
      timeout: 10_000,
    });

    const priceData: PriceData = {
      symbol: 'BTC',
      price: data.bitcoin.usd,
      timestamp: Date.now(),
      source: 'coingecko',
    };

    logger.debug({ price: priceData.price }, 'BTC price fetched from API');
    return priceData;
  }
}

export const priceService = new PriceService();
