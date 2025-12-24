import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getAssessmentQuiz,
    submitAssessment,
    getLessonQuiz,
    submitLessonQuiz
} from '../controllers/quizController.js';

const router = express.Router();

// Assessment quiz routes
router.get('/assessment', protect, getAssessmentQuiz);
router.post('/assessment/submit', protect, submitAssessment);

// Lesson quiz routes
router.get('/lesson/:lessonId', protect, getLessonQuiz);
router.post('/lesson/:lessonId/submit', protect, submitLessonQuiz);

export default router;
