// ─── Idempotency Middleware ──────────────────────────────────────────
// Prevents duplicate mutations using Idempotency-Key header + Redis.
// If a key has been seen, return the cached response without re-executing.

import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../infrastructure/redis';
import { config } from '../config';
import { BadRequestError } from '../utils/errors';
import { logger } from '../infrastructure/logger';

const IDEMPOTENCY_PREFIX = 'idempotency:';

interface CachedResponse {
  statusCode: number;
  body: unknown;
}

export function idempotency(req: Request, res: Response, next: NextFunction): void {
  // Only apply to mutating methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  if (!idempotencyKey) {
    // For POST requests, require idempotency key
    if (req.method === 'POST') {
      next(
        new BadRequestError(
          'Idempotency-Key header is required for POST requests',
          'MISSING_IDEMPOTENCY_KEY',
        ),
      );
      return;
    }
    next();
    return;
  }

  const redis = getRedis();
  const cacheKey = `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;

  // Check if this key has been processed before
  redis
    .get(cacheKey)
    .then((cached) => {
      if (cached) {
        const { statusCode, body } = JSON.parse(cached) as CachedResponse;
        logger.debug({ idempotencyKey }, 'Returning cached idempotent response');
        res.status(statusCode).json(body);
        return;
      }

      // Intercept res.json to capture and cache the response
      const originalJson = res.json.bind(res);
      res.json = function (body: unknown) {
        const responseToCache: CachedResponse = {
          statusCode: res.statusCode,
          body,
        };

        redis
          .setex(cacheKey, config.cache.idempotencyTtl, JSON.stringify(responseToCache))
          .catch((err) => logger.error({ err }, 'Failed to cache idempotent response'));

        return originalJson(body);
      };

      next();
    })
    .catch((err) => {
      logger.error({ err }, 'Idempotency check failed');
      next(); // Fail open — don't block the request
    });
}
