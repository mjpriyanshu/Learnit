import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getPreferences,
    createNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Get notifications
router.get('/', protect, getNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Get preferences
router.get('/preferences', protect, getPreferences);

// Mark single as read
router.patch('/:notificationId/read', protect, markAsRead);

// Mark all as read
router.patch('/read-all', protect, markAllAsRead);

// Delete single notification
router.delete('/:notificationId', protect, deleteNotification);

// Clear all notifications
router.delete('/', protect, clearAllNotifications);

// Admin only: Create notification
router.post('/create', protect, createNotification);

export default router;
