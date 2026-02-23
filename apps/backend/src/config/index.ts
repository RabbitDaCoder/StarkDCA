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

  // CORS (comma-separated for multiple origins, e.g. https://www.starkdca.xyz,https://starkdca.xyz)
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Redis TTLs (seconds)
  PRICE_CACHE_TTL: z.coerce.number().default(60),
  PLAN_CACHE_TTL: z.coerce.number().default(30),
  IDEMPOTENCY_TTL: z.coerce.number().default(86400),
  DISTRIBUTED_LOCK_TTL: z.coerce.number().default(30),

  // ─── Email Service (Vercel endpoint) ───────────────────────────────
  EMAIL_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  EMAIL_SERVICE_API_KEY: z.string().min(16).default('dev-email-service-key-placeholder'),

  // ─── Google OAuth ────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:4000/api/v1/auth/google/callback'),

  // ─── Frontend URLs ───────────────────────────────────────────────
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // ─── Bcrypt ──────────────────────────────────────────────────────
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // ─── Worker / Cron ───────────────────────────────────────────────
  // Set to "false" to disable in-process cron (production web server).
  // The dedicated worker process ignores this flag.
  ENABLE_CRON: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
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
    origin: env.CORS_ORIGIN.includes(',')
      ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : env.CORS_ORIGIN,
  },

  cache: {
    priceTtl: env.PRICE_CACHE_TTL,
    planTtl: env.PLAN_CACHE_TTL,
    idempotencyTtl: env.IDEMPOTENCY_TTL,
    lockTtl: env.DISTRIBUTED_LOCK_TTL,
  },

  emailService: {
    url: env.EMAIL_SERVICE_URL,
    apiKey: env.EMAIL_SERVICE_API_KEY,
  },

  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackUrl: env.GOOGLE_CALLBACK_URL,
    },
  },

  frontend: {
    url: env.FRONTEND_URL,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  enableCron: env.ENABLE_CRON,
} as const;

export type Config = typeof config;
