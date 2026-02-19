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

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds
const SHUTDOWN_TIMEOUT_MS = 10_000; // 10 seconds forced exit

let heartbeatTimer: NodeJS.Timeout | null = null;

async function startWorker(): Promise<void> {
  try {
    logger.info({ env: config.nodeEnv }, 'Starting StarkDCA worker...');

    // Connect infrastructure (same as web server)
    await connectDatabase();
    await connectRedis();

    // Start DCA cron scheduler
    // Uses distributed Redis locks — safe to run multiple instances
    startDcaCron();

    // ─── Health-check Heartbeat ────────────────────────────────────
    // Periodic log so orchestrators (Render, Docker) can verify the
    // worker is alive. Also useful for log-based alerting.
    heartbeatTimer = setInterval(() => {
      logger.debug('worker heartbeat — alive');
    }, HEARTBEAT_INTERVAL_MS);
    heartbeatTimer.unref(); // Don't prevent process exit

    logger.info('StarkDCA worker running — DCA cron scheduler active');

    // ─── Graceful Shutdown ─────────────────────────────────────────
    let isShuttingDown = false;

    const shutdown = async (signal: string) => {
      if (isShuttingDown) return; // Prevent double shutdown
      isShuttingDown = true;

      logger.info({ signal }, 'Worker shutting down gracefully...');

      if (heartbeatTimer) clearInterval(heartbeatTimer);
      stopDcaCron();

      await disconnectDatabase();
      await disconnectRedis();

      logger.info('Worker stopped');
      process.exit(0);
    };

    // Force exit after timeout (mirrors server.ts behaviour)
    const forceShutdown = (signal: string) => {
      void shutdown(signal);
      setTimeout(() => {
        logger.error('Worker forced shutdown after timeout');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS).unref();
    };

    process.on('SIGTERM', () => forceShutdown('SIGTERM'));
    process.on('SIGINT', () => forceShutdown('SIGINT'));

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
