// ─── Dashboard Lock Middleware ────────────────────────────────────────
// Blocks access to dashboard routes if user's launchAccessGranted is false.
// Even with a valid JWT, users cannot access the dashboard until
// an admin triggers the platform launch.

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../infrastructure/db';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Middleware that checks if the authenticated user has been granted
 * launch access. If not, returns 403 with a redirect hint.
 *
 * Must be used AFTER the authenticate middleware.
 */
export async function requireLaunchAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        launchAccessGranted: true,
        emailVerified: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Admins bypass launch lock
    if (user.role === 'ADMIN') {
      return next();
    }

    // Block unverified users
    if (!user.emailVerified) {
      throw new ForbiddenError(
        'Email verification required before accessing the dashboard',
        'EMAIL_NOT_VERIFIED',
      );
    }

    // Block users without launch access
    if (!user.launchAccessGranted) {
      throw new ForbiddenError(
        'Dashboard access is not yet available. Please check your waitlist status.',
        'LAUNCH_NOT_GRANTED',
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
