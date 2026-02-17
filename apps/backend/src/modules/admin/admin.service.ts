// ─── Admin Service ───────────────────────────────────────────────────
// Handles admin operations: user management, bulk emails, exports.

import { prisma } from '../../infrastructure/db';
import { emailService } from '../../infrastructure/email';
import { logger } from '../../infrastructure/logger';
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
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      role,
    } = options;

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
    const [totalWaitlist, totalUsers, waitlistToday, usersToday] = await Promise.all([
      prisma.waitlistUser.count(),
      prisma.user.count(),
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
    ]);

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
      waitlistToday,
      usersToday,
      recentTrend: waitlistByDay,
    };
  }
}

export const adminService = new AdminService();
