import { Router } from 'express';
import { priceController } from '../controllers';

const router = Router();

router.get('/btc', (req, res) => priceController.getBtcPrice(req, res));

export default router;
