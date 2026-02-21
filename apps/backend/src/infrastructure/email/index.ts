// ─── Email Service (HTTP Client) ─────────────────────────────────────
// Sends emails via the external Vercel-hosted email-endpoint service.
// Exposes the same interface as the original so no changes are needed
// in auth, admin, launch, or waitlist services.

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../../config';
import { logger } from '../logger';

interface EmailServiceResponse {
  success: boolean;
  data?: { sent: boolean; to: string; type?: string };
  error?: string;
  code?: string;
}

class EmailService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.emailService.url,
      timeout: 15_000, // 15 s — generous for cold-start Vercel functions
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.emailService.apiKey}`,
      },
    });

    logger.info(
      {
        emailServiceUrl: config.emailService.url
          ? `${config.emailService.url.slice(0, 30)}...`
          : '(not set)',
        apiKeySet: !!config.emailService.apiKey,
      },
      'Email service initialized (HTTP client → Vercel email-endpoint)',
    );
  }

  // ─── OTP Email ───────────────────────────────────────────────────

  /**
   * Send OTP verification email via the email-endpoint service.
   */
  async sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
    return this.callEndpoint('/api/send-otp', { to, name, otp }, 'sendOtpEmail');
  }

  // ─── Transactional Emails ────────────────────────────────────────

  async sendWaitlistWelcome(to: string, name: string): Promise<boolean> {
    return this.callEndpoint(
      '/api/send-email',
      { type: 'waitlist-welcome', to, name },
      'sendWaitlistWelcome',
    );
  }

  async sendSignupWelcome(to: string, name: string): Promise<boolean> {
    return this.callEndpoint(
      '/api/send-email',
      { type: 'signup-welcome', to, name },
      'sendSignupWelcome',
    );
  }

  async sendWaitlistConfirmation(to: string, name: string, position: number): Promise<boolean> {
    return this.callEndpoint(
      '/api/send-email',
      { type: 'waitlist-confirmation', to, name, position },
      'sendWaitlistConfirmation',
    );
  }

  async sendLaunchEmail(to: string, name: string): Promise<boolean> {
    return this.callEndpoint('/api/send-email', { type: 'launch', to, name }, 'sendLaunchEmail');
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<boolean> {
    return this.callEndpoint(
      '/api/send-email',
      { type: 'custom', to, name: variables.name || 'there', subject, templateName, variables },
      'sendCustomEmail',
    );
  }

  // ─── Internal HTTP Helper ────────────────────────────────────────

  private async callEndpoint(
    path: string,
    payload: Record<string, unknown>,
    method: string,
  ): Promise<boolean> {
    // In dev/test, skip if no email service URL configured
    if (!config.emailService.url) {
      if (!config.isProduction) {
        logger.info(
          { method, ...payload },
          '[DEV] Email would be sent (EMAIL_SERVICE_URL not set)',
        );
        return true;
      }
      logger.error({ method }, 'EMAIL_SERVICE_URL is not configured in production');
      return false;
    }

    try {
      const response = await this.client.post<EmailServiceResponse>(path, payload);

      if (response.data.success) {
        logger.info({ method, to: payload.to }, 'Email sent via email-endpoint');
        return true;
      }

      logger.error(
        { method, to: payload.to, error: response.data.error, code: response.data.code },
        'Email endpoint returned failure',
      );
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const body = error.response?.data;
        logger.error(
          { method, to: payload.to, status, error: body?.error || error.message },
          'Failed to call email-endpoint',
        );
      } else {
        logger.error(
          { method, to: payload.to, error: error instanceof Error ? error.message : error },
          'Unexpected error calling email-endpoint',
        );
      }
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
