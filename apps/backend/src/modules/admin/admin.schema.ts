// ─── Admin Validation Schemas ────────────────────────────────────────
// Zod schemas for admin operations.

import { z } from 'zod';

// Query schema for getting waitlist users
const getWaitlistUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().max(100).optional(),
});

// Body schema for sending emails
const sendEmailBodySchema = z.object({
  recipients: z.array(z.string().email()).min(1).max(1000),
  subject: z.string().min(1).max(200),
  template: z.enum(['announcement', 'launch']).default('announcement'),
  variables: z.record(z.string()).default({}),
});

// Body schema for bulk email
const sendBulkEmailBodySchema = z.object({
  filter: z.enum(['all', 'recent', 'custom']).default('all'),
  recentDays: z.coerce.number().min(1).max(365).optional(),
  subject: z.string().min(1).max(200),
  template: z.enum(['announcement', 'launch']).default('announcement'),
  variables: z.record(z.string()).default({}),
});

// Schemas for validate middleware
export const getWaitlistUsersSchema = {
  query: getWaitlistUsersQuerySchema,
};

export const sendEmailSchema = {
  body: sendEmailBodySchema,
};

export const sendBulkEmailSchema = {
  body: sendBulkEmailBodySchema,
};

export type GetWaitlistUsersInput = z.infer<typeof getWaitlistUsersQuerySchema>;
export type SendEmailInput = z.infer<typeof sendEmailBodySchema>;
export type SendBulkEmailInput = z.infer<typeof sendBulkEmailBodySchema>;
