import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import { fetchYouTubeVideo } from "./youtubeService.js";

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generatePersonalizedLessons = async (userId, count = 5) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const interests = user.interests
      .flatMap(i => i.split(",").map(v => v.trim().toLowerCase()))
      .filter(Boolean);

    const prompt = `
You are an educational content curator.

Generate EXACTLY ${count} learning video suggestions.

ONLY USE THESE TOPICS:
${interests.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

RULES:
- DO NOT generate YouTube URLs
- Generate SEARCH INTENT ONLY
- Use real, popular topics
- Beginner friendly

Return ONLY JSON:

[
  {
    "title": "Video title",
    "description": "What the user will learn",
    "searchQuery": "React hooks tutorial Traversy Media",
    "sourceType": "video",
    "tags": ["react"],
    "difficulty": "beginner",
    "estimatedTimeMin": 30,
    "provider": "Traversy Media",
    "prerequisites": []
  }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    const generatedLessons = JSON.parse(text);

    const finalLessons = [];

    for (const lesson of generatedLessons) {
      const video = await fetchYouTubeVideo(
        `${lesson.searchQuery} ${lesson.provider}`
      );

      if (!video) continue;

      finalLessons.push({
        title: lesson.title,
        description: lesson.description,
        contentURL: video.watchUrl,
        embedURL: video.embedUrl,
        sourceType: "video",
        tags: lesson.tags,
        difficulty: lesson.difficulty,
        estimatedTimeMin: lesson.estimatedTimeMin,
        provider: lesson.provider,
        prerequisites: lesson.prerequisites,
        createdBy: "gemini",
        geminiGenerated: true,
        personalizedFor: [userId],
        visibility: "private",
        isExternal: true,
        rating: 4.5,
        visits: 0
      });
    }

    return finalLessons.slice(0, count);

  } catch (error) {
    console.error("❌ Gemini lesson generation failed:", error.message);
    throw error;
  }
};

export const refreshPersonalizedLessons = async (userId) => {
  await Lesson.deleteMany({
    geminiGenerated: true,
    personalizedFor: userId
  });

  const lessons = await generatePersonalizedLessons(userId, 5);
  return Lesson.insertMany(lessons);
};

export const generateQuizQuestions = async (lessonTitle, lessonDescription = "") => {
  try {
    const prompt = `
You are an expert educator creating quiz questions.

Generate EXACTLY 5 multiple-choice questions based on this lesson:
Title: "${lessonTitle}"
Description: "${lessonDescription}"

RULES:
- Create questions that test understanding of the lesson topic
- Each question should have 4 options
- Mark the correct answer index (0-3)
- Provide a brief explanation for the correct answer
- Mix difficulty levels (easy, medium, hard)
- Questions should be clear and educational
- Award 10 points per question

Return ONLY valid JSON (no markdown, no code blocks):

[
  {
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct",
    "difficulty": "easy",
    "points": 10
  }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    const questions = JSON.parse(text);

    // Validate and ensure we have exactly 5 questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid quiz questions generated");
    }

    // Return first 5 questions (in case Gemini generates more)
    return questions.slice(0, 5);

  } catch (error) {
    console.error("❌ Gemini quiz generation failed:", error.message);
    // Return fallback questions if Gemini fails
    return [
      {
        question: "Did you understand the main concepts covered in this lesson?",
        options: ["Yes, completely", "Mostly yes", "Somewhat", "Not really"],
        correctAnswer: 0,
        explanation: "Great! Understanding the main concepts is the first step to mastery.",
        difficulty: "easy",
        points: 10
      },
      {
        question: "Which aspect of this lesson did you find most valuable?",
        options: ["Core concepts", "Practical examples", "Implementation details", "Best practices"],
        correctAnswer: 0,
        explanation: "All aspects are important, but core concepts form the foundation.",
        difficulty: "easy",
        points: 10
      },
      {
        question: "How confident do you feel applying what you learned?",
        options: ["Very confident", "Somewhat confident", "Need more practice", "Not confident"],
        correctAnswer: 0,
        explanation: "Confidence comes with practice and application.",
        difficulty: "medium",
        points: 10
      },
      {
        question: "What would help reinforce your learning from this lesson?",
        options: ["Practice exercises", "More examples", "Deeper explanation", "Related topics"],
        correctAnswer: 0,
        explanation: "Practice exercises are excellent for reinforcing learning.",
        difficulty: "medium",
        points: 10
      },
      {
        question: "Would you recommend this lesson to others learning this topic?",
        options: ["Definitely yes", "Probably yes", "Maybe", "Probably not"],
        correctAnswer: 0,
        explanation: "Sharing knowledge helps both the learner and the community.",
        difficulty: "easy",
        points: 10
      }
    ];
  }
};

