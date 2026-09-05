import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, 
  GraduationCap, Building2, School, Shield, AlertCircle, 
  CheckCircle2, Loader2, ArrowLeft, KeyRound, RotateCcw, 
  ShieldCheck, Globe
} from 'lucide-react';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-emerald-400', desc: 'Skill assessment, gap analysis & campus placements' },
  { id: 'company', label: 'Company', icon: Building2, color: 'text-purple-400', desc: 'Talent discovery, job drives & verified screening' },
  { id: 'faculty', label: 'Faculty', icon: School, color: 'text-blue-400', desc: 'Department analytics, curriculum & drive monitoring' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'text-rose-400', desc: 'Global platform supervision & verification controls' }
];

export default function Login() {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Form State
  const [selectedRole, setSelectedRole] = useState('student');
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
  const [forgotStep, setForgotStep] = useState(1); // 1: Email | 2: OTP & New Password
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
    const cleanRole = (userRole || selectedRole).toLowerCase();
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

  // 4. OAuth Handlers (Google / LinkedIn)
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Two-Column Card Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
        
        {/* ━━━━━━━━━━━━━━━━━━━━ LEFT COLUMN: HERO IMAGE & BRANDING ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 bg-slate-950/60 border-r border-slate-800 overflow-hidden">
          
          {/* Realistic Professional Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
              alt="Students and technology professionals collaborating" 
              className="w-full h-full object-cover object-center filter brightness-[0.32] contrast-105 scale-105 transition duration-700 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          {/* Top Logo & Tagline */}
          <div className="relative z-10 space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
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
              Enterprise AI engine bridging student capabilities, institutional curriculum, and corporate hiring demand.
            </p>
          </div>

          {/* Center Feature Highlights */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Real-Time Skill Gap DNA</span>
              </div>
              <p className="text-[11px] text-slate-300">
                AI-driven analysis benchmarking academic proficiency against live corporate tech stacks.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold font-mono">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>Verified Corporate Drives</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Direct recruitment pipelines with verified hiring managers and transparent interview tracking.
              </p>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>2FA & OAuth Enabled</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SOC2 Verified</span>
            </span>
          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━ RIGHT COLUMN: LOGIN FORM ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between text-left space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </Link>
              <span className="text-[11px] text-slate-500 font-mono">Secure Access</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to your SkillNexus AI account to continue to your dashboard.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Select Your Portal Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map(r => {
                const IconComponent = r.icon;
                const isSelected = selectedRole === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-white shadow-xs'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isSelected ? r.color : 'text-slate-500'}`} />
                    <span className="text-xs font-bold tracking-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Method Switcher (Password vs Email OTP) */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setLoginOtpSent(false);
                setErrorMsg('');
              }}
              className={`pb-1 font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                authMode === 'password'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Password Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setErrorMsg('');
              }}
              className={`pb-1 font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                authMode === 'otp'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Email OTP Login</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════ METHOD 1: PASSWORD LOGIN FORM ══════════════ */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
              
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@university.edu or corporate email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 ${
                      fieldErrors.email ? 'border-rose-500/80' : 'border-slate-800'
                    }`}
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 ${
                      fieldErrors.password ? 'border-rose-500/80' : 'border-slate-800'
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
                {fieldErrors.password && (
                  <span className="text-[11px] font-bold text-rose-400 block pt-0.5">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer accent-indigo-500"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer select-none">
                  Remember me on this browser session
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* ══════════════ METHOD 2: EMAIL OTP LOGIN FORM ══════════════ */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {!loginOtpSent ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        placeholder="Enter your registered email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 ${
                          fieldErrors.email ? 'border-rose-500/80' : 'border-slate-800'
                        }`}
                        disabled={loading}
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
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Login Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-slate-300">
                    6-digit code sent to <strong className="font-mono text-emerald-400">{email}</strong>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Enter 6-Digit OTP Code:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono tracking-[0.5em] text-emerald-400 outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Code Expiry: <strong className={otpTimer < 60 ? 'text-rose-400' : 'text-white'}>{formatTimer(otpTimer)}</strong></span>
                      <span>Attempts: <strong>{otpAttempts}/{MAX_OTP_ATTEMPTS}</strong></span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6 || otpTimer <= 0 || otpAttempts >= MAX_OTP_ATTEMPTS}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginOtpSent(false)}
                      className="hover:underline cursor-pointer"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendLoginOtp()}
                      disabled={loading || resendCooldown > 0}
                      className="text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ══════════════ 3. OAUTH LOGIN OPTIONS (GOOGLE & LINKEDIN) ══════════════ */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase shrink-0">
                Or Continue With
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              {/* LinkedIn OAuth */}
              <button
                type="button"
                onClick={handleLinkedInLogin}
                className="py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>LinkedIn</span>
              </button>

            </div>
          </div>

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <Link 
              to="/register" 
              className="font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline transition"
            >
              Create an account
            </Link>
          </div>

        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ FORGOT PASSWORD MODAL WITH OTP RESET ━━━━━━━━━━━━━━━━━━━━ */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-emerald-400" />
                <span>Password Recovery (OTP)</span>
              </h3>
              <button 
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Password updated successfully! You can now log in with your new password.</span>
              </div>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4 text-xs">
                <p className="text-slate-400">
                  Enter your registered email address and we'll dispatch a 6-digit verification code.
                </p>

                {forgotError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-bold">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Registered Email</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold transition cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending Code...' : 'Send OTP Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs animate-fadeIn">
                <p className="text-slate-400">
                  Enter the 6-digit code sent to <strong className="font-mono text-emerald-400">{forgotEmail}</strong> and your new password.
                </p>

                {forgotError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-bold">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center text-base font-mono tracking-widest text-emerald-400 outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold transition cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
