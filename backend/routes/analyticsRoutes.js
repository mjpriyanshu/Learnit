import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getAnalytics,
    getLearningPatterns,
    getRecommendations
} from '../controllers/analyticsController.js';

const router = express.Router();

// Get comprehensive analytics
router.get('/', protect, getAnalytics);

// Get learning patterns
router.get('/patterns', protect, getLearningPatterns);

// Get AI recommendations
router.get('/recommendations', protect, getRecommendations);

export default router;
