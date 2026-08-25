import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import {
  Dna, Eye, EyeOff, Lock, Mail, User, Loader2, ArrowRight, ArrowLeft,
  GraduationCap, Building2, BookOpen, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw
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
    <div className="block text-xs font-bold text-slate-300">{label}</div>
    <div className="relative">
      {Icon && <Icon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm outline-none transition font-medium`}
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

const ROLE_TABS = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'institution', label: 'Institution', icon: BookOpen },
];

const RoleSelector = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Role</label>
    <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
      {ROLE_TABS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            value === r.id
              ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
              : 'text-slate-500 hover:text-slate-300'
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

const SocialButtons = ({ oauthError }) => {
  const handleGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLinkedIn = () => {
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-800 w-full" />
        <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-600 tracking-widest absolute whitespace-nowrap">
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
          className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer group"
        >
          <GoogleIcon />
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleLinkedIn}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-950 border border-slate-800 hover:border-[#0A66C2]/50 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer group"
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

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Student details
  const [regCollege, setRegCollege] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regSkills, setRegSkills] = useState('');

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

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync mode from URL
  useEffect(() => {
    if (location.pathname === '/register') setMode('register');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  // Check for oauth_error in URL params (redirected back from backend)
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
    setMode(newMode);
    window.history.pushState({}, '', newMode === 'register' ? '/register' : '/login');
  };

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  // Register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (selectedRole === 'student') {
      if (regStep === 1) {
        if (!regName || !regEmail) { setErrorMsg('Please enter your full name and email address.'); return; }
        setErrorMsg(''); setRegStep(2); return;
      }
      if (regStep === 2) {
        if (!regPassword || regPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
        if (regPassword !== regConfirmPassword) { setErrorMsg('Passwords do not match.'); return; }
        setErrorMsg(''); setRegStep(3); return;
      }
    } else {
      if (regStep === 1) {
        if (!regName || !regEmail) { setErrorMsg('Please fill in all required information fields.'); return; }
        setErrorMsg(''); setRegStep(2); return;
      }
      if (regPassword !== regConfirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    }

    setErrorMsg(''); setSuccessMsg(''); setSubmitting(true);
    const result = await register(regName, regEmail, regPassword, selectedRole);
    setSubmitting(false);

    if (result.success) {
      setRegisteredEmail(regEmail);
      setSuccessMsg(result.message);
      if (!result.isPending) {
        setTimeout(() => navigate('/'), 1200);
      }
    } else {
      setErrorMsg(result.message || 'Registration failed. Please try again.');
    }
  };

  const maxSteps = selectedRole === 'student' ? 3 : 2;
  const isLastStep = (selectedRole === 'student' && regStep === 3) || (selectedRole !== 'student' && regStep === 2);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090d16] px-4 py-10 font-sans">
      <ForgotPasswordModal isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />

      {/* ── AUTH CARD ── */}
      <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="p-8 space-y-6">

          {/* Brand + SSL Badge */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Dna className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">SkillNexus AI</span>
            </Link>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure SSL</span>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━ LOGIN PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-400 mt-0.5">Sign in to your SkillNexus AI workspace.</p>
              </div>

              <RoleSelector value={selectedRole} onChange={setSelectedRole} />

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                {errorMsg && (
                  <div className="flex items-start space-x-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

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
                        className="text-blue-400 hover:underline font-bold normal-case tracking-normal cursor-pointer"
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
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span>Signing in…</span></>
                  ) : (
                    <span>Sign In →</span>
                  )}
                </button>
              </form>

              <SocialButtons oauthError={oauthError} />
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ REGISTER PANEL ━━━━━━━━━━━━━━━━━━━━ */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
                <p className="text-sm text-slate-400 mt-0.5">Start connecting your skills with opportunities.</p>
              </div>

              {/* Success state */}
              {successMsg ? (
                <div className="text-center py-6 space-y-3 bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Account created!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We've sent a verification link to <strong className="font-mono text-white">{registeredEmail}</strong>.
                  </p>
                  <div className="pt-2 flex justify-center space-x-2">
                    <button
                      onClick={() => alert(`Verification link resent to ${registeredEmail}`)}
                      className="py-2 px-3 bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Resend Email</span>
                    </button>
                    <button
                      onClick={() => switchMode('login')}
                      className="py-2 px-4 bg-white text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  {errorMsg && (
                    <div className="flex items-start space-x-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Account type selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">Account Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'student', title: 'Student', icon: GraduationCap },
                        { id: 'company', title: 'Company', icon: Building2 },
                        { id: 'institution', title: 'Institution', icon: BookOpen },
                      ].map((rc) => (
                        <button
                          key={rc.id}
                          type="button"
                          onClick={() => { setSelectedRole(rc.id); setRegStep(1); setErrorMsg(''); }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            selectedRole === rc.id
                              ? 'bg-blue-600/10 border-blue-500 text-blue-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <rc.icon className="h-4 w-4 mx-auto mb-0.5" />
                          <span className="text-[11px] block font-bold">{rc.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pb-1 border-b border-slate-800">
                    <span>Step {regStep} of {maxSteps}</span>
                    <span>
                      {selectedRole === 'student'
                        ? ['Personal Info', 'Account Security', 'Student Details'][regStep - 1]
                        : selectedRole === 'company'
                          ? ['Company Info', 'Account Security'][regStep - 1]
                          : ['Institution Info', 'Account Security'][regStep - 1]}
                    </span>
                  </div>

                  {/* ── STUDENT STEPS ── */}
                  {selectedRole === 'student' && (
                    <>
                      {regStep === 1 && (
                        <div className="space-y-3">
                          <InputField label="Full Name" icon={User} type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name" />
                          <InputField label="Email Address" icon={Mail} type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="your@email.com" />
                        </div>
                      )}
                      {regStep === 2 && (
                        <div className="space-y-3">
                          <InputField
                            label="Password"
                            icon={Lock}
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            rightElement={
                              <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            }
                          />
                          <InputField label="Confirm Password" icon={Lock} type={showRegPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                          <PasswordStrengthMeter password={regPassword} />
                        </div>
                      )}
                      {regStep === 3 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">College</label><input type="text" value={regCollege} onChange={(e) => setRegCollege(e.target.value)} placeholder="Institution" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Department</label><input type="text" value={regDept} onChange={(e) => setRegDept(e.target.value)} placeholder="e.g. CS" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          </div>
                          <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Skills / Tech Stack</label><input type="text" value={regSkills} onChange={(e) => setRegSkills(e.target.value)} placeholder="React, Node.js, Python…" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── COMPANY STEPS ── */}
                  {selectedRole === 'company' && (
                    <>
                      {regStep === 1 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Company Name</label><input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Company Name" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Official Email</label><input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="hr@company.com" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Industry</label><input type="text" value={regIndustry} onChange={(e) => setRegIndustry(e.target.value)} placeholder="Enterprise Software" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Website</label><input type="url" value={regWebsite} onChange={(e) => setRegWebsite(e.target.value)} placeholder="https://company.com" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          </div>
                        </div>
                      )}
                      {regStep === 2 && (
                        <div className="space-y-3">
                          <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Password</label><input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Confirm Password</label><input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          <PasswordStrengthMeter password={regPassword} />
                        </div>
                      )}
                    </>
                  )}

                  {/* ── INSTITUTION STEPS ── */}
                  {selectedRole === 'institution' && (
                    <>
                      {regStep === 1 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Institution Name</label><input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Institution Name" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Official Email</label><input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="admin@college.edu" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Institution Type</label><input type="text" value={regInstType} onChange={(e) => setRegInstType(e.target.value)} placeholder="University / Institute" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                            <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Location</label><input type="text" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} placeholder="City, State" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          </div>
                        </div>
                      )}
                      {regStep === 2 && (
                        <div className="space-y-3">
                          <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Password</label><input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          <div className="space-y-1"><label className="block text-xs font-bold text-slate-400">Confirm Password</label><input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none font-medium focus:border-blue-500 transition" /></div>
                          <PasswordStrengthMeter password={regPassword} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Step navigation */}
                  <div className="flex space-x-2 pt-1">
                    {regStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setRegStep(prev => prev - 1)}
                        className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`${regStep > 1 ? 'w-2/3' : 'w-full'} py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer`}
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /><span>Creating…</span></>
                      ) : (
                        <><span>{isLastStep ? 'Create Account' : 'Next Step'}</span><ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Social login on register (only for student) */}
              {selectedRole === 'student' && !successMsg && (
                <SocialButtons oauthError={oauthError} />
              )}
            </div>
          )}

        </div>

        {/* Footer toggle */}
        <div className="px-8 py-4 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-bold text-blue-400 hover:underline cursor-pointer"
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
                className="font-bold text-blue-400 hover:underline cursor-pointer"
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
