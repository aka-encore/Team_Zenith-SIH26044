import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, 
  CheckCircle2, Sun, Moon, ArrowLeft, Sparkles
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const accentColor = isLight ? '#063F3A' : '#19B874';

  // Steps: 1: Enter Email | 2: Verify OTP & Set New Password
  const [step, setStep] = useState(1);

  // Form State
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Timer State
  const [otpTimer, setOtpTimer] = useState(600); // 10 mins
  const [resendCooldown, setResendCooldown] = useState(30); // 30s
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1: Send Forgot Password OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors({ email: 'Please enter your registered email address.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role: selectedRole })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch password recovery code.');
      }

      setStep(2);
      setOtpTimer(600);
      setResendCooldown(30);
      setAttempts(0);
      setSuccessMsg(`If an account exists with ${email.toLowerCase()}, a 6-digit verification code has been dispatched.`);
    } catch (err) {
      console.error('Send forgot OTP error:', err);
      setErrorMsg(err.message || 'Unable to request password recovery.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role: selectedRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend recovery code.');
      }

      setOtpTimer(600);
      setResendCooldown(30);
      setSuccessMsg(`New 6-digit verification code sent to ${email.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    const errors = {};
    if (!otp || otp.trim().length !== 6) {
      errors.otp = 'Please enter the complete 6-digit verification code.';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long.';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (otpTimer <= 0) {
      setErrorMsg('Verification code has expired. Please click "Resend Code".');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setErrorMsg('Maximum verification attempts exceeded. Please request a new OTP code.');
      return;
    }

    setLoading(true);
    setAttempts(prev => prev + 1);

    try {
      const res = await fetch('/api/auth/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      setSuccessMsg('Password updated successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      setErrorMsg(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white"
      style={{ 
        backgroundColor: 'var(--fac-bg-page)', 
        color: 'var(--fac-text-primary)',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* ── Minimal Header ── */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 no-underline group">
          <div 
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              background: accentColor,
              color: isLight ? '#FFFFFF' : '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '-0.02em',
              flexShrink: 0
            }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fac-text-primary)', letterSpacing: '-0.02em' }}>
            SkillNexus
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--fac-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Moon style={{ width: '16px', height: '16px' }} />
            ) : (
              <Sun style={{ width: '16px', height: '16px', color: 'var(--fac-gold)' }} />
            )}
          </button>

          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: 'var(--fac-text-secondary)',
              textDecoration: 'none',
              fontWeight: 500
            }}
            className="hover:text-emerald-600 transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Main Two-Column Editorial Layout ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        
        {/* ── LEFT COLUMN: Brand & Info ── */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-8 pr-4 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--fac-emerald-tint)', color: accentColor }}>
              <span>Account Recovery</span>
            </div>

            <h1 
              style={{
                fontSize: '2.5rem',
                lineHeight: '1.2',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: 'var(--fac-text-primary)'
              }}
            >
              Reset your password securely.
            </h1>
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--fac-text-secondary)' }}>
              Follow the two-step verification flow using a time-limited one-time password dispatched to your inbox.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs" style={{ color: 'var(--fac-text-secondary)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: accentColor, fontWeight: 700 }}>•</span>
              <span>6-digit time-sensitive verification code</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: accentColor, fontWeight: 700 }}>•</span>
              <span>Immediate session credential refresh</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Password Recovery Form ── */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto lg:mx-0">
          <div className="space-y-6 text-left">
            
            {/* Top Return Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                {step === 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      fontSize: '12px',
                      color: accentColor,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                    className="hover:underline"
                  >
                    <ArrowLeft style={{ width: '14px', height: '14px' }} />
                    <span>Change Email</span>
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    style={{
                      fontSize: '12px',
                      color: 'var(--fac-text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    className="hover:underline"
                  >
                    <ArrowLeft style={{ width: '14px', height: '14px' }} />
                    <span>Return to Login</span>
                  </Link>
                )}
                <span style={{ fontSize: '11px', color: 'var(--fac-text-muted)' }}>
                  {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
              </div>

              <h2 
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--fac-text-primary)'
                }}
              >
                {step === 1 ? 'Recover password' : 'Set new password'}
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--fac-text-secondary)' }}>
                {step === 1 
                  ? 'Enter your registered email address to receive a secure 6-digit OTP.'
                  : `Enter the 6-digit code sent to ${email} and choose a new password.`}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div 
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(224, 82, 82, 0.08)',
                  border: '1px solid rgba(224, 82, 82, 0.25)',
                  color: 'var(--fac-error)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div 
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--fac-emerald-tint)',
                  border: '1px solid rgba(22, 163, 106, 0.25)',
                  color: 'var(--fac-emerald-bright)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ══════════════ STEP 1: ENTER EMAIL ══════════════ */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', label: 'Student' },
                      { id: 'company', label: 'Company' },
                      { id: 'faculty', label: 'Faculty' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: selectedRole === r.id
                            ? (isLight ? '1px solid #063F3A' : '1px solid #19B874')
                            : '1px solid var(--fac-border)',
                          background: selectedRole === r.id
                            ? (isLight ? '#063F3A' : '#19B874')
                            : 'var(--fac-bg-card)',
                          color: selectedRole === r.id
                            ? (isLight ? '#FFFFFF' : '#000000')
                            : 'var(--fac-text-secondary)'
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '14px',
                      height: '14px',
                      color: 'var(--fac-text-muted)',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({});
                      }}
                      className="fac-theme-input"
                      style={{
                        paddingLeft: '34px',
                        height: '40px',
                        fontSize: '13.5px',
                        borderColor: fieldErrors.email ? 'var(--fac-error)' : undefined
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {fieldErrors.email && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-error)' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '6px',
                    border: 'none',
                    background: accentColor,
                    color: isLight ? '#FFFFFF' : '#000000',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:brightness-105 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <span>Send 6-digit OTP code</span>
                  )}
                </button>
              </form>
            )}

            {/* ══════════════ STEP 2: VERIFY & RESET ══════════════ */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/[^0-9]/g, ''));
                      if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: '' });
                    }}
                    className="fac-theme-input text-center font-mono tracking-[0.3em]"
                    style={{
                      height: '42px',
                      fontSize: '16px',
                      fontWeight: 700,
                      borderColor: fieldErrors.otp ? 'var(--fac-error)' : undefined
                    }}
                    disabled={loading}
                    autoFocus
                  />
                  {fieldErrors.otp && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-error)' }}>
                      {fieldErrors.otp}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--fac-text-muted)', fontSize: '11px' }}>
                    <span>Expires in: <strong style={{ color: otpTimer < 60 ? 'var(--fac-error)' : 'var(--fac-text-primary)' }}>{formatTimer(otpTimer)}</strong></span>
                    <span>Attempts: <strong>{attempts}/{MAX_ATTEMPTS}</strong></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
                      }}
                      className="fac-theme-input"
                      style={{
                        paddingRight: '38px',
                        height: '40px',
                        fontSize: '13.5px',
                        borderColor: fieldErrors.newPassword ? 'var(--fac-error)' : undefined
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--fac-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-error)' }}>
                      {fieldErrors.newPassword}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    className="fac-theme-input"
                    style={{
                      height: '40px',
                      fontSize: '13.5px',
                      borderColor: fieldErrors.confirmPassword ? 'var(--fac-error)' : undefined
                    }}
                    disabled={loading}
                  />
                  {fieldErrors.confirmPassword && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-error)' }}>
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || otpTimer <= 0 || attempts >= MAX_ATTEMPTS}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '6px',
                    border: 'none',
                    background: accentColor,
                    color: isLight ? '#FFFFFF' : '#000000',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:brightness-105 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; reset password</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--fac-text-secondary)', fontSize: '12px' }}>
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || resendCooldown > 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: accentColor,
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: 0
                    }}
                    className="hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Back to Sign In */}
            <div 
              style={{
                textAlign: 'center',
                paddingTop: '8px',
                fontSize: '13px',
                color: 'var(--fac-text-secondary)'
              }}
            >
              <span>Remember your password? </span>
              <Link 
                to="/login" 
                style={{
                  fontWeight: 600,
                  color: accentColor,
                  textDecoration: 'none'
                }}
                className="hover:underline"
              >
                Sign in
              </Link>
            </div>

          </div>
        </div>

      </main>

      {/* ── Minimal Editorial Footer ── */}
      <footer 
        style={{
          borderTop: '1px solid var(--fac-border)',
          color: 'var(--fac-text-muted)',
          fontSize: '12px'
        }}
        className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-2"
      >
        <div>
          © 2026 SkillNexus Platform. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">About</Link>
          <Link to="/how-it-works" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">How It Works</Link>
        </div>
      </footer>

    </div>
  );
}
