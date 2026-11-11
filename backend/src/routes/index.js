import { Router } from 'express';
import authRoutes from './authRoutes.js';
import problemRoutes from './problemRoutes.js';
import battleRoutes from './battleRoutes.js';
import dailyChallengeRoutes from './dailyChallengeRoutes.js';
import profileRoutes from './profileRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/battles', battleRoutes);
router.use('/daily-challenge', dailyChallengeRoutes);
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

export default router;

