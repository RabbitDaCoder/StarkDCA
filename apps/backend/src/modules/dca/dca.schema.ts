import { z } from 'zod';

export const createPlanSchema = z.object({
  depositTokenAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid token address')
    .default('0x_USDT_ADDRESS'),
  targetTokenAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid token address')
    .default('0x_WBTC_ADDRESS'),
  amountPerExecution: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => {
      const n = BigInt(v);
      return n > BigInt(0);
    }, 'Amount must be positive'),
  totalExecutions: z
    .number()
    .int()
    .min(1, 'At least 1 execution required')
    .max(365, 'Maximum 365 executions'),
  interval: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']),
});

export const cancelPlanSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

export const getPlanSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
});

export const listPlansQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
});

export const executionLogsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
