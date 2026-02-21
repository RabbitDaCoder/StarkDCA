// ─── Email Providers ─────────────────────────────────────────────────
// Supports NodeMailer (SMTP) and SendGrid. Identical to original backend logic.

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailOptions, EnvConfig } from './types';

export interface EmailProvider {
  send(options: EmailOptions, config: EnvConfig): Promise<boolean>;
}

// ─── NodeMailer Provider ─────────────────────────────────────────────
class NodeMailerProvider implements EmailProvider {
  private transporter: Transporter | null = null;
  private lastConfig: string = '';

  private getTransporter(config: EnvConfig): Transporter {
    // Recreate transporter if config changes (shouldn't in production, but safe)
    const configKey = `${config.smtp.host}:${config.smtp.port}:${config.smtp.user}`;
    if (this.transporter && this.lastConfig === configKey) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    this.lastConfig = configKey;
    return this.transporter;
  }

  async send(options: EmailOptions, config: EnvConfig): Promise<boolean> {
    const transporter = this.getTransporter(config);

    await transporter.sendMail({
      from: `"${config.from.name}" <${config.from.address}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  }
}

// ─── SendGrid Provider ───────────────────────────────────────────────
class SendGridProvider implements EmailProvider {
  private apiUrl = 'https://api.sendgrid.com/v3/mail/send';

  async send(options: EmailOptions, config: EnvConfig): Promise<boolean> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.sendgrid.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: {
          email: config.from.address,
          name: config.from.name,
        },
        subject: options.subject,
        content: [
          { type: 'text/html', value: options.html },
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'No body');
      throw new Error(`SendGrid API error: ${response.status} — ${body}`);
    }

    return true;
  }
}

// ─── Provider Factory ────────────────────────────────────────────────
const nodemailerProvider = new NodeMailerProvider();
const sendgridProvider = new SendGridProvider();

export function getProvider(config: EnvConfig): EmailProvider {
  if (config.emailProvider === 'sendgrid') {
    return sendgridProvider;
  }
  return nodemailerProvider;
}
