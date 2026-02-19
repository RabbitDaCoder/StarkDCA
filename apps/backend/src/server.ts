// ─── Server Entry Point ──────────────────────────────────────────────
// Bootstraps Express, connects infrastructure, mounts middleware + routes.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { config } from './config';
import { logger } from './infrastructure/logger';
import { connectDatabase, disconnectDatabase } from './infrastructure/db';
import { connectRedis, disconnectRedis } from './infrastructure/redis';

import { errorHandler } from './middleware';
import { requestLogger } from './middleware/request-logger';
import { setupSwagger } from './swagger';
import routes from './routes';
import { startDcaCron, stopDcaCron } from './modules/execution';

// ─── Express App ─────────────────────────────────────────────────────
const app = express();

// ─── Security ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  }),
);

// ─── Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── API Documentation ──────────────────────────────────────────────
if (!config.isProduction) {
  setupSwagger(app);
}

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ─── Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    // Connect infrastructure
    await connectDatabase();
    await connectRedis();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(
        { port: config.port, env: config.nodeEnv },
        `StarkDCA backend running on port ${config.port}`,
      );

      // In production, cron runs in a dedicated worker service.
      // For local dev, cron runs in the same process for convenience.
      if (config.enableCron) {
        startDcaCron();
        logger.info('DCA cron scheduler started (in-process)');
      } else {
        logger.info('DCA cron scheduler disabled — handled by worker service');
      }
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down gracefully...');

      stopDcaCron();

      server.close(async () => {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Catch unhandled errors
    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, 'Uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.fatal({ err: reason }, 'Unhandled rejection');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();

export default app;
