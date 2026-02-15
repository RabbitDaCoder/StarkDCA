import { Router } from 'express';
import dcaRoutes from './dca.routes';
import priceRoutes from './price.routes';

const router = Router();

router.use('/plans', dcaRoutes);
router.use('/price', priceRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

export default router;
