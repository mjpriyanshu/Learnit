import Notification from "../models/Notification.js";

// Get all notifications for current user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { unreadOnly, limit = 20 } = req.query;

        const filter = { userId };
        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get unread count only
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({ success: true, data: { unreadCount } });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Create notification for users
export const createNotification = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const { userIds, title, message, type, icon, link, actionText } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        // If userIds is 'all', send to all students
        let targetUserIds = userIds;
        if (userIds === 'all') {
            const User = (await import('../models/User.js')).default;
            const allStudents = await User.find({ role: 'student' }).select('_id');
            targetUserIds = allStudents.map(u => u._id);
        }

        // Create notifications for each user
        const notifications = targetUserIds.map(userId => ({
            userId,
            type: type || 'system',
            title,
            message,
            icon: icon || '📢',
            link: link || null,
            actionText: actionText || null
        }));

        const created = await Notification.insertMany(notifications);

        res.json({
            success: true,
            message: `Notification sent to ${created.length} user(s)`,
            data: { count: created.length }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ userId });

        res.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create notification (internal helper, used by other controllers)
export const createNotificationHelper = async (userId, type, title, message, options = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            icon: options.icon || '🔔',
            link: options.link || null,
            actionText: options.actionText || null,
            relatedId: options.relatedId || null,
            relatedType: options.relatedType || null,
            expiresAt: options.expiresAt || null
        });

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Create study reminder notification
export const createStudyReminder = async (userId) => {
    try {
        const existingReminder = await Notification.findOne({
            userId,
            type: 'reminder',
            isRead: false,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
        });

        if (!existingReminder) {
            await Notification.create({
                userId,
                type: 'reminder',
                title: "Time to Learn! 📚",
                message: "Don't break your streak! Continue your learning journey today.",
                icon: '📚',
                link: '/dashboard'
            });
        }
    } catch (error) {
        console.error("Error creating study reminder:", error);
    }
};

// Create achievement notification
export const createAchievementNotification = async (userId, badge) => {
    try {
        await Notification.create({
            userId,
            type: 'achievement',
            title: `New Badge Earned! ${badge.icon}`,
            message: `You've earned the "${badge.name}" badge: ${badge.description}`,
            icon: badge.icon,
            link: '/profile',
            relatedType: 'badge'
        });
    } catch (error) {
        console.error("Error creating achievement notification:", error);
    }
};

// Get notification preferences
export const getPreferences = async (req, res) => {
    try {
        // For now, return default preferences
        // In a full implementation, this would read from a UserPreferences model
        res.json({
            success: true,
            data: {
                emailNotifications: true,
                pushNotifications: true,
                studyReminders: true,
                achievementAlerts: true,
                forumReplies: true,
                weeklyReport: true
            }
        });
    } catch (error) {
        console.error("Error fetching preferences:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
