import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../logger';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
    redisClient.on('close', () => logger.warn('Redis connection closed'));
  }

  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedis();
  try {
    await redis.connect();
  } catch (error) {
    // ioredis may already be connecting/connected
    if ((error as Error).message?.includes('already')) {
      return;
    }
    logger.error({ err: error }, 'Redis connection failed');
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

// ─── Cache Helpers ───────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Convenience export for direct redis access
export const redis = {
  get: async (key: string) => getRedis().get(key),
  set: async (key: string, value: string, mode?: string, ttl?: number, flag?: string) => {
    if (mode === 'EX' && ttl && flag === 'NX') {
      return getRedis().set(key, value, 'EX', ttl, 'NX');
    }
    if (mode === 'EX' && ttl) {
      return getRedis().setex(key, ttl, value);
    }
    return getRedis().set(key, value);
  },
  incr: async (key: string) => getRedis().incr(key),
  expire: async (key: string, seconds: number) => getRedis().expire(key, seconds),
  exists: async (key: string) => getRedis().exists(key),
  del: async (key: string) => getRedis().del(key),
};
