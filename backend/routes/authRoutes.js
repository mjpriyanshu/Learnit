import express from 'express';
import { checkFirstUser, register, login, verifyToken, getProfile, updateProfile, changePassword, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/check-first-user', checkFirstUser);
router.post('/register', register);
router.post('/login', login);
router.get('/verify', authMiddleware, verifyToken);
router.get('/me', authMiddleware, getProfile);

// Profile management routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

// Forgot password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
