// ─── Waitlist Service ────────────────────────────────────────────────
// Handles waitlist signups with Redis rate limiting and idempotency.
// Updated: counts both WaitlistUser and verified User tables for stats.

import { prisma } from '../../infrastructure/db';
import { redis } from '../../infrastructure/redis';
import { emailService } from '../../infrastructure/email';
import { logger } from '../../infrastructure/logger';
import { ConflictError, TooManyRequestsError, BadRequestError } from '../../utils/errors';
import type { JoinWaitlistInput } from './waitlist.schema';

// Redis keys (only used for rate limiting and idempotency, NOT for counts)
const WAITLIST_IP_PREFIX = 'waitlist:ip:';
const WAITLIST_EMAIL_PREFIX = 'waitlist:email:';

// Rate limits
const MAX_SIGNUPS_PER_IP = 3; // Per hour
const IP_RATE_LIMIT_TTL = 3600; // 1 hour in seconds

interface WaitlistStats {
  totalCount: number;
  recentSignups: Array<{ name: string; createdAt: Date }>;
}

interface UserWaitlistInfo {
  position: number;
  totalUsers: number;
  name: string | null;
}

interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  source: string | null;
  createdAt: Date;
}

class WaitlistService {
  /**
   * Join the waitlist with rate limiting and duplicate prevention.
   * Security: Uses Redis for IP-based rate limiting and email idempotency.
   */
  async join(input: JoinWaitlistInput, ipAddress: string): Promise<WaitlistUser> {
    const { name, email, source } = input;

    // 1. Check IP rate limit (prevent spam from same IP)
    await this.checkIpRateLimit(ipAddress);

    // 2. Check for duplicate email (idempotency via Redis + DB)
    await this.checkDuplicateEmail(email);

    // 3. Create waitlist entry
    const user = await prisma.waitlistUser.create({
      data: {
        name,
        email,
        ipAddress,
        source: source || 'landing',
      },
    });

    // 4. Mark email as used in Redis (fast lookup for future requests)
    await redis.set(`${WAITLIST_EMAIL_PREFIX}${email}`, '1', 'EX', 86400 * 30); // 30 days

    // 5. Send welcome email (async, don't block response)
    emailService.sendWaitlistWelcome(email, name).catch((err) => {
      logger.error({ error: err, email }, 'Failed to send waitlist welcome email');
    });

    logger.info({ email, source, ip: ipAddress }, 'New waitlist signup');

    return user;
  }

