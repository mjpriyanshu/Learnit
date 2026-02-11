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
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: OTP, 3: new password

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
        result = await register(formData.name, formData.email, formData.password);
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

  useEffect(() => {
    // Check if this is the first user registration
    const checkFirstUser = async () => {
      try {
        const response = await api.get('/auth/check-first-user');
        if (response.data.success) {
          setIsFirstUser(response.data.data.isFirstUser);
        }
      } catch (error) {
        console.log('Error checking first user:', error);
      }
    };
    checkFirstUser();
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
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
        setResetStep(2); // Move to OTP entry step
      } else {
        toast.error(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email: forgotEmail, otp });
      if (response.data.success) {
        toast.success(response.data.message);
        setResetStep(3); // Move to password reset step
      } else {
        toast.error(response.data.message || 'Invalid verification code');
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
        email: forgotEmail,
        otp,
        newPassword 
      });
      if (response.data.success) {
        toast.success(response.data.message);
        // Reset all states
        setShowForgotPassword(false);
        setResetStep(1);
        setForgotEmail('');
        setOtp('');
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
            <>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className='w-full px-4 py-3 rounded-lg outline-none transition'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#e0e7ff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder='John Doe'
                />
              </div>
            </>
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

          {/* First User Notice (Signup only) */}
          {!isLogin && isFirstUser && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👑</div>
              <div style={{ color: '#a78bfa', fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                System Administrator Account
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                You'll be the first user and super admin
              </div>
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
                setResetStep(1);
                setForgotEmail('');
                setOtp('');
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
              {resetStep === 1 ? 'Forgot Password' : resetStep === 2 ? 'Enter Verification Code' : 'Reset Password'}
            </h2>
            
            <p style={{
              color: '#a3b3c7',
              marginBottom: '30px',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {resetStep === 1 
                ? 'Enter your email to receive a verification code' 
                : resetStep === 2
                ? 'Check your email for the 6-digit code'
                : 'Enter your new password below'}
            </p>

            {resetStep === 1 && (
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
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {resetStep === 2 && (
              <div>
                <div style={inputContainerStyle}>
                  <span style={labelStyle}>Verification Code</span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    style={{
                      ...inputStyle(false),
                      letterSpacing: '0.5em',
                      fontSize: '1.2rem',
                      textAlign: 'center'
                    }}
                    maxLength={6}
                  />
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '0.75rem', 
                    marginTop: '5px',
                    textAlign: 'center'
                  }}>
                    💡 Check server console for the OTP (in development)
                  </p>
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    marginTop: '20px'
                  }}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => setResetStep(1)}
                  style={{
                    ...buttonStyle,
                    marginTop: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  Back to Email
                </button>
              </div>
            )}

            {resetStep === 3 && (
              <div>
                <div style={inputContainerStyle}>
                  <span style={labelStyle}>New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
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
