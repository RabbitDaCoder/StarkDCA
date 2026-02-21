// ─── POST /api/send-email ────────────────────────────────────────────
// Sends transactional emails (waitlist welcome, signup, launch, custom).
// Protected by API key.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../lib/auth';
import { validateBody, sendEmailSchema } from '../lib/validate';
import { getConfig } from '../lib/config';
import { getProvider } from '../lib/providers';
import {
  getWaitlistWelcomeTemplate,
  getSignupWelcomeTemplate,
  getWaitlistConfirmationTemplate,
  getLaunchEmailTemplate,
  getCustomTemplate,
  getPasswordResetTemplate,
} from '../lib/templates';
import { handleCors, sendSuccess, sendError } from '../lib/response';
import type { EmailOptions } from '../lib/types';

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
  const validation = validateBody(req.body, sendEmailSchema);
  if (!validation.success) {
    sendError(res, `Validation failed: ${validation.errors.join('; ')}`, 422, 'VALIDATION_ERROR');
    return;
  }

  const { type, to, name, subject, position, resetUrl, templateName, variables } = validation.data;

  try {
    const config = getConfig();
    const provider = getProvider(config);

    let emailOptions: EmailOptions;

    switch (type) {
      case 'waitlist-welcome': {
        const tpl = getWaitlistWelcomeTemplate(name);
        emailOptions = {
          to,
          subject: 'Welcome to the StarkDCA Waitlist!',
          html: tpl.html,
          text: tpl.text,
        };
        break;
      }

      case 'signup-welcome': {
        const tpl = getSignupWelcomeTemplate(name, config.frontendUrl);
        emailOptions = {
          to,
          subject: 'Welcome to StarkDCA!',
          html: tpl.html,
          text: tpl.text,
        };
        break;
      }

      case 'waitlist-confirmation': {
        if (!position) {
          sendError(res, 'position is required for waitlist-confirmation', 422, 'VALIDATION_ERROR');
          return;
        }
        const tpl = getWaitlistConfirmationTemplate(name, position);
        emailOptions = {
          to,
          subject: "You're on the Waitlist 🎉",
          html: tpl.html,
          text: tpl.text,
        };
        break;
      }

      case 'launch': {
        const tpl = getLaunchEmailTemplate(name, config.frontendUrl);
        emailOptions = {
          to,
          subject: '🚀 StarkDCA is Live — Your Dashboard is Ready!',
          html: tpl.html,
          text: tpl.text,
        };
        break;
      }

      case 'password-reset': {
        if (!resetUrl) {
          sendError(res, 'resetUrl is required for password-reset', 422, 'VALIDATION_ERROR');
          return;
        }
        const tpl = getPasswordResetTemplate(name, resetUrl);
        emailOptions = {
          to,
          subject: 'Reset Your StarkDCA Password',
          html: tpl.html,
          text: tpl.text,
        };
        break;
      }

      case 'custom': {
        if (!subject) {
          sendError(res, 'subject is required for custom emails', 422, 'VALIDATION_ERROR');
          return;
        }
        const tpl = getCustomTemplate(
          templateName || 'announcement',
          variables || {},
          config.frontendUrl,
        );
        emailOptions = {
          to,
          subject,
          html: tpl.html,
        };
        break;
      }

      default:
        sendError(res, `Unknown email type: ${type}`, 422, 'INVALID_TYPE');
        return;
    }

    await provider.send(emailOptions, config);

    sendSuccess(res, { sent: true, to, type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[send-email] Failed to send email:', { to, type, error: message });
    sendError(res, `Failed to send email: ${message}`, 500, 'EMAIL_SEND_FAILED');
  }
}
