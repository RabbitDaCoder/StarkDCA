// ─── CORS & Response Helpers ─────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConfig } from './config';
import type { ApiResponse } from './types';

/**
 * Set CORS headers on the response.
 * Returns true if the request is a preflight (OPTIONS) request that was handled.
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const config = getConfig();
  const origin = req.headers.origin || '';

  // Check if origin is allowed
  const isAllowed = config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin);

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

/**
 * Send a structured JSON success response.
 */
export function sendSuccess<T>(res: VercelResponse, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
}

/**
 * Send a structured JSON error response.
 */
export function sendError(res: VercelResponse, message: string, status = 400, code?: string): void {
  const body: ApiResponse = { success: false, error: message, code };
  res.status(status).json(body);
}
