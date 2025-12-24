import express from 'express';
import { getCourses } from '../controllers/lessonController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getCourses);

export default router;
