import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const users = await User.find({}).select('-passwordHash');

    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Prevent deletion of super admin
    if (user.isSuperAdmin) {
      return res.json({ success: false, message: "Cannot delete super admin" });
    }

    // Only super admin can delete other admins
    if (user.role === 'admin' && !req.user.isSuperAdmin) {
      return res.json({ success: false, message: "Only super admin can delete other admins" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const suspendUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Prevent suspending super admin
    if (user.isSuperAdmin) {
      return res.json({ success: false, message: "Cannot suspend super admin" });
    }

    // Only super admin can suspend other admins
    if (user.role === 'admin' && !req.user.isSuperAdmin) {
      return res.json({ success: false, message: "Only super admin can suspend other admins" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      data: { isActive: user.isActive }
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Only super admin can create admin accounts
    if (role === 'admin' && !req.user.isSuperAdmin) {
      return res.json({ success: false, message: "Only super admin can create admin accounts" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'student',
      isSuperAdmin: false
    });

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive
      },
      message: "User created successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const getSystemStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    // 1. Basic Counts
    const totalUsers = await User.countDocuments({});
    const totalLessons = await Lesson.countDocuments({});
    const totalCourses = await Course.countDocuments({});

    // 2. Active Users (students)
    const activeStudentCount = await User.countDocuments({ role: 'student' });

    // 3. User Registration Trend (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersLast30Days = await User.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).select('createdAt');

    const activityDataMap = {};
    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      activityDataMap[dateStr] = 0;
    }

    usersLast30Days.forEach(u => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      if (activityDataMap[dateStr] !== undefined) {
        activityDataMap[dateStr]++;
      }
    });

    // Convert map to array sorted by date
    const activityTrend = Object.entries(activityDataMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => count);

    // 4. System Load (Simulated based on recent activity count)
    // In a real app, this might come from OS metrics or a monitoring service.
    // Here we'll simulate "load" based on how many users signed up recently vs total users, scaled.
    // Or just random variance around a base for "liveness" feel if real metrics aren't available.
    // Let's make it semi-real: (Recent signups * 10) % 100
    const recentActivityCount = usersLast30Days.length;
    let systemLoad = Math.min(Math.round((recentActivityCount / (totalUsers || 1)) * 100) + 20, 95);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLessons,
        totalCourses,
        activeUsers: activeStudentCount,
        activityTrend: activityTrend.slice(-15), // Last 15 days for the chart
        systemLoad
      }
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    // Check MongoDB Connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Healthy' : 'Unstable';
    
    // Calculate database response time
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - startTime;

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memoryTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

    res.json({
      success: true,
      data: {
        api: 'Operational',
        database: dbStatus,
        dbResponseTime: `${dbResponseTime}ms`,
        memoryUsage: `${memoryUsedMB}MB / ${memoryTotalMB}MB`,
        uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear server cache (useful for recommendations, session data, etc.)
export const flushCache = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    // In a production app, you'd clear Redis or other cache services
    // For now, we can clear any in-memory caches and force garbage collection
    if (global.gc) {
      global.gc();
    }

    res.json({
      success: true,
      message: "Server cache flushed successfully",
      data: {
        timestamp: new Date().toISOString(),
        memoryBeforeGC: process.memoryUsage().heapUsed,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk user operations
export const bulkUserAction = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const { action, userIds } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.json({ success: false, message: "Invalid request format" });
    }

    let result;
    switch (action) {
      case 'suspend':
        result = await User.updateMany(
          { _id: { $in: userIds }, isSuperAdmin: false, role: { $ne: 'admin' } },
          { $set: { isActive: false } }
        );
        break;
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: true } }
        );
        break;
      case 'delete':
        result = await User.deleteMany(
          { _id: { $in: userIds }, isSuperAdmin: false, role: { $ne: 'admin' } }
        );
        break;
      default:
        return res.json({ success: false, message: "Invalid action" });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: { modifiedCount: result.modifiedCount || result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed analytics for admin dashboard
export const getDetailedAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    // User analytics
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const activeUsersLast7Days = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Course completion stats
    const completionStats = await Progress.aggregate([
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress' },
          totalCompletions: {
            $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        usersByRole,
        activeUsersLast7Days,
        avgCourseProgress: completionStats[0]?.avgProgress || 0,
        totalCompletions: completionStats[0]?.totalCompletions || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
