import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    targetLessons: { type: Number, default: 1 },
    completedLessons: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
});

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Goal Details
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" }, // e.g., "Python", "Web Dev", "Data Science"

    // Target & Progress
    targetLessons: { type: Number, default: 5 },
    completedLessons: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },

    // Timeline
    startDate: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },

    // Status
    status: { type: String, enum: ['active', 'completed', 'paused', 'failed'], default: 'active' },
    completedAt: { type: Date, default: null },

    // Milestones
    milestones: [milestoneSchema],

    // Associated Lessons (optional - for specific lesson goals)
    targetLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],

    // Notifications preference
    reminderEnabled: { type: Boolean, default: true },
    reminderFrequency: { type: String, enum: ['daily', 'weekly', 'none'], default: 'daily' }

}, { timestamps: true });

// Calculate progress percentage
goalSchema.methods.calculateProgress = function () {
    if (this.targetLessons === 0) return 100;
    return Math.min(Math.round((this.completedLessons / this.targetLessons) * 100), 100);
};

// Check if goal is overdue
goalSchema.methods.isOverdue = function () {
    return this.status === 'active' && new Date() > this.deadline;
};

// Days remaining
goalSchema.methods.daysRemaining = function () {
    const now = new Date();
    const diff = this.deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
