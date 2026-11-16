import { Router } from 'express';
import { param } from 'express-validator';
import { getStudentProfile } from '../controllers/profileController.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.get(
  '/:username',
  [
    param('username')
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Invalid username format'),
    validateRequest
  ],
  getStudentProfile
);

export default router;
