import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AdminSetup = () => {
  // Navigation hooks
  const navigate = useNavigate();
  
  // State variables
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        
        if (user.role === 'admin') {
          toast.success('Admin account created successfully!');
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1000);
        } else {
          toast.error('Failed to create admin account');
        }
      } else {
        toast.error(response.data.message || 'Setup failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='rounded-2xl p-8 w-full max-w-md'
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)'
        }}
      >
        <div className='text-center mb-8'>
          <div className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}>
            <span className='text-white text-2xl font-bold'>👤</span>
          </div>
          <h1 className='text-3xl font-bold mb-2' style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
            WebkitBackdropClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Create Admin Account
          </h1>
          <p className='text-gray-400'>
            Set up the first administrator account for LearnIT
          </p>
          <div className='mt-4 p-3 rounded-lg' style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <p className='text-sm text-indigo-300'>
              ⚠️ This is a one-time setup. The first account will have admin privileges.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Full Name
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 rounded-lg outline-none transition'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#e0e7ff'
              }}
              onFocus={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.2)'}
              placeholder='John Doe'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Email Address
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 rounded-lg outline-none transition'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#e0e7ff'
              }}
              onFocus={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.2)'}
              placeholder='admin@learnit.com'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Password
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className='w-full px-4 py-3 rounded-lg outline-none transition'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#e0e7ff'
              }}
              onFocus={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.2)'}
              placeholder='••••••••'
            />
            <p className='text-xs text-gray-400 mt-1'>Minimum 6 characters</p>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Confirm Password
            </label>
            <input
              type='password'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className='w-full px-4 py-3 rounded-lg outline-none transition'
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#e0e7ff'
              }}
              onFocus={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(99, 102, 241, 0.2)'}
              placeholder='••••••••'
            />
          </div>
          
          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-6'
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)')}
            onMouseLeave={(e) => (e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)')}
          >
            {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSetup;







