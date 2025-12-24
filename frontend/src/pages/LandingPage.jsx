import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Users,
  Award,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Code,
  Database,
  Globe,
  Rocket,
  Bot
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ripples, setRipples] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "Interactive learning that's effective and fun. Master programming, data science, and computer science with hands-on lessons designed by experts.";

  // Original content data
  const features = [
    {
      icon: <Brain className='w-8 h-8' />,
      title: 'Concepts that click',
      description: 'Our interactive approach makes even complex topics feel intuitive. Smart feedback catches mistakes as you learn.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Target className='w-8 h-8' />,
      title: 'Personalized learning',
      description: 'LearnIT tracks your progress, designs practice sets based on your performance, and adapts to your pace.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className='w-8 h-8' />,
      title: 'Track your growth',
      description: 'Stay motivated with detailed progress tracking, achievements, and daily encouragement to keep learning.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const categories = [
    { name: 'Programming', icon: <Code className='w-6 h-6' />, color: 'bg-blue-500' },
    { name: 'Data Science', icon: <Database className='w-6 h-6' />, color: 'bg-purple-500' },
    { name: 'Web Development', icon: <Globe className='w-6 h-6' />, color: 'bg-green-500' },
    { name: 'Computer Science', icon: <Brain className='w-6 h-6' />, color: 'bg-pink-500' }
  ];

  const benefits = [
    'Guided lessons with step-by-step explanations',
    'Build problem-solving skills one concept at a time',
    'Finish every day smarter with engaging content',
    'Learn at your own pace, anytime, anywhere'
  ];

  // Typing Effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, []);

  // Number Counter Hook
  const useCountAnimation = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
  };

  const count17 = useCountAnimation(17, 2000);

  // Ripple Effect Handler
  const handleButtonClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    };

    setRipples([...ripples, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);

    setTimeout(() => navigate(user ? '/dashboard' : '/auth'), 200);
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
    position: 'relative'
  };

  const statCardStyle = {
    background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.7) 0%, rgba(30, 15, 50, 0.5) 100%)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '24px',
    padding: '40px 32px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '350px'
  };

  const decorLineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)',
    transform: 'scaleX(0)',
    transition: 'transform 0.5s ease'
  };

  const shimmerOverlay = {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    animation: 'shimmer 3s infinite'
  };

  return (
    <div className='min-h-screen relative' style={{ background: 'linear-gradient(135deg, #0d0d15 0%, #1a0f2e 25%, #0d1b2a 50%, #1a0f2e 75%, #0d0d15 100%)' }}>

      {/* FULL PAGE ANIMATED BACKGROUND */}
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

        {/* Glow Effect 4 */}
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 18s ease-in-out infinite'
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
          opacity: 0.4
        }}></div>
      </div>

      {/* PAGE CONTENT - positioned above background */}
      <div className='relative' style={{ zIndex: 1 }}>

        {/* Hero Section */}
        <section className='relative overflow-hidden' style={{ minHeight: '100vh' }}>
          <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* TAGLINE WITH ICON */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6'
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Zap className='w-4 h-4 text-indigo-400' />
                  <span className='text-indigo-300 text-sm font-medium'>AI-POWERED LEARNING PLATFORM</span>
                  <Zap className='w-4 h-4 text-indigo-400' />
                </motion.div>

                <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight'>
                  Learn by{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    doing
                  </span>
                </h1>

                {/* Typing Effect Subtitle */}
                <p className='text-xl text-gray-400 mb-8 leading-relaxed' style={{ minHeight: '80px' }}>
                  {typedText}
                  {showCursor && (
                    <span style={{
                      opacity: 1,
                      animation: 'blink 1s infinite',
                      marginLeft: '2px'
                    }}>|</span>
                  )}
                </p>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <button
                    onClick={handleButtonClick}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    {ripples.map(ripple => (
                      <span
                        key={ripple.id}
                        style={{
                          position: 'absolute',
                          left: ripple.x,
                          top: ripple.y,
                          width: '0px',
                          height: '0px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.6)',
                          transform: 'translate(-50%, -50%)',
                          animation: 'rippleEffect 0.6s ease-out',
                          pointerEvents: 'none'
                        }}
                      />
                    ))}
                    <span style={{ position: 'relative', zIndex: 1 }}>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
                    <ArrowRight className='w-5 h-5' style={{ position: 'relative', zIndex: 1 }} />
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/learning-path')}
                    className='px-8 py-4 rounded-xl font-semibold text-gray-300 text-lg flex items-center justify-center gap-2'
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Explore Courses
                  </motion.button>
                </div>

                {/* New Platform Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className='flex items-center gap-4 mt-12'
                >
                  <div className='inline-flex items-center gap-2 px-4 py-2 rounded-lg' style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <Sparkles className='w-5 h-5 text-green-400' />
                    <span className='text-green-400 font-semibold'>New Platform</span>
                  </div>
                  <span className='text-gray-400'>Start your journey with us today!</span>
                </motion.div>
              </motion.div>

              {/* Right Animated Illustration - Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className='relative hidden lg:block'
              >
                <div className='relative' style={{ perspective: '1000px' }}>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className='rounded-xl p-6 mb-4 shadow-2xl'
                      style={{
                        background: i === 0
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))'
                          : i === 1
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(217, 70, 239, 0.8))'
                            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(251, 113, 133, 0.8))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      animate={{
                        y: [0, -15, 0],
                        x: [0, i % 2 === 0 ? 10 : -10, 0],
                        rotateY: [0, 5, 0]
                      }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut'
                      }}
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center' style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                          {i === 0 ? <Code className='w-5 h-5 text-white' /> :
                            i === 1 ? <Database className='w-5 h-5 text-white' /> :
                              <Globe className='w-5 h-5 text-white' />}
                        </div>
                        <div>
                          <div className='text-white font-semibold'>
                            {i === 0 ? 'Python Basics' : i === 1 ? 'Data Structures' : 'Web Development'}
                          </div>
                          <div className='text-white/70 text-sm'>
                            {i === 0 ? '12 lessons' : i === 1 ? '18 lessons' : '15 lessons'}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='flex-1 h-2 rounded-full' style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                          <div
                            className='h-full rounded-full'
                            style={{
                              width: i === 0 ? '75%' : i === 1 ? '45%' : '90%',
                              background: 'rgba(255, 255, 255, 0.8)'
                            }}
                          ></div>
                        </div>
                        <span className='text-white/80 text-sm font-medium'>
                          {i === 0 ? '75%' : i === 1 ? '45%' : '90%'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Feature Stats with Counter Animation */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto'>
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  ...statCardStyle,
                  borderColor: hoveredCard === 0 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.2)'
                }}
                onMouseEnter={(e) => {
                  setHoveredCard(0);
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)';
                  e.currentTarget.querySelector('.decor-line-0').style.transform = 'scaleX(1)';
                }}
                onMouseLeave={(e) => {
                  setHoveredCard(null);
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.querySelector('.decor-line-0').style.transform = 'scaleX(0)';
                }}
              >
                <div className="decor-line-0" style={decorLineStyle}></div>
                <div style={shimmerOverlay}></div>
                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <Rocket className='w-16 h-16 text-purple-400 mx-auto' />
                </div>
                <div style={{ fontSize: '3rem', fontWeight: '900', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', position: 'relative', zIndex: 2 }}>{count17}+</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>Powerful Features</div>
                <div style={{ fontSize: '0.9rem', color: '#a3b3c7', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>Complete learning ecosystem with AI mentorship</div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  ...statCardStyle,
                  borderColor: hoveredCard === 1 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(168, 85, 247, 0.2)'
                }}
                onMouseEnter={(e) => {
                  setHoveredCard(1);
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)';
                  e.currentTarget.querySelector('.decor-line-1').style.transform = 'scaleX(1)';
                }}
                onMouseLeave={(e) => {
                  setHoveredCard(null);
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.querySelector('.decor-line-1').style.transform = 'scaleX(0)';
                }}
              >
                <div className="decor-line-1" style={{ ...decorLineStyle, background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.8), transparent)' }}></div>
                <div style={shimmerOverlay}></div>
                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <Bot className='w-16 h-16 text-pink-400 mx-auto' />
                </div>
                <div style={{ fontSize: '3rem', fontWeight: '900', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', position: 'relative', zIndex: 2 }}>AI</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>Powered Learning</div>
                <div style={{ fontSize: '0.9rem', color: '#a3b3c7', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>Smart recommendations & personalized insights</div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  ...statCardStyle,
                  borderColor: hoveredCard === 2 ? 'rgba(14, 165, 233, 0.6)' : 'rgba(14, 165, 233, 0.2)'
                }}
                onMouseEnter={(e) => {
                  setHoveredCard(2);
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(14, 165, 233, 0.3), 0 0 40px rgba(14, 165, 233, 0.1)';
                  e.currentTarget.querySelector('.decor-line-2').style.transform = 'scaleX(1)';
                }}
                onMouseLeave={(e) => {
                  setHoveredCard(null);
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.querySelector('.decor-line-2').style.transform = 'scaleX(0)';
                }}
              >
                <div className="decor-line-2" style={{ ...decorLineStyle, background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.8), transparent)' }}></div>
                <div style={shimmerOverlay}></div>
                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <Users className='w-16 h-16 text-cyan-400 mx-auto' />
                </div>
                <div style={{ fontSize: '3rem', fontWeight: '900', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', position: 'relative', zIndex: 2 }}>24/7</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>Active Community</div>
                <div style={{ fontSize: '0.9rem', color: '#a3b3c7', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>Connect, collaborate & grow together</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Personalized Learning Section */}
        <section className='py-20 relative'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className='text-5xl md:text-6xl font-bold text-white mb-6'>
                  Personalized<br />learning
                </h2>
                <p className='text-xl text-gray-400 leading-relaxed'>
                  LearnIT tracks the concepts you've mastered, designs practice sets based on your progress, and adapts to your pace.
                </p>
              </motion.div>

              <div className='relative h-[500px]'>
                {[
                  { name: 'Variables', completed: true, top: '5%', left: '10%' },
                  { name: 'Data Types', completed: true, top: '5%', left: '55%' },
                  { name: 'Functions', completed: true, top: '20%', left: '35%' },
                  { name: 'Loops', completed: true, top: '40%', left: '5%' },
                  { name: 'Conditionals', completed: true, top: '35%', left: '50%' },
                  { name: 'Arrays', completed: true, top: '55%', left: '25%' },
                  { name: 'Objects', completed: false, top: '65%', left: '65%' },
                  { name: 'Classes', completed: true, top: '75%', left: '10%' },
                  { name: 'Async/Await', completed: false, top: '85%', left: '45%' },
                ].map((concept, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className='absolute rounded-lg px-4 py-3 shadow-xl cursor-pointer'
                    style={{
                      top: concept.top,
                      left: concept.left,
                      background: `linear-gradient(135deg, ${concept.completed ? 'rgba(99, 102, 241, 0.9)' : 'rgba(55, 65, 81, 0.9)'}, ${concept.completed ? 'rgba(168, 85, 247, 0.9)' : 'rgba(75, 85, 99, 0.9)'})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${concept.completed ? 'rgba(99, 102, 241, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`,
                      minWidth: '140px'
                    }}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <span className='text-white font-semibold text-sm'>{concept.name}</span>
                      {concept.completed ? (
                        <CheckCircle className='w-5 h-5 text-green-400' />
                      ) : (
                        <div className='w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center'>
                          <div className='w-2.5 h-2.5 bg-gray-500 rounded-full'></div>
                        </div>
                      )}
                    </div>
                    <div
                      className='h-0.5 mt-2 rounded-full'
                      style={{
                        background: concept.completed ? 'rgba(34, 197, 94, 0.6)' : 'rgba(107, 114, 128, 0.4)',
                        width: '100%'
                      }}
                    ></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='py-20 relative'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='text-center mb-16'
            >
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                Why choose LearnIT?
              </h2>
              <p className='text-xl text-gray-400'>
                More effective, more fun learning experience
              </p>
            </motion.div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className='rounded-2xl p-8'
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient}`}>
                    {feature.icon}
                  </div>
                  <h3 className='text-2xl font-bold text-white mb-4'>{feature.title}</h3>
                  <p className='text-gray-400 leading-relaxed'>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className='py-20' style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='text-center mb-16'
            >
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                Reach big learning goals
              </h2>
              <p className='text-xl text-gray-400'>
                Choose from a wide variety of topics
              </p>
            </motion.div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/learning-path')}
                  className='rounded-xl p-6 cursor-pointer'
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 text-white`}>
                    {category.icon}
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-2'>{category.name}</h3>
                  <p className='text-gray-400 text-sm'>Multiple courses available</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className='py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                  Guided lessons that keep you motivated
                </h2>
                <p className='text-xl text-gray-400 mb-8'>
                  Stay on track, see your progress, and build your skills one concept at a time.
                </p>

                <div className='space-y-4'>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className='flex items-start gap-3'
                    >
                      <CheckCircle className='w-6 h-6 text-green-500 flex-shrink-0 mt-1' />
                      <span className='text-gray-300 text-lg'>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className='relative'
              >
                <div className='rounded-2xl p-8' style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  <div className='flex items-center gap-4 mb-6'>
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center'>
                      <Award className='w-8 h-8 text-white' />
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-white'>Daily Streak: 15 days 🔥</div>
                      <div className='text-gray-400'>Keep it going!</div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='rounded-lg p-4' style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-white font-medium'>Weekly Goal</span>
                        <span className='text-indigo-400 font-bold'>4/5 days</span>
                      </div>
                      <div className='h-2 rounded-full' style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        <div className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500' style={{ width: '80%' }}></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-7 gap-2'>
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className='aspect-square rounded-lg flex items-center justify-center'
                          style={{
                            background: i < 4 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {i < 4 && <CheckCircle className='w-4 h-4 text-white' />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='rounded-3xl p-12 text-center relative overflow-hidden'
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute rounded-full bg-white'
                  style={{
                    width: Math.random() * 100 + 50,
                    height: Math.random() * 100 + 50,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.1
                  }}
                  animate={{
                    y: [0, Math.random() * 50 - 25],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: Math.random() * 5 + 5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}

              <div className='relative z-10'>
                <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                  Start learning today
                </h2>
                <p className='text-xl text-white/90 mb-8'>
                  Join millions of learners and achieve your goals with LearnIT
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className='px-10 py-5 rounded-xl font-semibold text-lg bg-white shadow-xl flex items-center justify-center gap-2 mx-auto'
                  style={{ color: '#6366f1' }}
                >
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight className='w-5 h-5' />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className='py-12 border-t' style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center text-gray-400'>
              <p className='text-lg mb-2'>© 2025 LearnIT. All rights reserved.</p>
              <p className='text-sm'>Made with ❤️ for learners worldwide</p>
            </div>
          </div>
        </footer>
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

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
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

        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes slideIn {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes rippleEffect {
          to {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
