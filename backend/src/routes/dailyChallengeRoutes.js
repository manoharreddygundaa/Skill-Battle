import { Router } from 'express';
import {
  getTodayChallenge,
  submitDailyChallenge
} from '../controllers/dailyChallengeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/today', optionalAuth, getTodayChallenge);
router.post('/submit', protect, submitDailyChallenge);

export default router;

