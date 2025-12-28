import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { GamificationContext } from '../context/GamificationContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Brain, Zap, Code, Database, Globe,
    CheckCircle, AlertCircle, ArrowRight, Star,
    Trophy, Play, Server, Palette, FileCode,
    Laptop, Smartphone, Cloud
} from 'lucide-react';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { addXP } = useContext(GamificationContext);
    const { user } = useContext(AuthContext);

    const [screen, setScreen] = useState('topic_selection'); // topic_selection, loading, quiz, results
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [userInterests, setUserInterests] = useState([]);
    const [skippedQuestions, setSkippedQuestions] = useState(new Set());

    // Static Topics Config - Expanded
    const STATIC_TOPICS = [
        { id: 'General', label: 'General Programming', icon: <Brain size={32} />, color: 'from-blue-500 to-indigo-500', isStatic: true },
        { id: 'JavaScript', label: 'JavaScript Mastery', icon: <Code size={32} />, color: 'from-yellow-400 to-orange-500', isStatic: true },
        { id: 'React', label: 'React Ecosystem', icon: <Zap size={32} />, color: 'from-cyan-400 to-blue-500', isStatic: true },
        { id: 'Python', label: 'Python & Data', icon: <Database size={32} />, color: 'from-green-400 to-emerald-600', isStatic: true },
        { id: 'TypeScript', label: 'TypeScript Fundamentals', icon: <FileCode size={32} />, color: 'from-blue-600 to-sky-500', isStatic: true },
        { id: 'Node.js', label: 'Node.js & Backend', icon: <Server size={32} />, color: 'from-green-500 to-teal-600', isStatic: true },
        { id: 'HTML', label: 'HTML & Markup', icon: <Globe size={32} />, color: 'from-orange-500 to-red-500', isStatic: true },
        { id: 'CSS', label: 'CSS & Styling', icon: <Palette size={32} />, color: 'from-pink-500 to-purple-600', isStatic: true },
        { id: 'Mobile Development', label: 'Mobile Development', icon: <Smartphone size={32} />, color: 'from-violet-500 to-purple-700', isStatic: true },
        { id: 'Cloud Computing', label: 'Cloud & DevOps', icon: <Cloud size={32} />, color: 'from-sky-400 to-blue-600', isStatic: true },
        { id: 'Full Stack', label: 'Full Stack Development', icon: <Laptop size={32} />, color: 'from-indigo-600 to-violet-600', isStatic: true },
    ];

    // Fetch user interests on mount
    useEffect(() => {
        const fetchUserInterests = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success && response.data.user.interests) {
                    const interests = response.data.user.interests
                        .flatMap(i => i.split(',').map(v => v.trim()))
                        .filter(Boolean)
                        .filter(interest => !STATIC_TOPICS.some(t => t.id.toLowerCase() === interest.toLowerCase()));
                    
                    // Create topic objects from interests
                    const interestTopics = interests.map((interest, idx) => ({
                        id: interest,
                        label: `${interest} Skills`,
                        icon: <Star size={32} />,
                        color: [
                            'from-rose-500 to-pink-600',
                            'from-amber-500 to-orange-600',
                            'from-lime-500 to-green-600',
                            'from-teal-500 to-cyan-600',
                            'from-fuchsia-500 to-purple-600',
                        ][idx % 5],
                        isStatic: false
                    }));
                    
                    setUserInterests(interestTopics);
                }
            } catch (error) {
                console.error('Failed to fetch user interests:', error);
            }
        };
        
        fetchUserInterests();
    }, []);

    const handleStartQuiz = async (topic) => {
        setSelectedTopic(topic);
        setScreen('loading');
        try {
            const response = await api.get(`/quiz/assessment?topic=${encodeURIComponent(topic.id)}`);
            if (response.data.success) {
                setQuiz(response.data.data);
                setScreen('quiz');
                setCurrentQuestion(0);
                setAnswers({});
            }
        } catch (error) {
            toast.error('Failed to generate quiz');
            setScreen('topic_selection');
        }
    };

    const handleOptionSelect = (optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSkip = () => {
        // Mark question as skipped
        setSkippedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.add(currentQuestion);
            return newSet;
        });
        
        // Move to next question or submit if last question
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setScreen('submitting');
        try {
            const answersArray = quiz.questions.map((_, index) => answers[index]);
            const response = await api.post('/quiz/assessment/submit', {
                quizId: quiz._id,
                answers: answersArray
            });

            if (response.data.success) {
                setResults(response.data.data);
                if (response.data.data.xpEarned > 0) {
                    addXP(response.data.data.xpEarned, response.data.data.newBadges || []);
                }
                setScreen('results');
            }
        } catch (error) {
            toast.error('Failed to submit');
            setScreen('quiz');
        }
    };

    // Render Components
    const renderTopicSelection = () => {
        const allTopics = [...STATIC_TOPICS, ...userInterests];
        
        return (
            <div className='max-w-6xl mx-auto'>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center mb-12'>
                    <h1 className='text-5xl font-black text-white mb-4'>Skill Assessment</h1>
                    <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
                        Select a topic to test your knowledge with AI-generated questions.
                    </p>
                </motion.div>

                {/* Static Topics Section */}
                <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-white mb-4 flex items-center gap-2'>
                        <Brain size={24} className='text-indigo-400' />
                        Core Topics
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {STATIC_TOPICS.map((topic, idx) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleStartQuiz(topic)}
                                className='group cursor-pointer relative overflow-hidden rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]'
                                style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(20px)' }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                <div className='flex items-center gap-4 relative z-10'>
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${topic.color} text-white shadow-lg`}>
                                        {topic.icon}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-lg font-bold text-white mb-1'>{topic.label}</h3>
                                        <p className='text-gray-400 text-xs'>15 Questions • AI-Generated</p>
                                    </div>
                                    <div className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors'>
                                        <Play fill='white' size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* User Interest Topics Section */}
                {userInterests.length > 0 && (
                    <div>
                        <h2 className='text-2xl font-bold text-white mb-4 flex items-center gap-2'>
                            <Star size={24} className='text-yellow-400' />
                            Your Interests
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {userInterests.map((topic, idx) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (STATIC_TOPICS.length + idx) * 0.05 }}
                                    onClick={() => handleStartQuiz(topic)}
                                    className='group cursor-pointer relative overflow-hidden rounded-3xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:scale-[1.02]'
                                    style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(20px)' }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-15 transition-opacity`} />
                                    <div className='flex items-center gap-4 relative z-10'>
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${topic.color} text-white shadow-lg`}>
                                            {topic.icon}
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='text-lg font-bold text-white mb-1'>{topic.label}</h3>
                                            <p className='text-yellow-400 text-xs'>15 Questions • Personalized</p>
                                        </div>
                                        <div className='w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors'>
                                            <Play fill='#FBBF24' size={16} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderQuiz = () => {
        const currentQ = quiz.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

        return (
            <div className='max-w-3xl mx-auto w-full'>
                {/* Header */}
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h2 className='text-sm font-bold text-gray-500 uppercase tracking-widest mb-1'>{selectedTopic?.label}</h2>
                        <div className='text-2xl font-bold text-white'>Question {currentQuestion + 1} <span className='text-gray-500 text-lg'>/ {quiz.questions.length}</span></div>
                    </div>
                    <div className='px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-sm'>
                        {currentQ.difficulty.toUpperCase()}
                    </div>
                </div>

                {/* Question Card */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden'
                >
                    <div className='absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500' style={{ width: `${progress}%` }} />

                    <h3 className='text-2xl font-bold text-white mb-8 leading-relaxed'>{currentQ.question}</h3>

                    <div className='space-y-4'>
                        {currentQ.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${answers[currentQuestion] === idx
                                        ? 'border-indigo-500 bg-indigo-500/20'
                                        : 'border-slate-800 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${answers[currentQuestion] === idx ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-gray-400 group-hover:text-white'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={`text-lg font-medium ${answers[currentQuestion] === idx ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {option}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <div className='flex justify-between items-center gap-4'>
                    <button
                        onClick={handleSkip}
                        className='px-6 py-4 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-lg border border-gray-600/50 hover:border-gray-500 transition-all'
                    >
                        Skip Question
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion] === undefined}
                        className='px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                        {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        );
    };

    const renderResults = () => (
        <div className='max-w-2xl mx-auto w-full'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center'
            >
                <div className='w-24 h-24 mx-auto bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg shadow-green-500/30'>
                    {results.score >= 80 ? '🏆' : results.score >= 50 ? '🌟' : '📚'}
                </div>

                <h2 className='text-4xl font-black text-white mb-2'>
                    {results.score >= 80 ? 'Excellent Job!' : results.score >= 50 ? 'Good Effort!' : 'Keep Learning!'}
                </h2>
                <p className='text-gray-400 mb-8'>You scored {results.score}% on {selectedTopic?.label}</p>

                <div className='grid grid-cols-4 gap-4 mb-8'>
                    <div className='bg-slate-800/50 rounded-xl p-4'>
                        <div className='text-xs text-gray-500 uppercase font-bold mb-1'>Correct</div>
                        <div className='text-2xl font-bold text-green-400'>{results.correctCount}/{results.totalQuestions}</div>
                    </div>
                    <div className='bg-slate-800/50 rounded-xl p-4'>
                        <div className='text-xs text-gray-500 uppercase font-bold mb-1'>Skipped</div>
                        <div className='text-2xl font-bold text-gray-400'>{skippedQuestions.size}</div>
                    </div>
                    <div className='bg-slate-800/50 rounded-xl p-4'>
                        <div className='text-xs text-gray-500 uppercase font-bold mb-1'>XP Earned</div>
                        <div className='text-2xl font-bold text-yellow-400'>+{results.xpEarned}</div>
                    </div>
                    <div className='bg-slate-800/50 rounded-xl p-4'>
                        <div className='text-xs text-gray-500 uppercase font-bold mb-1'>Skill Level</div>
                        <div className='text-2xl font-bold text-purple-400 capitalize'>{results.skillLevel}</div>
                    </div>
                </div>

                {/* Answer Review */}
                <div className='text-left space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar p-2'>
                    <h3 className='text-sm font-bold text-gray-500 uppercase'>Review Answers</h3>
                    {results.results.map((res, idx) => {
                        const wasSkipped = res.userAnswer === undefined || res.userAnswer === null;
                        return (
                            <div key={idx} className={`p-4 rounded-xl border ${
                                wasSkipped ? 'bg-gray-500/5 border-gray-500/20' : 
                                res.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                            }`}>
                                <div className='flex justify-between mb-2'>
                                    <span className='text-white font-medium text-sm'>{res.question}</span>
                                    <span>{wasSkipped ? '⏭️' : res.isCorrect ? '✅' : '❌'}</span>
                                </div>
                                {wasSkipped ? (
                                    <div className='text-xs text-gray-400'>
                                        <span className='text-yellow-400 font-bold'>Skipped</span> - 
                                        <span className='text-green-400 font-bold'> Correct answer:</span> {quiz.questions[idx].options[res.correctAnswer]}
                                    </div>
                                ) : !res.isCorrect && (
                                    <div className='text-xs text-gray-400'>
                                        <span className='text-green-400 font-bold'>Answer:</span> {quiz.questions[idx].options[res.correctAnswer]} <br />
                                        <span className='italic opacity-70'>{res.explanation}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={() => setScreen('topic_selection')}
                        className='flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors'
                    >
                        New Quiz
                    </button>
                    <button
                        onClick={() => navigate('/learning-path')}
                        className='flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20'
                    >
                        Continue Learning
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className='min-h-screen relative overflow-hidden flex items-center justify-center p-6' style={{ background: '#0a0a1e' }}>
            {/* COSMIC BACKGROUND */}
            <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    animation: 'moveGrid 20s linear infinite'
                }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className='relative z-10 w-full'>
                <AnimatePresence mode='wait'>
                    {screen === 'topic_selection' && (
                        <motion.div key="topics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderTopicSelection()}
                        </motion.div>
                    )}

                    {screen === 'loading' && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='text-center'>
                            <div className='w-16 h-16 border-4 border-indigo-500 border-t-white rounded-full animate-spin mx-auto mb-4' />
                            <h2 className='text-2xl font-bold text-white'>Generating {selectedTopic?.label} Quiz...</h2>
                            <p className='text-gray-400'>Our AI is selecting the best questions for you.</p>
                        </motion.div>
                    )}

                    {screen === 'quiz' && quiz && (
                        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderQuiz()}
                        </motion.div>
                    )}

                    {(screen === 'submitting' || screen === 'results') && results && (
                        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderResults()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes moveGrid {
                    0% { transform: translate(0,0); }
                    100% { transform: translate(50px, 50px); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AssessmentPage;
