// ─── GET /api/health ─────────────────────────────────────────────────
// Health check endpoint (no auth required).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, sendSuccess } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleCors(req, res)) return;

  sendSuccess(res, {
    status: 'ok',
    service: 'starkdca-email-endpoint',
    timestamp: new Date().toISOString(),
  });
}
