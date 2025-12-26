import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";

export const createOrUpdateProgress = async (req, res) => {
  try {
    let { itemId, status, score, timeSpentMin } = req.body;
    const userId = req.user._id;
    
    if (!itemId) {
      return res.json({success: false, message: "Lesson ID is required"});
    }
    
    // Extract string ID if an object is passed
    if (typeof itemId === 'object' && itemId._id) {
      itemId = itemId._id;
    }
    
    // Convert to string if it's not already
    itemId = itemId.toString();
    
    const lesson = await Lesson.findById(itemId);
    if (!lesson) {
      return res.json({success: false, message: "Lesson not found"});
    }
    
    let progress = await Progress.findOne({ userId, lessonId: itemId });
    
    // Auto-determine status based on score if not explicitly provided
    let finalStatus = status;
    if (!finalStatus) {
      const finalScore = score !== undefined ? score : (progress?.score || 0);
      if (finalScore === 100) {
        finalStatus = 'completed';
      } else if (finalScore > 0) {
        finalStatus = 'in-progress';
      } else {
        finalStatus = 'not-started';
      }
    }
    
    if (progress) {
      const previousTotal = progress.timeSpentMin || 0;
      
      progress.status = finalStatus;
      progress.score = score !== undefined ? score : progress.score;
      
      // Update total time spent
      if (timeSpentMin !== undefined) {
        progress.timeSpentMin = timeSpentMin;
      }
      
      // Update daily time log
      if (timeSpentMin !== undefined && timeSpentMin > previousTotal) {
        const today = new Date().toISOString().split('T')[0];
        const timeAddedThisUpdate = timeSpentMin - previousTotal;
        const todayLog = progress.dailyTimeLog.find(log => log.date === today);
        
        if (todayLog) {
          // Add the new time to today's log
          todayLog.minutesSpent += timeAddedThisUpdate;
        } else {
          // Create new daily log entry for today
          progress.dailyTimeLog.push({
            date: today,
            minutesSpent: timeAddedThisUpdate
          });
        }
      }
      
      // If not already in list and time is being spent, add to list
      if (!progress.addedToList && timeSpentMin > 0) {
        progress.addedToList = true;
      }
      
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      // Create new progress record
      const today = new Date().toISOString().split('T')[0];
      const dailyLog = timeSpentMin > 0 ? [{ date: today, minutesSpent: timeSpentMin }] : [];
      
      progress = new Progress({
        userId,
        lessonId: itemId,
        status: finalStatus,
        score: score !== undefined ? score : 0,
        timeSpentMin: timeSpentMin || 0,
        dailyTimeLog: dailyLog,
        addedToList: timeSpentMin > 0 || finalStatus === 'completed' // Auto-add if user spent time
      });
      await progress.save();
    }
    
    res.json({
      success: true,
      data: progress,
      message: "Progress updated successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.json({success: false, message: "Unauthorized access"});
    }
    
    const progress = await Progress.find({ userId }).populate('lessonId');
    
    const completedLessons = progress.filter(p => p.status === 'completed').length;
    const totalLessons = await Lesson.countDocuments();
    
    const allTags = await Lesson.distinct('tags');
    const tagProgress = [];
    
    for (const tag of allTags) {
      const tagLessons = await Lesson.find({ tags: tag });
      const tagLessonIds = tagLessons.map(l => l._id.toString());
      
      const completedTagLessons = progress.filter(p => 
        p.status === 'completed' && tagLessonIds.includes(p.lessonId._id.toString())
      );
      
      const mastery = tagLessons.length > 0 
        ? Math.round((completedTagLessons.length / tagLessons.length) * 100)
        : 0;
      
      tagProgress.push({
        name: tag,
        total: tagLessons.length,
        completed: completedTagLessons.length,
        mastery
      });
    }
    
    res.json({
      success: true,
      data: {
        progress,
        completedLessons,
        totalLessons,
        tagProgress,
        averageMastery: tagProgress.length > 0
          ? Math.round(tagProgress.reduce((sum, t) => sum + t.mastery, 0) / tagProgress.length)
          : 0,
        totalCompleted: completedLessons,
        totalTags: allTags.length
      },
      message: "Progress retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const progress = await Progress.find({ userId }).populate('lessonId').lean();
    const completedLessons = progress.filter(p => p.status === 'completed' && p.lessonId).length;
    const totalLessons = await Lesson.countDocuments();
    
    // Filter out invalid lesson references
    const validProgress = progress.filter(p => p.lessonId && p.lessonId._id);
    
    res.json({
      success: true,
      data: {
        completedLessons,
        totalLessons,
        progress: validProgress
      },
      message: "Progress retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getDetailedProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const progress = await Progress.find({ userId }).populate('lessonId');
    const completedLessons = progress.filter(p => p.status === 'completed').length;
    
    const allTags = await Lesson.distinct('tags');
    const tagProgress = [];
    
    for (const tag of allTags) {
      const tagLessons = await Lesson.find({ tags: tag });
      const tagLessonIds = tagLessons.map(l => l._id.toString());
      
      const completedTagLessons = progress.filter(p => 
        p.status === 'completed' && 
        p.lessonId && 
        tagLessonIds.includes(p.lessonId._id.toString())
      );
      
      const mastery = tagLessons.length > 0 
        ? Math.round((completedTagLessons.length / tagLessons.length) * 100)
        : 0;
      
      if (tagLessons.length > 0) {
        tagProgress.push({
          name: tag,
          total: tagLessons.length,
          completed: completedTagLessons.length,
          mastery
        });
      }
    }
    
    tagProgress.sort((a, b) => b.mastery - a.mastery);
    
    res.json({
      success: true,
      data: {
        totalCompleted: completedLessons,
        totalTags: allTags.length,
        averageMastery: tagProgress.length > 0
          ? Math.round(tagProgress.reduce((sum, t) => sum + t.mastery, 0) / tagProgress.length)
          : 0,
        tagProgress
      },
      message: "Detailed progress retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getInProgressLessons = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const inProgressRecords = await Progress.find({ 
      userId, 
      status: 'in-progress' 
    }).populate('lessonId').lean();
    
    // Filter out invalid lesson references and ensure proper structure
    const lessons = inProgressRecords
      .filter(p => p.lessonId && p.lessonId._id) // Filter out null/invalid lessons
      .map(p => ({
        ...p.lessonId,
        _id: p.lessonId._id.toString() // Ensure _id is a string
      }));
    
    res.json({
      success: true,
      data: lessons,
      message: "In-progress lessons retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Add lesson to user's progress list
 */
export const addToProgressList = async (req, res) => {
  try {
    let { lessonId, collection = 'Default' } = req.body;
    const userId = req.user._id;
    
    if (!lessonId) {
      return res.json({success: false, message: "Lesson ID is required"});
    }
    
    // Extract string ID if an object is passed
    if (typeof lessonId === 'object' && lessonId._id) {
      lessonId = lessonId._id;
    }
    
    // Convert to string if it's not already
    lessonId = lessonId.toString();
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.json({success: false, message: "Lesson not found"});
    }
    
    let progress = await Progress.findOne({ userId, lessonId });
    
    if (progress) {
      // Already exists, just mark as added to list
      if (progress.addedToList) {
        return res.json({success: false, message: "Lesson already in your progress list"});
      }
      progress.addedToList = true;
      progress.collection = collection;
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      // Create new progress entry
      progress = new Progress({
        userId,
        lessonId,
        status: 'not-started',
        addedToList: true,
        collection,
        score: 0,
        timeSpentMin: 0
      });
      await progress.save();
    }
    
    res.json({
      success: true,
      data: progress,
      message: `Added to ${collection}`
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Remove lesson from progress list
 */
export const removeFromProgressList = async (req, res) => {
  try {
    let { lessonId } = req.body;
    const userId = req.user._id;
    
    // Extract string ID if an object is passed
    if (typeof lessonId === 'object' && lessonId._id) {
      lessonId = lessonId._id;
    }
    
    // Convert to string if it's not already
    lessonId = lessonId.toString();
    
    const progress = await Progress.findOne({ userId, lessonId });
    
    if (!progress || !progress.addedToList) {
      return res.json({success: false, message: "Lesson not in your progress list"});
    }
    
    // If no progress made, delete entirely. Otherwise, just unmark.
    if (progress.status === 'not-started' && progress.timeSpentMin === 0) {
      await Progress.deleteOne({ _id: progress._id });
    } else {
      progress.addedToList = false;
      await progress.save();
    }
    
    res.json({
      success: true,
      message: "Removed from progress list"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Get only lessons user added to their progress list
 */
export const getMyProgressList = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const progressList = await Progress.find({ 
      userId, 
      addedToList: true 
    }).populate('lessonId').sort({ collection: 1, createdAt: 1 });
    
    // Group by collection
    const collections = {};
    progressList.forEach(p => {
      if (!p.lessonId) return; // Skip if lesson was deleted
      
      const collectionName = p.collection || 'Default';
      if (!collections[collectionName]) {
        collections[collectionName] = [];
      }
      
      collections[collectionName].push({
        ...p.toObject(),
        lesson: p.lessonId
      });
    });
    
    res.json({
      success: true,
      data: {
        collections,
        totalLessons: progressList.length
      },
      message: "Progress list retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Move lesson to different collection
 */
export const moveToCollection = async (req, res) => {
  try {
    let { lessonId, collection } = req.body;
    const userId = req.user._id;
    
    if (!collection) {
      return res.json({success: false, message: "Collection name is required"});
    }
    
    // Extract string ID if an object is passed
    if (typeof lessonId === 'object' && lessonId._id) {
      lessonId = lessonId._id;
    }
    
    // Convert to string if it's not already
    lessonId = lessonId.toString();
    
    const progress = await Progress.findOne({ userId, lessonId });
    
    if (!progress || !progress.addedToList) {
      return res.json({success: false, message: "Lesson not in your progress list"});
    }
    
    progress.collection = collection;
    progress.lastUpdated = Date.now();
    await progress.save();
    
    res.json({
      success: true,
      data: progress,
      message: `Moved to ${collection}`
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Get user's learning activity heatmap (last 30 days)
 */
export const getActivityHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    
    // Get all progress records for the user
    const progressRecords = await Progress.find({ userId }).select('dailyTimeLog');
    
    // Create a map of dates to activity
    const activityMap = {};
    
    // Initialize all dates with no activity
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(endDate.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      activityMap[dateStr] = {
        date: dateStr,
        hasActivity: false,
        count: 0,
        timeSpent: 0
      };
    }
    
    // Aggregate daily time from all progress records
    progressRecords.forEach(record => {
      if (record.dailyTimeLog && record.dailyTimeLog.length > 0) {
        record.dailyTimeLog.forEach(log => {
          if (activityMap[log.date]) {
            activityMap[log.date].hasActivity = true;
            activityMap[log.date].count += 1;
            activityMap[log.date].timeSpent += log.minutesSpent || 0;
          }
        });
      }
    });
    
    // Convert to array
    const activityArray = Object.values(activityMap);
    
    res.json({
      success: true,
      data: {
        activities: activityArray,
        totalActiveDays: activityArray.filter(a => a.hasActivity).length,
        totalTimeSpent: activityArray.reduce((sum, a) => sum + a.timeSpent, 0)
      },
      message: "Activity heatmap retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

/**
 * Get user's weekly learning activity (last 7 days time spent)
 */
export const getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days including today
    startDate.setHours(0, 0, 0, 0);
    
    // Get all progress records for the user
    const progressRecords = await Progress.find({ userId }).select('dailyTimeLog');
    
    // Create map for each day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    
    // Initialize all 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      weeklyData.push({
        day: dayName,
        mins: 0,
        date: date.toISOString().split('T')[0]
      });
    }
    
    // Aggregate time spent per day from dailyTimeLog
    progressRecords.forEach(record => {
      if (record.dailyTimeLog && record.dailyTimeLog.length > 0) {
        record.dailyTimeLog.forEach(log => {
          const dayData = weeklyData.find(d => d.date === log.date);
          if (dayData) {
            dayData.mins += log.minutesSpent || 0;
          }
        });
      }
    });
    
    const totalTime = weeklyData.reduce((sum, d) => sum + d.mins, 0);
    
    res.json({
      success: true,
      data: {
        weeklyActivity: weeklyData,
        totalTime
      },
      message: "Weekly activity retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};
