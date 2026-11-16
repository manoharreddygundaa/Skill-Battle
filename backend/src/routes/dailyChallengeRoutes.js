import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTodayChallenge,
  submitDailyChallenge
} from '../controllers/dailyChallengeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { codeExecutionRateLimiter } from '../middleware/security.js';

const router = Router();

router.get('/today', optionalAuth, getTodayChallenge);

router.post(
  '/submit',
  protect,
  codeExecutionRateLimiter,
  [
    body('code')
      .isString()
      .notEmpty()
      .withMessage('Code is required')
      .isLength({ max: 65536 })
      .withMessage('Code exceeds max length (64 KB)'),
    body('language')
      .isIn(['javascript', 'python'])
      .withMessage('Language must be either javascript or python'),
    validateRequest
  ],
  submitDailyChallenge
);

export default router;
