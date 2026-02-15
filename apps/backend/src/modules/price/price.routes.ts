import { Router } from 'express';
import { priceController } from './price.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/price/btc:
 *   get:
 *     summary: Get current BTC price in USD
 *     tags: [Price]
 *     responses:
 *       200:
 *         description: Current BTC price
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                       example: BTC
 *                     price:
 *                       type: number
 *                       example: 65000.50
 *                     timestamp:
 *                       type: number
 *                     source:
 *                       type: string
 *                       example: coingecko
 */
router.get('/btc', (req, res, next) => priceController.getBtcPrice(req, res, next));

export default router;
