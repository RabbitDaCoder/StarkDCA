// ─── Waitlist Controller ─────────────────────────────────────────────
// HTTP handlers for waitlist operations.

import { Request, Response, NextFunction } from 'express';
import { waitlistService } from './waitlist.service';
import { successResponse } from '../../utils/response';
import type { JoinWaitlistInput } from './waitlist.schema';

/**
 * @swagger
 * /api/v1/waitlist/join:
 *   post:
 *     summary: Join the waitlist
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               source:
 *                 type: string
 *                 example: "landing"
 *     responses:
 *       201:
 *         description: Successfully joined waitlist
 *       409:
 *         description: Email already registered
 *       429:
 *         description: Rate limit exceeded
 */
export async function joinWaitlist(
  req: Request<unknown, unknown, JoinWaitlistInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Get client IP for rate limiting
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const user = await waitlistService.join(req.body, ip);

    res.status(201).json(
      successResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        message: 'Successfully joined the waitlist! Check your email for confirmation.',
      }),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/waitlist/stats:
 *   get:
 *     summary: Get waitlist statistics
 *     tags: [Waitlist]
 *     responses:
 *       200:
 *         description: Waitlist statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: number
 *                   example: 1247
 *                 recentSignups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
export async function getWaitlistStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await waitlistService.getStats();
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/waitlist/me:
 *   get:
 *     summary: Get authenticated user's waitlist position
 *     tags: [Waitlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's waitlist info
 */
export async function getUserWaitlistInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const info = await waitlistService.getUserWaitlistInfo(req.user!.userId);
    res.json(successResponse(info));
  } catch (error) {
    next(error);
  }
}
