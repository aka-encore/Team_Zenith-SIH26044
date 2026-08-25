import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { OrbitingSkills } from '../components/OrbitingSkills';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { 
  Dna, Eye, EyeOff, Lock, Mail, User, Loader2, ArrowRight, ArrowLeft,
  GraduationCap, Building2, BookOpen, CheckCircle2, ShieldCheck, Globe, MapPin, RefreshCw
} from 'lucide-react';
import { Toast } from '../components/ui/Toast';


export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'company' | 'institution'

  // Form states - Login (Starts EMPTY, no fake pre-filled values)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register (Starts EMPTY)
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Student specific details
  const [regCollege, setRegCollege] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regYear, setRegYear] = useState('');
  const [regSkills, setRegSkills] = useState('');

  // Company specific details
  const [regIndustry, setRegIndustry] = useState('');
  const [regWebsite, setRegWebsite] = useState('');

  // Institution specific details
  const [regInstType, setRegInstType] = useState('');
  const [regLocation, setRegLocation] = useState('');

  // Modals & Messages
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthNotice, setOauthNotice] = useState(null);


  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);


  // Switch between login and register modes
  const switchMode = (newMode) => {
    setErrorMsg('');
    setSuccessMsg('');
    setRegStep(1);
    setMode(newMode);
    window.history.pushState({}, '', newMode === 'register' ? '/register' : '/login');
  };


  // Handle Login Submit
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


  // Handle Real OAuth Integration Attempt (Student Only)
  const handleSocialOAuth = (provider) => {
    setOauthNotice(`${provider} sign-in is coming soon! Please use Email & Password to sign in for now.`);
  };


  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (selectedRole === 'student') {
      if (regStep === 1) {
        if (!regName || !regEmail) {
          setErrorMsg('Please enter your full name and email address.');
          return;
        }
        setErrorMsg('');
        setRegStep(2);
        return;
      }

      if (regStep === 2) {
        if (!regPassword || regPassword.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          return;
        }
        if (regPassword !== regConfirmPassword) {
          setErrorMsg('Passwords do not match.');
          return;
        }
        setErrorMsg('');
        setRegStep(3);
        return;
      }
    } else {
      // Company or Institution - Step 1: Info -> Step 2: Password
      if (regStep === 1) {
        if (!regName || !regEmail) {
          setErrorMsg('Please fill in all required information fields.');
          return;
        }
        setErrorMsg('');
        setRegStep(2);
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    // Final Submission
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await register(regName, regEmail, regPassword, selectedRole);
    setSubmitting(false);

    if (result.success) {
      setRegisteredEmail(regEmail);
      setSuccessMsg(result.message);
      if (!result.isPending) {
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } else {
      setErrorMsg(result.message || 'Registration failed. Please try again.');
    }
  };


  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans">
      <ForgotPasswordModal isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />

      {/* UNIFIED FIT-TO-VIEWPORT CONTAINER */}
      <div className="w-[94vw] max-w-7xl h-[calc(100vh-110px)] min-h-[580px] max-h-[740px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-2xl shadow-slate-300/60 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
        
        {/* LEFT COLUMN: STATIC ROLE VISUAL (~45% width) */}
        <div className="lg:col-span-5 h-full">
          <OrbitingSkills selectedRole={selectedRole} />
        </div>

        {/* RIGHT COLUMN: FORM SHELL (~55% width) */}
        <div className="lg:col-span-7 h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 text-left transition-colors">
          
          {/* Header Brand & SSL Badge */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Dna className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight block">SkillBridge</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">SkillBridge Workspace</span>
              </div>
            </Link>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure SSL Login</span>
            </div>
          </div>

          {/* SLIDING FORM CONTAINER */}
          <div className="auth-slider-container my-auto py-2">
            
            {/* -------------------- LOGIN SLIDE PANEL -------------------- */}
            <div className={`auth-slide-panel ${mode === 'login' ? 'auth-slide-left-active' : 'auth-slide-left-enter pointer-events-none'}`}>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Sign in to continue to your SkillBridge workspace.
                  </p>
                </div>

                {/* SEGMENTED ROLE SELECTOR */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Select Role</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-300 dark:border-slate-800">
                    {[
                      { id: 'student', label: 'Student', icon: GraduationCap },
                      { id: 'company', label: 'Company', icon: Building2 },
                      { id: 'institution', label: 'Institution', icon: BookOpen }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`flex items-center justify-center space-x-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                          selectedRole === r.id 
                            ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-300 dark:border-slate-700' 
                            : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <r.icon className="h-3.5 w-3.5" />
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LOGIN FORM */}
                <form className="space-y-3 pt-1" onSubmit={handleLoginSubmit}>
                  {errorMsg && mode === 'login' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Email Address</label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm outline-none transition font-semibold"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm outline-none transition font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Signing you in...</span>
                        </>
                      ) : (
                        <span>Sign In →</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* SOCIAL LOGIN — RESTRICTED STRICTLY TO STUDENT ROLE ONLY */}
                {selectedRole === 'student' && (
                  <div className="space-y-2 pt-1">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                      <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
                        OR CONTINUE WITH
                      </span>
                    </div>

                    {oauthNotice && (
                      <Toast type="info" message={oauthNotice} onClose={() => setOauthNotice(null)} />
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Google', icon: (
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        )},
                        { name: 'Microsoft', icon: (
                          <svg className="h-4 w-4" viewBox="0 0 23 23">
                            <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                          </svg>
                        )},
                        { name: 'LinkedIn', icon: (
                          <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                          </svg>
                        )}
                      ].map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSocialOAuth(s.name)}
                          className="py-2.5 px-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-blue-500 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          {s.icon}
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------- REGISTER SLIDE PANEL -------------------- */}
            <div className={`auth-slide-panel ${mode === 'register' ? 'auth-slide-right-active' : 'auth-slide-right-enter pointer-events-none'}`}>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Your Account</h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Start connecting your skills, learning and opportunities.
                  </p>
                </div>

                {/* VERIFICATION & SUCCESS VIEW */}
                {successMsg && mode === 'register' ? (
                  <div className="text-center py-6 space-y-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Verify Your Email</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      We've sent a verification link to <strong className="text-slate-900 dark:text-white font-mono">{registeredEmail}</strong>.
                    </p>
                    <div className="pt-2 flex justify-center space-x-2">
                      <button
                        onClick={() => alert(`Verification link resent to ${registeredEmail}`)}
                        className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Resend Email</span>
                      </button>
                      <button
                        onClick={() => switchMode('login')}
                        className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Proceed to Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                    {errorMsg && mode === 'register' && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold">
                        {errorMsg}
                      </div>
                    )}

                    {/* SELECT ACCOUNT TYPE CARDS */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Select Account Type</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'student', title: 'Student', desc: 'Build skills & discover opportunities', icon: GraduationCap },
                          { id: 'company', title: 'Company', desc: 'Find talent & build pipeline', icon: Building2 },
                          { id: 'institution', title: 'Institution', icon: BookOpen, desc: 'Empower students' }
                        ].map((rc) => (
                          <button
                            key={rc.id}
                            type="button"
                            onClick={() => { setSelectedRole(rc.id); setRegStep(1); }}
                            className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                              selectedRole === rc.id
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                                : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                            }`}
                          >
                            <rc.icon className="h-4 w-4 mx-auto mb-0.5" />
                            <span className="text-[11px] block font-bold">{rc.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ---------------- STUDENT REGISTRATION (3-STEP) ---------------- */}
                    {selectedRole === 'student' && (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
                          <span>Step {regStep} of 3</span>
                          <span>{regStep === 1 ? 'Personal Info' : regStep === 2 ? 'Account Security' : 'Student Details'}</span>
                        </div>

                        {regStep === 1 && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Full Name</label>
                              <div className="relative">
                                <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                  type="text"
                                  required
                                  value={regName}
                                  onChange={(e) => setRegName(e.target.value)}
                                  placeholder="Enter your full name"
                                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Email Address</label>
                              <div className="relative">
                                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                  type="email"
                                  required
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
                                  placeholder="Enter your official email"
                                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {regStep === 2 && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Password</label>
                              <div className="relative">
                                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                  type={showRegPassword ? 'text' : 'password'}
                                  required
                                  value={regPassword}
                                  onChange={(e) => setRegPassword(e.target.value)}
                                  placeholder="Enter password"
                                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegPassword(!showRegPassword)}
                                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                                >
                                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Confirm Password</label>
                              <div className="relative">
                                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                                <input
                                  type={showRegPassword ? 'text' : 'password'}
                                  value={regConfirmPassword}
                                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                                  placeholder="Re-enter password"
                                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                            <PasswordStrengthMeter password={regPassword} />
                          </div>
                        )}

                        {regStep === 3 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">College</label>
                                <input
                                  type="text"
                                  value={regCollege}
                                  onChange={(e) => setRegCollege(e.target.value)}
                                  placeholder="Institution Name"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">Department</label>
                                <input
                                  type="text"
                                  value={regDept}
                                  onChange={(e) => setRegDept(e.target.value)}
                                  placeholder="Computer Science"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-0.5">Skills / Tech Stack</label>
                              <input
                                type="text"
                                value={regSkills}
                                onChange={(e) => setRegSkills(e.target.value)}
                                placeholder="React, Node.js, Python, Cloud"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ---------------- COMPANY REGISTRATION ---------------- */}
                    {selectedRole === 'company' && (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
                          <span>Step {regStep} of 2</span>
                          <span>{regStep === 1 ? 'Company Information' : 'Account Security'}</span>
                        </div>

                        {regStep === 1 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Company Name</label>
                                <input
                                  type="text"
                                  required
                                  value={regName}
                                  onChange={(e) => setRegName(e.target.value)}
                                  placeholder="Company Name"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Official Email</label>
                                <input
                                  type="email"
                                  required
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
                                  placeholder="hr@company.com"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Industry</label>
                                <input
                                  type="text"
                                  value={regIndustry}
                                  onChange={(e) => setRegIndustry(e.target.value)}
                                  placeholder="Enterprise Software"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Website</label>
                                <input
                                  type="url"
                                  value={regWebsite}
                                  onChange={(e) => setRegWebsite(e.target.value)}
                                  placeholder="https://company.com"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Password</label>
                              <input
                                type="password"
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Confirm Password</label>
                              <input
                                type="password"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                              />
                            </div>
                            <PasswordStrengthMeter password={regPassword} />
                          </div>
                        )}
                      </>
                    )}

                    {/* ---------------- INSTITUTION REGISTRATION ---------------- */}
                    {selectedRole === 'institution' && (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
                          <span>Step {regStep} of 2</span>
                          <span>{regStep === 1 ? 'Institution Information' : 'Account Security'}</span>
                        </div>

                        {regStep === 1 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Institution Name</label>
                                <input
                                  type="text"
                                  required
                                  value={regName}
                                  onChange={(e) => setRegName(e.target.value)}
                                  placeholder="Institution Name"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Official Email</label>
                                <input
                                  type="email"
                                  required
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
                                  placeholder="admin@college.edu"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Institution Type</label>
                                <input
                                  type="text"
                                  value={regInstType}
                                  onChange={(e) => setRegInstType(e.target.value)}
                                  placeholder="University / Institute"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Location</label>
                                <input
                                  type="text"
                                  value={regLocation}
                                  onChange={(e) => setRegLocation(e.target.value)}
                                  placeholder="City, State"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Password</label>
                              <input
                                type="password"
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Confirm Password</label>
                              <input
                                type="password"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl text-xs outline-none font-semibold"
                              />
                            </div>
                            <PasswordStrengthMeter password={regPassword} />
                          </div>
                        )}
                      </>
                    )}

                    {/* REGISTRATION STEP NAVIGATION CONTROLS */}
                    <div className="flex space-x-2 pt-2">
                      {regStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setRegStep(prev => prev - 1)}
                          className="w-1/3 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Back</span>
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`${regStep > 1 ? 'w-2/3' : 'w-full'} py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>{((selectedRole === 'student' && regStep === 3) || (selectedRole !== 'student' && regStep === 2)) ? 'Create Account' : 'Next Step'}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* FOOTER MODES TOGGLE */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
