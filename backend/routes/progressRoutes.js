import express from 'express';
import { 
  createOrUpdateProgress, 
  getUserProgress, 
  getProgress, 
  getDetailedProgress, 
  getInProgressLessons,
  addToProgressList,
  removeFromProgressList,
  getMyProgressList,
  moveToCollection,
  getActivityHeatmap,
  getWeeklyActivity
} from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createOrUpdateProgress);
router.get('/', authMiddleware, getProgress);
router.get('/detailed', authMiddleware, getDetailedProgress);
router.get('/in-progress', authMiddleware, getInProgressLessons);
router.get('/user/:id', authMiddleware, getUserProgress);

// New routes for progress list management
router.post('/add-to-list', authMiddleware, addToProgressList);
router.post('/remove-from-list', authMiddleware, removeFromProgressList);
router.get('/my-list', authMiddleware, getMyProgressList);
router.post('/move-to-collection', authMiddleware, moveToCollection);

// Activity heatmap and weekly stats
router.get('/activity-heatmap', authMiddleware, getActivityHeatmap);
router.get('/weekly-activity', authMiddleware, getWeeklyActivity);

export default router;
