import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import { calculateMastery } from "./recommendationEngine.js";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate personalized learning resources using Gemini AI
 * @param {string} userId - User ID to personalize for
 * @param {number} count - Number of lessons to generate (default: 5)
 * @returns {Array} Array of generated lesson objects
 */
export const generatePersonalizedLessons = async (userId, count = 5) => {
  try {
    console.log('🤖 [GEMINI] Starting AI lesson generation');
    console.log('🤖 [GEMINI] User ID:', userId);
    console.log('🤖 [GEMINI] Requested count:', count);
    console.log('🤖 [GEMINI] API Key configured:', !!process.env.GEMINI_API_KEY);
    
    // Fetch user data
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    console.log('👤 [GEMINI] User interests:', user.interests);
    console.log('🎯 [GEMINI] User goals:', user.learning_goals);

    // Get all unique tags from existing lessons
    const allLessons = await Lesson.find();
    const allTags = [...new Set(allLessons.flatMap(l => l.tags))];

    // Calculate user's mastery
    const mastery = await calculateMastery(userId, allTags);

    // Identify skill gaps (tags with low mastery)
    const skillGaps = Object.entries(mastery)
      .filter(([_, score]) => score < 0.7)
      .sort(([_, a], [__, b]) => a - b)
      .slice(0, 5)
      .map(([tag, _]) => tag);

    console.log('📊 [GEMINI] Skill gaps identified:', skillGaps);

    // Normalize and parse interests (split comma-separated values)
    const normalizedInterests = user.interests
      .flatMap(interest => interest.split(',').map(i => i.trim().toLowerCase()))
      .filter(Boolean);
    
    console.log('🎯 [GEMINI] Normalized interests:', normalizedInterests);

    // Build prompt for Gemini
    const prompt = `You are an educational content curator. Generate ${count} high-quality learning resources for a student with the following profile:

PRIMARY User Interests (MUST include these topics): ${normalizedInterests.join(', ')}
Learning Goals: ${user.learning_goals.join(', ')}
Suggested Areas for Improvement: ${skillGaps.length > 0 ? skillGaps.join(', ') : 'None identified'}

CRITICAL REQUIREMENTS:
1. Generate resources that DIRECTLY match the user's PRIMARY interests
2. If a user is interested in "python", "nextjs", etc., include those specific topics
3. Distribute lessons across ALL user interests, not just one technology
4. Provide REAL, EXISTING links to high-quality tutorials, videos, or articles

Recommended sources:
- YouTube: freeCodeCamp, Traversy Media, Web Dev Simplified, Programming with Mosh, Corey Schafer, Tech With Tim
- Tutorial sites: Real Python, CSS-Tricks, MDN, Dev.to, DigitalOcean Tutorials
- Course platforms: freeCodeCamp, Codecademy free courses, W3Schools

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Exact title of the resource",
    "description": "Brief description (1-2 sentences)",
    "contentURL": "Full valid URL (must be real and accessible)",
    "sourceType": "video|article|tutorial|course",
    "tags": ["tag1", "tag2", "tag3"],
    "difficulty": "beginner|intermediate|advanced",
    "estimatedTimeMin": number,
    "provider": "Channel/Site name",
    "prerequisites": ["prereq1", "prereq2"]
  }
]

IMPORTANT: 
- Provide REAL URLs only - verify these are actual resources
- Match tags to the user's PRIMARY interests
- Cover diverse topics from their interest list
- No placeholder or example URLs
- Prioritize beginner-friendly content for new topics`;

    // Generate content
    console.log('🚀 [GEMINI] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('📥 [GEMINI] Received response (first 500 chars):', text.substring(0, 500));

    // Clean up the response (remove markdown code blocks if present)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let generatedLessons;
    try {
      generatedLessons = JSON.parse(text);
      console.log('✅ [GEMINI] Successfully parsed JSON, lessons count:', generatedLessons.length);
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse JSON response');
      console.error('❌ [GEMINI] Response text:', text);
      console.error('❌ [GEMINI] Parse error:', parseError.message);
      throw new Error('Invalid JSON response from Gemini');
    }

    // Validate and format lessons
    const formattedLessons = generatedLessons.map(lesson => ({
      ...lesson,
      createdBy: 'gemini',
      geminiGenerated: true,
      personalizedFor: [userId],
      visibility: 'private',
      isExternal: true,
      rating: 4.5, // Default rating for AI-generated content
      visits: 0
    }));

    console.log('🎓 [GEMINI] Formatted lessons:', formattedLessons.length);
    console.log('🎓 [GEMINI] Sample lesson:', JSON.stringify(formattedLessons[0], null, 2));

    return formattedLessons;

  } catch (error) {
    console.error('❌ [GEMINI] Error generating personalized lessons:', error.message);
    console.error('❌ [GEMINI] Full error:', error);
    throw error;
  }
};

/**
 * Generate lessons for a specific topic/skill
 * @param {string} topic - Topic to generate lessons for
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of lessons
 * @returns {Array} Array of generated lesson objects
 */
export const generateTopicLessons = async (topic, difficulty = 'beginner', count = 3) => {
  try {
    const prompt = `Generate ${count} high-quality learning resources for the topic: "${topic}" at ${difficulty} level.

Provide REAL, EXISTING links to:
- YouTube tutorials from reputable channels
- Popular tutorial sites and documentation
- Free online courses

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Resource title",
    "description": "Brief description",
    "contentURL": "Full valid URL",
    "sourceType": "video|article|tutorial|course",
    "tags": ["${topic}", "related-tag1", "related-tag2"],
    "difficulty": "${difficulty}",
    "estimatedTimeMin": number,
    "provider": "Channel/Site name",
    "prerequisites": []
  }
]

Ensure all URLs are real and accessible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const generatedLessons = JSON.parse(text);

    return generatedLessons.map(lesson => ({
      ...lesson,
      createdBy: 'gemini',
      geminiGenerated: true,
      visibility: 'public',
      isExternal: true,
      rating: 4.5,
      visits: 0
    }));

  } catch (error) {
    console.error('Error generating topic lessons:', error);
    throw error;
  }
};

/**
 * Refresh user's personalized lesson pool
 * @param {string} userId - User ID
 * @returns {Array} Saved lessons
 */
export const refreshPersonalizedLessons = async (userId) => {
  try {
    // Delete old Gemini-generated lessons for this user (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await Lesson.deleteMany({
      geminiGenerated: true,
      personalizedFor: userId,
      createdAt: { $lt: sevenDaysAgo }
    });

    // Generate new personalized lessons
    const newLessons = await generatePersonalizedLessons(userId, 10);

    // Save to database
    const savedLessons = await Lesson.insertMany(newLessons);

    return savedLessons;

  } catch (error) {
    console.error('Error refreshing personalized lessons:', error);
    throw error;
  }
};

export default {
  generatePersonalizedLessons,
  generateTopicLessons,
  refreshPersonalizedLessons
};
