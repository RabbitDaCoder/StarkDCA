// ─── POST /api/send-otp ──────────────────────────────────────────────
// Sends OTP verification email. Protected by API key.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../lib/auth';
import { validateBody, sendOtpSchema } from '../lib/validate';
import { getConfig } from '../lib/config';
import { getProvider } from '../lib/providers';
import { getOtpEmailTemplate } from '../lib/templates';
import { handleCors, sendSuccess, sendError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS
  if (handleCors(req, res)) return;

  // Only POST
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED');
    return;
  }

  // Authenticate
  const auth = authenticateRequest(req);
  if (!auth.valid) {
    sendError(res, auth.error || 'Unauthorized', 401, 'UNAUTHORIZED');
    return;
  }

  // Validate body
  const validation = validateBody(req.body, sendOtpSchema);
  if (!validation.success) {
    sendError(res, `Validation failed: ${validation.errors.join('; ')}`, 422, 'VALIDATION_ERROR');
    return;
  }

  const { to, name, otp } = validation.data;

  try {
    const config = getConfig();
    const provider = getProvider(config);
    const { html, text } = getOtpEmailTemplate(name, otp);

    await provider.send(
      {
        to,
        subject: 'Your StarkDCA Verification Code',
        html,
        text,
      },
      config,
    );

    sendSuccess(res, { sent: true, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[send-otp] Failed to send email:', { to, error: message });
    sendError(res, `Failed to send OTP email: ${message}`, 500, 'EMAIL_SEND_FAILED');
  }
}
