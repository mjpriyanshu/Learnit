import express from 'express';
import { authMiddleware as protect } from '../middleware/auth.js';
import {
    getGoals,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    getGoalStats
} from '../controllers/goalController.js';

const router = express.Router();

// Get all goals for current user
router.get('/', protect, getGoals);

// Get goal statistics
router.get('/stats', protect, getGoalStats);

// Create a new goal
router.post('/', protect, createGoal);

// Update goal details
router.put('/:goalId', protect, updateGoal);

// Update goal progress
router.patch('/:goalId/progress', protect, updateGoalProgress);

// Delete a goal
router.delete('/:goalId', protect, deleteGoal);

export default router;
