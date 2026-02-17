// ─── Waitlist Validation Schemas ─────────────────────────────────────
// Zod schemas for waitlist signup and queries.

import { z } from 'zod';

// Strong email validation regex
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Body schema for join waitlist
const joinWaitlistBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .regex(emailRegex, 'Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  source: z.string().max(50).optional(),
});

// Schema for validate middleware
export const joinWaitlistSchema = {
  body: joinWaitlistBodySchema,
};

export type JoinWaitlistInput = z.infer<typeof joinWaitlistBodySchema>;
