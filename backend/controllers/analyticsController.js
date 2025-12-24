import UserStats from "../models/UserStats.js";
import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import Goal from "../models/Goal.js";

// Get comprehensive analytics for user
export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user stats
        const userStats = await UserStats.findOne({ userId });

        // Get all progress data
        const progressData = await Progress.find({ userId })
            .populate('lessonId', 'title topic difficulty estimatedTimeMin');

        // Calculate topic-wise breakdown
        const topicBreakdown = {};
        progressData.forEach(p => {
            if (p.lessonId && p.lessonId.topic) {
                const topic = p.lessonId.topic;
                if (!topicBreakdown[topic]) {
                    topicBreakdown[topic] = { total: 0, completed: 0, timeSpent: 0 };
                }
                topicBreakdown[topic].total += 1;
                if (p.status === 'completed') {
                    topicBreakdown[topic].completed += 1;
                }
                topicBreakdown[topic].timeSpent += p.timeSpentMin || 0;
            }
        });

        // Convert to array for radar chart
        const skillRadar = Object.entries(topicBreakdown).map(([topic, data]) => ({
            topic,
            proficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
            lessonsCompleted: data.completed,
            totalLessons: data.total,
            timeSpent: data.timeSpent
        }));

        // Activity over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activityByDay = {};
        const activityDates = userStats?.activityDates || [];

        activityDates.forEach(date => {
            if (new Date(date) >= thirtyDaysAgo) {
                const dayKey = new Date(date).toISOString().split('T')[0];
                activityByDay[dayKey] = (activityByDay[dayKey] || 0) + 1;
            }
        });

        // Generate last 30 days data
        const activityHeatmap = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split('T')[0];
            activityHeatmap.push({
                date: dayKey,
                activity: activityByDay[dayKey] || 0
            });
        }

        // Weekly learning hours
        const weeklyProgress = progressData
            .filter(p => {
                const completedDate = new Date(p.updatedAt);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return completedDate >= sevenDaysAgo;
            })
            .reduce((sum, p) => sum + (p.timeSpentMin || 0), 0);

        // Difficulty breakdown
        const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
        progressData.forEach(p => {
            if (p.status === 'completed' && p.lessonId?.difficulty) {
                difficultyBreakdown[p.lessonId.difficulty] += 1;
            }
        });

        // Learning pace (lessons per week average)
        const completedLessons = progressData.filter(p => p.status === 'completed');
        const firstCompletedDate = completedLessons.length > 0
            ? new Date(Math.min(...completedLessons.map(p => new Date(p.createdAt))))
            : new Date();

        const weeksSinceStart = Math.max(1, Math.ceil((new Date() - firstCompletedDate) / (7 * 24 * 60 * 60 * 1000)));
        const lessonsPerWeek = Math.round((completedLessons.length / weeksSinceStart) * 10) / 10;

        // Goals progress
        const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
        const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });

        res.json({
            success: true,
            data: {
                // Overview stats
                overview: {
                    totalXP: userStats?.xp || 0,
                    level: userStats?.level || 1,
                    currentStreak: userStats?.currentStreak || 0,
                    totalLessonsCompleted: userStats?.totalLessonsCompleted || 0,
                    totalQuizzesTaken: userStats?.totalQuizzesTaken || 0,
                    totalTimeSpentMin: progressData.reduce((sum, p) => sum + (p.timeSpentMin || 0), 0),
                    badgeCount: userStats?.badges?.length || 0
                },

                // Skill proficiency (for radar chart)
                skillRadar,

                // Activity heatmap (last 30 days)
                activityHeatmap,

                // Weekly stats
                weeklyStats: {
                    timeSpentMin: weeklyProgress,
                    lessonsCompleted: progressData.filter(p => {
                        const date = new Date(p.updatedAt);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        return p.status === 'completed' && date >= sevenDaysAgo;
                    }).length,
                    averageLessonsPerWeek: lessonsPerWeek
                },

                // Difficulty breakdown
                difficultyBreakdown,

                // Goals summary
                goalsSummary: {
                    active: activeGoals,
                    completed: completedGoals
                },

                // Learning insights
                insights: generateInsights(userStats, progressData, skillRadar)
            }
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get learning patterns
export const getLearningPatterns = async (req, res) => {
    try {
        const userId = req.user._id;

        const progressData = await Progress.find({ userId })
            .populate('lessonId', 'topic difficulty');

        // Time of day analysis (based on updatedAt)
        const hourlyActivity = Array(24).fill(0);
        progressData.forEach(p => {
            const hour = new Date(p.updatedAt).getHours();
            hourlyActivity[hour] += 1;
        });

        // Day of week analysis
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayActivity = Array(7).fill(0);
        progressData.forEach(p => {
            const day = new Date(p.updatedAt).getDay();
            weekdayActivity[day] += 1;
        });

        // Most productive time
        const maxHourActivity = Math.max(...hourlyActivity);
        const mostProductiveHour = hourlyActivity.indexOf(maxHourActivity);

        // Most active day
        const maxDayActivity = Math.max(...weekdayActivity);
        const mostActiveDay = dayNames[weekdayActivity.indexOf(maxDayActivity)];

        res.json({
            success: true,
            data: {
                hourlyActivity: hourlyActivity.map((count, hour) => ({
                    hour: `${hour}:00`,
                    count
                })),
                weekdayActivity: weekdayActivity.map((count, day) => ({
                    day: dayNames[day],
                    count
                })),
                patterns: {
                    mostProductiveHour: `${mostProductiveHour}:00 - ${mostProductiveHour + 1}:00`,
                    mostActiveDay,
                    averageSessionLength: progressData.length > 0
                        ? Math.round(progressData.reduce((sum, p) => sum + (p.timeSpentMin || 0), 0) / progressData.length)
                        : 0
                }
            }
        });
    } catch (error) {
        console.error("Error fetching learning patterns:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get recommendations based on analytics
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        const userStats = await UserStats.findOne({ userId });
        const progressData = await Progress.find({ userId, status: 'completed' })
            .populate('lessonId', 'topic');

        const recommendations = [];

        // Streak recommendation
        if (!userStats || userStats.currentStreak === 0) {
            recommendations.push({
                type: 'streak',
                title: 'Start a Learning Streak',
                message: 'Learn something every day to build consistency!',
                icon: '🔥',
                action: '/dashboard'
            });
        } else if (userStats.currentStreak < 7) {
            recommendations.push({
                type: 'streak',
                title: 'Keep Your Streak Going!',
                message: `You're on a ${userStats.currentStreak}-day streak. Reach 7 days for a badge!`,
                icon: '⚡',
                action: '/dashboard'
            });
        }

        // Assessment recommendation
        if (!userStats || !userStats.hasCompletedAssessment) {
            recommendations.push({
                type: 'assessment',
                title: 'Take the Knowledge Assessment',
                message: 'Help us personalize your learning path!',
                icon: '🧠',
                action: '/assessment'
            });
        }

        // Topic variety recommendation
        const topicsLearned = [...new Set(progressData.map(p => p.lessonId?.topic).filter(Boolean))];
        if (topicsLearned.length < 3) {
            recommendations.push({
                type: 'variety',
                title: 'Explore More Topics',
                message: 'Try learning different subjects to become a well-rounded developer!',
                icon: '🌟',
                action: '/learning-path'
            });
        }

        // Goal recommendation
        const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
        if (activeGoals === 0) {
            recommendations.push({
                type: 'goal',
                title: 'Set a Learning Goal',
                message: 'Goals help you stay focused and motivated!',
                icon: '🎯',
                action: '/goals'
            });
        }

        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to generate insights
function generateInsights(userStats, progressData, skillRadar) {
    const insights = [];

    // Streak insight
    if (userStats?.currentStreak >= 7) {
        insights.push({
            type: 'positive',
            message: `Amazing! You've maintained a ${userStats.currentStreak}-day streak! 🔥`
        });
    }

    // Level insight
    if (userStats?.level >= 5) {
        insights.push({
            type: 'positive',
            message: `You've reached Level ${userStats.level}! You're making great progress! 🌟`
        });
    }

    // Topic strength insight
    const strongTopics = skillRadar.filter(s => s.proficiency >= 80);
    if (strongTopics.length > 0) {
        insights.push({
            type: 'positive',
            message: `You're strong in ${strongTopics.map(t => t.topic).join(', ')}! 💪`
        });
    }

    // Improvement areas
    const weakTopics = skillRadar.filter(s => s.proficiency < 50 && s.totalLessons > 0);
    if (weakTopics.length > 0) {
        insights.push({
            type: 'suggestion',
            message: `Consider focusing more on ${weakTopics[0].topic} to improve. 📚`
        });
    }

    // Time insight
    const totalHours = progressData.reduce((sum, p) => sum + (p.timeSpentMin || 0), 0) / 60;
    if (totalHours >= 10) {
        insights.push({
            type: 'positive',
            message: `You've invested ${Math.round(totalHours)} hours in learning! Keep it up! ⏰`
        });
    }

    return insights;
}
