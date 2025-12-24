import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import XPBar from './XPBar';
import StreakCounter from './StreakCounter';
import NotificationPanel from './NotificationPanel';
import api from '../lib/api';

const NavBar = () => {
  // Context hooks first
  const { user, logout } = useContext(AuthContext);

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        if (response.data.success) {
          setUnreadCount(response.data.data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    if (user) fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Event handlers
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)'
      }}
      className='sticky top-0 z-50'
    >
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo/Brand */}
          <Link to='/' className='flex items-center gap-3 group'>
            <div className='relative'>
              <img src={logo} alt='LearnIT Logo' className='w-10 h-10 rounded-lg object-contain transition-transform group-hover:scale-110' />
              <div
                className='absolute inset-0 rounded-lg blur-xl transition-opacity opacity-0 group-hover:opacity-30'
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)'
                }}
              ></div>
            </div>
            <span
              className='text-2xl font-bold'
              style={{
                backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              LearnIT
            </span>
            {user.role === 'admin' && (
              <span
                className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full`}
                style={{
                  background: user.isSuperAdmin
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2))'
                    : 'rgba(168, 85, 247, 0.2)',
                  color: user.isSuperAdmin ? '#fde047' : '#a855f7',
                  border: user.isSuperAdmin ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {user.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
              </span>
            )}
          </Link>

          {/* Navigation Links */}
          <div className='flex items-center gap-6'>
            {user.role === 'admin' ? (
              <>
                <Link
                  to='/admin/dashboard'
                  className={`font-medium transition-all relative ${isActive('/admin/dashboard')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Dashboard
                  {isActive('/admin/dashboard') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
                <Link
                  to='/admin/lessons'
                  className={`font-medium transition-all relative ${isActive('/admin/lessons')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Lessons
                  {isActive('/admin/lessons') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
                <Link
                  to='/admin/users'
                  className={`font-medium transition-all relative ${isActive('/admin/users')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Users
                  {isActive('/admin/users') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to='/dashboard'
                  className={`font-medium transition-all relative ${isActive('/dashboard')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Dashboard
                  {isActive('/dashboard') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
                <Link
                  to='/learning-path'
                  className={`font-medium transition-all relative ${isActive('/learning-path')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Learning Path
                  {isActive('/learning-path') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
                <Link
                  to='/progress'
                  className={`font-medium transition-all relative ${isActive('/progress')
                    ? 'text-cyan-400'
                    : 'text-gray-300 hover:text-purple-400'
                    }`}
                >
                  Progress
                  {isActive('/progress') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)'
                      }}
                    />
                  )}
                </Link>
                <Link
                  to='/skill-tree'
                  className={`font-medium transition-all relative ${isActive('/skill-tree') ? 'text-cyan-400' : 'text-gray-300 hover:text-purple-400'
                    }`}
                  title="Skill Tree"
                >
                  Tree
                  {isActive('/skill-tree') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)' }}
                    />
                  )}
                </Link>
                <Link
                  to='/leaderboard'
                  className={`font-medium transition-all relative ${isActive('/leaderboard') ? 'text-cyan-400' : 'text-gray-300 hover:text-purple-400'
                    }`}
                  title="Leaderboard"
                >
                  Rank
                  {isActive('/leaderboard') && (
                    <motion.div
                      layoutId='activeLink'
                      className='absolute -bottom-1 left-0 right-0 h-0.5'
                      style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)' }}
                    />
                  )}
                </Link>
              </>
            )}

            {/* Gamification Stats */}
            {!user.role && (
              <div className="flex items-center gap-3 ml-2 max-lg:hidden">
                <StreakCounter showLabel={false} />
                <XPBar />
              </div>
            )}

            {/* User Menu */}
            <div
              className='flex items-center gap-4 ml-4 pl-4'
              style={{ borderLeft: '1px solid rgba(99, 102, 241, 0.2)' }}
            >
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition relative"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel
                  isOpen={showNotifications}
                  onClose={() => { setShowNotifications(false); setUnreadCount(0); }}
                />
              </div>
              <Link
                to='/profile'
                className='font-medium max-md:hidden text-gray-300 hover:text-white transition-colors'
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className='px-4 py-2 rounded-lg font-medium transition-all'
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
