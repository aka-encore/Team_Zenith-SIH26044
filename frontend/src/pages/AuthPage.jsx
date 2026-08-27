import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { signInWithGoogle } from '../firebase';
import {
  Dna, Eye, EyeOff, Lock, Mail, User, Loader2, ArrowRight, ArrowLeft,
  GraduationCap, Building2, BookOpen, School, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw,
  KeyRound, Send
} from 'lucide-react';


// ─── SVG Icons (Google + LinkedIn) ──────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4 shrink-0 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);


// ─── Input Field ─────────────────────────────────────────────────────────────

const InputField = ({ label, icon: Icon, rightElement, ...props }) => (
  <div className="space-y-1.5">
    <div className="block text-xs font-bold text-slate-600 dark:text-slate-300">{label}</div>
    <div className="relative">
      {Icon && <Icon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-sm outline-none transition font-medium`}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);


// ─── Role Tab Selector ───────────────────────────────────────────────────────

export const getRoleDashboard = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'company') return '/company';
  if (r === 'faculty' || r === 'institution' || r === 'academician') return '/faculty';
  if (r === 'admin') return '/admin';
  return '/student';
};

const ROLE_TABS = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: School },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: Lock },
];

const RoleSelector = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Role</label>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
      {ROLE_TABS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            value === r.id
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-300 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <r.icon className="h-3.5 w-3.5" />
          <span>{r.label}</span>
        </button>
      ))}
    </div>
  </div>
);


// ─── Social OAuth Buttons ────────────────────────────────────────────────────

const SocialButtons = ({ oauthError, setOauthError, selectedRole, onSuccess }) => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    if (setOauthError) setOauthError('');

    try {
      const fbResult = await signInWithGoogle();

      if (!fbResult.success) {
        if (fbResult.error && (fbResult.error.includes('popup-closed-by-user') || fbResult.error.includes('cancelled'))) {
          setGoogleLoading(false);
          return;
        }
        console.warn('Firebase popup error, falling back to server OAuth:', fbResult.error);
        window.location.href = '/api/auth/google';
        return;
      }

      const res = await fetch('/api/auth/firebase-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fbResult.user,
          role: selectedRole || 'student',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google sign-in failed on server.');
      }

      if (data.needsRole) {
        window.location.href = `/auth/oauth/role?tempToken=${encodeURIComponent(data.tempToken)}`;
        return;
      }

      if (onSuccess) {
        onSuccess(data.token, data.user);
      }
    } catch (err) {
      console.error('Google Firebase Auth Error:', err);
      if (setOauthError) setOauthError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkedIn = () => {
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600 tracking-widest absolute whitespace-nowrap">
          or continue with
        </span>
      </div>

      {oauthError && (
        <div className="flex items-start space-x-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{oauthError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer group disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          ) : (
            <GoogleIcon />
          )}
          <span>{googleLoading ? 'Signing in…' : 'Google'}</span>
        </button>

        <button
          type="button"
          onClick={handleLinkedIn}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#0A66C2]/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer group"
        >
          <LinkedInIcon />
          <span>LinkedIn</span>
        </button>
      </div>
    </div>
  );
};


// ─── Main AuthPage ───────────────────────────────────────────────────────────

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState('student');

  // Login methods: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginOtpStep, setLoginOtpStep] = useState(1); // 1: Email, 2: OTP
  const [loginOtp, setLoginOtp] = useState('');

  // Register form
  const [regStep, setRegStep] = useState(1); // 1: info, 2: password / details, 3: OTP verification
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtp, setRegOtp] = useState('');

  // Student details
  const [regCollege, setRegCollege] = useState('');
  const [regDept, setRegDept] = useState('');

  // Company details
  const [regIndustry, setRegIndustry] = useState('');
  const [regWebsite, setRegWebsite] = useState('');

  // Institution details
  const [regInstType, setRegInstType] = useState('');
  const [regLocation, setRegLocation] = useState('');

  // State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthError, setOauthError] = useState('');

  const { user, login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to their role dashboard
  useEffect(() => {
    if (user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleOAuthSuccess = (token, user) => {
    loginWithToken(token, user);
    navigate(getRoleDashboard(user?.role || selectedRole), { replace: true });
  };

  // Sync mode from URL
  useEffect(() => {
    if (location.pathname === '/register') setMode('register');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  // Check for oauth_error in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('oauth_error');
    if (err) setOauthError(decodeURIComponent(err));
  }, [location.search]);

  const switchMode = (newMode) => {
    setErrorMsg('');
    setSuccessMsg('');
    setOauthError('');
    setRegStep(1);
    setLoginOtpStep(1);
    setLoginOtp('');
    setRegOtp('');
    setMode(newMode);
    window.history.pushState({}, '', newMode === 'register' ? '/register' : '/login');
  };

  // 1. Direct Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);
    if (result.success) {
      const targetRole = result.user?.role || user?.role || selectedRole;
      navigate(getRoleDashboard(targetRole), { replace: true });
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  // 2. Send Login OTP
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    if (!loginEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send login code.');
      setLoginOtpStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Error sending OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Verify Login OTP
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!loginOtp || loginOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, otp: loginOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Invalid or expired OTP code.');
      loginWithToken(data.token, data.user);
      navigate(getRoleDashboard(data.user?.role || selectedRole));
    } catch (err) {
      setErrorMsg(err.message || 'Login verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Register: Send Registration OTP on last step
  const handleRegisterNext = async (e) => {
    e.preventDefault();

    if (selectedRole === 'student') {
      if (regStep === 1) {
        if (!regName || !regEmail) { setErrorMsg('Please enter your full name and email address.'); return; }
        setErrorMsg(''); setRegStep(2); return;
      }
      if (regStep === 2) {
        if (!regPassword || regPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
        if (regPassword !== regConfirmPassword) { setErrorMsg('Passwords do not match.'); return; }
        
        // Send OTP for email verification
        setErrorMsg('');
        setSubmitting(true);
        try {
          const res = await fetch('/api/auth/send-register-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: selectedRole }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send OTP code.');
          setRegStep(3);
        } catch (err) {
          setErrorMsg(err.message || 'Failed to send registration OTP.');
        } finally {
          setSubmitting(false);
        }
        return;
      }
    } else {
      if (regStep === 1) {
        if (!regName || !regEmail) { setErrorMsg('Please fill in all required fields.'); return; }
        setErrorMsg(''); setRegStep(2); return;
      }
      if (regStep === 2) {
        if (!regPassword || regPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
        if (regPassword !== regConfirmPassword) { setErrorMsg('Passwords do not match.'); return; }

        setErrorMsg('');
        setSubmitting(true);
        try {
          const res = await fetch('/api/auth/send-register-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: selectedRole }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send OTP code.');
          setRegStep(3);
        } catch (err) {
          setErrorMsg(err.message || 'Failed to send registration OTP.');
        } finally {
          setSubmitting(false);
        }
        return;
      }
    }
  };

  // 5. Verify Registration OTP
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    if (!regOtp || regOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, otp: regOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Invalid or expired OTP code.');
      
      setRegisteredEmail(regEmail);
      setSuccessMsg(data.message);
      loginWithToken(data.token, data.user);
      setTimeout(() => navigate(getRoleDashboard(data.user?.role || selectedRole)), 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#090d16] px-4 py-10 font-sans">
      <ForgotPasswordModal isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />

      {/* ── AUTH CARD ── */}
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-black/50 overflow-hidden">
        <div className="p-8 space-y-6">

          {/* Brand + SSL Badge */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Dna className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">SkillNexus AI</span>
            </Link>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <ShieldCheck className="h-3 w-3" />
              <span>SMTP OTP Verified</span>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━ LOGIN PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Sign in to your SkillNexus AI workspace.</p>
              </div>

              {/* Login Method Toggle: Password vs Email OTP */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setErrorMsg(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'password'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-300 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setLoginOtpStep(1); setErrorMsg(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'otp'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-300 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              <RoleSelector value={selectedRole} onChange={setSelectedRole} />

              {errorMsg && (
                <div className="flex items-start space-x-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* PASSWORD LOGIN FORM */}
              {loginMethod === 'password' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <InputField
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@email.com"
                  />

                  <InputField
                    label={
                      <span className="flex items-center justify-between w-full">
                        Password
                        <button
                          type="button"
                          onClick={() => setForgotPasswordOpen(true)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold normal-case tracking-normal cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </span>
                    }
                    icon={Lock}
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Signing in…</span></>
                    ) : (
                      <span>Sign In →</span>
                    )}
                  </button>
                </form>
              )}

              {/* EMAIL OTP LOGIN FORM */}
              {loginMethod === 'otp' && (
                <div>
                  {loginOtpStep === 1 ? (
                    <form className="space-y-4" onSubmit={handleSendLoginOtp}>
                      <InputField
                        label="Registered Email"
                        icon={Mail}
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@email.com"
                      />

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /><span>Sending OTP…</span></>
                        ) : (
                          <><Send className="h-4 w-4" /><span>Send OTP to Email</span></>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={handleVerifyLoginOtp}>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit Code</label>
                          <button
                            type="button"
                            onClick={handleSendLoginOtp}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Resend Code
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={loginOtp}
                          onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-4 py-2.5 text-center tracking-[8px] font-mono font-extrabold text-base bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:border-emerald-500 transition"
                        />
                        <p className="text-[11px] text-slate-500 text-center">Code sent to <strong>{loginEmail}</strong> from sih96880@gmail.com</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setLoginOtpStep(1)}
                          className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Sign In</span>}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <SocialButtons
                oauthError={oauthError}
                setOauthError={setOauthError}
                selectedRole={selectedRole}
                onSuccess={handleOAuthSuccess}
              />
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ REGISTER PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Start connecting your skills with opportunities.</p>
              </div>

              {/* Success state */}
              {successMsg ? (
                <div className="text-center py-6 space-y-3 bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Created & Verified!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Welcome to SkillNexus AI. Redirecting to your workspace...
                  </p>
                </div>
              ) : (
                <div>
                  {errorMsg && (
                    <div className="flex items-start space-x-2.5 p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Step Progress Pills */}
                  <div className="flex items-center space-x-2 mb-4">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          regStep >= s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Steps 1 & 2: Fill details */}
                  {regStep < 3 ? (
                    <form className="space-y-4" onSubmit={handleRegisterNext}>
                      {/* Step 1: Name, Email & Role */}
                      {regStep === 1 && (
                        <div className="space-y-4">
                          <RoleSelector value={selectedRole} onChange={setSelectedRole} />

                          <InputField
                            label="Full Name / Organization"
                            icon={User}
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Enter your name"
                          />

                          <InputField
                            label="Official Email Address"
                            icon={Mail}
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="you@email.com"
                          />
                        </div>
                      )}

                      {/* Step 2: Password & Role-specific details */}
                      {regStep === 2 && (
                        <div className="space-y-3.5">
                          <InputField
                            label="Create Password"
                            icon={Lock}
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            rightElement={
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />

                          <InputField
                            label="Confirm Password"
                            icon={Lock}
                            type="password"
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                          />

                          <PasswordStrengthMeter password={regPassword} />
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        {regStep > 1 && (
                          <button
                            type="button"
                            onClick={() => setRegStep(prev => prev - 1)}
                            className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back</span>
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`${regStep > 1 ? 'w-2/3' : 'w-full'} py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer`}
                        >
                          {submitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /><span>Sending OTP…</span></>
                          ) : (
                            <><span>{regStep === 2 ? 'Send Email OTP' : 'Continue'}</span><ArrowRight className="h-3.5 w-3.5" /></>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 3: Verify OTP */
                    <form className="space-y-4" onSubmit={handleVerifyRegisterOtp}>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit Email OTP</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={regOtp}
                          onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-4 py-2.5 text-center tracking-[8px] font-mono font-extrabold text-base bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:border-emerald-500 transition"
                        />
                        <p className="text-[11px] text-slate-500 text-center">Verification code dispatched to <strong>{regEmail}</strong> via sih96880@gmail.com</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Create Account</span>}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Social login on register */}
                  {!successMsg && regStep === 1 && (
                    <div className="mt-4">
                      <SocialButtons
                        oauthError={oauthError}
                        setOauthError={setOauthError}
                        selectedRole={selectedRole}
                        onSuccess={handleOAuthSuccess}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer toggle */}
        <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-medium">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
