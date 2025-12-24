import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamificationContext } from '../context/GamificationContext';

const LessonQuiz = ({ quiz, onComplete }) => {
    const { addXP, showBadgeUnlock } = useContext(GamificationContext);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return null;
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    const handleSelectAnswer = (answerIndex) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Call the onComplete callback with answers
            const result = await onComplete(quiz._id, selectedAnswers);
            setResults(result);
            setShowResults(true);

            // Add XP and show badges
            if (result.xpEarned) {
                addXP(result.xpEarned, result.newBadges || []);
            }
        } catch (error) {
            console.error('Failed to submit quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showResults && results) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl text-center"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                }}
            >
                {/* Result Icon */}
                <motion.div
                    className="text-7xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    {results.score >= 80 ? '🎉' : results.score >= 50 ? '👍' : '📚'}
                </motion.div>

                {/* Score */}
                <motion.h2
                    className="text-4xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: results.score >= 70
                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                            : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {results.score}%
                </motion.h2>

                <motion.p
                    className="text-gray-400 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {results.correctCount} of {results.totalQuestions} correct
                </motion.p>

                {/* XP Earned */}
                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <span className="text-2xl">⚡</span>
                    <span className="text-lg font-bold text-green-400">+{results.xpEarned} XP</span>
                </motion.div>

                {/* Badges Earned */}
                {results.newBadges && results.newBadges.length > 0 && (
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-sm text-gray-400 mb-2">New Badges Earned!</p>
                        <div className="flex justify-center gap-3">
                            {results.newBadges.map((badge, index) => (
                                <motion.div
                                    key={badge.id}
                                    className="flex flex-col items-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                >
                                    <span className="text-4xl">{badge.icon}</span>
                                    <span className="text-xs text-purple-300">{badge.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Message */}
                <motion.p
                    className="text-lg text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {results.score >= 80
                        ? "Excellent work! You've mastered this topic! 🌟"
                        : results.score >= 50
                            ? "Good job! Keep practicing to improve! 💪"
                            : "Keep learning! Review the lesson and try again! 📖"}
                </motion.p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">{quiz.title || 'Quiz Time!'}</h3>
                    <p className="text-sm text-gray-400">Test your knowledge</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                    <span className="text-sm text-purple-300">+{quiz.xpReward} XP</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <h4 className="text-lg font-semibold text-white mb-4">
                        {question.question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {question.options.map((option, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                className="w-full p-4 rounded-xl text-left transition-all"
                                style={{
                                    background: selectedAnswers[currentQuestion] === index
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))'
                                        : 'rgba(30, 41, 59, 0.5)',
                                    border: selectedAnswers[currentQuestion] === index
                                        ? '2px solid rgba(99, 102, 241, 0.8)'
                                        : '1px solid rgba(99, 102, 241, 0.2)'
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                        style={{
                                            background: selectedAnswers[currentQuestion] === index
                                                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                                                : 'rgba(99, 102, 241, 0.2)',
                                            color: 'white'
                                        }}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-gray-200">{option}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30"
                    style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc'
                    }}
                >
                    ← Previous
                </button>

                {currentQuestion === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswers.length !== quiz.questions.length || isSubmitting}
                        className="px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            color: 'white'
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                        className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white'
                        }}
                    >
                        Next →
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default LessonQuiz;
