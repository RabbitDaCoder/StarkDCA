// ─── Admin Controller ────────────────────────────────────────────────
// HTTP handlers for admin operations.

import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { launchService } from './launch.service';
import { successResponse } from '../../utils/response';
import { logger } from '../../infrastructure/logger';
import type { GetWaitlistUsersInput, SendEmailInput, SendBulkEmailInput } from './admin.schema';

/**
 * @swagger
 * /api/v1/admin/waitlist:
 *   get:
 *     summary: Get all waitlist users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, email]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of waitlist users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export async function getWaitlistUsers(
  req: Request<unknown, unknown, unknown, GetWaitlistUsersInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.getWaitlistUsers(req.query || {});
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all registered users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.getUsers(req.query as any);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/waitlist/export:
 *   get:
 *     summary: Export waitlist as CSV (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
export async function exportWaitlistCsv(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const csv = await adminService.exportWaitlistCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=waitlist-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/email/send:
 *   post:
 *     summary: Send email to specific recipients (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - subject
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               subject:
 *                 type: string
 *               template:
 *                 type: string
 *                 enum: [announcement, launch]
 *               variables:
 *                 type: object
 *     responses:
 *       200:
 *         description: Email send result
 */
export async function sendEmail(
  req: Request<unknown, unknown, SendEmailInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.sendEmail(req.body);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/email/bulk:
 *   post:
 *     summary: Send bulk email to waitlist (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *             properties:
 *               filter:
 *                 type: string
 *                 enum: [all, recent, custom]
 *               recentDays:
 *                 type: integer
 *               subject:
 *                 type: string
 *               template:
 *                 type: string
 *                 enum: [announcement, launch]
 *               variables:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bulk email result
 */
export async function sendBulkEmail(
  req: Request<unknown, unknown, SendBulkEmailInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.sendBulkEmail(req.body);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/launch:
 *   post:
 *     summary: Trigger platform launch (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform launched successfully
 *       409:
 *         description: Platform already launched
 */
export async function launchPlatform(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminUserId = req.user!.userId;

    logger.info({ adminUserId }, 'Admin triggered platform launch');

    const result = await launchService.triggerLaunch(adminUserId);

    res.json(
      successResponse({
        message: 'Platform launched successfully! Launch emails are being sent.',
        ...result,
      }),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/admin/launch/status:
 *   get:
 *     summary: Get platform launch status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Launch status
 */
export async function getLaunchStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = await launchService.getLaunchStatus();
    res.json(successResponse(status));
  } catch (error) {
    next(error);
  }
}

// ─── Platform Overview ─────────────────────────────────────────────
export async function getPlatformOverview(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const overview = await adminService.getPlatformOverview();
    res.json(successResponse(overview));
  } catch (error) {
    next(error);
  }
}

// ─── All Plans (admin) ─────────────────────────────────────────────
export async function getAllPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.getAllPlans(req.query as any);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

// ─── System Health ─────────────────────────────────────────────────
export async function getSystemHealth(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const health = await adminService.getSystemHealth();
    res.json(successResponse(health));
  } catch (error) {
    next(error);
  }
}

// ─── User Suspend / Reactivate ─────────────────────────────────────
export async function suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await adminService.suspendUser(userId);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function reactivateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await adminService.reactivateUser(userId);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

// ─── Execution Analytics ───────────────────────────────────────────
export async function getExecutionAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await adminService.getExecutionAnalytics(days);
    res.json(successResponse(analytics));
  } catch (error) {
    next(error);
  }
}
