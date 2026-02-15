// ─── Distributed Lock using Redis ────────────────────────────────────
// Prevents double-execution of DCA plans in horizontally scaled environments.
// Uses SET NX EX (atomic) for lock acquisition, Lua script for safe release.

import { getRedis } from '../infrastructure/redis';
import { logger } from '../infrastructure/logger';
import { config } from '../config';

const LOCK_PREFIX = 'lock:';

// Lua script: only delete the key if the value matches (prevents releasing another process's lock)
const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

function generateLockValue(): string {
  return `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface LockHandle {
  key: string;
  value: string;
  release: () => Promise<boolean>;
}

/**
 * Acquire a distributed lock.
 * Returns a handle with a release() method, or null if the lock is already held.
 */
export async function acquireLock(
  resource: string,
  ttlSeconds: number = config.cache.lockTtl,
): Promise<LockHandle | null> {
  const redis = getRedis();
  const key = `${LOCK_PREFIX}${resource}`;
  const value = generateLockValue();

  // SET key value NX EX ttl — atomic lock acquisition
  const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX');

  if (result !== 'OK') {
    logger.debug({ resource }, 'Lock acquisition failed — already held');
    return null;
  }

  logger.debug({ resource, ttlSeconds }, 'Lock acquired');

  return {
    key,
    value,
    release: async () => {
      const released = await redis.eval(RELEASE_SCRIPT, 1, key, value);
      const success = released === 1;
      if (success) {
        logger.debug({ resource }, 'Lock released');
      } else {
        logger.warn({ resource }, 'Lock release failed — expired or stolen');
      }
      return success;
    },
  };
}

/**
 * Execute a function while holding a distributed lock.
 * If the lock cannot be acquired, returns null.
 */
export async function withLock<T>(
  resource: string,
  fn: () => Promise<T>,
  ttlSeconds?: number,
): Promise<T | null> {
  const lock = await acquireLock(resource, ttlSeconds);
  if (!lock) return null;

  try {
    return await fn();
  } finally {
    await lock.release();
  }
}
