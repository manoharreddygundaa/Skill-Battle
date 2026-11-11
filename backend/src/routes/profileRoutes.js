import { Router } from 'express';
import { getStudentProfile } from '../controllers/profileController.js';

const router = Router();

router.get('/:username', getStudentProfile);

export default router;

