import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Notification Content
    type: {
        type: String,
        enum: [
            'achievement',      // Badge earned, level up
            'streak',           // Streak milestone
            'goal',             // Goal reminder, goal completed
            'lesson',           // Lesson recommendation, completion
            'forum',            // Reply to post, upvote
            'system',           // System announcements
            'reminder'          // Study reminders
        ],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    // Visual
    icon: { type: String, default: "🔔" },

    // Link/Action
    link: { type: String, default: null }, // e.g., "/learn/123" or "/forum/post/456"
    actionText: { type: String, default: null }, // e.g., "View Lesson", "Check Progress"

    // Related entities (optional)
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    relatedType: { type: String, default: null }, // 'lesson', 'goal', 'post', 'badge'

    // Status
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },

    // Expiry (optional)
    expiresAt: { type: Date, default: null }

}, { timestamps: true });

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-expire old notifications (optional)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
