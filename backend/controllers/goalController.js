import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";

// Get all goals for current user
export const getGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        const filter = { userId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const goals = await Goal.find(filter)
            .populate('targetLessonIds', 'title')
            .sort({ createdAt: -1 });

        // Check for overdue goals
        for (let goal of goals) {
            if (goal.status === 'active' && new Date() > goal.deadline) {
                goal.status = 'failed';
                await goal.save();
            }
        }

        res.json({ success: true, data: goals });
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new goal
export const createGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, category, targetLessons, deadline, milestones, reminderFrequency } = req.body;

        const goal = await Goal.create({
            userId,
            title,
            description,
            category,
            targetLessons: targetLessons || 5,
            deadline: new Date(deadline),
            milestones: milestones || [],
            reminderFrequency: reminderFrequency || 'daily'
        });

        // Create notification for goal creation
        await Notification.create({
            userId,
            type: 'goal',
            title: 'New Goal Created! 🎯',
            message: `You've set a new goal: "${title}". Good luck!`,
            icon: '🎯',
            link: '/goals',
            relatedId: goal._id,
            relatedType: 'goal'
        });

        res.status(201).json({ success: true, data: goal });
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update goal progress
export const updateGoalProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalId } = req.params;
        const { completedLessons, status } = req.body;

        const goal = await Goal.findOne({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        if (completedLessons !== undefined) {
            goal.completedLessons = completedLessons;
            goal.progressPercent = goal.calculateProgress();
        }

        if (status) {
            goal.status = status;
            if (status === 'completed') {
                goal.completedAt = new Date();

                // Create completion notification
                await Notification.create({
                    userId,
                    type: 'goal',
                    title: 'Goal Completed! 🎉',
                    message: `Congratulations! You've completed: "${goal.title}"`,
                    icon: '🏆',
                    link: '/goals',
                    relatedId: goal._id,
                    relatedType: 'goal'
                });
            }
        }

        // Check if goal is now complete
        if (goal.completedLessons >= goal.targetLessons && goal.status === 'active') {
            goal.status = 'completed';
            goal.completedAt = new Date();
            goal.progressPercent = 100;

            await Notification.create({
                userId,
                type: 'goal',
                title: 'Goal Completed! 🎉',
                message: `Congratulations! You've completed: "${goal.title}"`,
                icon: '🏆',
                link: '/goals',
                relatedId: goal._id,
                relatedType: 'goal'
            });
        }

        await goal.save();
        res.json({ success: true, data: goal });
    } catch (error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update goal details
export const updateGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalId } = req.params;
        const updates = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: goalId, userId },
            { $set: updates },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        res.json({ success: true, data: goal });
    } catch (error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalId } = req.params;

        const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        res.json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get goal statistics
export const getGoalStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalGoals = await Goal.countDocuments({ userId });
        const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
        const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });
        const failedGoals = await Goal.countDocuments({ userId, status: 'failed' });

        // Calculate average completion rate
        const completionRate = totalGoals > 0
            ? Math.round((completedGoals / totalGoals) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                totalGoals,
                activeGoals,
                completedGoals,
                failedGoals,
                completionRate
            }
        });
    } catch (error) {
        console.error("Error fetching goal stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Increment completed lessons on a goal (called when lesson is completed)
export const incrementGoalProgress = async (userId, lessonId) => {
    try {
        // Find active goals that include this lesson or have general progress tracking
        const activeGoals = await Goal.find({
            userId,
            status: 'active'
        });

        for (let goal of activeGoals) {
            // If goal has specific lessons, check if this lesson is in the list
            if (goal.targetLessonIds && goal.targetLessonIds.length > 0) {
                if (goal.targetLessonIds.includes(lessonId) &&
                    !goal.completedLessonIds.includes(lessonId)) {
                    goal.completedLessonIds.push(lessonId);
                    goal.completedLessons += 1;
                    goal.progressPercent = goal.calculateProgress();
                    await goal.save();
                }
            } else {
                // General goal - increment for any lesson
                goal.completedLessons += 1;
                goal.progressPercent = goal.calculateProgress();

                // Check if goal is now complete
                if (goal.completedLessons >= goal.targetLessons) {
                    goal.status = 'completed';
                    goal.completedAt = new Date();

                    await Notification.create({
                        userId,
                        type: 'goal',
                        title: 'Goal Completed! 🎉',
                        message: `You've completed: "${goal.title}"`,
                        icon: '🏆',
                        link: '/goals'
                    });
                }

                await goal.save();
            }
        }
    } catch (error) {
        console.error("Error incrementing goal progress:", error);
    }
};
