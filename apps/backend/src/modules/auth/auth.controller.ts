// ─── Auth Controller ─────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../utils/response';
import { config } from '../../config';
import type { SignupInput, LoginInput, GoogleCallbackInput } from './auth.schema';

class AuthController {
  /**
   * POST /api/v1/auth/signup
   * Register a new user with email and password.
   */
  async signup(
    req: Request<unknown, unknown, SignupInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.signup(req.body);

      // Set refresh token in HTTP-only cookie
      this.setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json(
        successResponse({
          accessToken: result.accessToken,
          user: {
            id: result.userId,
            name: result.name,
            email: result.email,
            role: result.role,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate with email and password.
   */
  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);

      this.setRefreshTokenCookie(res, result.refreshToken);

      res.json(
        successResponse({
          accessToken: result.accessToken,
          user: {
            id: result.userId,
            name: result.name,
            email: result.email,
            role: result.role,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/google
   * Redirect to Google OAuth authorization page.
   */
  async googleAuth(_req: Request, res: Response): Promise<void> {
    const authUrl = authService.getGoogleAuthUrl();
    res.redirect(authUrl);
  }

  /**
   * GET /api/v1/auth/google/callback
   * Handle Google OAuth callback.
   */
  async googleCallback(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { code } = req.query as GoogleCallbackInput;
      const result = await authService.handleGoogleCallback(code);

      this.setRefreshTokenCookie(res, result.refreshToken);

      // Redirect to frontend with token in URL (for SPA handling)
      const redirectUrl = new URL(`${config.frontend.url}/auth/callback`);
      redirectUrl.searchParams.set('token', result.accessToken);
      redirectUrl.searchParams.set('userId', result.userId);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      // Redirect to frontend with error
      const errorUrl = new URL(`${config.frontend.url}/login`);
      errorUrl.searchParams.set('error', 'oauth_failed');
      res.redirect(errorUrl.toString());
    }
  }

  /**
   * POST /api/v1/auth/connect
   * Authenticate via Starknet wallet address.
   */
  async connectWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { starknetAddress } = req.body;
      const { accessToken, refreshToken, userId } =
        await authService.connectWallet(starknetAddress);

      this.setRefreshTokenCookie(res, refreshToken);

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

      this.setRefreshTokenCookie(res, newRefreshToken);

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
      const profile = await authService.getProfile(req.user!.userId);
      res.json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   * Verify OTP code for email verification.
   * After success: adds user to waitlist and sends confirmation email.
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { otp } = req.body;
      const userId = req.user!.userId;

      const result = await authService.verifyOtp(userId, otp);

      res.json(
        successResponse({
          verified: result.verified,
          waitlistPosition: result.waitlistPosition,
          totalUsers: result.totalUsers,
          redirectTo: '/waitlist',
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-otp
   * Resend OTP verification code. Rate limited.
   */
  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await authService.resendOtp(userId);

      res.json(successResponse({ message: 'Verification code sent', ...result }));
    } catch (error) {
      next(error);
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });
  }
}

export const authController = new AuthController();
