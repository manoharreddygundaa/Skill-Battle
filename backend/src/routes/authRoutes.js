import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { authRateLimiter, noCache } from '../middleware/security.js';

const router = Router();

// Apply no-cache headers to all auth routes
router.use(noCache);

router.post(
  '/register',
  authRateLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain alphanumeric characters and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validateRequest
  ],
  register
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validateRequest
  ],
  login
);

router.post('/logout', protect, logout);

router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Name must be between 1 and 50 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Bio cannot exceed 200 characters'),
    body('avatar')
      .optional()
      .trim()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    validateRequest
  ],
  updateProfile
);

export default router;
