// ─── Admin Authorization Middleware ──────────────────────────────────
// Checks if authenticated user has admin role.

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../infrastructure/db';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Middleware that requires the authenticated user to have admin role.
 * Must be used after authenticate middleware.
 */
export async function requireAdmin(
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
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required', 'ADMIN_REQUIRED');
    }

    next();
  } catch (error) {
    next(error);
  }
}
