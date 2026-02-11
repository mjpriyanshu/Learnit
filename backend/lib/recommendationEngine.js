import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";

/**
 * Recommendation Engine Configuration
 * Adjust these weights to tune the recommendation algorithm
 */
const WEIGHTS = {
  GAP_RELEVANCE: 0.5,      // How much the lesson fills skill gaps
  DIFFICULTY_MATCH: 0.2,    // How well difficulty matches user level
  POPULARITY: 0.15,         // Lesson visits and engagement
  RATING: 0.15              // User ratings
};

const DIFFICULTY_SCORES = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3
};

/**
 * Calculate mastery score for each tag based on user progress
 * @param {string} userId - User ID
 * @param {Array} tags - List of all tags in the system
 * @returns {Object} Map of tag to mastery score (0-1)
 */
export const calculateMastery = async (userId, tags) => {
  try {
    const progress = await Progress.find({ userId, status: 'completed' })
      .populate('lessonId');
    
    const mastery = {};
    const tagCounts = {};
    
    tags.forEach(tag => {
      mastery[tag] = 0;
      tagCounts[tag] = 0;
    });
    
    progress.forEach(p => {
      if (p.lessonId && p.lessonId.tags) {
        p.lessonId.tags.forEach(tag => {
          if (mastery.hasOwnProperty(tag)) {
            mastery[tag] += (p.score || 100) / 100;
            tagCounts[tag]++;
          }
        });
      }
    });
    
    Object.keys(mastery).forEach(tag => {
      if (tagCounts[tag] > 0) {
        mastery[tag] = Math.min(mastery[tag] / tagCounts[tag], 1);
      }
    });
    
    return mastery;
  } catch (error) {
    console.error('Error calculating mastery:', error);
    return {};
  }
};

/**
 * Calculate skill gap for a lesson based on user's current mastery
 * @param {Object} mastery - User's mastery scores by tag
 * @param {Array} lessonTags - Tags for the lesson
 * @returns {number} Gap score (0-1), higher means bigger gap to fill
 */
export const calculateGap = (mastery, lessonTags) => {
  if (!lessonTags || lessonTags.length === 0) return 0;
  
  let totalGap = 0;
  lessonTags.forEach(tag => {
    const currentMastery = mastery[tag] || 0;
    totalGap += (1 - currentMastery);
  });
  
  return totalGap / lessonTags.length;
};

/**
 * Check if user has completed prerequisites for a lesson
 * @param {string} userId - User ID
 * @param {Array} prerequisites - Array of prerequisite tags
 * @param {Object} mastery - User's mastery scores
 * @returns {boolean} True if prerequisites are met
 */
export const checkPrerequisites = (mastery, prerequisites) => {
  if (!prerequisites || prerequisites.length === 0) return true;
  
  const PREREQUISITE_THRESHOLD = 0.5;
  
  return prerequisites.every(prereq => {
    return (mastery[prereq] || 0) >= PREREQUISITE_THRESHOLD;
  });
};

/**
 * Calculate difficulty match score
 * @param {Object} user - User object with skill_levels
 * @param {string} lessonDifficulty - Lesson difficulty level
 * @param {Array} lessonTags - Tags for the lesson
 * @param {Object} mastery - User's mastery scores
 * @returns {number} Score (0-1)
 */
export const calculateDifficultyMatch = (user, lessonDifficulty, lessonTags, mastery) => {
  const lessonDiffScore = DIFFICULTY_SCORES[lessonDifficulty] || 1;
  
  let avgMastery = 0;
  if (lessonTags && lessonTags.length > 0) {
    avgMastery = lessonTags.reduce((sum, tag) => sum + (mastery[tag] || 0), 0) / lessonTags.length;
  }
  
  const userLevel = 1 + (avgMastery * 2);
  const diffDelta = Math.abs(userLevel - lessonDiffScore);
  
  return Math.max(0, 1 - (diffDelta / 2));
};

/**
 * Calculate popularity score
 * @param {number} visits - Number of visits
 * @param {number} maxVisits - Maximum visits in dataset
 * @returns {number} Normalized score (0-1)
 */
export const calculatePopularityScore = (visits, maxVisits) => {
  if (maxVisits === 0) return 0;
  return visits / maxVisits;
};

/**
 * Calculate rating score
 * @param {number} rating - Lesson rating
 * @returns {number} Normalized score (0-1)
 */
export const calculateRatingScore = (rating) => {
  return rating / 5;
};

/**
 * Score a single lesson for a user
 * @param {Object} user - User object
 * @param {Object} lesson - Lesson object
 * @param {Object} mastery - User's mastery scores
 * @param {number} maxVisits - Maximum visits in dataset
 * @returns {Object} Score and reason
 */
export const scoreLesson = (user, lesson, mastery, maxVisits) => {
  const gap = calculateGap(mastery, lesson.tags);
  const difficultyMatch = calculateDifficultyMatch(user, lesson.difficulty, lesson.tags, mastery);
  const popularity = calculatePopularityScore(lesson.visits || 0, maxVisits);
  const ratingScore = calculateRatingScore(lesson.rating || 0);
  
  const totalScore = 
    (gap * WEIGHTS.GAP_RELEVANCE) +
    (difficultyMatch * WEIGHTS.DIFFICULTY_MATCH) +
    (popularity * WEIGHTS.POPULARITY) +
    (ratingScore * WEIGHTS.RATING);
  
  let reason = "";
  if (gap > 0.6) {
    reason = "Helps you learn new skills in " + (lesson.tags[0] || "this topic");
  } else if (difficultyMatch > 0.7) {
    reason = "Perfect difficulty match for your level";
  } else if (popularity > 0.7) {
    reason = "Highly popular among learners";
  } else if (ratingScore > 0.8) {
    reason = "Highly rated by users";
  } else {
    reason = "Recommended based on your interests";
  }
  
  return { score: totalScore, reason };
};

