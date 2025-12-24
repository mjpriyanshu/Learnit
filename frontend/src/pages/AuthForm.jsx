import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const AuthForm = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password, formData.role);
      }

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error already handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', role: 'student' });
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (response.data.success) {
        toast.success(response.data.message);
        // In a real app, the token would be sent via email
        // For demo purposes, we're showing the reset form
        if (response.data.data?.resetToken) {
          setResetToken(response.data.data.resetToken);
          setShowResetForm(true);
        }
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { 
        token: resetToken, 
        newPassword 
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowForgotPassword(false);
        setShowResetForm(false);
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 24px',
    background: 'linear-gradient(135deg, #0d0d15 0%, #1a0f2e 25%, #0d1b2a 50%, #1a0f2e 75%, #0d0d15 100%)',
    position: 'relative',
    overflow: 'hidden',
    color: '#fff'
  };

  const glowEffect1 = {
    position: 'absolute',
    top: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 30%, transparent 70%)',
    borderRadius: '50%',
    opacity: 0.4
  };

  const glowEffect2 = {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(29, 185, 84, 0.04) 40%, transparent 70%)',
    borderRadius: '50%',
    opacity: 0.3
  };

  const glowEffect3 = {
    position: 'absolute',
    top: '30%',
    right: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
    borderRadius: '50%',
    opacity: 0.3
  };

  const glowEffect4 = {
    position: 'absolute',
    bottom: '20%',
    left: '5%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    opacity: 0.3
  };

  const gridBg = {
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
  };

  const loginCardStyle = {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(20, 20, 40, 0.85)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    animation: 'fadeInUp 0.8s ease-out'
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
    lineHeight: '1.1'
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#a3b3c7',
    marginBottom: '40px',
    fontWeight: '400'
  };

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '24px',
    textAlign: 'left'
  };

  const inputStyle = (isFocused) => ({
    width: '100%',
    padding: '16px 20px',
    paddingRight: '50px',
    fontSize: '1rem',
    background: isFocused
      ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(40, 15, 60, 0.8) 100%)'
      : 'rgba(20, 20, 40, 0.6)',
    border: isFocused
      ? '2px solid rgba(139, 92, 246, 0.8)'
      : '2px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '16px',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: isFocused
      ? '0 0 30px rgba(139, 92, 246, 0.3), inset 0 1px 10px rgba(255, 255, 255, 0.05)'
      : 'none',
    boxSizing: 'border-box'
  });

  const selectStyle = (isFocused) => ({
    ...inputStyle(isFocused),
    paddingRight: '20px',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '16px'
  });

  const labelStyle = {
    position: 'absolute',
    top: '-10px',
    left: '16px',
    background: 'linear-gradient(135deg, #1a0f2e, #0d1b2a)',
    padding: '0 8px',
    fontSize: '0.85rem',
    color: '#a78bfa',
    fontWeight: '600',
    letterSpacing: '0.05em',
    zIndex: 2
  };

  const iconStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a78bfa',
    opacity: 0.7
  };

  const buttonStyle = {
    width: '100%',
    background: isLoading
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.7) 0%, rgba(168, 85, 247, 0.7) 100%)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '32px'
  };

  const linkStyle = {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '28px 0',
    gap: '16px'
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)'
  };

  const socialButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 24px',
    background: 'rgba(20, 20, 40, 0.6)',
    border: '2px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '12px'
  };

  return (
    <div style={containerStyle}>
      {/* Background Effects */}
      <div style={glowEffect1}></div>
      <div style={glowEffect2}></div>
      <div style={glowEffect3}></div>
      <div style={glowEffect4}></div>
      <div style={gridBg}></div>

      {/* Back to Landing Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(20, 20, 40, 0.6)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '10px 20px',
          color: '#a78bfa',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
          e.currentTarget.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(20, 20, 40, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Login Card */}
      <div style={loginCardStyle}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '16px'
        }}>
          🎓
        </div>

        <h1 style={titleStyle}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p style={subtitleStyle}>{isLogin ? 'Sign in to continue your learning journey' : 'Sign up to start your learning journey'}</p>

        <form onSubmit={handleSubmit}>
          {/* Name Input (Signup only) */}
          {!isLogin && (
            <div style={inputContainerStyle}>
              <span style={labelStyle}>Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Enter your full name"
                style={inputStyle(focusedInput === 'name')}
                required={!isLogin}
              />
              <span style={iconStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
          )}

          {/* Email Input */}
          <div style={inputContainerStyle}>
            <span style={labelStyle}>Email Address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your email"
              style={inputStyle(focusedInput === 'email')}
              required
            />
            <span style={iconStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
          </div>

          {/* Password Input */}
          <div style={inputContainerStyle}>
            <span style={labelStyle}>Password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your password"
              style={inputStyle(focusedInput === 'password')}
              required
              minLength={6}
            />
            <span
              style={{ ...iconStyle, cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
            {!isLogin && (
              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '8px', textAlign: 'left' }}>Minimum 6 characters</p>
            )}
          </div>

          {/* Account Type (Signup only) */}
          {!isLogin && (
            <div style={inputContainerStyle}>
              <span style={labelStyle}>Account Type</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onFocus={() => setFocusedInput('role')}
                onBlur={() => setFocusedInput(null)}
                style={selectStyle(focusedInput === 'role')}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <span
                style={linkStyle}
                onClick={() => setShowForgotPassword(true)}
                onMouseEnter={(e) => {
                  e.target.style.color = '#c4b5fd';
                  e.target.style.textShadow = '0 0 10px rgba(167, 139, 250, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#a78bfa';
                  e.target.style.textShadow = 'none';
                }}
              >
                Forgot Password?
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerLineStyle}></div>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>or continue with</span>
          <div style={dividerLineStyle}></div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          style={socialButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 20, 40, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          style={socialButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 20, 40, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Toggle Sign Up / Sign In */}
        <p style={{ marginTop: '28px', color: '#a3b3c7', fontSize: '0.95rem' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={toggleMode}
            style={linkStyle}
            onMouseEnter={(e) => {
              e.target.style.color = '#c4b5fd';
              e.target.style.textShadow = '0 0 10px rgba(167, 139, 250, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#a78bfa';
              e.target.style.textShadow = 'none';
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(20, 20, 40, 0.95)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setShowResetForm(false);
                setForgotEmail('');
                setResetToken('');
                setNewPassword('');
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#a78bfa',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '5px 10px'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#a78bfa',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {showResetForm ? 'Reset Password' : 'Forgot Password'}
            </h2>
            
            <p style={{
              color: '#a3b3c7',
              marginBottom: '30px',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {showResetForm 
                ? 'Enter your new password below' 
                : 'Enter your email to receive a password reset link'}
            </p>

            {!showResetForm ? (
              <div>
                <div style={inputContainerStyle}>
                  <span style={labelStyle}>Email Address</span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={inputStyle(false)}
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    marginTop: '20px'
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            ) : (
              <div>
                <div style={inputContainerStyle}>
                  <span style={labelStyle}>Reset Token</span>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    style={inputStyle(false)}
                    readOnly
                  />
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '0.75rem', 
                    marginTop: '5px',
                    textAlign: 'left'
                  }}>
                    In production, this would be sent to your email
                  </p>
                </div>
                <div style={inputContainerStyle}>
                  <span style={labelStyle}>New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={inputStyle(false)}
                    minLength={6}
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    marginTop: '20px'
                  }}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatDynamic {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(40px, -40px) rotate(8deg); }
          50% { transform: translate(-30px, 30px) rotate(-8deg); }
          75% { transform: translate(30px, 15px) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.15); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        input::placeholder, select::placeholder {
          color: rgba(163, 179, 199, 0.5);
        }

        input:focus::placeholder {
          color: transparent;
        }

        select option {
          background: #1a0f2e;
          color: #fff;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          form {
            padding: 0 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthForm;
