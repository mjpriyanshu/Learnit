import express from 'express';
import { trackVisit } from '../controllers/trackController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/visit', authMiddleware, trackVisit);

export default router;