/**
 * Generate recommendations for a user
 * @param {Object} user - User object
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} Sorted array of recommended lessons with scores
 */
export const generateRecommendations = async (user, limit = 10) => {
  try {
    // Get different types of lessons - Use 'public' as fallback since most lessons don't have visibility set
    const curatedQuery = { 
      $or: [
        { createdBy: 'system', visibility: 'curated' },
        { createdBy: 'system', visibility: { $exists: false } }, // Include legacy lessons without visibility
        { createdBy: 'system', visibility: 'public' }
      ]
    };
    const curatedLessons = await Lesson.find(curatedQuery);
    
    const personalizedLessons = await Lesson.find({
      geminiGenerated: true,
      personalizedFor: user._id
    });
    
    const customLessons = await Lesson.find({
      userId: user._id,
      isCustom: true
    });
    
    const publicLessons = await Lesson.find({
      visibility: 'public',
      createdBy: { $ne: 'system' }
    });

    console.log('📚 Lessons found:', {
      curated: curatedLessons.length,
      personalized: personalizedLessons.length,
      custom: customLessons.length,
      public: publicLessons.length
    });

    // Combine all available lessons
    const allLessons = [
      ...curatedLessons,
      ...personalizedLessons,
      ...customLessons,
      ...publicLessons
    ];

    // Remove duplicates based on _id
    const uniqueLessons = Array.from(
      new Map(allLessons.map(lesson => [lesson._id.toString(), lesson])).values()
    );
    
    console.log('✅ Total unique lessons:', uniqueLessons.length);
    
    const allTags = [...new Set(uniqueLessons.flatMap(l => l.tags || []))];
    
    const mastery = await calculateMastery(user._id.toString(), allTags);
    
    const completedProgress = await Progress.find({ 
      userId: user._id, 
      status: 'completed' 
    });
    const completedLessonIds = completedProgress.map(p => p.lessonId.toString());
    
    console.log('📈 User progress:', {
      completed: completedLessonIds.length,
      total: uniqueLessons.length,
      percentage: Math.round((completedLessonIds.length / uniqueLessons.length) * 100) + '%'
    });
    
    console.log('🔍 Filter criteria:', {
      userInterests: user.interests,
      completedCount: completedLessonIds.length
    });
    
    let filteredByCompleted = 0;
    let filteredByPrereqs = 0;
    let filteredByInterests = 0;
    
    // Normalize user interests - split comma-separated values
    const normalizedInterests = user.interests ? 
      user.interests.flatMap(interest => 
        interest.split(',').map(i => i.trim().toLowerCase())
      ) : [];
    
    console.log('🔍 Normalized interests:', normalizedInterests);
    
    const candidateLessons = uniqueLessons.filter(lesson => {
      if (completedLessonIds.includes(lesson._id.toString())) {
        filteredByCompleted++;
        return false;
      }
      
      // Only check prerequisites for intermediate/advanced lessons
      if (lesson.difficulty === 'intermediate' || lesson.difficulty === 'advanced') {
        if (!checkPrerequisites(mastery, lesson.prerequisites)) {
          filteredByPrereqs++;
          return false;
        }
      }
      
      // Match interests with loose matching (partial match)
      const hasMatchingInterest = normalizedInterests.length > 0
        ? lesson.tags.some(tag => 
            normalizedInterests.some(interest => 
              tag.toLowerCase().includes(interest) || interest.includes(tag.toLowerCase())
            )
          )
        : true; // If no interests set, show all lessons
      
      if (!hasMatchingInterest) {
        filteredByInterests++;
      }
      
      return hasMatchingInterest;
    });
    
    console.log('🎯 Candidate lessons after filtering:', candidateLessons.length);
    console.log('📉 Filtered out:', {
      byCompleted: filteredByCompleted,
      byPrerequisites: filteredByPrereqs,
      byInterests: filteredByInterests
    });
    
    const maxVisits = Math.max(...uniqueLessons.map(l => l.visits || 0), 1);
    
    const scoredLessons = candidateLessons.map(lesson => {
      const { score, reason } = scoreLesson(user, lesson, mastery, maxVisits);
      
      // Boost score for AI-personalized lessons
      let finalScore = score;
      if (lesson.geminiGenerated && lesson.personalizedFor?.includes(user._id)) {
        finalScore += 0.2; // 20% boost for AI-personalized content
      }
      
      // Boost score for user's custom lessons (they added them for a reason)
      if (lesson.isCustom && lesson.userId?.toString() === user._id.toString()) {
        finalScore += 0.15; // 15% boost for custom content
      }
      
      return {
        ...lesson.toObject(),
        score: Math.min(finalScore, 1), // Cap at 1.0
        reason
      };
    });
    
    scoredLessons.sort((a, b) => b.score - a.score);
    
    const finalRecommendations = scoredLessons.slice(0, limit);
    
    console.log('🎉 Final recommendations:', {
      count: finalRecommendations.length,
      topScores: finalRecommendations.slice(0, 3).map(r => ({
        title: r.title,
        score: r.score.toFixed(2),
        reason: r.reason
      }))
    });
    
    return finalRecommendations;
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    throw error;
  }
};
