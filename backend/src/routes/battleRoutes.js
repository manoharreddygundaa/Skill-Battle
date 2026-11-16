import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createBattleRoom,
  getBattleRoom,
  getUserBattleHistory,
  getBattleLeaderboard
} from '../controllers/battleController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post(
  '/create',
  protect,
  [
    body('difficulty')
      .optional()
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Difficulty must be Easy, Medium, or Hard'),
    body('duration')
      .optional()
      .isInt({ min: 60, max: 3600 })
      .withMessage('Duration must be between 60 and 3600 seconds (1 to 60 minutes)'),
    validateRequest
  ],
  createBattleRoom
);

router.get('/history/user', protect, getUserBattleHistory);
router.get('/leaderboard', getBattleLeaderboard);

router.get(
  '/:roomCode',
  protect,
  [
    param('roomCode')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Invalid room code'),
    validateRequest
  ],
  getBattleRoom
);

export default router;
