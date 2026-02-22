// ─── Admin Routes ────────────────────────────────────────────────────
// Protected admin endpoints requiring authentication and admin role.

import { Router } from 'express';
import { authenticate, validate } from '../../middleware';
import { requireAdmin } from '../../middleware/require-admin';
import {
  getWaitlistUsers,
  getUsers,
  exportWaitlistCsv,
  sendEmail,
  sendBulkEmail,
  getDashboardStats,
  launchPlatform,
  getLaunchStatus,
  getPlatformOverview,
  getAllPlans,
  getSystemHealth,
  suspendUser,
  reactivateUser,
  getExecutionAnalytics,
} from './admin.controller';
import { getWaitlistUsersSchema, sendEmailSchema, sendBulkEmailSchema } from './admin.schema';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard & Overview
router.get('/stats', getDashboardStats);
router.get('/overview', getPlatformOverview);

// Waitlist management
router.get('/waitlist', validate(getWaitlistUsersSchema), getWaitlistUsers);
router.get('/waitlist/export', exportWaitlistCsv);

// User management
router.get('/users', getUsers);
router.post('/users/:userId/suspend', suspendUser);
router.post('/users/:userId/reactivate', reactivateUser);

// Plan monitoring
router.get('/plans', getAllPlans);

// Email management
router.post('/email/send', validate(sendEmailSchema), sendEmail);
router.post('/email/bulk', validate(sendBulkEmailSchema), sendBulkEmail);

// System health
router.get('/system/health', getSystemHealth);

// Analytics
router.get('/analytics/executions', getExecutionAnalytics);

// Launch management
router.post('/launch', launchPlatform);
router.get('/launch/status', getLaunchStatus);

export default router;
