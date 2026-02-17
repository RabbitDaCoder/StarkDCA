import { z } from 'zod';

// Password validation rules for security:
// - At least 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  );

const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

// ─── Body Schemas ────────────────────────────────────────────────────

const signupBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: emailSchema,
  password: passwordSchema,
});

const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
});

const connectWalletBodySchema = z.object({
  starknetAddress: z
    .string()
    .min(1, 'Starknet address is required')
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid Starknet address format'),
  signature: z.string().min(1, 'Signature is required').optional(),
  message: z.string().min(1, 'Message is required').optional(),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Schemas for validate middleware ─────────────────────────────────

export const signupSchema = {
  body: signupBodySchema,
};

export const loginSchema = {
  body: loginBodySchema,
};

export const googleCallbackSchema = {
  query: googleCallbackQuerySchema,
};

export const connectWalletSchema = {
  body: connectWalletBodySchema,
};

export const refreshTokenSchema = {
  body: refreshTokenBodySchema,
};

export type SignupInput = z.infer<typeof signupBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type GoogleCallbackInput = z.infer<typeof googleCallbackQuerySchema>;
export type ConnectWalletInput = z.infer<typeof connectWalletBodySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>;
