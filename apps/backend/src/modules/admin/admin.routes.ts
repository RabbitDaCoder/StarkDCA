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
} from './admin.controller';
import { getWaitlistUsersSchema, sendEmailSchema, sendBulkEmailSchema } from './admin.schema';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Waitlist management
router.get('/waitlist', validate(getWaitlistUsersSchema), getWaitlistUsers);
router.get('/waitlist/export', exportWaitlistCsv);

// User management
router.get('/users', getUsers);

// Email management
router.post('/email/send', validate(sendEmailSchema), sendEmail);
router.post('/email/bulk', validate(sendBulkEmailSchema), sendBulkEmail);

export default router;
