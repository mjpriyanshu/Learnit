import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { GamificationContext } from '../context/GamificationContext';
import LessonQuiz from '../components/LessonQuiz';

const LessonView = () => {
  // Navigation hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordLessonComplete: awardLessonXP } = useContext(GamificationContext);

  // State variables
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null); // Quiz state
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [initialTimeSpent, setInitialTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Update current session time every second
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setCurrentSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!lesson || !sessionStartTime || currentSessionTime === 0) return;

    const interval = setInterval(() => {
      // Calculate total time: initial + current session
      const totalMinutes = initialTimeSpent + Math.floor(currentSessionTime / 60);

      // Calculate progress based on time spent
      const estimatedMinutes = lesson.estimatedTimeMin || 30;
      const progress = Math.min(Math.round((totalMinutes / estimatedMinutes) * 100), 99); // Max 99% until marked complete

      // Auto-save progress
      saveProgress(totalMinutes, progress, progress > 0 ? 'in-progress' : 'not-started');
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [lesson, sessionStartTime, currentSessionTime, initialTimeSpent]);

  // Fetch lesson first
  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  // Fetch quiz after lesson is loaded (non-blocking)
  useEffect(() => {
    if (lesson && id) {
      fetchQuiz();
    }
  }, [lesson, id]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      if (response.data.success) {
        setLesson(response.data.data);

        // Check existing progress
        const progressResponse = await api.get('/progress');
        if (progressResponse.data.success) {
          const existingProgress = progressResponse.data.data.progress.find(
            p => p.lessonId?._id === id
          );
          if (existingProgress) {
            setCurrentProgress(existingProgress);
            setInitialTimeSpent(existingProgress.timeSpentMin || 0); // Store in minutes
          }
        }

        // Start tracking time on this page
        setSessionStartTime(Date.now());
      } else {
        toast.error('Lesson not found');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load lesson');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuiz = async () => {
    setIsQuizLoading(true);
    try {
      const response = await api.get(`/quiz/lesson/${id}`);
      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const saveProgress = async (totalTimeMinutes, progress, status = 'in-progress') => {
    try {
      await api.post('/progress', {
        itemId: id,
        timeSpentMin: totalTimeMinutes,
        score: progress,
        status
      });
    } catch (error) {
      // Silent fail for auto-save
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const totalMinutes = initialTimeSpent + Math.floor(currentSessionTime / 60);
      const response = await api.post('/progress', {
        itemId: id,
        status: 'completed',
        score: 100,
        timeSpentMin: totalMinutes
      });
      if (response.data.success) {
        // Award XP via Gamification Context
        await awardLessonXP();

        // Update local state to reflect completion
        setCurrentProgress({
          ...currentProgress,
          status: 'completed'
        });

        toast.success('Lesson marked as complete!');
        // Stay on page to take quiz if available
        if (!quiz) {
          setTimeout(() => navigate('/progress'), 1500);
        }
      } else {
        toast.error(response.data.message || 'Failed to mark as complete');
      }
    } catch (error) {
      console.error('Failed to mark complete:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleQuizComplete = async (quizId, answers) => {
    try {
      const response = await api.post(`/quiz/lesson/${id}/submit`, {
        quizId,
        answers
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Quiz submission failed", error);
      throw error;
    }
  };

  const handleRegenerateQuiz = async () => {
    setIsQuizLoading(true);
    try {
      toast.loading('Generating new quiz questions...');
      const response = await api.post(`/quiz/lesson/${id}/regenerate`);
      if (response.data.success) {
        setQuiz(response.data.data);
        toast.dismiss();
        toast.success('New quiz generated!');
      }
    } catch (error) {
      toast.dismiss();
      console.error("Quiz regeneration failed", error);
      toast.error('Failed to generate new quiz');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleBack = () => {
    // Save progress before leaving
    if (sessionStartTime && currentSessionTime > 0) {
      const totalMinutes = initialTimeSpent + Math.floor(currentSessionTime / 60);
      const estimatedMinutes = lesson?.estimatedTimeMin || 30;
      const progress = Math.min(Math.round((totalMinutes / estimatedMinutes) * 100), 99);
      saveProgress(totalMinutes, progress, progress > 0 ? 'in-progress' : 'not-started');
    }
    navigate('/progress');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalMinutes = () => {
    return initialTimeSpent + Math.floor(currentSessionTime / 60);
  };

  const getProgressPercentage = () => {
    if (!lesson) return 0;
    const totalMinutes = getTotalMinutes();
    const estimatedMinutes = lesson.estimatedTimeMin || 30;
    return Math.min(Math.round((totalMinutes / estimatedMinutes) * 100), currentProgress?.status === 'completed' ? 100 : 99);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
        <div className='text-xl text-gray-300'>Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className='min-h-screen p-6' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
      <div className='max-w-6xl mx-auto'>
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className='mb-6 px-4 py-2 rounded-lg font-medium transition'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
        >
          ← Back to Dashboard
        </motion.button>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='mb-6 rounded-xl p-6'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h3 className='text-lg font-semibold text-white'>Your Progress</h3>
              <p className='text-sm text-gray-400'>
                Time on this page: {formatTime(currentSessionTime)} | Total: {getTotalMinutes()} min
              </p>
            </div>
            <div className='text-3xl font-bold text-cyan-400'>
              {getProgressPercentage()}%
            </div>
          </div>

          <div className='w-full h-3 rounded-full overflow-hidden' style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
              className='h-full rounded-full'
              style={{
                background: getProgressPercentage() === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #6366f1, #a855f7)'
              }}
            />
          </div>

          {currentProgress && (
            <div className='mt-3 text-sm text-gray-400'>
              Status: <span className={`font-medium ${currentProgress.status === 'completed' ? 'text-green-400' :
                currentProgress.status === 'in-progress' ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                {currentProgress.status === 'completed' ? 'Completed' :
                  currentProgress.status === 'in-progress' ? 'In Progress' :
                    'Not Started'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Lesson Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='rounded-2xl overflow-hidden mb-8'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)'
          }}
        >
          {/* Header */}
          <div className='p-8 text-white' style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <h1 className='text-3xl font-bold mb-2'>{lesson.title}</h1>
            {lesson.description && (
              <p className='text-indigo-100'>{lesson.description}</p>
            )}
            {lesson.tags && lesson.tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-4'>
                {lesson.tags.map((tag, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 rounded-full text-sm'
                    style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content Preview */}
          <div className='p-8'>
            {lesson.contentURL ? (
              <div className='mb-6'>
                <h2 className='text-xl font-semibold text-gray-200 mb-4'>Lesson Content</h2>

                {/* Enhanced Video Embed Handler */}
                {(() => {
                  const getEmbedUrl = (url) => {
                    if (!url) return null;
                    // Handle YouTube (Standard, Short, Embed, Shorts)
                    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (ytMatch && ytMatch[1]) {
                      return `https://www.youtube.com/embed/${ytMatch[1]}`;
                    }
                    // Handle Vimeo
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                    if (vimeoMatch && vimeoMatch[1]) {
                      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                    }
                    return null;
                  };

                  const embedUrl = lesson.embedURL || getEmbedUrl(lesson.contentURL);

                  if (embedUrl) {
                    return (
                      <div className='w-full aspect-video rounded-lg overflow-hidden mb-4' style={{ border: '2px solid rgba(99, 102, 241, 0.2)' }}>
                        <iframe
                          src={embedUrl}
                          className='w-full h-full'
                          title={lesson.title}
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                        />
                      </div>
                    );
                  } else {
                    /* Fallback for non-embeddable content */
                    return (
                      <div className='p-8 rounded-lg text-center' style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '2px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        <div className='mb-4'>
                          <svg className='w-16 h-16 mx-auto text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                          </svg>
                        </div>
                        <p className='text-gray-300 mb-2'>This content opens in a new window</p>
                        <p className='text-gray-500 text-sm mb-6'>External resource (Articles, PDFs, or protected videos)</p>
                      </div>
                    );
                  }
                })()}

                <div className='mt-4 text-center'>
                  <a
                    href={lesson.contentURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105'
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: 'white'
                    }}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                    </svg>
                    Open Original Link
                  </a>
                </div>
              </div>
            ) : (
              <div className='mb-6 p-8 rounded-lg text-center' style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                <p className='text-gray-400'>No content URL available for this lesson.</p>
              </div>
            )}

            {/* Mark Complete Button */}
            <div className='flex justify-center gap-4'>
              {currentProgress?.status !== 'completed' ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className='px-8 py-4 rounded-lg text-white font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105'
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {isCompleting ? 'Marking Complete...' : '✓ Mark as Completed'}
                </button>
              ) : (
                <div className='flex items-center gap-3 px-8 py-4 rounded-lg' style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <svg className='w-6 h-6 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  <span className='text-lg font-semibold text-green-400'>Lesson Completed!</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lesson Quiz Section */}
        {isQuizLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='p-8 rounded-2xl text-center'
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
              <div className='text-xl text-gray-300'>Generating quiz questions...</div>
              <div className='text-sm text-gray-500'>Using AI to create personalized questions for this lesson</div>
            </div>
          </motion.div>
        ) : quiz ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LessonQuiz
              quiz={quiz}
              onComplete={handleQuizComplete}
              onRegenerate={handleRegenerateQuiz}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default LessonView;
