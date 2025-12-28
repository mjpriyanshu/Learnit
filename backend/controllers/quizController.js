import Quiz from "../models/Quiz.js";
import UserStats from "../models/UserStats.js";
import { BADGE_DEFINITIONS } from "./gamificationController.js";

// Get assessment quiz (AI-generated based on topic with 15 questions)
export const getAssessmentQuiz = async (req, res) => {
    try {
        const topic = req.query.topic || 'General Programming'; // Default to General

        console.log(`Generating assessment quiz for topic: ${topic}`);

        // Generate 15 questions using Gemini AI
        const { generateAssessmentQuestions } = await import('../lib/geminiService.js');
        const questions = await generateAssessmentQuestions(topic);

        console.log(`Generated ${questions.length} questions for ${topic} assessment`);

        // Create a temporary quiz instance to validate answers later
        const tempQuiz = await Quiz.create({
            title: `${topic} Skill Assessment`,
            description: `A comprehensive 15-question assessment to evaluate your ${topic} skills.`,
            type: 'assessment',
            topic: topic,
            xpReward: 150, // Higher XP for 15 questions
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: q.difficulty,
                points: 10
            }))
        });

        const quizForClient = {
            _id: tempQuiz._id,
            title: tempQuiz.title,
            description: tempQuiz.description,
            xpReward: tempQuiz.xpReward,
            questions: tempQuiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                difficulty: q.difficulty,
                points: q.points
            }))
        };

        res.json({ success: true, data: quizForClient });
    } catch (error) {
        console.error("Error generating assessment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit assessment quiz
export const submitAssessment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { quizId, answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        let correctCount = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        const results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            totalPoints += question.points;

            if (isCorrect) {
                correctCount++;
                earnedPoints += question.points;
            }

            results.push({
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            });
        });

        const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        // Determine skill level
        let skillLevel = 'beginner';
        if (scorePercent >= 80) skillLevel = 'advanced';
        else if (scorePercent >= 50) skillLevel = 'intermediate';

        // Update user stats
        let userStats = await UserStats.findOne({ userId });
        if (!userStats) {
            userStats = new UserStats({ userId });
            await userStats.save();
        }

        userStats.assessmentResults.push({
            topic: quiz.topic || "General",
            score: scorePercent,
            level: skillLevel
        });
        userStats.hasCompletedAssessment = true;
        userStats.totalQuizzesTaken += 1;

        // XP
        const xpEarned = earnedPoints; // Give actual points earned
        userStats.xp += xpEarned;
        userStats.level = userStats.calculateLevel();

        // Badges
        const newBadges = [];
        
        // Assessment completion badge
        const assessmentBadge = BADGE_DEFINITIONS.assessment_complete;
        if (!userStats.badges.find(b => b.id === assessmentBadge.id)) {
            userStats.badges.push(assessmentBadge);
            newBadges.push(assessmentBadge);
        }
        
        // First quiz badge
        if (userStats.totalQuizzesTaken === 1) {
            const badge = BADGE_DEFINITIONS.first_quiz;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        
        // Quiz master badge (10 quizzes)
        if (userStats.totalQuizzesTaken >= 10) {
            const badge = BADGE_DEFINITIONS.quiz_master;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        
        // Perfect score badge
        if (scorePercent === 100) {
            const perfectBadge = BADGE_DEFINITIONS.perfect_score;
            if (!userStats.badges.find(b => b.id === perfectBadge.id)) {
                userStats.badges.push(perfectBadge);
                newBadges.push(perfectBadge);
            }
        }

        await userStats.save();

        res.json({
            success: true,
            data: {
                score: scorePercent,
                correctCount,
                totalQuestions: quiz.questions.length,
                skillLevel,
                xpEarned,
                newBadges,
                results
            }
        });
    } catch (error) {
        console.error("Error submitting assessment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Keep existing Lesson Quiz Logic
export const getLessonQuiz = async (req, res) => {
    try {
        const { lessonId } = req.params;
        let quiz = await Quiz.findOne({ lessonId, type: 'lesson' });

        // Check if quiz exists but has less than 5 questions (old format)
        if (quiz && quiz.questions.length < 5) {
            console.log(`Found old quiz with ${quiz.questions.length} question(s). Deleting and regenerating...`);
            await Quiz.findByIdAndDelete(quiz._id);
            quiz = null; // Force regeneration
        }

        if (!quiz) {
            // Get lesson details to generate relevant questions
            const Lesson = (await import('../models/Lesson.js')).default;
            const lesson = await Lesson.findById(lessonId);
            
            if (!lesson) {
                return res.status(404).json({ success: false, message: "Lesson not found" });
            }

            console.log(`Generating quiz for lesson: ${lesson.title}`);

            // Generate quiz questions using Gemini API
            const { generateQuizQuestions } = await import('../lib/geminiService.js');
            const questions = await generateQuizQuestions(lesson.title, lesson.description);

            console.log(`Generated ${questions.length} questions for quiz`);

            // Create quiz with generated questions
            quiz = await Quiz.create({
                title: `${lesson.title} - Quick Quiz`,
                type: "lesson",
                lessonId,
                xpReward: 50,
                questions: questions
            });

            console.log(`Quiz created successfully with ID: ${quiz._id}`);
        }

        const quizForClient = {
            _id: quiz._id,
            title: quiz.title,
            xpReward: quiz.xpReward,
            questions: quiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                difficulty: q.difficulty,
                points: q.points
            }))
        };

        res.json({ success: true, data: quizForClient });
    } catch (error) {
        console.error("Error in getLessonQuiz:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitLessonQuiz = async (req, res) => {
    try {
        const userId = req.user._id;
        const { quizId, answers } = req.body;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

        let correctCount = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            totalPoints += question.points;
            if (userAnswer === question.correctAnswer) {
                correctCount++;
                earnedPoints += question.points;
            }
        });

        const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = scorePercent >= (quiz.passingScore || 60);

        let userStats = await UserStats.findOne({ userId });
        if (!userStats) {
            userStats = new UserStats({ userId });
            await userStats.save();
        }

        userStats.totalQuizzesTaken += 1;
        const xpEarned = Math.round(quiz.xpReward * (scorePercent / 100));
        userStats.xp += xpEarned;
        userStats.level = userStats.calculateLevel();

        // Check for quiz badges
        const newBadges = [];
        
        // First quiz badge
        if (userStats.totalQuizzesTaken === 1) {
            const badge = BADGE_DEFINITIONS.first_quiz;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        
        // Quiz master badge (10 quizzes)
        if (userStats.totalQuizzesTaken >= 10) {
            const badge = BADGE_DEFINITIONS.quiz_master;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
        
        // Perfect score badge
        if (scorePercent === 100) {
            const perfectBadge = BADGE_DEFINITIONS.perfect_score;
            if (!userStats.badges.find(b => b.id === perfectBadge.id)) {
                userStats.badges.push(perfectBadge);
                newBadges.push(perfectBadge);
            }
        }

        await userStats.save();

        res.json({
            success: true,
            data: {
                score: scorePercent,
                passed,
                correctCount,
                totalQuestions: quiz.questions.length,
                xpEarned,
                newBadges
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Regenerate lesson quiz with new questions
export const regenerateLessonQuiz = async (req, res) => {
    try {
        const { lessonId } = req.params;
        
        // Get lesson details
        const Lesson = (await import('../models/Lesson.js')).default;
        const lesson = await Lesson.findById(lessonId);
        
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        // Delete existing quiz for this lesson
        await Quiz.findOneAndDelete({ lessonId, type: 'lesson' });

        // Generate new quiz questions using Gemini API
        const { generateQuizQuestions } = await import('../lib/geminiService.js');
        const questions = await generateQuizQuestions(lesson.title, lesson.description);

        // Create new quiz with generated questions
        const quiz = await Quiz.create({
            title: `${lesson.title} - Quick Quiz`,
            type: "lesson",
            lessonId,
            xpReward: 50,
            questions: questions
        });

        const quizForClient = {
            _id: quiz._id,
            title: quiz.title,
            xpReward: quiz.xpReward,
            questions: quiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                difficulty: q.difficulty,
                points: q.points
            }))
        };

        res.json({ success: true, data: quizForClient });
    } catch (error) {
        console.error("Error regenerating quiz:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
