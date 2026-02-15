import { Request, Response, NextFunction } from 'express';
import { priceService } from './price.service';
import { successResponse } from '../../utils/response';

class PriceController {
  /**
   * GET /api/v1/price/btc
   */
  async getBtcPrice(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const price = await priceService.getBtcPrice();
      res.json(successResponse(price));
    } catch (error) {
      next(error);
    }
  }
}

export const priceController = new PriceController();
