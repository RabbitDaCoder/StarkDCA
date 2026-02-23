import { z } from 'zod';

export const createPlanSchema = z.object({
  depositTokenAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid token address')
    .default('0x2b4e08333782d7b4ef03de812c72fe43942e31948c6acd8bf7f80a31d766b9'),
  targetTokenAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid token address')
    .default('0x14caa56b33c13a4c09967735793199d4dd565e973b21fb390a1d5e66d9ef69e'),
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
  interval: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'])),
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
