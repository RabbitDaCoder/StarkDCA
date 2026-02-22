// ─── Admin Service ───────────────────────────────────────────────────
// Handles admin operations: user management, bulk emails, exports,
// platform overview, plan monitoring, system health.

import { prisma } from '../../infrastructure/db';
import { emailService } from '../../infrastructure/email';
import { logger } from '../../infrastructure/logger';
import { getRedis } from '../../infrastructure/redis';
import type { SendEmailInput, SendBulkEmailInput } from './admin.schema';

interface EmailResult {
  success: number;
  failed: number;
  total: number;
}

class AdminService {
  /**
   * Get all waitlist users with pagination and filtering.
   */
  async getWaitlistUsers(options: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'email';
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }) {
    const { sortBy = 'createdAt', sortOrder = 'desc', search } = options;
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;

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

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all registered users with pagination.
   */
  async getUsers(options: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name' | 'email';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const { sortBy = 'createdAt', sortOrder = 'desc', search, role } = options;
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          launchAccessGranted: true,
          starknetAddress: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Export waitlist to CSV.
   */
  async exportWaitlistCsv(): Promise<string> {
    const users = await prisma.waitlistUser.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Name', 'Email', 'Source', 'IP Address', 'Signed Up At'];
    const rows = users.map((user) => [
      user.id,
      `"${user.name.replace(/"/g, '""')}"`,
      user.email,
      user.source || '',
      user.ipAddress || '',
      user.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Send email to specific recipients.
   */
  async sendEmail(input: SendEmailInput): Promise<EmailResult> {
    const { recipients, subject, template, variables } = input;

    let success = 0;
    let failed = 0;

    for (const email of recipients) {
      try {
        await emailService.sendCustomEmail(email, subject, template, variables);
        success++;
      } catch (error) {
        logger.error({ error, email }, 'Failed to send email');
        failed++;
      }
    }

    logger.info({ success, failed, total: recipients.length }, 'Bulk email completed');

    return { success, failed, total: recipients.length };
  }

  /**
   * Send bulk email to waitlist users.
   */
  async sendBulkEmail(input: SendBulkEmailInput): Promise<EmailResult> {
    const { filter, recentDays, subject, template, variables } = input;

    // Build filter query
    let where: any = {};

    if (filter === 'recent' && recentDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - recentDays);
      where.createdAt = { gte: cutoff };
    }

    // Get all matching waitlist users
    const users = await prisma.waitlistUser.findMany({
      where,
      select: { email: true, name: true },
    });

    let success = 0;
    let failed = 0;

    // Send emails in batches to avoid overwhelming the email provider
    const BATCH_SIZE = 10;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Inject user-specific variables
            const userVars = { ...variables, name: user.name.split(' ')[0] };
            await emailService.sendCustomEmail(user.email, subject, template, userVars);
            success++;
          } catch (error) {
            logger.error({ error, email: user.email }, 'Failed to send bulk email');
            failed++;
          }
        }),
      );

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    logger.info(
      { success, failed, total: users.length, filter },
      'Bulk email to waitlist completed',
    );

    return { success, failed, total: users.length };
  }

  /**
   * Get dashboard stats for admin.
   */
  async getDashboardStats() {
    const [totalWaitlist, totalUsers, verifiedUsers, waitlistToday, usersToday] = await Promise.all(
      [
        prisma.waitlistUser.count(),
        prisma.user.count(),
        prisma.user.count({ where: { emailVerified: true } }),
        prisma.waitlistUser.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ],
    );

    // Get signups by day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const waitlistByDay = await prisma.waitlistUser.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      totalWaitlist,
      totalUsers,
      verifiedUsers,
      waitlistToday,
      usersToday,
      recentTrend: waitlistByDay,
    };
  }

  // ─── Platform Overview ───────────────────────────────────────────
  /**
   * Get comprehensive platform stats for admin dashboard.
   */
  async getPlatformOverview() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [
      totalUsers,
      totalPlans,
      activePlans,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      todayExecutions,
      totalDepositedResult,
      totalBtcResult,
      usersToday,
      plansToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dCAPlan.count(),
      prisma.dCAPlan.count({ where: { status: 'ACTIVE' } }),
      prisma.executionHistory.count(),
      prisma.executionHistory.count({ where: { status: 'SUCCESS' } }),
      prisma.executionHistory.count({ where: { status: 'FAILED' } }),
      prisma.executionHistory.count({ where: { executedAt: { gte: today } } }),
      prisma.$queryRaw<
        [{ sum: string }]
      >`SELECT COALESCE(SUM(CAST(total_deposited AS DECIMAL)), 0) as sum FROM dca_plans`,
      prisma.$queryRaw<
        [{ sum: string }]
      >`SELECT COALESCE(SUM(CAST(amount_out AS DECIMAL)), 0) as sum FROM execution_history WHERE status = 'SUCCESS'`,
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.dCAPlan.count({ where: { createdAt: { gte: today } } }),
    ]);

    return {
      users: { total: totalUsers, today: usersToday },
      plans: { total: totalPlans, active: activePlans, today: plansToday },
      executions: {
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions,
        today: todayExecutions,
        successRate:
          totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0,
      },
      volume: {
        totalDeposited: parseFloat(totalDepositedResult[0]?.sum || '0'),
        totalBtcAccumulated: parseFloat(totalBtcResult[0]?.sum || '0'),
      },
    };
  }

  // ─── All Plans (Platform-wide) ──────────────────────────────────
  /**
   * Get all DCA plans with user info, for admin monitoring.
   */
  async getAllPlans(options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [plans, total] = await Promise.all([
      prisma.dCAPlan.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { executions: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dCAPlan.count({ where }),
    ]);

    return {
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── System Health ──────────────────────────────────────────────
  /**
   * Check system health (DB, Redis, etc.)
   */
  async getSystemHealth() {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
    } catch (err: any) {
      checks.database = {
        status: 'unhealthy',
        latencyMs: Date.now() - dbStart,
        error: err.message,
      };
    }

    // Redis check
    const redisStart = Date.now();
    try {
      const redis = getRedis();
      await redis.ping();
      checks.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
    } catch (err: any) {
      checks.redis = {
        status: 'unhealthy',
        latencyMs: Date.now() - redisStart,
        error: err.message,
      };
    }

    // Memory usage
    const memUsage = process.memoryUsage();

    return {
      status: Object.values(checks).every((c) => c.status === 'healthy') ? 'healthy' : 'degraded',
      uptime: Math.floor(process.uptime()),
      checks,
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
    };
  }

  // ─── User Suspend / Reactivate ──────────────────────────────────
  async suspendUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { launchAccessGranted: false },
      select: { id: true, name: true, email: true, launchAccessGranted: true },
    });

    // Cancel all active plans for suspended user
    await prisma.dCAPlan.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    logger.info({ userId }, 'User suspended by admin');
    return user;
  }

  async reactivateUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { launchAccessGranted: true },
      select: { id: true, name: true, email: true, launchAccessGranted: true },
    });

    logger.info({ userId }, 'User reactivated by admin');
    return user;
  }

  // ─── Execution Analytics ────────────────────────────────────────
  async getExecutionAnalytics(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const executions = await prisma.$queryRaw<
      Array<{ date: string; total: string; success: string; failed: string; volume: string }>
    >`
      SELECT 
        DATE(executed_at) as date,
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'SUCCESS')::text as success,
        COUNT(*) FILTER (WHERE status = 'FAILED')::text as failed,
        COALESCE(SUM(CAST(amount_in AS DECIMAL)) FILTER (WHERE status = 'SUCCESS'), 0)::text as volume
      FROM execution_history
      WHERE executed_at >= ${since}
      GROUP BY DATE(executed_at)
      ORDER BY date ASC
    `;

    return executions.map((row) => ({
      date: row.date,
      total: parseInt(row.total),
      success: parseInt(row.success),
      failed: parseInt(row.failed),
      volume: parseFloat(row.volume),
    }));
  }
}

export const adminService = new AdminService();
