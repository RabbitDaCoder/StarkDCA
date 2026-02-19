// ─── Worker Entry Point ──────────────────────────────────────────────
// Standalone process for background jobs: DCA cron execution.
// Does NOT start an HTTP server — only connects to DB + Redis + cron.
//
// Usage: node dist/worker.js
// Render: Worker Service with this as the start command.

import { config } from './config';
import { logger } from './infrastructure/logger';
import { connectDatabase, disconnectDatabase } from './infrastructure/db';
import { connectRedis, disconnectRedis } from './infrastructure/redis';
import { startDcaCron, stopDcaCron } from './modules/execution';

async function startWorker(): Promise<void> {
  try {
    logger.info({ env: config.nodeEnv }, 'Starting StarkDCA worker...');

    // Connect infrastructure (same as web server)
    await connectDatabase();
    await connectRedis();

    // Start DCA cron scheduler
    // Uses distributed Redis locks — safe to run multiple instances
    startDcaCron();

    logger.info('StarkDCA worker running — DCA cron scheduler active');

    // ─── Graceful Shutdown ─────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Worker shutting down gracefully...');

      stopDcaCron();
      await disconnectDatabase();
      await disconnectRedis();

      logger.info('Worker stopped');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, 'Worker uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.fatal({ err: reason }, 'Worker unhandled rejection');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start worker');
    process.exit(1);
  }
}

startWorker();
