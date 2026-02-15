import { Router } from 'express';
import { dcaController } from '../controllers';

const router = Router();

router.post('/', (req, res) => dcaController.createPlan(req, res));
router.get('/', (req, res) => dcaController.getPlans(req, res));
router.get('/:planId', (req, res) => dcaController.getPlan(req, res));
router.post('/:planId/cancel', (req, res) => dcaController.cancelPlan(req, res));
router.get('/:planId/executions', (req, res) => dcaController.getExecutionLogs(req, res));

export default router;
