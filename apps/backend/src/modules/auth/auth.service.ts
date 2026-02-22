// ─── Auth Service ────────────────────────────────────────────────────
// Handles wallet-based authentication, email/password auth, OAuth, JWT issuance, and token refresh.

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../infrastructure/db';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { emailService } from '../../infrastructure/email';
import { redis } from '../../infrastructure/redis';
import { waitlistService } from '../waitlist/waitlist.service';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  TooManyRequestsError,
} from '../../utils/errors';
import type { JwtPayload } from '../../middleware/authenticate';
import type { SignupInput, LoginInput } from './auth.schema';

// Redis keys for OTP
const OTP_PREFIX = 'otp:';
const OTP_RATE_PREFIX = 'otp:rate:';
const OTP_TTL = 600; // 10 minutes
const OTP_RATE_LIMIT_TTL = 60; // 1 minute between resends
const OTP_MAX_ATTEMPTS = 5; // Max verification attempts
const OTP_ATTEMPTS_PREFIX = 'otp:attempts:';

// Redis keys for password reset
const PW_RESET_PREFIX = 'pwreset:';
const PW_RESET_RATE_PREFIX = 'pwreset:rate:';
const PW_RESET_TTL = 3600; // 1 hour
const PW_RESET_RATE_LIMIT_TTL = 60; // 1 minute between requests

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends TokenPair {
  userId: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

class AuthService {
  /**
   * Register a new user with email and password.
   * Security: Password is hashed with bcrypt before storage.
   * New flow: Does NOT grant dashboard access. Sends OTP for email verification.
   */
  async signup(input: SignupInput): Promise<AuthResult> {
    const { name, email, password } = input;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists', 'EMAIL_EXISTS');
    }

    // Hash password with bcrypt (cost factor from config)
    const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

    // Create user (emailVerified = false, launchAccessGranted = false)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
        emailVerified: false,
        launchAccessGranted: false,
      },
    });

    // Generate tokens (user can authenticate but dashboard is locked)
    const tokens = await this.generateTokenPairForUser(user.id, user.email);

    // Generate and send OTP for email verification
    await this.generateAndSendOtp(user.id, email, name);

    logger.info({ userId: user.id, email }, 'New user registered — OTP sent for verification');

    return { ...tokens, userId: user.id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Login with email and password.
   * Security: Uses constant-time comparison via bcrypt.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      // Use generic error to prevent email enumeration
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = await this.generateTokenPairForUser(user.id, user.email);

    logger.info({ userId: user.id }, 'User logged in via email/password');

    return { ...tokens, userId: user.id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Get Google OAuth authorization URL.
   */
  getGoogleAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: config.oauth.google.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle Google OAuth callback.
   * Exchanges code for tokens and creates/updates user.
   */
  async handleGoogleCallback(code: string): Promise<AuthResult> {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.oauth.google.clientId,
        client_secret: config.oauth.google.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.oauth.google.callbackUrl,
      }),
    });

    if (!tokenResponse.ok) {
      logger.error({ status: tokenResponse.status }, 'Google token exchange failed');
      throw new UnauthorizedError('Failed to authenticate with Google', 'GOOGLE_AUTH_FAILED');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new UnauthorizedError('Failed to get Google user info', 'GOOGLE_USERINFO_FAILED');
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { oauthAccounts: { some: { provider: 'GOOGLE', providerUserId: googleUser.id } } },
        ],
      },
      include: { oauthAccounts: true },
    });

    if (!user) {
      // Create new user with OAuth account
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          emailVerified: true, // Google emails are verified
          launchAccessGranted: false, // Still locked until launch
          role: 'USER',
          oauthAccounts: {
            create: {
              provider: 'GOOGLE',
              providerUserId: googleUser.id,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            },
          },
        },
        include: { oauthAccounts: true },
      });

      // Add to waitlist and send waitlist email (Google users are auto-verified)
      const waitlistInfo = await waitlistService.addUserToWaitlist(user.id);
      emailService
        .sendWaitlistConfirmation(googleUser.email, googleUser.name, waitlistInfo.position)
        .catch((err) => {
          logger.error(
            { error: err, email: googleUser.email },
            'Failed to send waitlist confirmation email',
          );
        });

      logger.info(
        { userId: user.id, email: googleUser.email },
        'New user registered via Google OAuth',
      );
    } else {
      // Update or create OAuth account
      const existingOAuth = user.oauthAccounts?.find(
        (a) => a.provider === 'GOOGLE' && a.providerUserId === googleUser.id,
      );

      if (existingOAuth) {
        await prisma.oAuthAccount.update({
          where: { id: existingOAuth.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || existingOAuth.refreshToken,
            tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          },
        });
      } else {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerUserId: googleUser.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          },
        });
      }

      logger.info({ userId: user.id }, 'User logged in via Google OAuth');
    }

    // Generate app tokens
    const tokens = await this.generateTokenPairForUser(user.id, user.email);

    return { ...tokens, userId: user.id, name: user.name, email: user.email, role: user.role };
  }

  // ─── OTP Verification ─────────────────────────────────────────────

  /**
   * Verify OTP code for email verification.
   * After successful verification:
   * - Mark email as verified
   * - Add user to waitlist
   * - Send "You're on the Waitlist" email
   * - Return waitlist info (position, total users)
   */
  async verifyOtp(
    userId: string,
    otpCode: string,
  ): Promise<{
    verified: boolean;
    waitlistPosition: number;
    totalUsers: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user || !user.email) {
      throw new BadRequestError('User not found');
    }

    if (user.emailVerified) {
      // Already verified — return waitlist info
      const info = await waitlistService.getUserWaitlistInfo(userId);
      return { verified: true, waitlistPosition: info.position, totalUsers: info.totalUsers };
    }

    // Check attempt count (brute force protection)
    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${userId}`;
    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) {
      await redis.expire(attemptsKey, OTP_TTL);
    }
    if (attempts > OTP_MAX_ATTEMPTS) {
      throw new TooManyRequestsError(
        'Too many verification attempts. Please request a new code.',
        'OTP_MAX_ATTEMPTS',
      );
    }

    // Retrieve stored OTP
    const storedOtp = await redis.get(`${OTP_PREFIX}${userId}`);
    if (!storedOtp) {
      throw new BadRequestError('Verification code expired. Please request a new one.');
    }

    // Constant-time comparison
    const otpBuffer = Buffer.from(otpCode);
    const storedBuffer = Buffer.from(storedOtp);
    if (
      otpBuffer.length !== storedBuffer.length ||
      !crypto.timingSafeEqual(otpBuffer, storedBuffer)
    ) {
      throw new BadRequestError('Invalid verification code');
    }

    // OTP valid — mark email as verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    // Clean up OTP keys
    await redis.del(`${OTP_PREFIX}${userId}`);
    await redis.del(attemptsKey);

    // Add user to waitlist
    const waitlistInfo = await waitlistService.addUserToWaitlist(userId);

    // Send "You're on the Waitlist" email
    emailService
      .sendWaitlistConfirmation(user.email, user.name || 'there', waitlistInfo.position)
      .catch((err) => {
        logger.error(
          { error: err, email: user.email },
          'Failed to send waitlist confirmation email',
        );
      });

    logger.info(
      { userId, email: user.email, position: waitlistInfo.position },
      'Email verified — user added to waitlist',
    );

    return {
      verified: true,
      waitlistPosition: waitlistInfo.position,
      totalUsers: waitlistInfo.totalUsers,
    };
  }

  /**
   * Resend OTP. Rate limited to 1 per minute.
   */
  async resendOtp(userId: string): Promise<{ sent: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user || !user.email) {
      throw new BadRequestError('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    // Rate limit check
    const rateKey = `${OTP_RATE_PREFIX}${userId}`;
    const rateLimited = await redis.get(rateKey);
    if (rateLimited) {
      throw new TooManyRequestsError(
        'Please wait before requesting another code',
        'OTP_RATE_LIMITED',
      );
    }

    const sent = await this.generateAndSendOtp(userId, user.email, user.name || 'there');

    return { sent };
  }

  /**
   * Generate a 6-digit OTP, store in Redis, and send via email.
   */
  private async generateAndSendOtp(
    userId: string,
    email: string,
    name: string | null,
  ): Promise<boolean> {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store in Redis with TTL
    await redis.set(`${OTP_PREFIX}${userId}`, otp, 'EX', OTP_TTL);

    // Set rate limit for resend
    await redis.set(`${OTP_RATE_PREFIX}${userId}`, '1', 'EX', OTP_RATE_LIMIT_TTL);

    // Reset attempt counter
    await redis.del(`${OTP_ATTEMPTS_PREFIX}${userId}`);

    // Send OTP email (await so we can report actual status)
    const firstName = name?.split(' ')[0] || 'there';
    let sent = false;
    try {
      sent = await emailService.sendOtpEmail(email, firstName, otp);
      if (!sent) {
        logger.error({ userId, email }, 'OTP email send returned false — email was NOT delivered');
      } else {
        logger.info({ userId, email }, 'OTP email sent successfully');
      }
    } catch (err) {
      logger.error({ error: err, email }, 'Failed to send OTP email — exception thrown');
    }

    // In development, log OTP to console for easy testing
    if (!config.isProduction) {
      logger.info({ userId, email, otp }, '🔑 [DEV] OTP code for testing');
    }

    return sent;
  }

  // ─── Password Reset ─────────────────────────────────────────────

  /**
   * Initiate password reset flow.
   * Generates a secure token, stores in Redis, and sends email.
   * For Google OAuth users without a password, this lets them set one.
   * Always returns success to prevent email enumeration.
   */
  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.email) {
      logger.info({ email }, 'Forgot password requested for non-existent email — no-op');
      return { sent: true };
    }

    // Rate limit: 1 request per minute per user
    const rateKey = `${PW_RESET_RATE_PREFIX}${user.id}`;
    const rateLimited = await redis.get(rateKey);
    if (rateLimited) {
      throw new TooManyRequestsError(
        'Please wait before requesting another reset link',
        'RESET_RATE_LIMITED',
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token → userId mapping in Redis with 1-hour TTL
    await redis.set(`${PW_RESET_PREFIX}${token}`, user.id, 'EX', PW_RESET_TTL);

    // Set rate limit
    await redis.set(rateKey, '1', 'EX', PW_RESET_RATE_LIMIT_TTL);

    // Build reset URL
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;

    // Send password reset email
    const firstName = user.name?.split(' ')[0] || 'there';
    let sent = false;
    try {
      sent = await emailService.sendPasswordResetEmail(user.email, firstName, resetUrl);
      if (!sent) {
        logger.error(
          { userId: user.id, email: user.email },
          'Password reset email send returned false — email was NOT delivered',
        );
      } else {
        logger.info(
          { userId: user.id, email: user.email },
          'Password reset email sent successfully',
        );
      }
    } catch (err) {
      logger.error(
        { error: err, email: user.email },
        'Failed to send password reset email — exception thrown',
      );
    }

    // In dev, log the token
    if (!config.isProduction) {
      logger.info({ userId: user.id, email, token, resetUrl }, '🔑 [DEV] Password reset token');
    }

    return { sent: true };
  }

  /**
   * Reset password using a valid token.
   * Works for both email/password users and Google OAuth users (setting password for first time).
   */
  async resetPassword(token: string, newPassword: string): Promise<{ reset: boolean }> {
    // Look up the token in Redis
    const userId = await redis.get(`${PW_RESET_PREFIX}${token}`);
    if (!userId) {
      throw new BadRequestError('Invalid or expired reset link. Please request a new one.');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset link. Please request a new one.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.rounds);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate the token (single use)
    await redis.del(`${PW_RESET_PREFIX}${token}`);

    // Revoke all refresh tokens for security (force re-login everywhere)
    await this.revokeAllTokens(user.id);

    logger.info(
      { userId: user.id, email: user.email, hadPassword: !!user.passwordHash },
      'Password reset successfully',
    );

    return { reset: true };
  }

  /**
   * Authenticate a user by their Starknet wallet address.
   * Creates the user if they don't exist (first-time connect).
   */
  async connectWallet(starknetAddress: string): Promise<TokenPair & { userId: string }> {
    // Upsert user — creates on first connect, returns existing otherwise
    const user = await prisma.user.upsert({
      where: { starknetAddress: starknetAddress.toLowerCase() },
      update: { updatedAt: new Date() },
      create: { starknetAddress: starknetAddress.toLowerCase() },
    });

    const tokens = await this.generateTokenPair(user.id, user.starknetAddress);

    logger.info({ userId: user.id, starknetAddress }, 'Wallet connected');

    return { ...tokens, userId: user.id };
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Find the refresh token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    if (storedToken.revoked) {
      // Possible token theft — revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });
      logger.warn(
        { userId: storedToken.userId },
        'Refresh token reuse detected — all tokens revoked',
      );
      throw new UnauthorizedError('Refresh token revoked', 'TOKEN_REVOKED');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired', 'TOKEN_EXPIRED');
    }

    // Rotate: revoke old token, issue new pair
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const tokens = await this.generateTokenPairForUser(
      storedToken.user.id,
      storedToken.user.email || storedToken.user.starknetAddress,
    );

    return tokens;
  }

  /**
   * Logout — revoke the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }

  /**
   * Revoke all refresh tokens for a user (force logout everywhere).
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    logger.info({ userId }, 'All refresh tokens revoked');
  }

  /**
   * Get the current user profile.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        starknetAddress: true,
        role: true,
        emailVerified: true,
        launchAccessGranted: true,
        waitlistPosition: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  // ─── Private ─────────────────────────────────────────────────────

  /**
   * Generate token pair for email-based users (signup/login/OAuth).
   */
  private async generateTokenPairForUser(
    userId: string,
    identifier: string | null,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      userId,
      starknetAddress: identifier || '', // Keep compatible with existing middleware
    };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as string & jwt.SignOptions['expiresIn'],
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiresAt = this.parseExpiryToDate(config.jwt.refreshExpiry);

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    this.cleanupExpiredTokens(userId).catch((err) =>
      logger.error({ err }, 'Failed to cleanup expired tokens'),
    );

    return { accessToken, refreshToken };
  }

  private async generateTokenPair(
    userId: string,
    starknetAddress: string | null,
  ): Promise<TokenPair> {
    const payload: JwtPayload = { userId, starknetAddress: starknetAddress || '' };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as string & jwt.SignOptions['expiresIn'],
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Parse the refresh expiry string to a date
    const refreshExpiresAt = this.parseExpiryToDate(config.jwt.refreshExpiry);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    // Cleanup expired tokens (non-blocking)
    this.cleanupExpiredTokens(userId).catch((err) =>
      logger.error({ err }, 'Failed to cleanup expired tokens'),
    );

    return { accessToken, refreshToken };
  }

  private parseExpiryToDate(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Default to 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const ms: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * (ms[unit] || ms.d));
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });
  }
}

export const authService = new AuthService();
