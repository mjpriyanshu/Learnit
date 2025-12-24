import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { generatePersonalizedSkillTree, getDefaultSkillTree, getSkillTreeHistory } from '../controllers/skillTreeController.js';

const router = express.Router();

// Generate personalized skill tree based on user interests and progress
router.post('/personalized', authMiddleware, generatePersonalizedSkillTree);

// Get default skill tree (fallback)
router.get('/default', authMiddleware, getDefaultSkillTree);

// Get user's skill tree history (last 3 trees)
router.get('/history', authMiddleware, getSkillTreeHistory);

export default router;
