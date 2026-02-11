import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(null);
  const [inProgressLessons, setInProgressLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProgress(), fetchInProgressLessons()]);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress');
      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };
  
  const fetchInProgressLessons = async () => {
    try {
      const response = await api.get('/progress/in-progress');
      if (response.data.success) {
        setInProgressLessons(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching in-progress lessons:', error);
      toast.error('Failed to load in-progress lessons');
    }
  };
  
  const notStartedCount = (progress?.totalLessons || 0) - (progress?.completedLessons || 0) - inProgressLessons.length;
  
  const progressPercentage = progress?.totalLessons 
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;
  
  const handleOpenLesson = async (lesson) => {
    try {
      const lessonId = typeof lesson._id === 'object' ? lesson._id.toString() : lesson._id;
      await api.post('/track/visit', { itemId: lessonId });
      navigate(`/learn/${lessonId}`);
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
          <div className='text-xl text-gray-300'>Loading Dashboard...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className='min-h-screen p-6' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 
            className='text-4xl font-bold mb-2'
            style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className='text-gray-400'>Track your progress and continue learning</p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {/* 3D Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='rounded-xl p-8 flex flex-col items-center justify-center'
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
              minHeight: '400px'
            }}
          >
            {/* Animated Card Stack */}
            <div className='relative w-full h-full flex items-center justify-center' style={{ perspective: '1000px' }}>
              {[...Array(5)].map((_, i) => {
                // Different color gradient for each card
                const cardColors = [
                  'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)', // Indigo to Purple
                  'linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(251, 113, 133, 0.95) 100%)', // Pink to Rose
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)', // Blue to Purple
                  'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(217, 70, 239, 0.95) 100%)', // Purple to Fuchsia
                  'linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(219, 39, 119, 0.95) 100%)', // Indigo to Pink
                ];
                
                return (
                  <motion.div
                    key={i}
                    className='absolute rounded-lg shadow-2xl'
                    style={{
                      width: '120px',
                      height: '160px',
                      background: cardColors[i],
                      transformStyle: 'preserve-3d',
                      zIndex: 5 - i,
                    }}
                    animate={{
                      rotateY: [0, 5, 0, -5, 0],
                      x: [(i - 2) * 12, (i - 2) * 16, (i - 2) * 12],
                      y: [i * 6, i * 9, i * 6],
                      rotateZ: [(i - 2) * 6, (i - 2) * 9, (i - 2) * 6],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                    whileHover={{
                      y: -20,
                      rotateZ: 0,
                      scale: 1.05,
                      transition: { duration: 0.3 },
                    }}
                  >
                    {/* Card Content */}
                    <div className='p-3 h-full flex flex-col justify-between'>
                      <div>
                        <div className='w-6 h-6 rounded-md mb-2' style={{ 
                          background: 'rgba(255, 255, 255, 0.3)' 
                        }}></div>
                        <div className='space-y-1.5'>
                          <div className='h-1.5 rounded' style={{ width: '75%', background: 'rgba(255, 255, 255, 0.5)' }}></div>
                          <div className='h-1.5 rounded' style={{ width: '50%', background: 'rgba(255, 255, 255, 0.5)' }}></div>
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <div className='h-1 rounded' style={{ background: 'rgba(255, 255, 255, 0.3)' }}></div>
                        <div className='h-1 rounded' style={{ width: '83%', background: 'rgba(255, 255, 255, 0.3)' }}></div>
                        <div className='h-1 rounded' style={{ width: '67%', background: 'rgba(255, 255, 255, 0.3)' }}></div>
                      </div>
                    </div>

                    {/* Card Shine Effect */}
                    <motion.div
                      className='absolute inset-0 rounded-lg'
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                );
              })}

              {/* Floating Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className='absolute w-1 h-1 rounded-full'
                  style={{
                    background: i % 2 === 0 ? '#6366f1' : '#a855f7',
                    left: `${15 + i * 10}%`,
                    top: '60%',
                  }}
                  animate={{
                    y: [0, -40, 0],
                    x: [0, Math.cos(i) * 30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
            
            <div className='text-center mt-8'>
              <h3 className='text-2xl font-bold text-white mb-2'>
                {progress?.completedLessons > 0 
                  ? 'Keep Learning!' 
                  : 'Start Your Journey'}
              </h3>
              <p className='text-gray-400'>
                {progress?.completedLessons > 0
                  ? `You've completed ${progress.completedLessons} ${progress.completedLessons === 1 ? 'lesson' : 'lessons'}!`
                  : 'Begin your learning adventure today'}
              </p>
              <div className='flex gap-3 mt-6 justify-center'>
                <button
                  onClick={() => navigate('/learning-path')}
                  className='px-6 py-3 rounded-lg font-medium hover:scale-105 transition-transform'
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}
                >
                  Explore Lessons
                </button>
                <button
                  onClick={() => navigate('/progress')}
                  className='px-6 py-3 rounded-lg font-medium hover:scale-105 transition-transform'
                  style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                >
                  My Progress
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='rounded-xl p-6'
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 className='text-xl font-semibold text-white mb-6'>Overall Progress</h2>
            
            {/* Circular Progress */}
            <div className='flex items-center justify-center mb-6'>
              <div className='relative w-32 h-32'>
                <svg className='transform -rotate-90 w-32 h-32'>
                  <circle cx='64' cy='64' r='56' stroke='rgba(99, 102, 241, 0.2)' strokeWidth='12' fill='none' />
                  <circle
                    cx='64' cy='64' r='56'
                    stroke='url(#gradient)'
                    strokeWidth='12'
                    fill='none'
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                    strokeLinecap='round'
                  />
                  <defs>
                    <linearGradient id='gradient'>
                      <stop offset='0%' stopColor='#6366f1' />
                      <stop offset='100%' stopColor='#a855f7' />
                    </linearGradient>
                  </defs>
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-3xl font-bold text-white'>{progressPercentage}%</span>
                </div>
              </div>
            </div>
            
            {/* Detailed Breakdown */}
            <div className='space-y-3'>
              {/* Completed */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ background: '#22c55e' }}></div>
                    <span className='text-sm text-gray-300'>Completed</span>
                  </div>
                  <span className='text-sm font-semibold text-green-400'>{progress?.completedLessons || 0}</span>
                </div>
                <div className='w-full h-2 rounded-full overflow-hidden' style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
                  <div 
                    className='h-full rounded-full transition-all duration-500'
                    style={{ 
                      width: `${progress?.totalLessons ? (progress.completedLessons / progress.totalLessons * 100) : 0}%`,
                      background: '#22c55e'
                    }}
                  />
                </div>
              </div>
              
              {/* In Progress */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ background: '#3b82f6' }}></div>
                    <span className='text-sm text-gray-300'>In Progress</span>
                  </div>
                  <span className='text-sm font-semibold text-blue-400'>{inProgressLessons.length}</span>
                </div>
                <div className='w-full h-2 rounded-full overflow-hidden' style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
                  <div 
                    className='h-full rounded-full transition-all duration-500'
                    style={{ 
                      width: `${progress?.totalLessons ? (inProgressLessons.length / progress.totalLessons * 100) : 0}%`,
                      background: '#3b82f6'
                    }}
                  />
                </div>
              </div>
              
              {/* Not Started */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ background: 'rgba(148, 163, 184, 0.5)' }}></div>
                    <span className='text-sm text-gray-300'>Not Started</span>
                  </div>
                  <span className='text-sm font-semibold text-gray-400'>{notStartedCount}</span>
                </div>
                <div className='w-full h-2 rounded-full overflow-hidden' style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
                  <div 
                    className='h-full rounded-full transition-all duration-500'
                    style={{ 
                      width: `${progress?.totalLessons ? (notStartedCount / progress.totalLessons * 100) : 0}%`,
                      background: 'rgba(148, 163, 184, 0.5)'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Total */}
            <div className='mt-4 pt-4 border-t border-gray-700'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-400'>Total Lessons</span>
                <span className='text-lg font-bold text-indigo-400'>{progress?.totalLessons || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Continue Learning Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='rounded-xl p-6 mb-8'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-white'>Continue Learning</h2>
            <button
              onClick={() => navigate('/learning-path')}
              className='text-indigo-400 hover:text-indigo-300 font-medium text-sm'
            >
              View All →
            </button>
          </div>
          
          {inProgressLessons.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {inProgressLessons.map((lesson) => (
                <motion.div
                  key={lesson._id}
                  whileHover={{ scale: 1.02 }}
                  className='p-4 rounded-lg cursor-pointer'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                  onClick={() => handleOpenLesson(lesson)}
                >
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                      {lesson.sourceType === 'video' ? '🎥' : '📄'}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-white mb-1 line-clamp-2'>{lesson.title}</h3>
                      <p className='text-sm text-gray-400 mb-2'>{lesson.estimatedTimeMin} min</p>
                      {lesson.geminiGenerated && (
                        <span className='inline-block px-2 py-1 text-xs rounded-full' style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                          🤖 AI Generated
                        </span>
                      )}
                      {lesson.isCustom && (
                        <span className='inline-block px-2 py-1 text-xs rounded-full' style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                          👤 Custom
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>📚</div>
              <p className='text-gray-400 mb-4'>No lessons in progress</p>
              <button
                onClick={() => navigate('/learning-path')}
                className='px-6 py-3 rounded-lg font-medium'
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}
              >
                Browse Learning Path
              </button>
            </div>
          )}
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className='text-2xl font-semibold text-white mb-6'>Explore Features</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <button
              onClick={() => navigate('/learning-path')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>📚</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Learning Path</h3>
              <p className='text-sm text-indigo-200'>Explore all lessons</p>
            </button>
            
            <button
              onClick={() => navigate('/skill-tree')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>🌳</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Skill Tree</h3>
              <p className='text-sm text-purple-200'>Visualize your path</p>
            </button>
            
            <button
              onClick={() => navigate('/goals')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>🎯</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Goals</h3>
              <p className='text-sm text-pink-200'>Set your targets</p>
            </button>
            
            <button
              onClick={() => navigate('/leaderboard')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>🏆</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Leaderboard</h3>
              <p className='text-sm text-orange-200'>Compete with others</p>
            </button>
            
            <button
              onClick={() => navigate('/analytics')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>📊</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Analytics</h3>
              <p className='text-sm text-cyan-200'>Track your stats</p>
            </button>
            
            <button
              onClick={() => navigate('/assessment')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>✅</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Assessment</h3>
              <p className='text-sm text-emerald-200'>Test your knowledge</p>
            </button>
            
            <button
              onClick={() => navigate('/certificates')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>🎓</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Certificates</h3>
              <p className='text-sm text-yellow-200'>Your achievements</p>
            </button>
            
            <button
              onClick={() => navigate('/forum')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>💬</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Forum</h3>
              <p className='text-sm text-indigo-200'>Chat with peers</p>
            </button>
            
            <button
              onClick={() => navigate('/messages')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>📢</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Messages</h3>
              <p className='text-sm text-purple-200'>Admin notices & updates</p>
            </button>
            
            <button
              onClick={() => navigate('/add-content')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>➕</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Add Content</h3>
              <p className='text-sm text-emerald-200'>Import your tutorials</p>
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>⚙️</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Profile</h3>
              <p className='text-sm text-purple-200'>Manage preferences</p>
            </button>
            
            <button
              onClick={() => navigate('/progress')}
              className='p-6 rounded-xl text-left hover:scale-105 transition-transform'
              style={{
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)'
              }}
            >
              <div className='text-4xl mb-2'>📈</div>
              <h3 className='text-xl font-semibold text-white mb-1'>Progress</h3>
              <p className='text-sm text-teal-200'>View detailed stats</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
