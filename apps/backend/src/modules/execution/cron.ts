// ─── DCA Cron Scheduler ──────────────────────────────────────────────
// Runs every minute (configurable). Scans for due plans and executes them
// using the execution service with distributed locking.

import cron from 'node-cron';
import { config } from '../../config';
import { executionService } from './execution.service';
import { logger } from '../../infrastructure/logger';
import { withLock } from '../../utils/distributed-lock';

const CRON_LOCK_KEY = 'cron:dca-executor';
let cronJob: cron.ScheduledTask | null = null;

/**
 * Start the DCA execution cron job.
 * Uses a distributed lock so only one instance processes at a time.
 */
export function startDcaCron(): void {
  if (cronJob) {
    logger.warn('DCA cron already running');
    return;
  }

  logger.info({ schedule: config.cron.schedule }, 'DCA cron scheduler started');

  cronJob = cron.schedule(config.cron.schedule, async () => {
    logger.debug('DCA cron tick');

    // Acquire cron-level lock to prevent parallel cron runs across instances
    const result = await withLock(
      CRON_LOCK_KEY,
      async () => {
        return executionService.processDuePlans();
      },
      55,
    ); // Lock for 55 seconds (just under 1-minute cron interval)

    if (result === null) {
      logger.debug('DCA cron skipped — another instance is processing');
    }
  });
}

/**
 * Stop the DCA cron job.
 */
export function stopDcaCron(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('DCA cron scheduler stopped');
  }
}
