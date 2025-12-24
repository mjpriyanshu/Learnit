import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import { calculateMastery } from "./recommendationEngine.js";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Validate URL format (no HTTP requests)
 * @param {string} url - URL to validate
 * @returns {boolean} true if valid format, false otherwise
 */
const validateURL = (url) => {
  try {
    // Check basic URL format
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlPattern.test(url)) return false;
    
    // For YouTube videos, validate the video ID format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = url.match(youtubeRegex);
      return match !== null; // Valid if video ID format is correct
    }
    
    // Accept well-known educational domains
    const trustedDomains = [
      'youtube.com', 'youtu.be', 'freecodecamp.org', 'developer.mozilla.org',
      'w3schools.com', 'python.org', 'realpython.com', 'dev.to', 
      'digitalocean.com', 'codecademy.com', 'css-tricks.com', 'github.com'
    ];
    
    return trustedDomains.some(domain => url.includes(domain));
  } catch (error) {
    console.log('⚠️ [URL Validation] Invalid URL format:', url);
    return false;
  }
};

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
    const prompt = `You are an educational content curator. Generate EXACTLY ${count} high-quality YouTube video tutorials.

STRICT REQUIREMENT - ONLY GENERATE VIDEOS ABOUT THESE TOPICS:
${normalizedInterests.map((interest, i) => `${i + 1}. ${interest.toUpperCase()}`).join('\n')}

User's Learning Goals: ${user.learning_goals.join(', ')}

CRITICAL RULES:
1. Generate EXACTLY ${count} YouTube videos
2. EVERY video MUST be directly related to ONE of the topics listed above
3. Do NOT generate videos about topics NOT in the user's interests
4. Distribute videos across DIFFERENT interests from the list (not all on one topic)
5. Use ONLY these trusted YouTube channels:
   - freeCodeCamp.org
   - Traversy Media
   - Programming with Mosh
   - Web Dev Simplified
   - The Net Ninja
   - Corey Schafer
   - Tech With Tim
   - Fireship
   - Kevin Powell (for CSS)

EXAMPLE - If interests are ["python", "react", "css"]:
✅ CORRECT: Python tutorial, React hooks, CSS flexbox
❌ WRONG: Java tutorial, Angular, PHP (not in interests)

Return ONLY valid JSON array with EXACTLY ${count} items:
[
  {
    "title": "Full video title matching user interests",
    "description": "What they'll learn about [INTEREST FROM LIST]",
    "contentURL": "https://www.youtube.com/watch?v=VIDEO_ID",
    "sourceType": "video",
    "tags": ["${normalizedInterests[0] || 'programming'}", "tag2", "tag3"],
    "difficulty": "beginner",
    "estimatedTimeMin": 30,
    "provider": "Channel name from approved list",
    "prerequisites": []
  }
]

MANDATORY:
- All tags must relate to interests: ${normalizedInterests.join(', ')}
- sourceType must be "video"
- Only YouTube URLs from approved channels
- Match user interests EXACTLY - no random topics`;

    console.log('📝 [GEMINI] Prompt:', prompt.substring(0, 300) + '...');

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
      console.log('📊 [GEMINI] Requested:', count, '| Received:', generatedLessons.length);
      
      if (generatedLessons.length < count) {
        console.log('⚠️ [GEMINI] Warning: Received fewer lessons than requested!');
      }
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse JSON response');
      console.error('❌ [GEMINI] Response text:', text);
      console.error('❌ [GEMINI] Parse error:', parseError.message);
      throw new Error('Invalid JSON response from Gemini');
    }

    // Validate and format lessons
    console.log('🔍 [GEMINI] Validating URLs...');
    
    // Validate URLs (format check only, no HTTP requests)
    const validLessons = generatedLessons.filter(lesson => {
      const isValid = validateURL(lesson.contentURL);
      if (!isValid) {
        console.log('❌ [GEMINI] Removed invalid URL format:', lesson.contentURL);
        return false;
      }
      return true;
    });
    
    console.log(`✅ [GEMINI] URL Validation: ${validLessons.length}/${generatedLessons.length} URLs have valid format`);
    
    // If we lost too many lessons, warn but continue
    if (validLessons.length < count * 0.5) {
      console.log('⚠️ [GEMINI] Warning: More than 50% of URLs were invalid. Consider regenerating.');
    }
    
    const formattedLessons = validLessons.map(lesson => ({
      title: lesson.title,
      description: lesson.description,
      contentURL: lesson.contentURL,
      sourceType: lesson.sourceType,
      tags: lesson.tags,
      difficulty: lesson.difficulty,
      estimatedTimeMin: lesson.estimatedTimeMin,
      provider: lesson.provider,
      prerequisites: lesson.prerequisites,
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

    // Generate new personalized lessons (8 to have some buffer)
    const newLessons = await generatePersonalizedLessons(userId, 8);

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