  /**
   * Get waitlist statistics for the public landing page.
   * Returns total count and recent signups (first names only for privacy).
   */
  async getStats(): Promise<WaitlistStats> {
    // Count both public waitlist signups AND verified registered users
    // This gives the true community size for social proof on the landing page
    const [publicCount, registeredCount] = await Promise.all([
      prisma.waitlistUser.count(),
      prisma.user.count({ where: { emailVerified: true } }),
    ]);
    const totalCount = publicCount + registeredCount;

    // Get recent signups from both tables, merge and sort
    const [publicSignups, registeredSignups] = await Promise.all([
      prisma.waitlistUser.findMany({
        select: { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.user.findMany({
        where: { emailVerified: true, name: { not: null } },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Merge, sort by newest first, take top 5
    const allSignups = [
      ...publicSignups.map((u) => ({ name: u.name, createdAt: u.createdAt })),
      ...registeredSignups.map((u) => ({ name: u.name || 'User', createdAt: u.createdAt })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Extract only first names for privacy
    const recentSignups = allSignups.map((user) => ({
      name: user.name.split(' ')[0],
      createdAt: user.createdAt,
    }));

    return {
      totalCount,
      recentSignups,
    };
  }

  /**
   * Get all waitlist users (admin only).
   */
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'email';
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }): Promise<{ users: WaitlistUser[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search } = options;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.waitlistUser.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.waitlistUser.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Export waitlist as CSV data.
   */
  async exportCsv(): Promise<string> {
    const users = await prisma.waitlistUser.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Name', 'Email', 'Source', 'Signed Up At'];
    const rows = users.map((user) => [
      user.id,
      `"${user.name.replace(/"/g, '""')}"`, // Escape quotes
      user.email,
      user.source || '',
      user.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  // ─── Registered User Waitlist Methods ──────────────────────────────

  /**
   * Add a registered user to the waitlist after OTP verification.
   * Assigns a unique waitlistPosition using a DB transaction for correctness.
   * Safe across Redis restarts and concurrent requests.
   */
  async addUserToWaitlist(userId: string): Promise<UserWaitlistInfo> {
    // Check if user already has a position
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { waitlistPosition: true, name: true },
    });

    if (existingUser?.waitlistPosition) {
      // Already on waitlist, return current info
      const totalUsers = await this.getTotalRegisteredCount();
      return {
        position: existingUser.waitlistPosition,
        totalUsers,
        name: existingUser.name,
      };
    }

    // Atomic position assignment via DB transaction
    // Uses MAX(waitlistPosition) + 1 to ensure unique sequential positions
    const result = await prisma.$transaction(async (tx) => {
      const maxResult = await tx.user.aggregate({
        _max: { waitlistPosition: true },
      });
      const nextPosition = (maxResult._max.waitlistPosition || 0) + 1;

      const user = await tx.user.update({
        where: { id: userId },
        data: { waitlistPosition: nextPosition },
        select: { name: true, waitlistPosition: true },
      });

      return { position: nextPosition, name: user.name };
    });

    const totalUsers = await this.getTotalRegisteredCount();

    logger.info({ userId, position: result.position }, 'User added to launch waitlist');

    return {
      position: result.position,
      totalUsers,
      name: result.name,
    };
  }

  /**
   * Get a registered user's waitlist position and stats.
   */
  async getUserWaitlistInfo(userId: string): Promise<UserWaitlistInfo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { waitlistPosition: true, name: true, launchAccessGranted: true },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const totalUsers = await this.getTotalRegisteredCount();

    return {
      position: user.waitlistPosition || 0,
      totalUsers,
      name: user.name,
    };
  }

  /**
   * Get total count of registered (verified) users for the waitlist page.
   * Always queries DB for accuracy — COUNT with index is <1ms.
   */
  async getTotalRegisteredCount(): Promise<number> {
    return prisma.user.count({
      where: { emailVerified: true },
    });
  }

  // ─── Private Helpers ─────────────────────────────────────────────────

  private async checkIpRateLimit(ipAddress: string): Promise<void> {
    const key = `${WAITLIST_IP_PREFIX}${ipAddress}`;
    const count = await redis.incr(key);

    if (count === 1) {
      // First request from this IP, set TTL
      await redis.expire(key, IP_RATE_LIMIT_TTL);
    }

    if (count > MAX_SIGNUPS_PER_IP) {
      logger.warn({ ip: ipAddress, count }, 'Waitlist rate limit exceeded');
      throw new TooManyRequestsError(
        'Too many signup attempts. Please try again later.',
        'WAITLIST_RATE_LIMITED',
      );
    }
  }

  private async checkDuplicateEmail(email: string): Promise<void> {
    // Fast check via Redis
    const cached = await redis.get(`${WAITLIST_EMAIL_PREFIX}${email}`);
    if (cached) {
      throw new ConflictError('This email is already on the waitlist.', 'EMAIL_ALREADY_REGISTERED');
    }

    // Fallback check via database (in case Redis cache expired)
    const existing = await prisma.waitlistUser.findUnique({
      where: { email },
    });

    if (existing) {
      // Re-cache for future fast lookups
      await redis.set(`${WAITLIST_EMAIL_PREFIX}${email}`, '1', 'EX', 86400 * 30);
      throw new ConflictError('This email is already on the waitlist.', 'EMAIL_ALREADY_REGISTERED');
    }
  }
}

export const waitlistService = new WaitlistService();
