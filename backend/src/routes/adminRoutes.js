import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  setDailyChallenge
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { noCache } from '../middleware/security.js';

const router = Router();

// All routes here are restricted to admin users only and should not be cached
router.use(noCache);
router.use(protect, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);

router.patch(
  '/users/:id/toggle-status',
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    validateRequest
  ],
  toggleUserStatus
);

router.get('/problems', getAdminProblems);

router.post(
  '/problems',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
    body('functionName').matches(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/).withMessage('Valid function name is required'),
    validateRequest
  ],
  createProblem
);

router.put(
  '/problems/:id',
  [
    param('id').isMongoId().withMessage('Invalid problem ID'),
    validateRequest
  ],
  updateProblem
);

router.delete(
  '/problems/:id',
  [
    param('id').isMongoId().withMessage('Invalid problem ID'),
    validateRequest
  ],
  deleteProblem
);

router.post(
  '/daily-challenge',
  [
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
    body('problemId').isMongoId().withMessage('Valid problem ID is required'),
    validateRequest
  ],
  setDailyChallenge
);

export default router;
