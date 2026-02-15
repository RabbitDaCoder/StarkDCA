// ─── Auth Controller ─────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../utils/response';
import { config } from '../../config';

class AuthController {
  /**
   * POST /api/v1/auth/connect
   * Authenticate via Starknet wallet address.
   */
  async connectWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { starknetAddress } = req.body;
      const { accessToken, refreshToken, userId } =
        await authService.connectWallet(starknetAddress);

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1/auth',
      });

      res.status(200).json(
        successResponse({
          accessToken,
          userId,
          starknetAddress,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token from cookie or body.
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

      const { accessToken, refreshToken: newRefreshToken } =
        await authService.refreshAccessToken(refreshToken);

      // Rotate refresh token cookie
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      });

      res.json(successResponse({ accessToken }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Revoke the current refresh token.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      res.json(successResponse({ message: 'Logged out successfully' }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user info (protected).
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(
        successResponse({
          userId: req.user!.userId,
          starknetAddress: req.user!.starknetAddress,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
