import express from 'express';
import { 
  getLesson, 
  getAllLessons, 
  getCourses,
  createCustomLesson,
  getMyCustomLessons,
  updateCustomLesson,
  deleteCustomLesson,
  generatePersonalizedLessonsForUser,
  generateTopicLessonsEndpoint,
  refreshMyLessons,
  getMyLearningDirectory
} from '../controllers/lessonController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Learning directory (all available lessons for user) - MUST be before /:id
router.get('/my/directory', authMiddleware, getMyLearningDirectory);
router.get('/my/custom', authMiddleware, getMyCustomLessons);

// Basic lesson routes
router.get('/', authMiddleware, getAllLessons);
router.get('/:id', authMiddleware, getLesson);

// Custom lesson routes (user-imported)
router.post('/custom', authMiddleware, createCustomLesson);
router.put('/custom/:id', authMiddleware, updateCustomLesson);
router.delete('/custom/:id', authMiddleware, deleteCustomLesson);

// AI-generated lesson routes
router.post('/generate/personalized', authMiddleware, generatePersonalizedLessonsForUser);
router.post('/generate/topic', authMiddleware, generateTopicLessonsEndpoint);
router.post('/refresh', authMiddleware, refreshMyLessons);

export default router;
