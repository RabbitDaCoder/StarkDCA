// ─── Request Validation ──────────────────────────────────────────────

import { z } from 'zod';

export const sendOtpSchema = z.object({
  to: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const sendEmailSchema = z.object({
  type: z.enum(['waitlist-welcome', 'signup-welcome', 'waitlist-confirmation', 'launch', 'custom']),
  to: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  subject: z.string().max(200).optional(),
  position: z.number().int().positive().optional(),
  templateName: z.string().max(50).optional(),
  variables: z.record(z.string()).optional(),
});

/**
 * Validate request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}
