import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "🏆" },
    earnedAt: { type: Date, default: Date.now }
});

const assessmentResultSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    completedAt: { type: Date, default: Date.now }
});

const userStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // XP & Leveling
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // Streaks
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },

    // Badges
    badges: [badgeSchema],

    // Assessment Results
    assessmentResults: [assessmentResultSchema],
    hasCompletedAssessment: { type: Boolean, default: false },

    // Activity Stats
    totalLessonsCompleted: { type: Number, default: 0 },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalTimeSpentMin: { type: Number, default: 0 },

    // Activity Calendar (for heatmap)
    activityDates: [{ type: Date }]

}, { timestamps: true });

// Calculate level from XP
userStatsSchema.methods.calculateLevel = function () {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(this.xp / 100)) + 1;
};

// XP needed for next level
userStatsSchema.methods.xpForNextLevel = function () {
    const nextLevel = this.level + 1;
    return (nextLevel - 1) * (nextLevel - 1) * 100;
};

const UserStats = mongoose.model("UserStats", userStatsSchema);
export default UserStats;
