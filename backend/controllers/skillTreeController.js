import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import SkillTree from '../models/SkillTree.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate personalized skill tree based on user interests and progress
 */
export const generatePersonalizedSkillTree = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body; // Get interests from request body

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide interests as an array' 
      });
    }

    // Fetch user data for progress tracking
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user's progress
    const progress = await Progress.find({ userId });
    const completedLessons = progress.filter(p => p.isCompleted).length;
    const totalProgress = progress.reduce((sum, p) => sum + (p.progressPercent || 0), 0) / Math.max(progress.length, 1);

    // Get all lessons to understand available topics
    const allLessons = await Lesson.find();

    // Calculate completed topics
    const completedTags = new Set();
    for (const prog of progress.filter(p => p.isCompleted)) {
      const lesson = allLessons.find(l => l._id.toString() === prog.lessonId.toString());
      if (lesson) {
        lesson.tags.forEach(tag => completedTags.add(tag));
      }
    }

    console.log('🌲 [SKILL TREE] Generating for user:', user.name);
    console.log('🌲 [SKILL TREE] Custom interests:', interests);
    console.log('🌲 [SKILL TREE] Completed lessons:', completedLessons);
    console.log('🌲 [SKILL TREE] Completed tags:', Array.from(completedTags));

    // Build prompt for Gemini
    const prompt = `You are a learning path architect. Generate a personalized skill tree/mind map for a student with the following requirements:

PRIMARY INTERESTS (MUST focus on these): ${interests.join(', ')}
Completed Topics: ${Array.from(completedTags).join(', ') || 'None yet'}
Current Progress: ${Math.round(totalProgress)}% overall completion

REQUIREMENTS:
1. Create a skill tree with 15-20 nodes focused ONLY on the user's specified interests: ${interests.join(', ')}
2. Organize nodes into logical learning paths (branches) based on these interests
3. Each node should be a specific skill or topic related to the interests
4. Connect nodes in a prerequisite chain (basics → intermediate → advanced)
5. Mark completed topics as "completed", topics ready to learn as "unlocked", and future topics as "locked"
6. Position nodes in a visually appealing tree structure (x: 0-100, y: 0-100)
7. Use categories that match user interests exactly (e.g., 'python', 'web', 'data-science', 'mobile', 'ai', 'react', 'nodejs')
8. Include real YouTube video IDs for learning each topic (11 characters)

Return ONLY valid JSON with this structure:
{
  "id": "root",
  "title": "Your Learning Journey",
  "nodes": [
    {
      "id": "unique-id",
      "title": "Node Title",
      "x": 50,
      "y": 10,
      "status": "completed|unlocked|locked",
      "category": "category-name",
      "icon": "Code|Server|Database|Globe|Lock|Cpu|Terminal|Layers|Search|Zap",
      "description": "What you'll learn (1-2 sentences)",
      "videoId": "youtube-video-id",
      "connections": ["connected-node-id-1", "connected-node-id-2"]
    }
  ]
}

CRITICAL GUIDELINES:
- Distribute nodes across the canvas (x: 0-100, y: 0-100) with AMPLE SPACING
- AVOID clustering: ensure minimum 15-20 units distance between nodes
- Start with 1-2 foundational nodes at y: 10-20
- Branch out into different paths based on the ${interests.length} interests provided
- Use the FULL WIDTH of the canvas - spread branches horizontally (x: 10, 30, 50, 70, 90)
- End with advanced/specialized topics at y: 80-100
- Create 3-5 distinct learning paths (branches) that don't overlap
- Ensure each node has meaningful connections showing prerequisites
- Use real, popular YouTube tutorial video IDs (11 characters, valid format)
- Match categories to user interests EXACTLY - use lowercase versions of the interest keywords
- Make sure all interests are covered in the tree
- SPREAD OUT nodes vertically too - use increments of 15-20 for y positions`;

    // Generate skill tree using AI
    console.log('🚀 [SKILL TREE] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let skillTree;
    try {
      skillTree = JSON.parse(text);
      console.log('✅ [SKILL TREE] Successfully generated tree with', skillTree.nodes.length, 'nodes');
    } catch (parseError) {
      console.error('❌ [SKILL TREE] Failed to parse JSON');
      console.error('Response:', text.substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate skill tree', 
        error: parseError.message 
      });
    }

    // Add metadata
    skillTree.generatedAt = new Date();
    skillTree.userId = userId;
    skillTree.userProgress = Math.round(totalProgress);

    // Save to database and maintain history (keep only 3 most recent)
    try {
      await SkillTree.create({
        userId,
        interests,
        treeData: skillTree
      });

      // Keep only the 3 most recent trees per user
      const allUserTrees = await SkillTree.find({ userId }).sort({ createdAt: -1 });
      if (allUserTrees.length > 3) {
        const treesToDelete = allUserTrees.slice(3).map(t => t._id);
        await SkillTree.deleteMany({ _id: { $in: treesToDelete } });
      }
    } catch (saveError) {
      console.error('⚠️ [SKILL TREE] Failed to save tree to database:', saveError.message);
      // Continue anyway - don't fail the request if save fails
    }

    res.json({ success: true, skillTree });

  } catch (error) {
    console.error('❌ [SKILL TREE] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate skill tree', 
      error: error.message 
    });
  }
};

/**
 * Get default skill tree (fallback if AI fails)
 */
export const getDefaultSkillTree = (req, res) => {
  const defaultTree = {
    id: 'root',
    title: 'Mastery Map',
    nodes: [
      {
        id: 'cs-basics',
        title: 'CS Fundamentals',
        x: 50, y: 10,
        status: 'unlocked',
        category: 'foundation',
        icon: 'Cpu',
        description: 'Computers, Binary, and Logic.',
        videoId: 'zOjov-2OZ0E',
        connections: ['python-basics', 'js-basics']
      },
      {
        id: 'python-basics',
        title: 'Python Basics',
        x: 30, y: 30,
        status: 'unlocked',
        category: 'python',
        icon: 'Terminal',
        description: 'Syntax, loops, and types.',
        videoId: '_uQrJ0TkZlc',
        connections: ['python-advanced']
      },
      {
        id: 'python-advanced',
        title: 'Advanced Python',
        x: 20, y: 50,
        status: 'locked',
        category: 'python',
        icon: 'Code',
        description: 'Decorators, generators, OOP.',
        videoId: 'jJ44UiErcXk',
        connections: []
      },
      {
        id: 'js-basics',
        title: 'JavaScript',
        x: 70, y: 30,
        status: 'unlocked',
        category: 'web',
        icon: 'Code',
        description: 'The language of the web.',
        videoId: 'PkZNo7MFNFg',
        connections: ['frontend-react']
      },
      {
        id: 'frontend-react',
        title: 'React & UI',
        x: 70, y: 50,
        status: 'locked',
        category: 'web',
        icon: 'Globe',
        description: 'Components & Hooks.',
        videoId: 'SqcY0GlETk4',
        connections: []
      }
    ],
    generatedAt: new Date(),
    isDefault: true
  };

  res.json({ success: true, skillTree: defaultTree });
};

/**
 * Get user's skill tree history (last 3 generated trees)
 */
export const getSkillTreeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await SkillTree.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('interests treeData createdAt');

    const formattedHistory = history.map(record => ({
      id: record._id,
      interests: record.interests,
      tree: record.treeData,
      createdAt: record.createdAt
    }));

    res.json({ success: true, history: formattedHistory });
  } catch (error) {
    console.error('❌ [SKILL TREE HISTORY] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch skill tree history', 
      error: error.message 
    });
  }
};
