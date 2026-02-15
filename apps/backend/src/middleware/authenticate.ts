// ─── JWT Authentication Middleware ───────────────────────────────────
// Validates access token from Authorization header or HTTP-only cookie.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

export interface JwtPayload {
  userId: string;
  starknetAddress: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
      return;
    }

    next(new UnauthorizedError());
  }
}

function extractToken(req: Request): string | null {
  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 2. Try HTTP-only cookie
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }

  return null;
}
