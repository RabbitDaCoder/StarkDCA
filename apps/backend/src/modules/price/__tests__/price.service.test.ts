// ─── Price Service Tests ─────────────────────────────────────────────

import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Redis
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();

jest.mock('../../../infrastructure/redis', () => ({
  cacheGet: (...args: any[]) => mockCacheGet(...args),
  cacheSet: (...args: any[]) => mockCacheSet(...args),
  cacheDel: jest.fn(),
}));

jest.mock('../../../config', () => ({
  config: {
    price: {
      apiUrl: 'https://api.coingecko.com/api/v3',
      apiKey: '',
      cacheTtl: 60,
    },
    isProduction: false,
  },
}));

jest.mock('../../../infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { priceService } from '../price.service';

describe('PriceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheGet.mockResolvedValue(null);
    mockCacheSet.mockResolvedValue(undefined);
  });

  it('should fetch BTC price from API when cache is empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        bitcoin: {
          usd: 67432.5,
          last_updated_at: Date.now() / 1000,
        },
      },
    });

    const price = await priceService.getBtcPrice();

    expect(price.symbol).toBe('BTC');
    expect(price.price).toBe(67432.5);
    expect(price.source).toBe('coingecko');
    // Should cache both fresh and stale
    expect(mockCacheSet).toHaveBeenCalledTimes(2);
  });

  it('should return cached price when available', async () => {
    const cachedPrice = {
      symbol: 'BTC',
      price: 65000,
      timestamp: Date.now(),
      source: 'coingecko',
    };

    mockCacheGet.mockResolvedValueOnce(cachedPrice);

    const price = await priceService.getBtcPrice();

    expect(price.price).toBe(65000);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should return stale cache when API fails', async () => {
    // Fresh cache miss
    mockCacheGet.mockResolvedValueOnce(null);
    // API fails
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    // Stale cache hit
    mockCacheGet.mockResolvedValueOnce({
      symbol: 'BTC',
      price: 70000,
      timestamp: Date.now() - 120000,
      source: 'coingecko',
    });

    const price = await priceService.getBtcPrice();
    expect(price.price).toBe(70000);
  });

  it('should throw when API fails and no cache is available', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(priceService.getBtcPrice()).rejects.toThrow('Unable to fetch BTC price');
  });
});
