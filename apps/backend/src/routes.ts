// ─── API v1 Router ───────────────────────────────────────────────────
// All routes prefixed with /api/v1

import { Router } from 'express';
import { authRoutes } from './modules/auth';
import { dcaRoutes } from './modules/dca';
import { priceRoutes } from './modules/price';
import { successResponse } from './utils/response';

const router = Router();

// ─── Health Check ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (_req, res) => {
  res.json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
  );
});

// ─── Module Routes ───────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/plans', dcaRoutes);
router.use('/price', priceRoutes);

export default router;
