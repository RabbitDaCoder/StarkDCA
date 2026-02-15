import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ─── Validated Environment Schema ────────────────────────────────────
const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Starknet
  STARKNET_RPC_URL: z.string().url().default('https://starknet-sepolia.public.blastapi.io'),
  DCA_CONTRACT_ADDRESS: z.string().default(''),
  EXECUTOR_PRIVATE_KEY: z.string().default(''),
  EXECUTOR_ADDRESS: z.string().default(''),

  // Price API
  PRICE_API_URL: z.string().url().default('https://api.coingecko.com/api/v3'),
  PRICE_API_KEY: z.string().default(''),

  // Cron
  DCA_CRON_SCHEDULE: z.string().default('*/1 * * * *'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Redis TTLs (seconds)
  PRICE_CACHE_TTL: z.coerce.number().default(60),
  PLAN_CACHE_TTL: z.coerce.number().default(30),
  IDEMPOTENCY_TTL: z.coerce.number().default(86400),
  DISTRIBUTED_LOCK_TTL: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  db: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  starknet: {
    rpcUrl: env.STARKNET_RPC_URL,
    contractAddress: env.DCA_CONTRACT_ADDRESS,
    executorPrivateKey: env.EXECUTOR_PRIVATE_KEY,
    executorAddress: env.EXECUTOR_ADDRESS,
  },

  price: {
    apiUrl: env.PRICE_API_URL,
    apiKey: env.PRICE_API_KEY,
    cacheTtl: env.PRICE_CACHE_TTL,
  },

  cron: {
    schedule: env.DCA_CRON_SCHEDULE,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  cache: {
    priceTtl: env.PRICE_CACHE_TTL,
    planTtl: env.PLAN_CACHE_TTL,
    idempotencyTtl: env.IDEMPOTENCY_TTL,
    lockTtl: env.DISTRIBUTED_LOCK_TTL,
  },
} as const;

export type Config = typeof config;
