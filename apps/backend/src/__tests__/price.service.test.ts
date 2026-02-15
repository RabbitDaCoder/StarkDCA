import { PriceService } from '../../services/price.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PriceService', () => {
  let service: PriceService;

  beforeEach(() => {
    service = new PriceService();
    service.clearCache();
  });

  it('should fetch BTC price from API', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        bitcoin: {
          usd: 67432.5,
          last_updated_at: Date.now() / 1000,
        },
      },
    });

    const price = await service.getBtcPrice();

    expect(price.symbol).toBe('BTC');
    expect(price.price).toBe(67432.5);
    expect(price.source).toBe('coingecko');
  });

  it('should return cached price within cache window', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        bitcoin: {
          usd: 67432.5,
          last_updated_at: Date.now() / 1000,
        },
      },
    });

    const first = await service.getBtcPrice();
    const second = await service.getBtcPrice();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(first.price).toBe(second.price);
  });

  it('should return stale cache when API fails', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: { bitcoin: { usd: 70000, last_updated_at: Date.now() / 1000 } },
      })
      .mockRejectedValueOnce(new Error('Network error'));

    const first = await service.getBtcPrice();
    service.clearCache();
    // Re-set cache manually with old timestamp to force re-fetch
    (service as any).cache = { ...first, timestamp: Date.now() - 120_000 };

    const fallback = await service.getBtcPrice();
    expect(fallback.price).toBe(70000);
  });
});
