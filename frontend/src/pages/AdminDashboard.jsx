import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  Users, BookOpen, Layers, Activity, Server, Database,
  TrendingUp, Clock, Shield, Command, Search, Send
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    totalCourses: 0,
    activeUsers: 0,
    systemLoad: 0,
    activityTrend: []
  });
  const [health, setHealth] = useState({
    api: 'Unknown',
    database: 'Unknown',
    dbResponseTime: '0ms',
    memoryUsage: '0MB',
    uptime: '0h 0m'
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    icon: '📢',
    sendToAll: true
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchStats();

    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const [statsRes, healthRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/health'),
        api.get('/admin/users') // Keeping this for the user table
      ]);

      if (statsRes.data.success) {
        setStats(prev => ({
          ...prev,
          ...statsRes.data.data
        }));
      }

      if (healthRes.data.success) {
        setHealth(healthRes.data.data);
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (error) {
      console.error('Dashboard sync failed:', error);
      toast.error('Failed to sync dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      const loadingToast = toast.loading('Flushing server cache...');
      const res = await api.post('/admin/cache/flush');
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        toast.success('Cache flushed successfully! 🚀');
        await fetchStats(); // Refresh stats
      } else {
        toast.error(res.data.message || 'Failed to flush cache');
      }
    } catch (error) {
      toast.error('Error flushing cache');
    }
  };

  const handleCreateLesson = () => {
    navigate('/admin/add-content');
  };

  const handleManageRoles = () => {
    navigate('/admin/users');
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in title and message');
      return;
    }

    try {
      const loadingToast = toast.loading('Sending notification...');
      const res = await api.post('/notifications/create', {
        userIds: 'all',
        title: notificationForm.title,
        message: notificationForm.message,
        icon: notificationForm.icon,
        type: 'system'
      });
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        toast.success(`Notification sent to ${res.data.data.count} users! 🎉`);
        setShowNotificationModal(false);
        setNotificationForm({ title: '', message: '', icon: '📢', sendToAll: true });
      } else {
        toast.error(res.data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.error('Error sending notification');
    }
  };

  // Mock Data is NOT used anymore for charts, using real stats.activityTrend

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a1e]'>
        <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
        <div className='text-sm font-bold text-indigo-400 tracking-widest uppercase'>Initializing Command Center...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-6 relative overflow-hidden' style={{ background: '#0a0a1e' }}>
      {/* COSMIC BACKGROUND */}
      <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full" />
        <div style={{
          position: 'absolute', left: mousePosition.x, top: mousePosition.y,
          width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%)',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none'
        }} />
      </div>

      <div className='max-w-[1600px] mx-auto relative z-10'>
        {/* TOP BAR */}
        <div className='flex flex-col md:flex-row justify-between items-center mb-10 gap-6'>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className='flex items-center gap-3 mb-1'>
              <div className='p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30'>
                <Command className='text-white' size={24} />
              </div>
              <div>
                <h1 className='text-2xl font-black text-white tracking-wide'>COMMAND CENTER</h1>
                <p className='text-xs font-bold text-indigo-400 uppercase tracking-widest'>LearnIT Administration v2.0</p>
              </div>
            </div>
          </motion.div>

          <div className='flex items-center gap-4 w-full md:w-auto'>
            <div className='relative flex-1 md:w-80'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={16} />
              <input
                type='text'
                placeholder='Search users, logs, or settings...'
                className='w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:border-indigo-500 outline-none transition-all'
              />
            </div>
            <div className='flex items-center gap-3 pl-4 border-l border-white/10'>
              <div className='text-right hidden md:block'>
                <div className='text-xs font-bold text-white'>{user.name}</div>
                <div className='text-[10px] font-bold text-emerald-400 uppercase'>System Admin</div>
              </div>
              <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white'>
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
          {/* STAT CARDS */}
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo', increase: '+Live' },
            { label: 'Total Lessons', value: stats.totalLessons, icon: BookOpen, color: 'blue', increase: '+Live' },
            { label: 'Courses Active', value: stats.totalCourses, icon: Layers, color: 'purple', increase: '+Live' },
            { label: 'System Load', value: `${stats.systemLoad || 0}%`, icon: Activity, color: 'emerald', increase: 'Stable' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className='bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all'
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-all`} />

              <div className='flex justify-between items-start mb-4'>
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-400`}>
                  <stat.icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.increase.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.increase}
                </span>
              </div>
              <div className='text-3xl font-black text-white mb-1'>{stat.value}</div>
              <div className='text-xs font-bold text-gray-500 uppercase tracking-wide'>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* MAIN CHART SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className='lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-96 relative overflow-hidden'
          >
            <div className='flex justify-between items-center mb-8'>
              <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                <TrendingUp size={20} className='text-indigo-400' /> User Registration Trends (15 Days)
              </h3>
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
                <span className='text-[10px] text-green-400 font-bold uppercase tracking-widest'>Real-time</span>
              </div>
            </div>

            {/* SVG Chart Visualization */}
            <div className='absolute bottom-0 left-0 right-0 h-64 px-6 flex items-end justify-between gap-2'>
              {stats.activityTrend && stats.activityTrend.length > 0 ? (
                stats.activityTrend.map((val, i) => {
                  const maxVal = Math.max(...stats.activityTrend, 1);
                  const heightPct = (val / maxVal) * 80 + 10; // scale to 10-90%
                  return (
                    <div key={i} className='w-full bg-slate-800/30 rounded-t-lg relative group h-full flex items-end'>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 1, delay: 0.1 + (i * 0.05) }}
                        className='w-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-lg relative'
                      >
                        <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20'>
                          {val} signups
                        </div>
                      </motion.div>
                    </div>
                  );
                })
              ) : (
                <div className="flex w-full h-full items-center justify-center text-gray-500">No recent activity data</div>
              )}
            </div>
            {/* Grid Lines */}
            <div className='absolute inset-0 pointer-events-none' style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100% 20%' }}></div>

          </motion.div>

          {/* SYSTEM HEALTH */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className='bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-96 overflow-y-auto custom-scrollbar'
          >
            <h3 className='text-lg font-bold text-white flex items-center gap-2 mb-6'>
              <Shield size={20} className='text-emerald-400' /> System Diagnostics
            </h3>
            <div className='space-y-4'>
              <div className='p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Server size={18} className='text-emerald-400' />
                  <div>
                    <div className='text-sm font-bold text-white'>API Server</div>
                    <div className='text-xs text-emerald-400'>{health.api}</div>
                  </div>
                </div>
                <div className='text-xs font-mono text-gray-500'>Online</div>
              </div>

              <div className='p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Database size={18} className='text-emerald-400' />
                  <div>
                    <div className='text-sm font-bold text-white'>MongoDB Cluster</div>
                    <div className={`text-xs ${health.database === 'Healthy' ? 'text-emerald-400' : 'text-red-400'}`}>{health.database}</div>
                  </div>
                </div>
                <div className='text-xs font-mono text-gray-500'>Primary</div>
              </div>

              <div className='p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Clock size={18} className='text-cyan-400' />
                  <div>
                    <div className='text-sm font-bold text-white'>Uptime</div>
                    <div className='text-xs text-cyan-400'>{health.uptime}</div>
                  </div>
                </div>
                <div className='text-xs font-mono text-gray-500'>Live</div>
              </div>

              <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                <div className='flex items-center gap-3 mb-2'>
                  <Activity size={18} className='text-yellow-400' />
                  <div className='text-sm font-bold text-white'>Performance</div>
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-400'>DB Response</span>
                    <span className='text-yellow-400 font-mono'>{health.dbResponseTime}</span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-gray-400'>Memory</span>
                    <span className='text-yellow-400 font-mono'>{health.memoryUsage}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* RECENT USERS TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
          >
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-bold text-white'>Recent Registrations</h3>
              <button onClick={() => navigate('/admin/users')} className='text-xs font-bold text-indigo-400 hover:text-indigo-300'>View All</button>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='text-left border-b border-white/10'>
                    <th className='pb-3 text-xs font-black text-gray-500 uppercase tracking-widest pl-2'>User</th>
                    <th className='pb-3 text-xs font-black text-gray-500 uppercase tracking-widest'>Status</th>
                    <th className='pb-3 text-xs font-black text-gray-500 uppercase tracking-widest'>Date</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  {users.slice(0, 5).map((user, i) => (
                    <tr key={i} className='border-b border-white/5 hover:bg-white/5 transition-colors'>
                      <td className='py-3 pl-2'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-300'>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className='font-bold text-white'>{user.name}</div>
                            <div className='text-xs text-gray-500'>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className='py-3'>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className='py-3 text-gray-400 font-mono text-xs'>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6'
          >
            <h3 className='text-lg font-bold text-white mb-6'>Deployment Controls</h3>
            <div className='space-y-3'>
              <button 
                onClick={handleCreateLesson}
                className='w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-indigo-500/50 transition-all flex items-center gap-4 group text-left'
              >
                <div className='p-2 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:scale-110 transition-transform'><BookOpen size={20} /></div>
                <div>
                  <div className='font-bold text-white'>Create Lesson</div>
                  <div className='text-xs text-gray-400'>Add new content to library</div>
                </div>
              </button>
              <button 
                onClick={handleManageRoles}
                className='w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-indigo-500/50 transition-all flex items-center gap-4 group text-left'
              >
                <div className='p-2 bg-purple-500/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform'><Users size={20} /></div>
                <div>
                  <div className='font-bold text-white'>Manage Users</div>
                  <div className='text-xs text-gray-400'>Update user permissions & roles</div>
                </div>
              </button>
              <button 
                onClick={handleFlushCache}
                className='w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-pink-500/50 transition-all flex items-center gap-4 group text-left'
              >
                <div className='p-2 bg-pink-500/20 text-pink-400 rounded-lg group-hover:scale-110 transition-transform'><Server size={20} /></div>
                <div>
                  <div className='font-bold text-white'>Flush Cache</div>
                  <div className='text-xs text-gray-400'>Clear server temporary data</div>
                </div>
              </button>
              <button 
                onClick={() => setShowNotificationModal(true)}
                className='w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-emerald-500/50 transition-all flex items-center gap-4 group text-left'
              >
                <div className='p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform'><Send size={20} /></div>
                <div>
                  <div className='font-bold text-white'>Send Notification</div>
                  <div className='text-xs text-gray-400'>Broadcast message to all users</div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full'
          >
            <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-2'>
              <Send className='text-emerald-400' size={24} />
              Send Notification
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Icon</label>
                <div className='flex gap-2'>
                  {['\ud83d\udce2', '\ud83c\udf89', '\u2728', '\ud83d\udd14', '\ud83d\udca1', '\u26a0\ufe0f'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNotificationForm({ ...notificationForm, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg border transition ${
                        notificationForm.icon === emoji
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Title</label>
                <input
                  type='text'
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder='e.g., New Feature Released!'
                  className='w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-400 mb-2'>Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder='Write your message here...'
                  rows={4}
                  className='w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className='flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  className='flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2'
                >
                  <Send size={18} />
                  Send to All Users
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
