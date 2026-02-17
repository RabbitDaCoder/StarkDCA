// ─── Waitlist Routes ─────────────────────────────────────────────────
// Public endpoints for waitlist signup and stats.

import { Router } from 'express';
import { validate } from '../../middleware';
import { joinWaitlist, getWaitlistStats } from './waitlist.controller';
import { joinWaitlistSchema } from './waitlist.schema';

const router = Router();

// Public routes - no authentication required
router.post('/join', validate(joinWaitlistSchema), joinWaitlist);
router.get('/stats', getWaitlistStats);

export default router;
