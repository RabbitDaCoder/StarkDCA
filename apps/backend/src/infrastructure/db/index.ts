import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
    datasourceUrl: config.db.url,
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

// ─── Graceful Shutdown ───────────────────────────────────────────────
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed');
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
