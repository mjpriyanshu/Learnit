import UserStats from "../models/UserStats.js";
import User from "../models/User.js";

// Badge definitions
export const BADGE_DEFINITIONS = {
    first_lesson: { id: 'first_lesson', name: 'First Steps', description: 'Completed your first lesson', icon: '🎓' },
    first_quiz: { id: 'first_quiz', name: 'Quiz Starter', description: 'Completed your first quiz', icon: '🎯' },
    perfect_score: { id: 'perfect_score', name: 'Perfect Score', description: 'Got 100% on a quiz', icon: '💯' },
    assessment_complete: { id: 'assessment_complete', name: 'Self-Aware', description: 'Completed knowledge assessment', icon: '🧠' },
    quiz_master: { id: 'quiz_master', name: 'Quiz Master', description: 'Completed 10 quizzes', icon: '🏆' },
    streak_3: { id: 'streak_3', name: 'On Fire', description: 'Maintained a 3-day streak', icon: '🔥' },
    streak_7: { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '⚡' },
    streak_30: { id: 'streak_30', name: 'Dedicated Learner', description: 'Maintained a 30-day streak', icon: '🌟' },
    lessons_5: { id: 'lessons_5', name: 'Getting Started', description: 'Completed 5 lessons', icon: '📚' },
    lessons_25: { id: 'lessons_25', name: 'Knowledge Seeker', description: 'Completed 25 lessons', icon: '📖' },
    lessons_100: { id: 'lessons_100', name: 'Scholar', description: 'Completed 100 lessons', icon: '🎖️' },
    level_5: { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐' },
    level_10: { id: 'level_10', name: 'Expert', description: 'Reached level 10', icon: '💎' },
    xp_1000: { id: 'xp_1000', name: 'XP Hunter', description: 'Earned 1000 XP', icon: '🎮' }
};

// Get user gamification stats
export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        let userStats = await UserStats.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true }
        );

        // Calculate XP for next level
        const xpForNextLevel = userStats.xpForNextLevel();
        const currentLevelXP = userStats.level > 1 ? (userStats.level - 1) * (userStats.level - 1) * 100 : 0;
        const progressToNextLevel = ((userStats.xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100;

        res.json({
            success: true,
            data: {
                xp: userStats.xp,
                level: userStats.level,
                currentStreak: userStats.currentStreak,
                longestStreak: userStats.longestStreak,
                badges: userStats.badges,
                hasCompletedAssessment: userStats.hasCompletedAssessment,
                totalLessonsCompleted: userStats.totalLessonsCompleted,
                totalQuizzesTaken: userStats.totalQuizzesTaken,
                xpForNextLevel,
                progressToNextLevel: Math.min(progressToNextLevel, 100),
                activityDates: userStats.activityDates.slice(-30) // Last 30 days
            }
        });
    } catch (error) {
        console.error("Error getting stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update daily streak
export const updateStreak = async (req, res) => {
    try {
        const userId = req.user._id;

        let userStats = await UserStats.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true }
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActive = userStats.lastActiveDate ? new Date(userStats.lastActiveDate) : null;
        if (lastActive) {
            lastActive.setHours(0, 0, 0, 0);
        }

        let streakUpdated = false;
        const newBadges = [];

        if (!lastActive || lastActive.getTime() !== today.getTime()) {
            // Check if it's a consecutive day
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastActive && lastActive.getTime() === yesterday.getTime()) {
                // Consecutive day - increase streak
                userStats.currentStreak += 1;
                streakUpdated = true;
            } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
                // Streak broken - reset to 1
                userStats.currentStreak = 1;
                streakUpdated = true;
            }

            // Update longest streak
            if (userStats.currentStreak > userStats.longestStreak) {
                userStats.longestStreak = userStats.currentStreak;
            }

            userStats.lastActiveDate = today;

            // Add to activity dates
            userStats.activityDates.push(today);

            // Check for streak badges
            if (userStats.currentStreak >= 3) {
                const badge = BADGE_DEFINITIONS.streak_3;
                if (!userStats.badges.find(b => b.id === badge.id)) {
                    userStats.badges.push(badge);
                    newBadges.push(badge);
                }
            }
            if (userStats.currentStreak >= 7) {
                const badge = BADGE_DEFINITIONS.streak_7;
                if (!userStats.badges.find(b => b.id === badge.id)) {
                    userStats.badges.push(badge);
                    newBadges.push(badge);
                }
            }
            if (userStats.currentStreak >= 30) {
                const badge = BADGE_DEFINITIONS.streak_30;
                if (!userStats.badges.find(b => b.id === badge.id)) {
                    userStats.badges.push(badge);
                    newBadges.push(badge);
                }
            }

            await userStats.save();
        }

        res.json({
            success: true,
            data: {
                currentStreak: userStats.currentStreak,
                longestStreak: userStats.longestStreak,
                streakUpdated,
                newBadges
            }
        });
    } catch (error) {
        console.error("Error updating streak:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Award XP to user
export const awardXP = async (userId, amount, reason) => {
    try {
        let userStats = await UserStats.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true }
        );

        userStats.xp += amount;
        const oldLevel = userStats.level;
        userStats.level = userStats.calculateLevel();
        const leveledUp = userStats.level > oldLevel;

        // Check XP badge
        const newBadges = [];
        if (userStats.xp >= 1000) {
            const badge = BADGE_DEFINITIONS.xp_1000;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }

        // Check level badges
        if (userStats.level >= 5) {
            const badge = BADGE_DEFINITIONS.level_5;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        if (userStats.level >= 10) {
            const badge = BADGE_DEFINITIONS.level_10;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }

        await userStats.save();

        return { xp: userStats.xp, level: userStats.level, leveledUp, newBadges };
    } catch (error) {
        console.error("Error awarding XP:", error);
        return null;
    }
};

// Record lesson completion
export const recordLessonComplete = async (req, res) => {
    try {
        const userId = req.user._id;

        let userStats = await UserStats.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId } },
            { upsert: true, new: true }
        );

        userStats.totalLessonsCompleted += 1;

        // Award XP
        const xpEarned = 25; // Base XP for lesson completion
        userStats.xp += xpEarned;
        userStats.level = userStats.calculateLevel();

        const newBadges = [];

        // Check lesson completion badges
        if (userStats.totalLessonsCompleted === 1) {
            const badge = BADGE_DEFINITIONS.first_lesson;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        if (userStats.totalLessonsCompleted >= 5) {
            const badge = BADGE_DEFINITIONS.lessons_5;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        if (userStats.totalLessonsCompleted >= 25) {
            const badge = BADGE_DEFINITIONS.lessons_25;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        if (userStats.totalLessonsCompleted >= 100) {
            const badge = BADGE_DEFINITIONS.lessons_100;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }

        await userStats.save();

        res.json({
            success: true,
            data: {
                xpEarned,
                totalXP: userStats.xp,
                level: userStats.level,
                totalLessonsCompleted: userStats.totalLessonsCompleted,
                newBadges
            }
        });
    } catch (error) {
        console.error("Error recording lesson completion:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get top users excluding admins
        const topUsers = await UserStats.find()
            .sort({ xp: -1 })
            .populate('userId', 'name email role isSuperAdmin');

        // Filter out admin accounts and limit to 20
        const studentUsers = topUsers.filter(stats => 
            stats.userId && 
            stats.userId.role !== 'admin' && 
            !stats.userId.isSuperAdmin
        ).slice(0, 20);

        const leaderboard = studentUsers.map((stats, index) => ({
            rank: index + 1,
            userId: stats.userId?._id,
            name: stats.userId?.name || 'Anonymous',
            xp: stats.xp,
            level: stats.level,
            badgeCount: stats.badges.length
        }));

        // Find current user's rank (only among students)
        const userStats = await UserStats.findOne({ userId });
        let userRank = null;
        if (userStats) {
            // Count students with higher XP
            const allStats = await UserStats.find({ xp: { $gt: userStats.xp } })
                .populate('userId', 'role isSuperAdmin');
            
            const studentsAbove = allStats.filter(stats => 
                stats.userId && 
                stats.userId.role !== 'admin' && 
                !stats.userId.isSuperAdmin
            ).length;
            
            userRank = studentsAbove + 1;
        }

        res.json({
            success: true,
            data: {
                leaderboard,
                userRank,
                userStats: userStats ? {
                    xp: userStats.xp,
                    level: userStats.level
                } : null
            }
        });
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all available badges
export const getAllBadges = async (req, res) => {
    try {
        const userId = req.user._id;

        const userStats = await UserStats.findOne({ userId });
        const earnedBadgeIds = userStats ? userStats.badges.map(b => b.id) : [];

        const allBadges = Object.values(BADGE_DEFINITIONS).map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id),
            earnedAt: userStats?.badges.find(b => b.id === badge.id)?.earnedAt || null
        }));

        res.json({
            success: true,
            data: allBadges
        });
    } catch (error) {
        console.error("Error getting badges:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper to check and award badges
export const checkAndAwardBadges = async (userId) => {
    // This is called from other controllers
    // Returns any new badges earned
    return [];
};
