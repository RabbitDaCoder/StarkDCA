// ─── Launch Service ──────────────────────────────────────────────────
// Handles platform launch: granting access and sending launch emails.
// Uses background processing for mass email to avoid timeouts.

import { prisma } from '../../infrastructure/db';
import { redis } from '../../infrastructure/redis';
import { emailService } from '../../infrastructure/email';
import { logger } from '../../infrastructure/logger';
import { config } from '../../config';
import { ConflictError, BadRequestError } from '../../utils/errors';

const LAUNCH_LOCK_KEY = 'platform:launch:lock';
const LAUNCH_STATUS_KEY = 'platform:launch:status';
const LAUNCH_EMAIL_PROGRESS_KEY = 'platform:launch:email:progress';

interface LaunchResult {
  usersUpdated: number;
  emailsQueued: number;
  launchedAt: string;
  launchedBy: string;
}

interface LaunchStatus {
  launched: boolean;
  launchedAt: string | null;
  launchedBy: string | null;
  emailProgress: {
    total: number;
    sent: number;
    failed: number;
    inProgress: boolean;
  };
}

class LaunchService {
  /**
   * Trigger platform launch.
   * - Updates launchAccessGranted = true for all verified users
   * - Queues launch emails for all users
   * - Idempotent: cannot launch twice
   *
   * Security: Uses distributed lock to prevent concurrent launches.
   */
  async triggerLaunch(adminUserId: string): Promise<LaunchResult> {
    // 1. Check if already launched (idempotency)
    const alreadyLaunched = await redis.get(LAUNCH_STATUS_KEY);
    if (alreadyLaunched) {
      throw new ConflictError('Platform has already been launched', 'ALREADY_LAUNCHED');
    }

    // 2. Acquire distributed lock to prevent concurrent launch triggers
    const lockAcquired = await redis.set(LAUNCH_LOCK_KEY, adminUserId, 'EX', 300, 'NX');
    if (!lockAcquired) {
      throw new ConflictError('Launch is already in progress', 'LAUNCH_IN_PROGRESS');
    }

    try {
      // 3. Update all verified users: grant dashboard access
      const updateResult = await prisma.user.updateMany({
        where: {
          emailVerified: true,
          launchAccessGranted: false,
        },
        data: {
          launchAccessGranted: true,
        },
      });

      const launchedAt = new Date().toISOString();

      // 4. Mark launch status in Redis (permanent)
      await redis.set(
        LAUNCH_STATUS_KEY,
        JSON.stringify({
          launched: true,
          launchedAt,
          launchedBy: adminUserId,
        }),
      );

      // 5. Log the launch event
      logger.info(
        {
          adminUserId,
          usersUpdated: updateResult.count,
          launchedAt,
        },
        'PLATFORM LAUNCHED — All verified users granted access',
      );

      // 6. Start background email send (non-blocking)
      this.sendLaunchEmailsInBackground(adminUserId).catch((err) => {
        logger.error({ error: err }, 'Background launch email process failed');
      });

      return {
        usersUpdated: updateResult.count,
        emailsQueued: updateResult.count,
        launchedAt,
        launchedBy: adminUserId,
      };
    } finally {
      // Release lock
      await redis.del(LAUNCH_LOCK_KEY);
    }
  }

  /**
   * Send launch emails to all verified users in background batches.
   * Marks launchEmailSent = true on each user to ensure idempotency.
   */
  private async sendLaunchEmailsInBackground(adminUserId: string): Promise<void> {
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES_MS = 1500;

    // Get all verified users who haven't received the launch email
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true,
        launchEmailSent: false,
        email: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    let sent = 0;
    let failed = 0;
    const total = users.length;

    // Update progress in Redis
    await redis.set(
      LAUNCH_EMAIL_PROGRESS_KEY,
      JSON.stringify({ total, sent: 0, failed: 0, inProgress: true }),
    );

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            if (!user.email) return;

            const firstName = user.name?.split(' ')[0] || 'there';
            await emailService.sendLaunchEmail(user.email, firstName);

            // Mark as sent (idempotency)
            await prisma.user.update({
              where: { id: user.id },
              data: { launchEmailSent: true },
            });

            sent++;
          } catch (error) {
            logger.error(
              { error, userId: user.id, email: user.email },
              'Failed to send launch email to user',
            );
            failed++;
          }
        }),
      );

      // Update progress
      await redis.set(
        LAUNCH_EMAIL_PROGRESS_KEY,
        JSON.stringify({ total, sent, failed, inProgress: i + BATCH_SIZE < users.length }),
      );

      // Throttle between batches to respect email provider rate limits
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
      }
    }

    // Final progress update
    await redis.set(
      LAUNCH_EMAIL_PROGRESS_KEY,
      JSON.stringify({ total, sent, failed, inProgress: false }),
    );

    logger.info({ total, sent, failed, adminUserId }, 'Launch email campaign completed');
  }

  /**
   * Get current launch status for admin panel.
   */
  async getLaunchStatus(): Promise<LaunchStatus> {
    const statusRaw = await redis.get(LAUNCH_STATUS_KEY);
    const progressRaw = await redis.get(LAUNCH_EMAIL_PROGRESS_KEY);

    let launched = false;
    let launchedAt: string | null = null;
    let launchedBy: string | null = null;

    if (statusRaw) {
      const parsed = JSON.parse(statusRaw);
      launched = parsed.launched;
      launchedAt = parsed.launchedAt;
      launchedBy = parsed.launchedBy;
    }

    let emailProgress = { total: 0, sent: 0, failed: 0, inProgress: false };
    if (progressRaw) {
      emailProgress = JSON.parse(progressRaw);
    }

    return {
      launched,
      launchedAt,
      launchedBy,
      emailProgress,
    };
  }
}

export const launchService = new LaunchService();
