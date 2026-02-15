// ─── Redis-Based Rate Limiter ────────────────────────────────────────
// Sliding window rate limiting using Redis. Configurable per-route.

import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../infrastructure/redis';
import { config } from '../config';
import { TooManyRequestsError } from '../utils/errors';
import { logger } from '../infrastructure/logger';

const RATE_LIMIT_PREFIX = 'ratelimit:';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = config.rateLimit.windowMs,
    maxRequests = config.rateLimit.maxRequests,
    keyGenerator = defaultKeyGenerator,
    message = 'Too many requests, please try again later',
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const redis = getRedis();
    const clientKey = keyGenerator(req);
    const redisKey = `${RATE_LIMIT_PREFIX}${clientKey}`;

    try {
      const current = await redis.incr(redisKey);

      if (current === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      // Set rate limit headers
      const ttl = await redis.ttl(redisKey);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      if (current > maxRequests) {
        logger.warn({ clientKey, current, maxRequests }, 'Rate limit exceeded');
        next(new TooManyRequestsError(message));
        return;
      }

      next();
    } catch (err) {
      logger.error({ err }, 'Rate limiter error');
      next(); // Fail open
    }
  };
}

function defaultKeyGenerator(req: Request): string {
  // Use authenticated user ID if available, otherwise IP
  if (req.user?.userId) {
    return `user:${req.user.userId}`;
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

// ─── Preset rate limiters ────────────────────────────────────────────

/** Strict limiter for auth endpoints */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many authentication attempts',
});

/** Standard API limiter */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/** Tight limiter for execution endpoints */
export const executionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Too many execution requests',
});
