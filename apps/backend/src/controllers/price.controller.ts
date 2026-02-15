import { Request, Response } from 'express';
import { priceService } from '../services';
import { ApiResponse, PriceData } from '@stark-dca/shared-types';

export class PriceController {
  async getBtcPrice(_req: Request, res: Response): Promise<void> {
    try {
      const price = await priceService.getBtcPrice();
      const response: ApiResponse<PriceData> = { success: true, data: price };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const priceController = new PriceController();
