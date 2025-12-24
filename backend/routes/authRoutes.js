import express from 'express';
import { register, login, verifyToken, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', authMiddleware, verifyToken);

// Profile management routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

// Password reset routes (no auth required)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
