// ─── Waitlist Routes ─────────────────────────────────────────────────
// Public endpoints for waitlist signup and stats.
// Protected endpoint for authenticated user's waitlist info.

import { Router } from 'express';
import { validate, authenticate } from '../../middleware';
import { joinWaitlist, getWaitlistStats, getUserWaitlistInfo } from './waitlist.controller';
import { joinWaitlistSchema } from './waitlist.schema';

const router = Router();

// Public routes - no authentication required
router.post('/join', validate(joinWaitlistSchema), joinWaitlist);
router.get('/stats', getWaitlistStats);

// Protected route - requires authentication
router.get('/me', authenticate, getUserWaitlistInfo);

export default router;
