import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { GamificationContext } from '../context/GamificationContext';
import { AuthContext } from '../context/AuthContext';
import {
  Trophy, Flame, Target, BookOpen, Clock,
  Calendar, Star, Award, ChevronRight, Folder,
  Trash2, Move, Plus, Info, X
} from 'lucide-react';

// Badge Info Item Component
const BadgeInfoItem = ({ icon, name, desc }) => (
  <div className='flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50'>
    <span className='text-2xl'>{icon}</span>
    <div>
      <div className='font-semibold text-white'>{name}</div>
      <div className='text-sm text-gray-400'>{desc}</div>
    </div>
  </div>
);

const ProgressPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const gamification = useContext(GamificationContext);
  const stats = gamification?.stats || {};

  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [moveLesson, setMoveLesson] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activityData, setActivityData] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);

  useEffect(() => {
    fetchProgressList();
    fetchActivityHeatmap();
    fetchWeeklyActivity();
  }, []);

  // Refresh data when user navigates to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProgressList();
        fetchActivityHeatmap();
        fetchWeeklyActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchActivityHeatmap = async () => {
    try {
      const response = await api.get('/progress/activity-heatmap?days=30');
      if (response.data.success) {
        setActivityData(response.data.data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activity heatmap:', error);
    }
  };

  const fetchWeeklyActivity = async () => {
    try {
      const response = await api.get('/progress/weekly-activity');
      if (response.data.success) {
        setWeeklyActivity(response.data.data.weeklyActivity || []);
      }
    } catch (error) {
      console.error('Failed to load weekly activity:', error);
    }
  };

  const fetchProgressList = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/progress/my-list');
      if (response.data.success) {
        setProgressData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load progress list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromList = async (e, lessonId) => {
    e.stopPropagation();
    try {
      const response = await api.post('/progress/remove-from-list', { lessonId });
      if (response.data.success) {
        toast.success('Removed from list');
        fetchProgressList();
      }
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToCollection = async (lessonId, collection) => {
    try {
      const response = await api.post('/progress/move-to-collection', { lessonId, collection });
      if (response.data.success) {
        toast.success(`Moved to ${collection}`);
        fetchProgressList();
        setShowCollectionModal(false);
        setMoveLesson(null);
        setNewCollectionName('');
      }
    } catch (error) {
      toast.error('Failed to move');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{ background: '#0a0a1e' }}>
        <div className='w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  const collections = progressData?.collections || {};
  const collectionNames = Object.keys(collections);
  const displayedItems = selectedCollection === 'all'
    ? Object.values(collections).flat()
    : collections[selectedCollection] || [];

  const totalLessons = progressData?.totalLessons || 0;
  const completedCount = displayedItems.filter(p => p.status === 'completed').length;
  const inProgressCount = displayedItems.filter(p => p.status === 'in-progress').length;
  const totalTime = displayedItems.reduce((acc, curr) => acc + (curr.timeSpentMin || 0), 0);

  // Generate Activity Heatmap (Last 30 Days)
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (29 - i));
    return d;
  });

  return (
    <div className='min-h-screen relative overflow-hidden' style={{ background: '#0a0a1e' }}>

      {/* COSMIC BACKGROUND */}
      <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.2,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite'
        }} />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className='relative z-10 max-w-7xl mx-auto p-8'>

        {/* HEADER & GAMIFICATION STATS */}
        <div className='flex flex-col lg:flex-row justify-between items-end gap-8 mb-12'>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className='flex items-center gap-3 mb-2'>
              <div className='px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider'>
                Analytics Center
              </div>
            </div>
            <h1 className='text-5xl font-black text-white mb-2 leading-tight'>
              My Progress
            </h1>
            <p className='text-lg text-gray-400'>
              Track your growth, view your badges, and manage your collections.
            </p>
          </motion.div>

          {/* Gamification Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='flex gap-4'
          >
            <div className='bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4 min-w-[140px]'>
              <div className='p-3 bg-orange-500/20 rounded-xl'>
                <Flame className='text-orange-500' size={24} />
              </div>
              <div>
                <div className='text-2xl font-black text-white'>{stats.currentStreak || 0}</div>
                <div className='text-xs text-gray-400 font-bold uppercase'>Day Streak</div>
              </div>
            </div>

            <div className='bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4 min-w-[140px]'>
              <div className='p-3 bg-purple-500/20 rounded-xl'>
                <Trophy className='text-purple-500' size={24} />
              </div>
              <div>
                <div className='text-2xl font-black text-white'>{stats.level || 1}</div>
                <div className='text-xs text-gray-400 font-bold uppercase'>Level</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>

          {/* LEFT COLUMN: ACTIVITY & COLLECTIONS */}
          <div className='lg:col-span-2 space-y-8'>

            {/* 1. ACTIVITY HEATMAP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8'
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                  <Calendar size={20} className='text-indigo-400' /> Learning Activity
                </h2>
                <span className='text-sm text-gray-500'>Last 30 Days</span>
              </div>

              <div className='grid grid-cols-15 gap-2' style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
                {days.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const dayActivity = activityData.find(a => a.date === dateStr);
                  const active = dayActivity?.hasActivity || false;
                  const activityCount = dayActivity?.count || 0;
                  
                  return (
                    <div key={i} className='group relative'>
                      <div
                        className={`w-8 h-8 rounded-md transition-all ${
                          active 
                            ? 'bg-green-500 shadow-lg shadow-green-500/20 scale-100' 
                            : 'bg-gray-800 border border-gray-700 scale-90'
                        }`}
                      />
                      {/* Tooltip */}
                      <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20'>
                        {d.toLocaleDateString()}
                        {active && ` - ${activityCount} activity`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* 2. COLLECTION MANAGER */}
            <div className='flex flex-col md:flex-row gap-6 items-start'>

              {/* Collection Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className='w-full md:w-64 bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-4 flex flex-col gap-2'
              >
                <div className='px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest'>Collections</div>

                <button
                  onClick={() => setSelectedCollection('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${selectedCollection === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                  <Folder size={18} /> All Items
                </button>

                {collectionNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedCollection(name)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${selectedCollection === name ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
                  >
                    <span className='opacity-50'>📁</span> {name}
                    <span className='ml-auto text-xs opacity-50 bg-black/20 px-2 py-0.5 rounded-full'>{collections[name].length}</span>
                  </button>
                ))}

                <button
                  className='w-full text-left px-4 py-3 rounded-xl font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center gap-3 mt-2 border border-indigo-500/20 border-dashed'
                  onClick={() => toast('Collection creation happens when moving items!')}
                >
                  <Plus size={18} /> New Collection
                </button>
              </motion.div>

              {/* Lesson Grid */}
              <div className='flex-1 w-full'>
                {displayedItems.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <AnimatePresence mode='popLayout'>
                      {displayedItems.map((progress, idx) => (
                        <motion.div
                          key={progress._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => navigate(`/learn/${progress.lesson?._id}`)}
                          className='group bg-gray-800/40 backdrop-blur-lg border border-gray-700 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1'
                        >
                          <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity' />

                          <div className='flex justify-between items-start mb-3'>
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${progress.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                              {progress.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                            <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <button
                                className='p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white'
                                onClick={(e) => { e.stopPropagation(); setMoveLesson(progress.lesson._id); setShowCollectionModal(true); }}
                              >
                                <Move size={14} />
                              </button>
                              <button
                                className='p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400'
                                onClick={(e) => handleRemoveFromList(e, progress.lesson._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <h3 className='font-bold text-white mb-2 line-clamp-1'>{progress.lesson?.title}</h3>

                          <div className='mb-3'>
                            <div className='flex justify-between text-xs text-gray-400 mb-1'>
                              <span>Progress</span>
                              <span>{progress.score || 0}%</span>
                            </div>
                            <div className='w-full h-1.5 bg-gray-700 rounded-full overflow-hidden'>
                              <div className='h-full bg-indigo-500' style={{ width: `${progress.score || 0}%` }} />
                            </div>
                          </div>

                          <div className='flex items-center gap-3 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'><Clock size={12} /> {progress.timeSpentMin}m</span>
                            {progress.lesson?.rating && <span className='flex items-center gap-1'><Star size={12} className='text-yellow-500' /> {progress.lesson.rating}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className='h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-800/30 rounded-3xl border border-dashed border-gray-700'>
                    <div className='w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl'>📂</div>
                    <h3 className='text-xl font-bold text-white mb-2'>This collection is empty</h3>
                    <p className='text-gray-400 max-w-sm mb-6'>Start adding lessons to build your personal library.</p>
                    <button onClick={() => navigate('/learning-path')} className='px-6 py-2 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-500'>
                      Explore Lessons
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STATS & BADGES */}
          <div className='space-y-6'>

            {/* Weekly Focus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className='bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6'
            >
              <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                <Target className='text-indigo-400' size={20} /> Weekly Focus
              </h2>
              <div className='flex items-end gap-2 h-32 mb-4'>
                {weeklyActivity.length > 0 ? weeklyActivity.map((d, i) => {
                  // Calculate height with minimum visibility and better scaling
                  const maxTime = Math.max(...weeklyActivity.map(day => day.mins), 60); // At least 60 min scale
                  const heightPercent = d.mins > 0 
                    ? Math.max(10, (d.mins / maxTime) * 100) // Minimum 10% if there's any time
                    : 5; // 5% for empty days
                  
                  return (
                    <div key={i} className='flex-1 flex flex-col justify-end items-center gap-1 group'>
                      <div
                        className={`w-full rounded-t-lg transition-all relative ${
                          d.mins > 0 
                            ? 'bg-indigo-500/50 group-hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                            : 'bg-gray-700/30 border border-gray-600/20'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'>
                          {d.mins}m on {d.day}
                        </div>
                      </div>
                      <div className='text-center text-[10px] text-gray-400 font-bold'>{d.mins}m</div>
                      <div className='text-center text-xs text-gray-500 font-bold'>{d.day.charAt(0)}</div>
                    </div>
                  );
                }) : (
                  <div className='w-full text-center text-gray-500 py-8'>
                    No activity data yet
                  </div>
                )}
              </div>
              <div className='flex justify-between items-center bg-black/20 rounded-xl p-4'>
                <div>
                  <div className='text-xs text-gray-400'>Total Time</div>
                  <div className='text-xl font-bold text-white'>{totalTime}m</div>
                </div>
                <div className='h-8 w-[1px] bg-gray-700' />
                <div>
                  <div className='text-xs text-gray-400'>Completed</div>
                  <div className='text-xl font-bold text-white'>{completedCount}</div>
                </div>
              </div>
            </motion.div>

            {/* Badges Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className='bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-6'
            >
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-white flex items-center gap-2'>
                  <Award className='text-yellow-400' size={20} /> Badges
                </h2>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setShowBadgeInfo(true)}
                    className='text-blue-400 hover:text-blue-300 transition-colors'
                    title='View all badges'
                  >
                    <Info size={18} />
                  </button>
                  <span className='text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full'>
                    {stats.badges ? Array.from(new Map(stats.badges.map(b => [b.id, b])).values()).length : 0} Unlocked
                  </span>
                </div>
              </div>

              {stats.badges && stats.badges.length > 0 ? (
                <div className='grid grid-cols-4 gap-2'>
                  {Array.from(new Map(stats.badges.map(b => [b.id, b])).values()).map((badge) => (
                    <div key={badge.id} className='aspect-square bg-gray-800/50 rounded-xl flex items-center justify-center text-2xl border border-gray-700 hover:border-yellow-500/50 transition-colors cursor-help group relative'>
                      {badge.icon}
                      <div className='absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded-xl text-xs z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl'>
                        <div className='font-bold text-white mb-1'>{badge.name}</div>
                        <div className='text-gray-400'>{badge.description}</div>
                      </div>
                    </div>
                  ))}
                  {/* Empty slots placeholders */}
                  {[...Array(Math.max(0, 8 - (Array.from(new Map(stats.badges.map(b => [b.id, b])).values()).length)))].map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square bg-gray-800/20 rounded-xl flex items-center justify-center text-gray-700 border border-gray-800/50'>
                      <div className='w-8 h-8 rounded-full bg-gray-800/50' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  Complete lessons to earn badges!
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>

      {/* Badge Info Modal */}
      {showBadgeInfo && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' onClick={() => setShowBadgeInfo(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-gray-900 border border-purple-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-2xl font-bold text-white flex items-center gap-2'>
                <Award className='text-yellow-400' size={24} />
                All Badges & How to Earn Them
              </h3>
              <button
                onClick={() => setShowBadgeInfo(false)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <X size={24} />
              </button>
            </div>
            
            <div className='space-y-6'>
              {/* Learning Progress Badges */}
              <div>
                <h4 className='text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2'>
                  📚 Learning Progress Badges
                </h4>
                <div className='grid gap-3'>
                  <BadgeInfoItem icon='🎓' name='First Steps' desc='Complete your first lesson' />
                  <BadgeInfoItem icon='📚' name='Getting Started' desc='Complete 5 lessons' />
                  <BadgeInfoItem icon='📖' name='Knowledge Seeker' desc='Complete 25 lessons' />
                  <BadgeInfoItem icon='🎖️' name='Scholar' desc='Complete 100 lessons' />
                </div>
              </div>

              {/* Quiz Achievement Badges */}
              <div>
                <h4 className='text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2'>
                  🎯 Quiz Achievement Badges
                </h4>
                <div className='grid gap-3'>
                  <BadgeInfoItem icon='🎯' name='Quiz Starter' desc='Complete your first quiz' />
                  <BadgeInfoItem icon='💯' name='Perfect Score' desc='Get 100% on any quiz' />
                  <BadgeInfoItem icon='🏆' name='Quiz Master' desc='Complete 10 quizzes' />
                  <BadgeInfoItem icon='🧠' name='Self-Aware' desc='Complete the knowledge assessment' />
                </div>
              </div>

              {/* Streak Badges */}
              <div>
                <h4 className='text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2'>
                  🔥 Streak Badges
                </h4>
                <div className='grid gap-3'>
                  <BadgeInfoItem icon='🔥' name='On Fire' desc='Maintain a 3-day learning streak' />
                  <BadgeInfoItem icon='⚡' name='Week Warrior' desc='Maintain a 7-day learning streak' />
                  <BadgeInfoItem icon='🌟' name='Dedicated Learner' desc='Maintain a 30-day learning streak' />
                </div>
              </div>

              {/* Level & XP Badges */}
              <div>
                <h4 className='text-lg font-semibold text-green-400 mb-3 flex items-center gap-2'>
                  📊 Level & XP Badges
                </h4>
                <div className='grid gap-3'>
                  <BadgeInfoItem icon='⭐' name='Rising Star' desc='Reach level 5' />
                  <BadgeInfoItem icon='💎' name='Expert' desc='Reach level 10' />
                  <BadgeInfoItem icon='🎮' name='XP Hunter' desc='Earn 1000 total XP' />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <div className='bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl'>
            <h3 className='text-xl font-bold text-white mb-4'>Move to Collection</h3>

            <div className='space-y-2 mb-4 max-h-48 overflow-y-auto'>
              {collectionNames.map(name => (
                <button
                  key={name}
                  onClick={() => handleMoveToCollection(moveLesson, name)}
                  className='w-full text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition'
                >
                  📁 {name}
                </button>
              ))}
            </div>

            <div className='border-t border-gray-800 pt-4'>
              <p className='text-xs text-gray-500 mb-2 uppercase font-bold'>Create New</p>
              <div className='flex gap-2'>
                <input
                  type="text"
                  placeholder="Collection Name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className='flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500'
                />
                <button
                  onClick={() => handleMoveToCollection(moveLesson, newCollectionName)}
                  disabled={!newCollectionName.trim()}
                  className='bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold'
                >
                  Create
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCollectionModal(false)}
              className='mt-4 w-full py-2 text-gray-500 hover:text-white transition'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
         @keyframes moveGrid {
             0% { transform: translate(0,0); }
             100% { transform: translate(50px, 50px); }
         }
      `}</style>
    </div>
  );
};

export default ProgressPage;
