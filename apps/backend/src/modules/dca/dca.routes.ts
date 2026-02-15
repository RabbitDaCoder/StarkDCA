import { Router } from 'express';
import { dcaController } from './dca.controller';
import { validate, authenticate, idempotency } from '../../middleware';
import { apiRateLimit } from '../../middleware/rate-limit';
import {
  createPlanSchema,
  cancelPlanSchema,
  getPlanSchema,
  listPlansQuerySchema,
  executionLogsQuerySchema,
} from './dca.schema';

const router = Router();

// All DCA routes require authentication
router.use(authenticate);
router.use(apiRateLimit);

/**
 * @swagger
 * /api/v1/plans:
 *   post:
 *     summary: Create a new DCA plan
 *     tags: [DCA Plans]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amountPerExecution, totalExecutions, interval]
 *             properties:
 *               amountPerExecution:
 *                 type: string
 *                 example: "100000000"
 *               totalExecutions:
 *                 type: integer
 *                 example: 12
 *               interval:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, BIWEEKLY, MONTHLY]
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/', idempotency, validate({ body: createPlanSchema }), (req, res, next) =>
  dcaController.createPlan(req, res, next),
);

/**
 * @swagger
 * /api/v1/plans:
 *   get:
 *     summary: List user's DCA plans (cursor-based pagination)
 *     tags: [DCA Plans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PAUSED, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Paginated list of plans
 */
router.get('/', validate({ query: listPlansQuerySchema }), (req, res, next) =>
  dcaController.listPlans(req, res, next),
);

/**
 * @swagger
 * /api/v1/plans/{planId}:
 *   get:
 *     summary: Get a DCA plan by ID
 *     tags: [DCA Plans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details
 */
router.get('/:planId', validate({ params: getPlanSchema }), (req, res, next) =>
  dcaController.getPlan(req, res, next),
);

/**
 * @swagger
 * /api/v1/plans/{planId}/cancel:
 *   post:
 *     summary: Cancel a DCA plan
 *     tags: [DCA Plans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan cancelled
 */
router.post(
  '/:planId/cancel',
  idempotency,
  validate({ params: cancelPlanSchema }),
  (req, res, next) => dcaController.cancelPlan(req, res, next),
);

/**
 * @swagger
 * /api/v1/plans/{planId}/executions:
 *   get:
 *     summary: Get execution history for a plan
 *     tags: [DCA Plans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated execution history
 */
router.get(
  '/:planId/executions',
  validate({ params: getPlanSchema, query: executionLogsQuerySchema }),
  (req, res, next) => dcaController.getExecutionHistory(req, res, next),
);

export default router;
