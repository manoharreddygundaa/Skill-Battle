import { Router } from 'express';
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

const router = Router();

// All routes here are restricted to admin users only
router.use(protect, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

router.get('/problems', getAdminProblems);
router.post('/problems', createProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);

router.post('/daily-challenge', setDailyChallenge);

export default router;

