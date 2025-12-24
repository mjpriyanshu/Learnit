import express from "express";
import { 
  getAllUsers, 
  getUserById, 
  deleteUser, 
  suspendUser, 
  createUser, 
  getSystemStats, 
  getSystemHealth,
  flushCache,
  bulkUserAction,
  getDetailedAnalytics
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get('/stats', authMiddleware, getSystemStats);
router.get('/health', authMiddleware, getSystemHealth);
router.get('/analytics', authMiddleware, getDetailedAnalytics);
router.post('/cache/flush', authMiddleware, flushCache);

router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.post('/users', authMiddleware, createUser);
router.post('/users/bulk', authMiddleware, bulkUserAction);
router.patch('/users/:id/suspend', authMiddleware, suspendUser);
router.delete('/users/:id', authMiddleware, deleteUser);

export default router;
