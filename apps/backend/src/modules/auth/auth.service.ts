// ─── Auth Service ────────────────────────────────────────────────────
// Handles wallet-based authentication, JWT issuance, and token refresh.

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../infrastructure/db';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { UnauthorizedError, BadRequestError } from '../../utils/errors';
import type { JwtPayload } from '../../middleware/authenticate';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
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

    const tokens = await this.generateTokenPair(
      storedToken.user.id,
      storedToken.user.starknetAddress,
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

  // ─── Private ─────────────────────────────────────────────────────

  private async generateTokenPair(userId: string, starknetAddress: string): Promise<TokenPair> {
    const payload: JwtPayload = { userId, starknetAddress };

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
