import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { generatePersonalizedLessons, generateTopicLessons, refreshPersonalizedLessons } from "../lib/geminiService.js";

export const getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.json({success: false, message: "Lesson not found"});
    }
    
    res.json({
      success: true,
      data: lesson,
      message: "Lesson retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({});
    
    res.json({
      success: true,
      data: lessons,
      message: "Lessons retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('lessons');
    
    res.json({
      success: true,
      data: courses,
      message: "Courses retrieved successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};

// ===== CUSTOM LESSON MANAGEMENT =====

/**
 * Create a custom lesson (user-imported tutorial)
 */
export const createCustomLesson = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, contentURL, sourceType, tags, difficulty, estimatedTimeMin, provider, prerequisites } = req.body;

    // Validate required fields
    if (!title || !contentURL) {
      return res.json({ success: false, message: "Title and URL are required" });
    }

    // Create custom lesson
    const customLesson = new Lesson({
      title,
      description: description || "",
      contentURL,
      sourceType: sourceType || 'article',
      tags: tags || [],
      difficulty: difficulty || 'beginner',
      estimatedTimeMin: estimatedTimeMin || 30,
      provider: provider || "Custom",
      prerequisites: prerequisites || [],
      createdBy: 'user',
      isCustom: true,
      userId: userId,
      visibility: 'private', // User's personal lesson
      isExternal: true,
      rating: 0,
      visits: 0
    });

    await customLesson.save();

    res.json({
      success: true,
      data: customLesson,
      message: "Custom lesson created successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

/**
 * Get user's custom lessons
 */
export const getMyCustomLessons = async (req, res) => {
  try {
    const userId = req.user._id;

    const customLessons = await Lesson.find({
      userId: userId,
      isCustom: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customLessons,
      message: "Custom lessons retrieved successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

/**
 * Update a custom lesson
 */
export const updateCustomLesson = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    // Find lesson and verify ownership
    const lesson = await Lesson.findOne({ _id: id, userId: userId, isCustom: true });

    if (!lesson) {
      return res.json({ success: false, message: "Custom lesson not found or access denied" });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'contentURL', 'sourceType', 'tags', 'difficulty', 'estimatedTimeMin', 'provider', 'prerequisites'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        lesson[field] = updates[field];
      }
    });

    await lesson.save();

    res.json({
      success: true,
      data: lesson,
      message: "Custom lesson updated successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

/**
 * Delete a custom lesson
 */
export const deleteCustomLesson = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const lesson = await Lesson.findOneAndDelete({ _id: id, userId: userId, isCustom: true });

    if (!lesson) {
      return res.json({ success: false, message: "Custom lesson not found or access denied" });
    }

    res.json({
      success: true,
      message: "Custom lesson deleted successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// ===== AI-GENERATED LESSONS =====

/**
 * Generate personalized lessons using Gemini AI
 */
export const generatePersonalizedLessonsForUser = async (req, res) => {
  try {
    const userId = req.user._id; // Fixed: use _id instead of id
    const { count = 5 } = req.body;

    // Generate lessons
    const lessons = await generatePersonalizedLessons(userId, count);

    // Save to database
    const savedLessons = await Lesson.insertMany(lessons);

    res.json({
      success: true,
      data: {
        lessons: savedLessons,
        generatedCount: savedLessons.length
      },
      message: `Generated ${savedLessons.length} personalized lessons`
    });

  } catch (error) {
    console.error('❌ Error generating personalized lessons:', error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Generate lessons for a specific topic
 */
export const generateTopicLessonsEndpoint = async (req, res) => {
  try {
    const { topic, difficulty = 'beginner', count = 3 } = req.body;

    if (!topic) {
      return res.json({ success: false, message: "Topic is required" });
    }

    const lessons = await generateTopicLessons(topic, difficulty, count);
    const savedLessons = await Lesson.insertMany(lessons);

    res.json({
      success: true,
      data: savedLessons,
      message: `Generated ${savedLessons.length} lessons for ${topic}`
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

/**
 * Refresh user's personalized lesson pool
 */
export const refreshMyLessons = async (req, res) => {
  try {
    const userId = req.user._id;

    const lessons = await refreshPersonalizedLessons(userId);

    res.json({
      success: true,
      data: lessons,
      message: "Personalized lessons refreshed successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

/**
 * Get all available lessons for user (curated + personalized + custom)
 */
export const getMyLearningDirectory = async (req, res) => {
  try {
    const userId = req.user._id;

    // PUBLIC SECTION - General content visible to everyone
    const publicLessons = await Lesson.find({ 
      visibility: 'public'
    });

    // PRIVATE SECTION - User's personalized content
    // 1. AI-generated lessons for this user
    const personalizedLessons = await Lesson.find({
      geminiGenerated: true,
      personalizedFor: userId
    });

    // 2. User's custom imported lessons
    const customLessons = await Lesson.find({
      userId: userId,
      isCustom: true
    });

    res.json({
      success: true,
      data: {
        public: publicLessons,
        private: {
          personalized: personalizedLessons,
          custom: customLessons,
          total: personalizedLessons.length + customLessons.length
        },
        total: publicLessons.length + personalizedLessons.length + customLessons.length
      },
      message: "Learning directory retrieved successfully"
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};
