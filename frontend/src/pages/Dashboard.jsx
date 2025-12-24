import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GamificationContext } from '../context/GamificationContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  BookOpen, Users, Target, ClipboardCheck, Library, TrendingUp,
  Award, MessageCircle, Brain, Folder, User, BarChart3,
  TreePine, GraduationCap, Zap, Home, Plus, MessageSquare
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const gamification = useContext(GamificationContext);
  const stats = gamification?.stats || {};
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [inProgressLessons, setInProgressLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Loading Progress Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
      
      // Also get progress data to show time spent
      const progressResponse = await api.get('/progress');
      if (progressResponse.data.success) {
        const progressMap = {};
        progressResponse.data.data.progress.forEach(p => {
          if (p.lessonId) {
            progressMap[p.lessonId._id] = p;
          }
        });
        
        // Attach progress data to in-progress lessons
        const lessonsWithProgress = response.data.data.map(lesson => ({
          ...lesson,
          progressData: progressMap[lesson._id]
        }));
        setInProgressLessons(lessonsWithProgress);
      }
    } catch (error) {
      console.error('Error fetching in-progress lessons:', error);
    }
  };

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4000);
  };

  const features = [
    { id: 1, name: 'Learning Path', path: '/learning-path', icon: BookOpen, gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', desc: 'Explore all lessons & courses' },
    { id: 2, name: 'My Progress', path: '/progress', icon: TrendingUp, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', desc: 'Track your learning journey' },
    { id: 3, name: 'Goals & Planning', path: '/goals', icon: Target, gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', desc: 'Set & track your goals' },
    { id: 4, name: 'Skill Assessment', path: '/assessment', icon: ClipboardCheck, gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', desc: 'Test your knowledge level' },
    { id: 5, name: 'Add Content', path: '/add-content', icon: Plus, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', desc: 'Import tutorials & resources' },
    { id: 6, name: 'Skill Tree', path: '/skill-tree', icon: TreePine, gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)', desc: 'Visual skill progression' },
    { id: 7, name: 'Certificates', path: '/certificates', icon: Award, gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', desc: 'View your achievements' },
    { id: 8, name: 'Leaderboard', path: '/leaderboard', icon: Users, gradient: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)', desc: 'Compare with others' },
    { id: 9, name: 'Discussion Forum', path: '/forum', icon: MessageCircle, gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', desc: 'Community discussions' },
    { id: 10, name: 'Analytics', path: '/analytics', icon: BarChart3, gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', desc: 'Learning insights & stats' },
    { id: 11, name: 'Profile', path: '/profile', icon: User, gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)', desc: 'Manage your account' },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'AI Chat', path: '/forum', color: '#3b82f6' },
    { icon: BookOpen, label: 'Learn', path: '/learning-path', color: '#8b5cf6' },
    { icon: Target, label: 'Goals', path: '/goals', color: '#10b981' }
  ];

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
  };

  const handleMouseLeaveCard = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
  };

  const progressPercentage = progress?.totalLessons
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #0d0d15 0%, #1a0f2e 25%, #0d1b2a 50%, #1a0f2e 75%, #0d0d15 100%)' }}>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
          <div className='text-xl text-gray-300'>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  // Use currentStreak from stats, fallback to 0
  const currentStreak = stats?.currentStreak ?? 0;

  return (
    <div className='min-h-screen relative' style={{ background: 'linear-gradient(135deg, #0d0d15 0%, #1a0f2e 25%, #0d1b2a 50%, #1a0f2e 75%, #0d0d15 100%)' }}>

      {/* FULL PAGE ANIMATED BACKGROUND - FIXED */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden' style={{ zIndex: 0 }}>
        {/* Glow Effect 1 */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 30%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'floatDynamic 25s ease-in-out infinite',
          opacity: 0.6
        }}></div>

        {/* Glow Effect 2 */}
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(29, 185, 84, 0.08) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'floatDynamic 30s ease-in-out infinite reverse',
          opacity: 0.5
        }}></div>

        {/* Glow Effect 3 */}
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 20s ease-in-out infinite'
        }}></div>

        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite',
          opacity: 0.3
        }}></div>
      </div>

      {/* Confetti Overlay */}
      {confetti.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
          {confetti.map(piece => (
            <div
              key={piece.id}
              style={{
                position: 'absolute',
                left: `${piece.left}%`,
                top: '-10%',
                width: '10px',
                height: '10px',
                background: piece.color,
                animation: `confettiFall ${piece.duration}s ease-out ${piece.delay}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
        </div>
      )}

      {/* PAGE CONTENT */}
      <div className='relative' style={{ zIndex: 1 }}>

        {/* Loading Progress Bar */}
        {loadProgress < 100 && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.5)'
          }}>
            <div style={{
              height: '100%',
              width: `${loadProgress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)'
            }} />
          </div>
        )}

        {/* Navbar */}
        <nav style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                LearnIT
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    color: '#9ca3af',
                    border: 'none',
                    background: 'rgba(99, 102, 241, 0.15)',
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Home style={{ width: '18px', height: '18px' }} />
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, rgba(30, 34, 54, 0.9), rgba(40, 20, 60, 0.7))',
                  borderRadius: '14px',
                  padding: '8px 16px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>🔥</span>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {currentStreak}
                  </span>

                  <div style={{ width: '1px', height: '24px', background: 'rgba(139, 92, 246, 0.3)', margin: '0 6px' }}></div>

                  <span style={{ fontSize: '1.25rem' }}>👨‍🎓</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'white' }}>{user?.name || 'Learner'}</div>
                    <div style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: '600' }}>LEVEL {stats?.level || 1}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px', position: 'relative', zIndex: 1 }}>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              backdropFilter: 'blur(30px)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '40px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #06b6d4, transparent)'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#a78bfa',
                  fontWeight: '700',
                  letterSpacing: '0.15em',
                  marginBottom: '10px',
                  textTransform: 'uppercase'
                }}>
                  ⚡ WELCOME BACK
                </div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  color: 'white',
                  marginBottom: '10px'
                }}>
                  Hey, {user?.name || 'Learner'}! 👋
                </h1>
                <p style={{ fontSize: '1.125rem', color: '#cbd5e1' }}>
                  Ready to crush your goals today?
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'STREAK', value: `🔥 ${currentStreak}`, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
                  { label: 'LEVEL', value: stats?.level || 1, gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
                  { label: 'XP', value: stats?.xp || 0, gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(40, 10, 60, 0.7))',
                    borderRadius: '16px',
                    padding: '20px 32px',
                    textAlign: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '900',
                      background: item.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {[
              { label: 'Lessons Completed', value: progress?.completedLessons || 0, icon: BookOpen, color: '#22c55e' },
              { label: 'In Progress', value: inProgressLessons.length, icon: TrendingUp, color: '#3b82f6' },
              { label: 'Total Lessons', value: progress?.totalLessons || 0, icon: Library, color: '#a855f7' },
              { label: 'Completion', value: `${progressPercentage}%`, icon: Target, color: '#ec4899' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.8) 0%, rgba(30, 15, 50, 0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div style={{
                  background: `${stat.color}20`,
                  padding: '16px',
                  borderRadius: '16px'
                }}>
                  <stat.icon style={{ width: '30px', height: '30px', color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: 'white',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span>🚀</span> Explore Features
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#a3b3c7', marginBottom: '32px' }}>
              Choose from {features.length} powerful tools to enhance your learning experience
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, idx) => (
              <button
                key={feature.id}
                onClick={() => navigate(feature.path)}
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.8) 0%, rgba(30, 15, 50, 0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: 'white',
                  transformStyle: 'preserve-3d'
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={(e) => {
                  setHoveredFeature(feature.id);
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  handleMouseLeaveCard(e);
                  setHoveredFeature(null);
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  background: feature.gradient,
                  padding: '18px',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  <feature.icon style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                  {feature.name}
                </h3>
                <p style={{ fontSize: '1rem', color: '#a3b3c7', lineHeight: '1.6' }}>
                  {feature.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Continue Learning Section */}
          {inProgressLessons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '32px',
                marginTop: '48px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>Continue Learning</h2>
                <button
                  onClick={() => navigate('/learning-path')}
                  style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  View All →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {inProgressLessons.slice(0, 3).map((lesson) => (
                  <div
                    key={lesson._id}
                    onClick={() => navigate(`/learn/${lesson._id}`)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{lesson.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span>📚 {lesson.estimatedTimeMin} min</span>
                      {lesson.progressData?.timeSpentMin > 0 && (
                        <span style={{ color: '#818cf8' }}>⏱️ {lesson.progressData.timeSpentMin}m spent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        <div style={{ position: 'fixed', bottom: '32px', left: '32px', zIndex: 999 }}>
          {fabOpen && quickActions.map((action, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                bottom: `${(idx + 1) * 72}px`,
                left: 0,
                cursor: 'pointer'
              }}
              onClick={() => { navigate(action.path); setFabOpen(false); }}
            >
              <div style={{
                background: action.color,
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${action.color}50`
              }}>
                <action.icon style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
            </div>
          ))}

          <button
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)'
            }}
            onClick={() => setFabOpen(!fabOpen)}
          >
            <Zap style={{ width: '28px', height: '28px', color: 'white' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes floatDynamic {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(40px, -40px) rotate(8deg); }
          50% { transform: translate(-30px, 30px) rotate(-8deg); }
          75% { transform: translate(30px, 15px) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes confettiFall {
          0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
        }

        @keyframes float0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(-20px, 20px); }
          75% { transform: translate(20px, 10px); }
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 30px) rotate(120deg); }
          66% { transform: translate(40px, -20px) rotate(240deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.5) translate(-25px, 25px); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
