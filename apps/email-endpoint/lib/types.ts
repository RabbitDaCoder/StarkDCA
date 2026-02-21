// ─── Type Definitions for Email Endpoint ─────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendOtpRequest {
  to: string;
  name: string;
  otp: string;
}

export interface SendEmailRequest {
  type: 'waitlist-welcome' | 'signup-welcome' | 'waitlist-confirmation' | 'launch' | 'custom';
  to: string;
  name: string;
  subject?: string;
  position?: number;
  templateName?: string;
  variables?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface EnvConfig {
  emailServiceApiKey: string;
  emailProvider: 'nodemailer' | 'sendgrid';
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  sendgrid: {
    apiKey: string;
  };
  from: {
    name: string;
    address: string;
  };
  frontendUrl: string;
  allowedOrigins: string[];
}
