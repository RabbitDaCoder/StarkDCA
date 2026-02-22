// ─── StarkDCA Email Service ──────────────────────────────────────────
// Works as:
//   1. Standalone Node.js server  → npm start / npm run dev
//   2. Vercel serverless function → deployed on Vercel (uses default export)

import http from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from './lib/auth';
import { validateBody, sendOtpSchema, sendEmailSchema } from './lib/validate';
import { getConfig } from './lib/config';
import { getProvider } from './lib/providers';
import {
  getOtpEmailTemplate,
  getWaitlistWelcomeTemplate,
  getSignupWelcomeTemplate,
  getWaitlistConfirmationTemplate,
  getLaunchEmailTemplate,
  getCustomTemplate,
  getPasswordResetTemplate,
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

// ─── Standalone Server (non-Vercel) ─────────────────────────────────
// When running directly (node/tsx), start an HTTP server.
// On Vercel, this block is skipped — only the default export is used.

function isRunningDirectly(): boolean {
  // In Vercel serverless, VERCEL=1 or AWS_LAMBDA_FUNCTION_NAME is set
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  // Check if this module is the entry point
  const mainModule = process.argv[1];
  if (!mainModule) return false;
  const path = require('path');
  return path.resolve(mainModule).replace(/\\/g, '/').includes('server');
}

if (isRunningDirectly()) {
  // Load .env.local / .env for local development
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
    dotenv.config({ path: '.env' });
  } catch {
    // dotenv not installed — env vars must be set externally
  }

  const PORT = parseInt(process.env.PORT || '3001', 10);

  const server = http.createServer(async (nodeReq, nodeRes) => {
    // Collect body for POST/PUT/PATCH
    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(nodeReq.method || '')) {
      body = await new Promise<string>((resolve) => {
        let data = '';
        nodeReq.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        nodeReq.on('end', () => resolve(data));
      });
      try {
        body = JSON.parse(body);
      } catch {
        /* plain text */
      }
    }

    // Build Vercel-compatible request
    const url = new URL(nodeReq.url || '/', `http://${nodeReq.headers.host || 'localhost'}`);
    const query: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      query[k] = v;
    });

    const req = {
      method: nodeReq.method,
      url: nodeReq.url,
      headers: nodeReq.headers,
      query,
      body,
    } as unknown as VercelRequest;

    // Build Vercel-compatible response
    const res = {
      _statusCode: 200,
      _headers: {} as Record<string, string>,
      _sent: false,
      status(code: number) {
        this._statusCode = code;
        return this;
      },
      setHeader(key: string, value: string) {
        this._headers[key] = value;
        return this;
      },
      json(data: any) {
        if (this._sent) return;
        this._sent = true;
        this._headers['Content-Type'] = 'application/json';
        nodeRes.writeHead(this._statusCode, this._headers);
        nodeRes.end(JSON.stringify(data));
      },
      send(data: string) {
        if (this._sent) return;
        this._sent = true;
        nodeRes.writeHead(this._statusCode, this._headers);
        nodeRes.end(data);
      },
      end(data?: string) {
        if (this._sent) return;
        this._sent = true;
        nodeRes.writeHead(this._statusCode, this._headers);
        nodeRes.end(data);
      },
    } as unknown as VercelResponse;

    try {
      await handler(req, res);
    } catch (err) {
      console.error('Handler error:', err);
      if (!nodeRes.headersSent) {
        nodeRes.writeHead(500, { 'Content-Type': 'application/json' });
        nodeRes.end(JSON.stringify({ success: false, error: 'Internal server error' }));
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`Email endpoint running on http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
  });
}
