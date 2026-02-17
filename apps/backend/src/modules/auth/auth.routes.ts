import { Router } from 'express';
import { authController } from './auth.controller';
import { validate, authenticate } from '../../middleware';
import { authRateLimit } from '../../middleware/rate-limit';
import {
  connectWalletSchema,
  refreshTokenSchema,
  signupSchema,
  loginSchema,
  googleCallbackSchema,
} from './auth.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       201:
 *         description: Successfully registered
 *       409:
 *         description: Email already exists
 */
router.post('/signup', authRateLimit, validate(signupSchema), (req, res, next) =>
  authController.signup(req, res, next),
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimit, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google', (req, res) => authController.googleAuth(req, res));

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend with token
 */
router.get('/google/callback', validate(googleCallbackSchema), (req, res, next) =>
  authController.googleCallback(req, res, next),
);

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
 *             required: [starknetAddress]
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
router.post('/connect', authRateLimit, validate(connectWalletSchema), (req, res, next) =>
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
