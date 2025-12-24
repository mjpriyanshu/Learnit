import Quiz from "../models/Quiz.js";
import UserStats from "../models/UserStats.js";
import { BADGE_DEFINITIONS } from "./gamificationController.js";

// Question Bank (Mocking an external API or DB of questions)
const QUESTION_BANK = {
    JavaScript: [
        { q: "What is the output of: console.log(typeof [])?", o: ["array", "object", "undefined", "null"], a: 1, e: "Arrays are objects in JS.", d: "easy" },
        { q: "Which method adds an element to the end of an array?", o: ["push()", "pop()", "shift()", "unshift()"], a: 0, e: "push() appends to the end.", d: "easy" },
        { q: "What does 'async/await' help with?", o: ["Styling", "Asynchronous operations", "Loop optimization", "Memory"], a: 1, e: "Syntactic sugar for Promises.", d: "medium" },
        { q: "What is a closure?", o: ["Browser event", "Function with parent scope access", "Loop terminator", "Error handler"], a: 1, e: "Closures access outer scope.", d: "medium" },
        { q: "Difference between '==' and '==='?", o: ["None", "Value vs Value & Type", "String only", "Deprecated"], a: 1, e: "=== checks type too.", d: "easy" },
        { q: "What is the 'this' keyword?", o: ["Global object", "Current execution context", "Function name", "Variable"], a: 1, e: "Depends on call site.", d: "hard" },
        // Add more if needed
    ],
    React: [
        { q: "What hook is for side effects?", o: ["useState", "useEffect", "useContext", "useReducer"], a: 1, e: "useEffect handles side effects.", d: "easy" },
        { q: "What is the Virtual DOM?", o: ["Game engine", "Lightweight DOM copy", "Database", "CSS framework"], a: 1, e: "Efficient diffing mechanism.", d: "medium" },
        { q: "What is JSX?", o: ["JS Library", "Syntax extension", "CSS tool", "Test runner"], a: 1, e: "HTML-like syntax in JS.", d: "easy" },
        { q: "How do you pass data to child components?", o: ["State", "Props", "Context", "Refs"], a: 1, e: "Props flow down.", d: "easy" },
        { q: "What hook manages local state?", o: ["useEffect", "useState", "useMemo", "useCallback"], a: 1, e: "useState manages state.", d: "easy" },
    ],
    Python: [
        { q: "What is a list comprehension?", o: ["List understanding", "Concise list creation", "Sorting", "Debugging"], a: 1, e: "Concise syntax for lists.", d: "medium" },
        { q: "What does 'self' refer to?", o: ["File", "Instance", "Parent", "Global"], a: 1, e: "Current instance.", d: "easy" },
        { q: "Mutable data type?", o: ["Tuple", "List", "String", "Integer"], a: 1, e: "Lists can be changed.", d: "easy" },
        { q: "Function to get length?", o: ["size()", "length()", "len()", "count()"], a: 2, e: "len() returns length.", d: "easy" },
    ],
    General: [
        { q: "What does HTTP stand for?", o: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyper Transfer Text Protocol", "None"], a: 0, e: "Standard web protocol.", d: "easy" },
        { q: "What is Git?", o: ["Editor", "Version Control", "Language", "OS"], a: 1, e: "Tracks code changes.", d: "easy" },
    ]
};

// Get assessment quiz (Randomly generated based on topic)
export const getAssessmentQuiz = async (req, res) => {
    try {
        const topic = req.query.topic || 'General'; // Default to General

        // 1. Select Questions
        // Logic: Get random 5-10 questions from BANK matching topic, or fallback to mixed
        let pool = QUESTION_BANK[topic] || QUESTION_BANK['General'];
        if (topic === 'Mixed') {
            pool = Object.values(QUESTION_BANK).flat();
        }

        // Shuffle and slice
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 5); // Pick 5 random questions

        // 2. Format for Client
        // We generate a "Transient" quiz structure (we don't strictly need to save every generated quiz to DB if it's dynamic, 
        // OR we save it as a new "Active Attempt" so we can validate answers later. For simplicity here, we'll send it and validate statelessly or save temp)

        // Better approach: Save a "Temp" quiz instance so we can submit against it safely
        const tempQuiz = await Quiz.create({
            title: `${topic} Skill Assessment`,
            description: `A generated check for your ${topic} skills.`,
            type: 'assessment',
            topic: topic,
            xpReward: 50, // Dynamic XP?
            questions: selectedQuestions.map(q => ({
                question: q.q,
                options: q.o,
                correctAnswer: q.a,
                explanation: q.e,
                difficulty: q.d,
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
            userStats = await UserStats.create({ userId });
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
        if (userStats.totalQuizzesTaken === 1) {
            const badge = BADGE_DEFINITIONS.first_quiz;
            if (!userStats.badges.find(b => b.id === badge.id)) {
                userStats.badges.push(badge);
                newBadges.push(badge);
            }
        }
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

        if (!quiz) {
            quiz = await Quiz.create({
                title: "Lesson Quiz",
                type: "lesson",
                lessonId,
                xpReward: 30,
                questions: [
                    {
                        question: "Did you understand the main concepts?",
                        options: ["Yes", "Mostly", "Somewhat", "No"],
                        correctAnswer: 0,
                        difficulty: "easy",
                        points: 10
                    }
                ]
            });
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
        if (!userStats) userStats = await UserStats.create({ userId });

        userStats.totalQuizzesTaken += 1;
        const xpEarned = Math.round(quiz.xpReward * (scorePercent / 100));
        userStats.xp += xpEarned;
        userStats.level = userStats.calculateLevel();

        await userStats.save();

        res.json({
            success: true,
            data: {
                score: scorePercent,
                passed,
                correctCount,
                xpEarned,
                newBadges: []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
