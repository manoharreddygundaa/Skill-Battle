import { Router } from 'express';
import {
  getProblems,
  getProblemBySlug,
  runCode,
  submitCode
} from '../controllers/problemController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getProblems);
router.get('/:slug', optionalAuth, getProblemBySlug);
router.post('/:slug/run', protect, runCode);
router.post('/:slug/submit', protect, submitCode);

export default router;

