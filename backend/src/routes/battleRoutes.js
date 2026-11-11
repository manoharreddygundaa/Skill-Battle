import { Router } from 'express';
import {
  createBattleRoom,
  getBattleRoom,
  getUserBattleHistory,
  getBattleLeaderboard
} from '../controllers/battleController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create', protect, createBattleRoom);
router.get('/history/user', protect, getUserBattleHistory);
router.get('/leaderboard', getBattleLeaderboard);
router.get('/:roomCode', protect, getBattleRoom);

export default router;

