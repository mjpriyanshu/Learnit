import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getStats,
    updateStreak,
    recordLessonComplete,
    getLeaderboard,
    getAllBadges
} from '../controllers/gamificationController.js';

const router = express.Router();

// Get user gamification stats
router.get('/stats', protect, getStats);

// Update daily streak
router.post('/update-streak', protect, updateStreak);

// Record lesson completion (called when user completes a lesson)
router.post('/lesson-complete', protect, recordLessonComplete);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

// Get all badges (earned and not earned)
router.get('/badges', protect, getAllBadges);

export default router;
