import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, 
  Sun, Moon, ArrowRight, ShieldCheck, Sparkles, Mail, Lock, KeyRound
} from 'lucide-react';

export default function Login() {
  const { login, loginWithToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Form State - Unified single login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login State
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const MAX_OTP_ATTEMPTS = 5;

  // Status & Validation State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Timer Countdown for OTP
  useEffect(() => {
    let interval = null;
    if (loginOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginOtpSent, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const redirectUserByRole = (userRole) => {
    const cleanRole = (userRole || 'student').toLowerCase();
    if (cleanRole === 'company') {
      navigate('/company', { replace: true });
    } else if (['faculty', 'institution', 'academician'].includes(cleanRole)) {
      navigate('/faculty', { replace: true });
    } else if (cleanRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/student', { replace: true });
    }
  };

  // 1. Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    const errors = {};
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email address.';

    if (!password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password, selectedRole);

      if (!result.success) {
        throw new Error(result.message || 'Invalid email or password credentials.');
      }

      redirectUserByRole(result.user?.role);
    } catch (err) {
      console.error('Password login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send Login OTP
  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors({ email: 'Please enter a valid email address to receive OTP.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role: selectedRole })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch login verification code.');
      }

      setLoginOtpSent(true);
      setOtpTimer(600);
      setResendCooldown(30);
      setOtpAttempts(0);
      setSuccessMsg(`A 6-digit verification code was sent to ${email.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Send login OTP error:', err);
      setErrorMsg(err.message || 'Unable to send login OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify Login OTP
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (otpTimer <= 0) {
      setErrorMsg('OTP code has expired. Please click "Resend Code".');
      return;
    }

    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
      setErrorMsg('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }

    setLoading(true);
    setOtpAttempts(prev => prev + 1);

    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode.trim(),
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired OTP code.');
      }

      loginWithToken(data.token, data.user);
      redirectUserByRole(data.user?.role);
    } catch (err) {
      console.error('Verify login OTP error:', err);
      setErrorMsg(err.message || 'Failed to verify login code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. OAuth Handlers
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLinkedInLogin = () => {
    window.location.href = '/api/auth/linkedin';
  };

  // 5. Forgot Password Flow
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), role: selectedRole })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send password reset code.');
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Error requesting password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError('Please provide the 6-digit OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp.trim(),
          newPassword,
          role: selectedRole
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep(1);
        setForgotSuccess(false);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
      }, 2500);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white"
      style={{
        background: isLight 
          ? 'linear-gradient(135deg, #F0F2F8 0%, #E2E8F0 50%, #ECEEF5 100%)' 
          : 'linear-gradient(135deg, #0D0E15 0%, #13141F 50%, #1A162B 100%)',
        color: 'var(--fac-text-primary)',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* ── Top Header Navigation ── */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-6 pb-2 flex items-center justify-between z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 no-underline group">
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
            }}
          >
            <Sparkles style={{ width: '17px', height: '17px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: isLight ? '#090C0B' : '#F5F7F6' }}>
            SkillNexus
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: isLight ? '1px solid #DDE2DD' : '1px solid rgba(255, 255, 255, 0.1)',
              background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
              color: isLight ? '#1F2926' : '#F5F7F6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Moon style={{ width: '16px', height: '16px' }} />
            ) : (
              <Sun style={{ width: '16px', height: '16px', color: '#FBBF24' }} />
            )}
          </button>

          <Link
            to="/"
            className="nav-link-notion"
            style={{ fontSize: '13.5px', fontWeight: 600 }}
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* ── Main Centered Split Card (Inspired by Image 1) ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div 
          className="w-full max-w-4xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl transition-all duration-300"
          style={{
            background: isLight ? '#FFFFFF' : '#14151E',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isLight 
              ? '0 25px 50px -12px rgba(139, 92, 246, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.08)' 
              : '0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.15)'
          }}
        >
          {/* ══════════════ LEFT COLUMN: Login Form Card ══════════════ */}
          <div 
            className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between"
            style={{
              background: isLight ? '#FFFFFF' : '#12131C',
              color: isLight ? '#090C0B' : '#F5F7F6'
            }}
          >
            <div>
              {/* Form Header */}
              <div className="mb-6">
                <h1 
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: isLight ? '#090C0B' : '#FFFFFF',
                    margin: 0
                  }}
                >
                  Login
                </h1>
                <p 
                  style={{ 
                    fontSize: '13.5px', 
                    color: isLight ? '#4B5854' : '#94A3B8', 
                    marginTop: '6px' 
                  }}
                >
                  Enter your account details to access SkillNexus
                </p>
              </div>

              {/* Mode Toggle: Password vs Email OTP */}
              <div 
                className="flex items-center gap-4 mb-6 pb-2"
                style={{ borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setLoginOtpSent(false);
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: authMode === 'password' ? '2px solid #8B5CF6' : '2px solid transparent',
                    paddingBottom: '8px',
                    fontSize: '13.5px',
                    fontWeight: authMode === 'password' ? 700 : 500,
                    color: authMode === 'password' ? (isLight ? '#6D28D9' : '#A78BFA') : (isLight ? '#64748B' : '#64748B'),
                    cursor: 'pointer',
                    marginBottom: '-10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Password Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: authMode === 'otp' ? '2px solid #8B5CF6' : '2px solid transparent',
                    paddingBottom: '8px',
                    fontSize: '13.5px',
                    fontWeight: authMode === 'otp' ? 700 : 500,
                    color: authMode === 'otp' ? (isLight ? '#6D28D9' : '#A78BFA') : (isLight ? '#64748B' : '#64748B'),
                    cursor: 'pointer',
                    marginBottom: '-10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  OTP Sign-in
                </button>
              </div>

              {/* Error & Success Feedback Alerts */}
              {errorMsg && (
                <div 
                  className="mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444'
                  }}
                >
                  <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div 
                  className="mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10B981'
                  }}
                >
                  <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ── Password Auth Form ── */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {/* Username / Email Field */}
                  <div className="space-y-1.5">
                    <label 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: isLight ? '#1F2926' : '#CBD5E1' 
                      }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="name@institution.edu"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                        }}
                        disabled={loading}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          padding: '0 14px 0 40px',
                          fontSize: '13.5px',
                          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                          border: fieldErrors.email 
                            ? '1px solid #EF4444' 
                            : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)'),
                          color: isLight ? '#090C0B' : '#FFFFFF',
                          outline: 'none',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                        onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#EF4444' : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.1)')}
                      />
                      <Mail 
                        style={{ 
                          position: 'absolute', 
                          left: '13px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          width: '16px', 
                          height: '16px', 
                          color: '#94A3B8' 
                        }} 
                      />
                    </div>
                    {fieldErrors.email && (
                      <span style={{ fontSize: '11px', color: '#EF4444' }}>{fieldErrors.email}</span>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label 
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          color: isLight ? '#1F2926' : '#CBD5E1' 
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        style={{
                          fontSize: '12px',
                          color: isLight ? '#6D28D9' : '#A78BFA',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 500
                        }}
                        className="hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                        }}
                        disabled={loading}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          padding: '0 40px 0 40px',
                          fontSize: '13.5px',
                          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                          border: fieldErrors.password 
                            ? '1px solid #EF4444' 
                            : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)'),
                          color: isLight ? '#090C0B' : '#FFFFFF',
                          outline: 'none',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                        onBlur={(e) => e.target.style.borderColor = fieldErrors.password ? '#EF4444' : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.1)')}
                      />
                      <Lock 
                        style={{ 
                          position: 'absolute', 
                          left: '13px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          width: '16px', 
                          height: '16px', 
                          color: '#94A3B8' 
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <span style={{ fontSize: '11px', color: '#EF4444' }}>{fieldErrors.password}</span>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        accentColor: '#8B5CF6',
                        width: '14px',
                        height: '14px',
                        cursor: 'pointer'
                      }}
                    />
                    <label 
                      htmlFor="rememberMe" 
                      style={{ 
                        fontSize: '12.5px', 
                        color: isLight ? '#4B5854' : '#94A3B8', 
                        cursor: 'pointer' 
                      }}
                    >
                      Keep me logged in
                    </label>
                  </div>

                  {/* Main Login Button (Vibrant Purple Pill matching Image 1) */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.5)',
                      transition: 'all 0.2s ease',
                      marginTop: '12px'
                    }}
                    className="hover:brightness-110 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>
                </form>
              )}

              {/* ── OTP Login Form ── */}
              {authMode === 'otp' && (
                <div className="space-y-4">
                  {!loginOtpSent ? (
                    <form onSubmit={handleSendLoginOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: isLight ? '#1F2926' : '#CBD5E1' }}>
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="name@institution.edu"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                            }}
                            disabled={loading}
                            style={{
                              width: '100%',
                              height: '44px',
                              borderRadius: '12px',
                              padding: '0 14px 0 40px',
                              fontSize: '13.5px',
                              background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                              border: fieldErrors.email ? '1px solid #EF4444' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)'),
                              color: isLight ? '#090C0B' : '#FFFFFF',
                              outline: 'none'
                            }}
                          />
                          <Mail style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                        </div>
                        {fieldErrors.email && <span style={{ fontSize: '11px', color: '#EF4444' }}>{fieldErrors.email}</span>}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.5)'
                        }}
                      >
                        {loading ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : 'Send Verification OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: isLight ? '#1F2926' : '#CBD5E1' }}>
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          disabled={loading}
                          style={{
                            width: '100%',
                            height: '44px',
                            borderRadius: '12px',
                            padding: '0 14px',
                            fontSize: '18px',
                            letterSpacing: '0.3em',
                            textAlign: 'center',
                            fontWeight: 700,
                            background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                            border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: isLight ? '#090C0B' : '#FFFFFF',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#94A3B8' }}>Code expires in: {formatTimer(otpTimer)}</span>
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={resendCooldown > 0 || loading}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: resendCooldown > 0 ? '#94A3B8' : '#8B5CF6',
                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.5)'
                        }}
                      >
                        {loading ? <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> : 'Verify & Sign In'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="mt-6 pt-5" style={{ borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                      color: isLight ? '#090C0B' : '#F5F7F6',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover:bg-slate-500/10"
                  >
                    <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLinkedInLogin}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                      color: isLight ? '#090C0B' : '#F5F7F6',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover:bg-slate-500/10"
                  >
                    <svg style={{ width: '14px', height: '14px', fill: '#0A66C2' }} viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-3.2 0 1.6 1.6 0 0 0 1.6 1.6m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: Sign up link styled matching Image 1 */}
            <div className="mt-8 pt-4 flex items-center justify-between text-xs">
              <span style={{ color: isLight ? '#4B5854' : '#94A3B8' }}>
                Don't have an account?
              </span>
              <Link
                to="/register"
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                  color: isLight ? '#090C0B' : '#FFFFFF',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.15s ease'
                }}
                className="hover:brightness-110"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* ══════════════ RIGHT COLUMN: Purple Portal Graphic (Image 1 Aesthetic) ══════════════ */}
          <div 
            className="hidden lg:flex lg:col-span-6 relative p-10 flex-col justify-between overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 60%, #6D28D9 100%)',
              color: '#FFFFFF'
            }}
          >
            {/* Background artistic organic bubble layers */}
            <div 
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }} 
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-20px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.15)',
                filter: 'blur(20px)',
                pointerEvents: 'none'
              }} 
            />

            {/* Portal Banner Text */}
            <div className="relative z-10 space-y-2">
              <h2 
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  lineHeight: '1.15',
                  letterSpacing: '-0.035em',
                  color: '#FFFFFF',
                  margin: 0
                }}
              >
                Welcome to<br />student portal
              </h2>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 500,
                  margin: 0
                }}
              >
                Login to access your personalized career & skill account
              </p>
            </div>

            {/* Stylized Clean Vector Art (Inspired by Image 1) */}
            <div className="relative z-10 flex items-center justify-center my-6">
              <svg 
                viewBox="0 0 400 320" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', maxWidth: '340px', height: 'auto' }}
              >
                {/* Modern document/checklist board */}
                <rect x="120" y="90" width="160" height="200" rx="16" fill="#FFFFFF" />
                <rect x="145" y="115" width="50" height="10" rx="5" fill="#E2E8F0" />
                
                {/* Checklist items */}
                <circle cx="150" cy="150" r="10" stroke="#8B5CF6" strokeWidth="3" fill="none" />
                <rect x="170" y="146" width="85" height="8" rx="4" fill="#CBD5E1" />
                
                <circle cx="150" cy="185" r="10" stroke="#8B5CF6" strokeWidth="3" fill="none" />
                <rect x="170" y="181" width="75" height="8" rx="4" fill="#CBD5E1" />
                
                <circle cx="150" cy="220" r="10" stroke="#8B5CF6" strokeWidth="3" fill="none" />
                <rect x="170" y="216" width="90" height="8" rx="4" fill="#CBD5E1" />

                <rect x="145" y="255" width="110" height="8" rx="4" fill="#E2E8F0" />

                {/* Decorative plant in pot */}
                <path d="M280 270 L310 270 L305 300 L285 300 Z" fill="#1E1B4B" />
                <path d="M295 270 Q320 220 300 190 Q290 230 295 270" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2" />
                <path d="M295 270 Q270 230 280 200 Q290 240 295 270" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2" />

                {/* Character 1: Sitting with laptop on top of board */}
                <circle cx="280" cy="70" r="14" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
                <path d="M272 64 Q280 58 290 66" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Body */}
                <path d="M266 84 C260 105 260 130 285 130 C295 130 305 120 305 100 C305 84 285 84 266 84 Z" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Laptop */}
                <path d="M290 115 L320 115 L315 95 Z" fill="#1E1B4B" />
                {/* Legs */}
                <path d="M285 130 L320 150 L335 140" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M295 130 L310 170 L325 175" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                {/* Character 2: Standing with mobile */}
                <circle cx="85" cy="130" r="14" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
                <path d="M78 124 Q85 118 95 126" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Body */}
                <path d="M75 144 L95 144 L100 200 L70 200 Z" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Mobile */}
                <rect x="62" y="160" width="10" height="18" rx="2" fill="#1E1B4B" />
                {/* Legs & Shoes */}
                <path d="M78 200 L74 270 L65 275" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M92 200 L98 270 L110 275" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Bottom trust footer */}
            <div className="relative z-10 flex items-center justify-between text-xs pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                Universal Academia-Industry Login
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                SkillNexus v2.4
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Forgot Password Modal ── */}
      {forgotModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-5"
            style={{
              background: isLight ? '#FFFFFF' : '#14151E',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <KeyRound style={{ width: '16px', height: '16px' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: isLight ? '#090C0B' : '#FFFFFF' }}>
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <AlertCircle style={{ width: '14px', height: '14px' }} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-4 rounded-xl text-center space-y-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <CheckCircle2 style={{ width: '28px', height: '28px', margin: '0 auto' }} />
                <p style={{ fontSize: '13px', fontWeight: 600 }}>Password successfully updated!</p>
                <p style={{ fontSize: '11.5px', color: '#94A3B8' }}>You may now login with your new credentials.</p>
              </div>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <p style={{ fontSize: '13px', color: isLight ? '#4B5854' : '#94A3B8' }}>
                  Enter your registered email address. We'll send a 6-digit verification code.
                </p>
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    padding: '0 12px',
                    fontSize: '13px',
                    background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isLight ? '#090C0B' : '#FFFFFF',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#8B5CF6',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    padding: '0 12px',
                    fontSize: '14px',
                    textAlign: 'center',
                    letterSpacing: '0.2em',
                    fontWeight: 700,
                    background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isLight ? '#090C0B' : '#FFFFFF',
                    outline: 'none'
                  }}
                />
                <input
                  type="password"
                  placeholder="New Password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    padding: '0 12px',
                    fontSize: '13px',
                    background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isLight ? '#090C0B' : '#FFFFFF',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#8B5CF6',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {forgotLoading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between text-xs" style={{ color: isLight ? '#4B5854' : '#64748B' }}>
        <span>© {new Date().getFullYear()} SkillNexus. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:underline">Privacy</Link>
          <Link to="/" className="hover:underline">Terms</Link>
          <Link to="/" className="hover:underline">Support</Link>
        </div>
      </footer>
    </div>
  );
}