export const generateAssessmentQuestions = async (topic) => {
  try {
    const prompt = `
You are an expert educator creating comprehensive skill assessment questions.

Generate EXACTLY 15 multiple-choice questions about "${topic}".

RULES:
- Create questions that thoroughly test understanding of ${topic}
- Cover different aspects and complexity levels
- Questions should range from basic concepts to advanced applications
- Each question should have 4 options
- Mark the correct answer index (0-3)
- Provide a clear, educational explanation for each correct answer
- Mix difficulty levels: 5 easy, 7 medium, 3 hard
- Questions should be practical and test real understanding
- Award 10 points per question

Return ONLY valid JSON (no markdown, no code blocks):

[
  {
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct",
    "difficulty": "easy",
    "points": 10
  }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    const questions = JSON.parse(text);

    // Validate and ensure we have questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid assessment questions generated");
    }

    // Return first 15 questions (in case Gemini generates more)
    return questions.slice(0, 15);

  } catch (error) {
    console.error("❌ Gemini assessment generation failed:", error.message);
    // Return fallback questions if Gemini fails
    return Array(15).fill(null).map((_, i) => ({
      question: `Question ${i + 1}: What is your current understanding of ${topic}?`,
      options: ["Excellent understanding", "Good understanding", "Basic understanding", "Need to learn more"],
      correctAnswer: 0,
      explanation: `Understanding ${topic} comes with practice and continuous learning.`,
      difficulty: i < 5 ? "easy" : i < 12 ? "medium" : "hard",
      points: 10
    }));
  }
};

export const generateTopicLessons = async (topic, difficulty = "beginner", count = 3) => {
  try {
    const prompt = `
You are an educational content curator.

Generate EXACTLY ${count} learning video suggestions about "${topic}".

RULES:
- DO NOT generate YouTube URLs
- Generate SEARCH INTENT ONLY
- Use real, popular content creators
- Difficulty level: ${difficulty}

Return ONLY JSON:

[
  {
    "title": "Video title about ${topic}",
    "description": "What the user will learn",
    "searchQuery": "${topic} tutorial beginner",
    "sourceType": "video",
    "tags": ["${topic.toLowerCase()}"],
    "difficulty": "${difficulty}",
    "estimatedTimeMin": 30,
    "provider": "Popular Creator Name",
    "prerequisites": []
  }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    const generatedLessons = JSON.parse(text);

    const finalLessons = [];

    for (const lesson of generatedLessons) {
      const video = await fetchYouTubeVideo(
        `${lesson.searchQuery} ${lesson.provider}`
      );

      if (!video) continue;

      finalLessons.push({
        title: lesson.title,
        description: lesson.description,
        contentURL: video.watchUrl,
        embedURL: video.embedUrl,
        sourceType: "video",
        tags: lesson.tags,
        difficulty: lesson.difficulty,
        estimatedTimeMin: lesson.estimatedTimeMin,
        provider: lesson.provider,
        prerequisites: lesson.prerequisites,
        createdBy: "gemini",
        geminiGenerated: true,
        visibility: "public",
        isExternal: true,
        rating: 4.5,
        visits: 0
      });
    }

    return finalLessons.slice(0, count);

  } catch (error) {
    console.error("❌ Gemini topic lesson generation failed:", error.message);
    throw error;
  }
};
