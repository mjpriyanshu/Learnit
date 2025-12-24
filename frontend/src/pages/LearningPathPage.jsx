import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Search, BookOpen, Video, FileText, Filter, Zap, Clock, Star, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ImportLessonForm from '../components/ImportLessonForm';

const LearningPathPage = () => {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({}); // Map of lessonId -> progress stats
  const [inProgressList, setInProgressList] = useState([]);

  // Dynamic Learning States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter states
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // all, public, private
  const [activeTab, setActiveTab] = useState('all'); // all, videos, articles
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, beginner, intermediate, advanced
  const [sourceFilter, setSourceFilter] = useState('all'); // all, ai, custom, curated
  const [sortOption, setSortOption] = useState('newest'); // newest, rating, difficulty
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('all'); // Topic filtering

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Background Animation Effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchLessons();
    fetchUserProgress();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [lessons, visibilityFilter, activeTab, difficultyFilter, sourceFilter, sortOption, searchQuery, activeTopic]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/lessons/my/directory');
      if (response.data.success) {
        // Combine public and private lessons with proper labeling
        const publicLessons = response.data.data.public.map(lesson => ({
          ...lesson,
          _visibility: 'public' // Add internal flag for filtering
        }));
        
        const privateLessons = [
          ...response.data.data.private.personalized,
          ...response.data.data.private.custom
        ].map(lesson => ({
          ...lesson,
          _visibility: 'private' // Add internal flag for filtering
        }));
        
        const allLessons = [...publicLessons, ...privateLessons];
        setLessons(allLessons);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      // Get detailed progress map
      const response = await api.get('/progress');
      if (response.data.success) {
        const progressMap = {};
        const activeDefaults = [];

        response.data.data.progress.forEach(p => {
          if (p.lessonId) {
            progressMap[p.lessonId._id] = p;
            if (p.status === 'in-progress') {
              activeDefaults.push(p.lessonId);
            }
          }
        });
        setUserProgress(progressMap);
        setInProgressList(activeDefaults);
      }
    } catch (error) {
      console.error('Failed to fetch progress', error);
    }
  };

  const handleAddToProgress = async (e, lessonId) => {
    e.stopPropagation();
    try {
      const response = await api.post('/progress/add-to-list', { lessonId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUserProgress(); // Refresh to show added status
      }
    } catch (error) {
      toast.error('Failed to add to list');
    }
  };

  const handleGeneratePersonalized = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post('/lessons/generate/personalized', { count: 5 });
      if (response.data.success) {
        toast.success(`Generated ${response.data.data.length} personalized lessons!`);
        fetchLessons();
      }
    } catch (error) {
      toast.error('Failed to generate lessons.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lessons];

    // Visibility filter - use internal _visibility flag
    if (visibilityFilter === 'public') filtered = filtered.filter(l => l._visibility === 'public');
    else if (visibilityFilter === 'private') filtered = filtered.filter(l => l._visibility === 'private');

    // Tab filter
    if (activeTab === 'videos') filtered = filtered.filter(l => l.sourceType === 'video');
    else if (activeTab === 'articles') filtered = filtered.filter(l => l.sourceType === 'article');

    // Difficulty
    if (difficultyFilter !== 'all') filtered = filtered.filter(l => l.difficulty === difficultyFilter);

    // Source
    if (sourceFilter === 'ai') filtered = filtered.filter(l => l.geminiGenerated);
    else if (sourceFilter === 'custom') filtered = filtered.filter(l => l.isCustom);
    else if (sourceFilter === 'curated') filtered = filtered.filter(l => l.createdBy === 'system');

    // Topic
    if (activeTopic !== 'all') {
      filtered = filtered.filter(l => l.tags?.some(t => t.toLowerCase() === activeTopic.toLowerCase()));
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        l.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'difficulty') {
      const diffScore = { beginner: 1, intermediate: 2, advanced: 3 };
      filtered.sort((a, b) => diffScore[a.difficulty] - diffScore[b.difficulty]);
    }

    setFilteredLessons(filtered);
  };

  const handleOpenLesson = async (lesson) => {
    try {
      const lessonId = typeof lesson._id === 'object' ? lesson._id.toString() : lesson._id;
      await api.post('/track/visit', { itemId: lessonId });
      navigate(`/learn/${lessonId}`);
    } catch (error) { }
  };

  // Helper styles
  const getBadgeStyle = (lesson) => {
    if (lesson.geminiGenerated) return { bg: 'linear-gradient(135deg, #059669, #10b981)', text: '🤖 AI Generated' };
    if (lesson.isCustom) return { bg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', text: '👤 Custom' };
    return { bg: 'linear-gradient(135deg, #4f46e5, #6366f1)', text: '📚 Curated' };
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  // Extract unique topics for pills
  const allTopics = Array.from(new Set(lessons.flatMap(l => l.tags || []))).slice(0, 8);

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = filteredLessons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: '#0a0a1e' }}>
        <div className='w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen relative overflow-hidden' style={{ background: '#0a0a1e' }}>

      {/* BACKGROUND ANIMATION (From Dashboard) */}
      <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        {/* Moving Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.2,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite'
        }} />

        {/* Glow Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full" />

        {/* Interactive Mouse Glow */}
        <div style={{
          position: 'absolute', left: mousePosition.x, top: mousePosition.y,
          width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none'
        }} />
      </div>

      <div className='relative z-10 max-w-7xl mx-auto p-8'>

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-3xl p-10 mb-12 relative overflow-hidden'
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full" />

          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <span className='px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold tracking-wider uppercase'>
                  🚀 Your Journey
                </span>
              </div>
              <h1 className='text-5xl font-black text-white mb-4 tracking-tight'>
                Learning Path
              </h1>
              <p className='text-lg text-gray-400 max-w-xl'>
                Master new skills with our AI-curated lessons. Track your progress, earn certificates, and level up your career.
              </p>
            </div>

            <div className='flex gap-4'>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className='px-6 py-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800 transition-all text-white font-bold flex items-center gap-2'
              >
                <Plus size={20} /> Import
              </button>
              <button
                onClick={handleGeneratePersonalized}
                disabled={isGenerating}
                className='px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 group'
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                {isGenerating ? <div className='animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full' /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                AI Personalize
              </button>
            </div>
          </div>
        </motion.div>

        {/* ROADMAP / CONTINUE LEARNING SECTION */}
        {inProgressList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-12'
          >
            <div className='flex items-center gap-3 mb-6'>
              <Zap className='text-yellow-400 fill-yellow-400' />
              <h2 className='text-2xl font-bold text-white'>Continue Learning</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {inProgressList.slice(0, 3).map((lesson, idx) => {
                const progress = userProgress[lesson._id];
                const pct = progress ? Math.round((progress.score || 0)) : 0;

                return (
                  <div key={lesson._id}
                    onClick={() => handleOpenLesson(lesson)}
                    className='group cursor-pointer rounded-2xl p-6 relative overflow-hidden transition-all hover:translate-y-[-5px]'
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000' />

                    <div className='flex justify-between items-start mb-4'>
                      <span className='text-xs font-bold px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'>
                        In Progress
                      </span>
                      <span className='text-white font-bold text-lg'>{pct}%</span>
                    </div>

                    <h3 className='text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors'>{lesson.title}</h3>
                    <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4'>
                      <div className='h-full bg-gradient-to-r from-indigo-500 to-purple-500' style={{ width: `${pct}%` }} />
                    </div>

                    <div className='flex items-center text-sm text-gray-400 gap-2'>
                      <Clock size={14} /> {lesson.estimatedTimeMin} min remaining
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className='sticky top-4 z-40 mb-8 space-y-4'>
          <div className='p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center shadow-2xl'
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Search */}
            <div className='relative flex-1 w-full'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-gray-800 transition-all'
              />
            </div>

            {/* Filters Row */}
            <div className='flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0'>
              <select
                value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}
                className='bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none font-semibold'
              >
                <option value="all">🌐 All Content</option>
                <option value="public">🔓 Public</option>
                <option value="private">🔒 Private</option>
              </select>

              <select
                value={sortOption} onChange={(e) => setSortOption(e.target.value)}
                className='bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none'
              >
                <option value="newest">✨ Newest First</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="difficulty">📈 Difficulty Level</option>
              </select>

              <select
                value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
                className='bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none'
              >
                <option value="all">All Types</option>
                <option value="videos">🎥 Videos</option>
                <option value="articles">📄 Articles</option>
              </select>
            </div>
          </div>

          {/* TOPIC PILLS */}
          <div className='flex flex-wrap gap-2 justify-center'>
            <button
              onClick={() => setActiveTopic('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTopic === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              All Topics
            </button>
            {allTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${activeTopic === topic ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-500'}`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        {paginatedLessons.length > 0 ? (
          <motion.div
            layout
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          >
            <AnimatePresence>
              {paginatedLessons.map((lesson, idx) => {
                const progress = userProgress[lesson._id];
                const isAdded = !!progress;
                const isCompleted = progress?.status === 'completed';
                const pct = progress ? progress.score : 0;

                return (
                  <motion.div
                    key={lesson._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className='group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full'
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={() => handleOpenLesson(lesson)}
                  >
                    {/* Hover Gradient Border */}
                    <div className='absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-500/50 transition-colors pointer-events-none z-20' />

                    {/* Header Badge Row */}
                    <div className='p-6 pb-0 flex justify-between items-start z-10'>
                      <span className='px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg'
                        style={{ background: getBadgeStyle(lesson).bg }}>
                        {getBadgeStyle(lesson).text}
                      </span>
                      <span className='flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700'>
                        {getDifficultyColor(lesson.difficulty) === '#4ade80' ? '🟢' : getDifficultyColor(lesson.difficulty) === '#fbbf24' ? '🟡' : '🔴'}
                        <span className='capitalize'>{lesson.difficulty}</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className='p-6 flex-1 flex flex-col z-10'>
                      <h3 className='text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors'>
                        {lesson.title}
                      </h3>
                      <p className='text-sm text-gray-400 line-clamp-2 mb-4 flex-1'>
                        {lesson.description || 'Start learning this topic now.'}
                      </p>

                      <div className='flex items-center gap-4 text-xs font-medium text-gray-500 mb-4'>
                        <span className='flex items-center gap-1'><Clock size={12} /> {lesson.estimatedTimeMin}m</span>
                        {progress?.timeSpentMin > 0 && (
                          <span className='flex items-center gap-1 text-indigo-400'>
                            ⏱️ {progress.timeSpentMin}m spent
                          </span>
                        )}
                        <span className='flex items-center gap-1'><Star size={12} className="text-yellow-500" /> {lesson.rating?.toFixed(1) || 'N/A'}</span>
                      </div>

                      {/* Progress Bar (if started) */}
                      {isAdded && (
                        <div className='mb-4'>
                          <div className='flex justify-between text-xs mb-1'>
                            <span className={isCompleted ? 'text-green-400' : 'text-indigo-400'}>
                              {isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                            <span className='text-white'>{pct}%</span>
                          </div>
                          <div className='w-full h-1.5 bg-gray-700 rounded-full overflow-hidden'>
                            <div
                              className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    <div className='p-4 border-t border-gray-700/50 bg-gray-900/30 z-10 mt-auto'>
                      {isAdded ? (
                        <button className='w-full py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2'>
                          {isCompleted ? 'Review Lesson' : 'Continue Learning'} <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddToProgress(e, lesson._id)}
                          className='w-full py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2'
                          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                        >
                          <Plus size={16} /> Add to Path
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className='text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800'>
            <div className='text-6xl mb-4 opacity-50'>🔍</div>
            <h3 className='text-2xl font-bold text-white mb-2'>No lessons found</h3>
            <p className='text-gray-400'>Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination (Simplified) */}
        {totalPages > 1 && (
          <div className='flex justify-center gap-2 mt-12'>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

      </div>

      <ImportLessonForm
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchLessons}
      />

      <style>{`
         @keyframes moveGrid {
             0% { transform: translate(0,0); }
             100% { transform: translate(50px, 50px); }
         }
      `}</style>
    </div>
  );
};

export default LearningPathPage;
