import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { GamificationContext } from '../context/GamificationContext';
import { Award } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const gamification = useContext(GamificationContext);
  const stats = gamification?.stats || {};
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    interests: [],
    learning_goals: []
  });
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // New interest/goal input
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        interests: Array.isArray(user.interests) ? user.interests : [],
        learning_goals: Array.isArray(user.learning_goals) ? user.learning_goals : []
      });
    }
  }, [user]);
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        // Update context with new user data
        setUser(response.data.data);
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };
  
  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim().toLowerCase())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim().toLowerCase()]
      });
      setNewInterest('');
    }
  };
  
  const removeInterest = (interest) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };
  
  const addGoal = () => {
    if (newGoal.trim() && !profileData.learning_goals.includes(newGoal.trim())) {
      setProfileData({
        ...profileData,
        learning_goals: [...profileData.learning_goals, newGoal.trim()]
      });
      setNewGoal('');
    }
  };
  
  const removeGoal = (goal) => {
    setProfileData({
      ...profileData,
      learning_goals: profileData.learning_goals.filter(g => g !== goal)
    });
  };
  
  const generateAILessons = async () => {
    if (!user.interests || user.interests.length === 0) {
      toast.error('Please add interests first to generate personalized lessons');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/lessons/generate/personalized');
      
      if (response.data.success) {
        const count = response.data.data?.generatedCount || 0;
        toast.success(`Successfully generated ${count} personalized lessons! Check your Learning Path.`);
      } else {
        toast.error(response.data.message || 'Failed to generate lessons');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate AI lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='min-h-screen py-8 px-6'>
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold mb-2' style={{
            backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            My Profile
          </h1>
          <p className='text-gray-400'>Manage your account and learning preferences</p>
        </motion.div>
        
        {/* Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message.text}
          </motion.div>
        )}
        
        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='rounded-xl p-6 mb-6'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-white'>Basic Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className='px-4 py-2 rounded-lg font-medium transition-all'
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: 'white'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          <form onSubmit={handleProfileUpdate}>
            {/* Name */}
            <div className='mb-6'>
              <label className='block text-gray-300 mb-2 font-medium'>Name</label>
              {isEditing ? (
                <input
                  type='text'
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className='w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  required
                />
              ) : (
                <p className='text-white text-lg'>{user?.name}</p>
              )}
            </div>
            
            {/* Email (Read-only) */}
            <div className='mb-6'>
              <label className='block text-gray-300 mb-2 font-medium'>Email</label>
              <p className='text-gray-400'>{user?.email}</p>
            </div>
            
            {/* Role (Read-only) */}
            <div className='mb-6'>
              <label className='block text-gray-300 mb-2 font-medium'>Role</label>
              <span className='inline-block px-3 py-1 rounded-full text-sm font-semibold'
                style={{
                  background: user?.role === 'admin' 
                    ? 'rgba(168, 85, 247, 0.2)' 
                    : 'rgba(99, 102, 241, 0.2)',
                  color: user?.role === 'admin' ? '#a855f7' : '#6366f1',
                  border: `1px solid ${user?.role === 'admin' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                }}
              >
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
            
            {/* Interests */}
            <div className='mb-6'>
              <label className='block text-gray-300 mb-2 font-medium'>
                Interests <span className='text-sm text-gray-500'>(helps personalize recommendations)</span>
              </label>
              
              {isEditing && (
                <div className='flex gap-2 mb-3'>
                  <input
                    type='text'
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    placeholder='e.g., react, javascript, python'
                    className='flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  />
                  <button
                    type='button'
                    onClick={addInterest}
                    className='px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white'
                  >
                    Add
                  </button>
                </div>
              )}
              
              <div className='flex flex-wrap gap-2'>
                {profileData.interests.length > 0 ? (
                  profileData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 rounded-full text-sm flex items-center gap-2'
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      {interest}
                      {isEditing && (
                        <button
                          type='button'
                          onClick={() => removeInterest(interest)}
                          className='text-red-400 hover:text-red-300'
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className='text-gray-500'>No interests added yet</p>
                )}
              </div>
            </div>
            
            {/* Learning Goals */}
            <div className='mb-6'>
              <label className='block text-gray-300 mb-2 font-medium'>
                Learning Goals <span className='text-sm text-gray-500'>(what you want to achieve)</span>
              </label>
              
              {isEditing && (
                <div className='flex gap-2 mb-3'>
                  <input
                    type='text'
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    placeholder='e.g., master react, build full-stack apps'
                    className='flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  />
                  <button
                    type='button'
                    onClick={addGoal}
                    className='px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white'
                  >
                    Add
                  </button>
                </div>
              )}
              
              <div className='flex flex-wrap gap-2'>
                {profileData.learning_goals.length > 0 ? (
                  profileData.learning_goals.map((goal, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 rounded-full text-sm flex items-center gap-2'
                      style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#e9d5ff',
                        border: '1px solid rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      {goal}
                      {isEditing && (
                        <button
                          type='button'
                          onClick={() => removeGoal(goal)}
                          className='text-red-400 hover:text-red-300'
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className='text-gray-500'>No learning goals added yet</p>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className='flex gap-3'>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-3 rounded-lg font-medium transition-all'
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData({
                      name: user?.name || '',
                      interests: user?.interests || [],
                      learning_goals: user?.learning_goals || []
                    });
                  }}
                  className='px-6 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all'
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
          
          {/* Generate AI Lessons Button */}
          {!isEditing && (user?.interests?.length > 0 || user?.learning_goals?.length > 0) && (
            <div className='mt-6 pt-6 border-t border-gray-700'>
              <div className='flex items-start gap-4'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    🤖 AI-Powered Learning
                  </h3>
                  <p className='text-gray-400 text-sm mb-4'>
                    Generate personalized lessons using Gemini AI based on your interests and learning goals. 
                    The AI will find relevant resources tailored specifically for you.
                  </p>
                </div>
              </div>
              <button
                onClick={generateAILessons}
                disabled={loading}
                className='w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed'
                style={{
                  background: loading ? '#4b5563' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: 'white',
                  boxShadow: loading ? 'none' : '0 4px 15px 0 rgba(16, 185, 129, 0.3)'
                }}
              >
                {loading ? '🔄 Generating AI Lessons...' : '✨ Generate AI-Personalized Lessons'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='rounded-xl p-6 mb-6'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}
        >
          <h2 className='text-2xl font-semibold text-white mb-4 flex items-center gap-2'>
            <Award className='text-yellow-400' size={24} />
            My Badges
          </h2>
          <p className='text-gray-400 text-sm mb-4'>
            {stats.badges ? Array.from(new Map(stats.badges.map(b => [b.id, b])).values()).length : 0} badges unlocked • Keep learning to earn more!
          </p>

          {stats.badges && stats.badges.length > 0 ? (
            <div className='max-h-96 overflow-y-auto pr-2 custom-scrollbar'>
              <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2'>
                {Array.from(new Map(stats.badges.map(b => [b.id, b])).values()).map((badge) => (
                  <div
                    key={badge.id}
                    className='aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center text-xl border border-gray-700 hover:border-purple-500/50 transition-colors cursor-help group relative'
                  >
                    {badge.icon}
                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 border border-purple-500/50 rounded-xl text-xs z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl'>
                      <div className='font-bold text-white mb-1'>{badge.name}</div>
                      <div className='text-gray-400'>{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <Award className='mx-auto mb-3 text-gray-600' size={48} />
              <p>No badges earned yet</p>
              <p className='text-sm mt-1'>Complete lessons and quizzes to earn your first badge!</p>
            </div>
          )}
        </motion.div>
        
        {/* Change Password Card */}
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
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-white'>Security</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className='px-4 py-2 rounded-lg font-medium transition-all bg-slate-700 hover:bg-slate-600 text-white'
              >
                Change Password
              </button>
            )}
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange}>
              <div className='mb-4'>
                <label className='block text-gray-300 mb-2 font-medium'>Current Password</label>
                <input
                  type='password'
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className='w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-gray-300 mb-2 font-medium'>New Password</label>
                <input
                  type='password'
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className='w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  required
                />
              </div>
              
              <div className='mb-6'>
                <label className='block text-gray-300 mb-2 font-medium'>Confirm New Password</label>
                <input
                  type='password'
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className='w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500'
                  required
                />
              </div>
              
              <div className='flex gap-3'>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-3 rounded-lg font-medium transition-all'
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage({ type: '', text: '' });
                  }}
                  className='px-6 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all'
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
