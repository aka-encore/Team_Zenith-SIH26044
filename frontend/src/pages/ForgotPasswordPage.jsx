import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  KeyRound, Mail, Lock, Eye, EyeOff, Sparkles, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, 
  Loader2, RotateCcw, ShieldCheck
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Steps: 1: Enter Email | 2: Verify OTP & Set New Password
  const [step, setStep] = useState(1);

  // Form State
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
        body: JSON.stringify({ email: email.trim().toLowerCase() })
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
        body: JSON.stringify({ email: email.trim().toLowerCase() })
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
          newPassword
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* ━━━━━━━━━━━━━━━━━━━━ LEFT COLUMN: HERO & INFO ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 bg-slate-950/60 border-r border-slate-800 overflow-hidden">
          
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" 
              alt="Cybersecurity and technology workspace" 
              className="w-full h-full object-cover object-center filter brightness-[0.28] contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Skill<span className="text-emerald-400">Nexus</span> AI
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Enterprise security infrastructure protecting user identity and platform access.
            </p>
          </div>

          <div className="relative z-10 space-y-3.5 my-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Zero-Knowledge Email Verification</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Time-limited 6-digit authentication codes dispatched directly to your registered inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold font-mono">
                <KeyRound className="h-3.5 w-3.5 shrink-0" />
                <span>Instant Credential Revocation</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Previous verification tokens and sessions are automatically invalidated upon password reset.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>256-Bit Cryptographic Hash</span>
            <span className="text-emerald-400 font-bold">● Active 2FA</span>
          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━ RIGHT COLUMN: RECOVERY FORM ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between text-left space-y-6">
          
          {/* Top Return Link */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change Email</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Login</span>
                </Link>
              )}
              <span className="text-[11px] text-slate-500 font-mono">
                {step === 1 ? 'Step 1 of 2: Email' : 'Step 2 of 2: Verify & Reset'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {step === 1 ? 'Recover Password' : 'Set New Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {step === 1 
                ? 'Enter your registered email address to receive a secure 6-digit OTP verification code.'
                : `Enter the 6-digit code sent to ${email} and choose a new password.`}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════ STEP 1: ENTER EMAIL ══════════════ */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Enter your registered account email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({});
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 ${
                      fieldErrors.email ? 'border-rose-500' : 'border-slate-800'
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {fieldErrors.email && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit OTP Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ══════════════ STEP 2: VERIFY OTP & SET NEW PASSWORD ══════════════ */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
              
              {/* 6-Digit OTP Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  6-Digit Verification Code *
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/[^0-9]/g, ''));
                      if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-center text-base font-mono tracking-widest text-emerald-400 outline-none transition focus:border-emerald-500 ${
                      fieldErrors.otp ? 'border-rose-500' : 'border-slate-800'
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {fieldErrors.otp && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.otp}
                  </span>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                  <span>Code Expiry: <strong className={otpTimer < 60 ? 'text-rose-400' : 'text-white'}>{formatTimer(otpTimer)}</strong></span>
                  <span>Attempts: <strong>{attempts}/{MAX_ATTEMPTS}</strong></span>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 ${
                      fieldErrors.newPassword ? 'border-rose-500' : 'border-slate-800'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 ${
                      fieldErrors.confirmPassword ? 'border-rose-500' : 'border-slate-800'
                    }`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || otpTimer <= 0 || attempts >= MAX_ATTEMPTS}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Resend OTP Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

            </form>
          )}

          {/* Bottom Back to Sign In */}
          <div className="text-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Remember your password? </span>
            <Link 
              to="/login" 
              className="font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline transition"
            >
              Sign in to your portal
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
