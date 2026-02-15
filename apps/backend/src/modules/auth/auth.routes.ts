import { Router } from 'express';
import { authController } from './auth.controller';
import { validate, authenticate } from '../../middleware';
import { authRateLimit } from '../../middleware/rate-limit';
import { connectWalletSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/connect:
 *   post:
 *     summary: Connect wallet and authenticate
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [starknetAddress, signature, message]
 *             properties:
 *               starknetAddress:
 *                 type: string
 *                 example: "0x04a..."
 *               signature:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 */
router.post('/connect', authRateLimit, validate({ body: connectWalletSchema }), (req, res, next) =>
  authController.connectWallet(req, res, next),
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 */
router.post('/refresh', authRateLimit, (req, res, next) => authController.refresh(req, res, next));

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
