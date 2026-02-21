// ─── API Key Authentication ──────────────────────────────────────────
// Validates the shared secret between the backend and this email service.

import type { VercelRequest } from '@vercel/node';
import { getConfig } from './config';

/**
 * Validate the API key from the request headers.
 * Expects: `Authorization: Bearer <API_KEY>` or `x-api-key: <API_KEY>`
 *
 * Uses constant-time comparison to prevent timing attacks.
 */
export function authenticateRequest(req: VercelRequest): { valid: boolean; error?: string } {
  const config = getConfig();

  // Check Authorization header first, then x-api-key
  const authHeader = req.headers['authorization'];
  const apiKeyHeader = req.headers['x-api-key'];

  let providedKey = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.slice(7);
  } else if (typeof apiKeyHeader === 'string') {
    providedKey = apiKeyHeader;
  }

  if (!providedKey) {
    return {
      valid: false,
      error: 'Missing API key. Provide via Authorization Bearer or x-api-key header.',
    };
  }

  // Constant-time comparison
  const expected = config.emailServiceApiKey;
  if (providedKey.length !== expected.length) {
    return { valid: false, error: 'Invalid API key' };
  }

  const a = Buffer.from(providedKey);
  const b = Buffer.from(expected);

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a[i] ^ b[i];
  }

  if (mismatch !== 0) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}
