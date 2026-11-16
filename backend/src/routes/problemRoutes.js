import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProblems,
  getProblemBySlug,
  runCode,
  submitCode
} from '../controllers/problemController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { codeExecutionRateLimiter } from '../middleware/security.js';

const router = Router();

router.get('/', optionalAuth, getProblems);

router.get(
  '/:slug',
  optionalAuth,
  [
    param('slug')
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid problem slug format'),
    validateRequest
  ],
  getProblemBySlug
);

router.post(
  '/:slug/run',
  protect,
  codeExecutionRateLimiter,
  [
    param('slug')
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid problem slug format'),
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
  runCode
);

router.post(
  '/:slug/submit',
  protect,
  codeExecutionRateLimiter,
  [
    param('slug')
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid problem slug format'),
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
  submitCode
);

export default router;
