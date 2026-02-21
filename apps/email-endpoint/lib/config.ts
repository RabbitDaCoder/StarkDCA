// ─── Environment Configuration ───────────────────────────────────────
// Loads and validates environment variables for the email service.

import type { EnvConfig } from './types';

let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (_config) return _config;

  const env = process.env;

  const emailServiceApiKey = env.EMAIL_SERVICE_API_KEY || '';
  if (!emailServiceApiKey || emailServiceApiKey.length < 16) {
    throw new Error('EMAIL_SERVICE_API_KEY must be set and at least 16 characters');
  }

  _config = {
    emailServiceApiKey,
    emailProvider: (env.EMAIL_PROVIDER as 'nodemailer' | 'sendgrid') || 'nodemailer',
    smtp: {
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(env.SMTP_PORT || '587', 10),
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
    },
    sendgrid: {
      apiKey: env.SENDGRID_API_KEY || '',
    },
    from: {
      name: env.EMAIL_FROM_NAME || 'StarkDCA',
      address: env.EMAIL_FROM_ADDRESS || 'starkdca@gmail.com',
    },
    frontendUrl: env.FRONTEND_URL || 'http://localhost:3000',
    allowedOrigins: (env.ALLOWED_ORIGINS || 'http://localhost:4000')
      .split(',')
      .map((s) => s.trim()),
  };

  return _config;
}
