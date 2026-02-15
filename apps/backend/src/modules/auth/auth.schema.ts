import { z } from 'zod';

// ─── Starknet signature-based auth (wallet connect) ──────────────────
export const connectWalletSchema = z.object({
  starknetAddress: z
    .string()
    .min(1, 'Starknet address is required')
    .regex(/^0x[0-9a-fA-F]+$/, 'Invalid Starknet address format'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type ConnectWalletInput = z.infer<typeof connectWalletSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
