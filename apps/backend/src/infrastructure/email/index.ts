// ─── Email Service Abstraction ───────────────────────────────────────
// Supports multiple email providers: NodeMailer (SMTP) and SendGrid.
// Secure: Credentials loaded from environment variables.

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../../config';
import { logger } from '../logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

// ─── NodeMailer Provider ─────────────────────────────────────────────
class NodeMailerProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    });
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info({ to: options.to, subject: options.subject }, 'Email sent via NodeMailer');
      return true;
    } catch (error) {
      logger.error({ error, to: options.to }, 'Failed to send email via NodeMailer');
      return false;
    }
  }
}

// ─── SendGrid Provider ───────────────────────────────────────────────
class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private apiUrl = 'https://api.sendgrid.com/v3/mail/send';

  constructor() {
    this.apiKey = config.email.sendgrid.apiKey;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: {
            email: config.email.from.address,
            name: config.email.from.name,
          },
          subject: options.subject,
          content: [
            { type: 'text/html', value: options.html },
            ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      logger.info({ to: options.to, subject: options.subject }, 'Email sent via SendGrid');
      return true;
    } catch (error) {
      logger.error({ error, to: options.to }, 'Failed to send email via SendGrid');
      return false;
    }
  }
}

// ─── Email Service Factory ───────────────────────────────────────────
class EmailService {
  private provider: EmailProvider;

  constructor() {
    if (config.email.provider === 'sendgrid') {
      this.provider = new SendGridProvider();
    } else {
      this.provider = new NodeMailerProvider();
    }
    logger.info({ provider: config.email.provider }, 'Email service initialized');
  }

  async send(options: EmailOptions): Promise<boolean> {
    // In development/test, log but skip actual sending if no credentials
    if (!config.isProduction && !config.email.smtp.user && !config.email.sendgrid.apiKey) {
      logger.info({ ...options }, '[DEV] Email would be sent (no credentials configured)');
      return true;
    }
    return this.provider.send(options);
  }

  // ─── Pre-built Email Templates ─────────────────────────────────────
  async sendWaitlistWelcome(to: string, name: string): Promise<boolean> {
    const html = this.getWaitlistWelcomeTemplate(name);
    return this.send({
      to,
      subject: 'Welcome to the StarkDCA Waitlist!',
      html,
      text: `Hi ${name}, thank you for joining the StarkDCA waitlist! You're now on the list for early access to our Bitcoin DCA platform on Starknet.`,
    });
  }

  async sendSignupWelcome(to: string, name: string): Promise<boolean> {
    const html = this.getSignupWelcomeTemplate(name);
    return this.send({
      to,
      subject: 'Welcome to StarkDCA!',
      html,
      text: `Hi ${name}, welcome to StarkDCA! Your account has been created successfully.`,
    });
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<boolean> {
    let html = this.getCustomTemplate(templateName);

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return this.send({ to, subject, html });
  }

  // ─── Email Templates ───────────────────────────────────────────────
  private getWaitlistWelcomeTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StarkDCA Waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're on the List!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
    
    <p>Thank you for joining the <strong>StarkDCA</strong> waitlist! You're now secured a spot for early access to our revolutionary Bitcoin DCA platform built on Starknet.</p>
    
    <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #667eea;">What's Coming:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #4a4a6a;">
        <li>Automated Dollar-Cost Averaging into BTC</li>
        <li>Non-custodial & fully on-chain execution</li>
        <li>Low gas fees powered by Starknet</li>
        <li>Smart scheduling: daily, weekly, or monthly</li>
      </ul>
    </div>
    
    <p>We'll notify you as soon as we launch. In the meantime, follow us on Twitter for updates!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://twitter.com/StarkDCA" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Follow @StarkDCA</a>
    </div>
    
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Building the future of Bitcoin investment on Starknet</em>
    </p>
  </div>
</body>
</html>`;
  }

  private getSignupWelcomeTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StarkDCA</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">₿ Welcome to StarkDCA!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
    
    <p>Your StarkDCA account has been created successfully! You're now ready to start automating your Bitcoin investments.</p>
    
    <div style="background: #fff8f0; border-left: 4px solid #f7931a; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #f7931a;">Getting Started:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #4a4a6a;">
        <li>Connect your Starknet wallet</li>
        <li>Create your first DCA plan</li>
        <li>Fund your wallet and watch the automation work</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${config.frontend.url}/dashboard" style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
    </div>
    
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Stack sats. Stay sovereign.</em>
    </p>
  </div>
</body>
</html>`;
  }

  private getCustomTemplate(templateName: string): string {
    // Base template that can be customized with variables
    const templates: Record<string, string> = {
      announcement: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{title}}</h1>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p>Hi {{name}},</p>
    <p>{{content}}</p>
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`,
      launch: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 We're Live!</h1>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p>Hi {{name}},</p>
    <p>Great news! StarkDCA is now live and you have early access as a waitlist member!</p>
    <p>{{content}}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${config.frontend.url}/signup" style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Create Your Account</a>
    </div>
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`,
    };

    return templates[templateName] || templates.announcement;
  }
}

// Singleton instance
export const emailService = new EmailService();
