// ─── Single Entry Point for Vercel Serverless ───────────────────────
// All routes are handled here. Vercel routes everything to this file.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from './lib/auth';
import { validateBody, sendOtpSchema, sendEmailSchema } from './lib/validate';
import { getConfig } from './lib/config';
import { getProvider } from './lib/providers';
import { getOtpEmailTemplate } from './lib/templates';
import {
  getWaitlistWelcomeTemplate,
  getSignupWelcomeTemplate,
  getWaitlistConfirmationTemplate,
  getLaunchEmailTemplate,
  getCustomTemplate,
} from './lib/templates';
import { handleCors, sendSuccess, sendError } from './lib/response';
import type { EmailOptions } from './lib/types';

// ─── Route: Health Check ─────────────────────────────────────────────
async function handleHealth(_req: VercelRequest, res: VercelResponse): Promise<void> {
  sendSuccess(res, {
    status: 'ok',
    service: 'starkdca-email-endpoint',
    timestamp: new Date().toISOString(),
  });
}

// ─── Route: Send OTP ─────────────────────────────────────────────────
async function handleSendOtp(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED');
    return;
  }

  const auth = authenticateRequest(req);
  if (!auth.valid) {
    sendError(res, auth.error || 'Unauthorized', 401, 'UNAUTHORIZED');
    return;
  }

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

    await provider.send({ to, subject: 'Your StarkDCA Verification Code', html, text }, config);

    sendSuccess(res, { sent: true, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[send-otp] Failed to send email:', { to, error: message });
    sendError(res, `Failed to send OTP email: ${message}`, 500, 'EMAIL_SEND_FAILED');
  }
}

// ─── Route: Send Email ───────────────────────────────────────────────
async function handleSendEmail(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendError(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED');
    return;
  }

  const auth = authenticateRequest(req);
  if (!auth.valid) {
    sendError(res, auth.error || 'Unauthorized', 401, 'UNAUTHORIZED');
    return;
  }

  const validation = validateBody(req.body, sendEmailSchema);
  if (!validation.success) {
    sendError(res, `Validation failed: ${validation.errors.join('; ')}`, 422, 'VALIDATION_ERROR');
    return;
  }

  const { type, to, name, subject, position, templateName, variables } = validation.data;

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
        emailOptions = { to, subject: 'Welcome to StarkDCA!', html: tpl.html, text: tpl.text };
        break;
      }

      case 'waitlist-confirmation': {
        if (!position) {
          sendError(res, 'position is required for waitlist-confirmation', 422, 'VALIDATION_ERROR');
          return;
        }
        const tpl = getWaitlistConfirmationTemplate(name, position);
        emailOptions = { to, subject: "You're on the Waitlist 🎉", html: tpl.html, text: tpl.text };
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
        emailOptions = { to, subject, html: tpl.html };
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

// ─── Main Handler (Router) ───────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS for all routes
  if (handleCors(req, res)) return;

  // Parse pathname
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  // Route matching
  if (path === '/api/health' || path === '/health') {
    return handleHealth(req, res);
  }

  if (path === '/api/send-otp' || path === '/send-otp') {
    return handleSendOtp(req, res);
  }

  if (path === '/api/send-email' || path === '/send-email') {
    return handleSendEmail(req, res);
  }

  // 404 for unknown routes
  sendError(res, `Not found: ${path}`, 404, 'NOT_FOUND');
}
