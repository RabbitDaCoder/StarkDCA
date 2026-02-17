// ─── Auth Service ────────────────────────────────────────────────────
// Handles wallet-based authentication, email/password auth, OAuth, JWT issuance, and token refresh.

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../infrastructure/db';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { emailService } from '../../infrastructure/email';
import { UnauthorizedError, BadRequestError, ConflictError } from '../../utils/errors';
import type { JwtPayload } from '../../middleware/authenticate';
import type { SignupInput, LoginInput } from './auth.schema';

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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokenPairForUser(user.id, user.email);

    // Send welcome email (async, don't block response)
    emailService.sendSignupWelcome(email, name).catch((err) => {
      logger.error({ error: err, email }, 'Failed to send signup welcome email');
    });

    logger.info({ userId: user.id, email }, 'New user registered via email/password');

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

      // Send welcome email
      emailService.sendSignupWelcome(googleUser.email, googleUser.name).catch((err) => {
        logger.error({ error: err, email: googleUser.email }, 'Failed to send OAuth welcome email');
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
