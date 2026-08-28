import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Building2, School, Sparkles, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, 
  Eye, EyeOff, Lock, Mail, User, Phone, Globe, 
  MapPin, Hash, Briefcase, BookOpen, Loader2, KeyRound, 
  RotateCcw, ShieldCheck
} from 'lucide-react';

const REG_ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-emerald-400', desc: 'Assess skills, discover jobs & join campus drives' },
  { id: 'company', label: 'Company', icon: Building2, color: 'text-purple-400', desc: 'Post hiring drives, discover verified talent & recruit' },
  { id: 'faculty', label: 'Faculty', icon: School, color: 'text-blue-400', desc: 'Track department skill DNA & placement readiness' }
];

export default function Register() {
  const navigate = useNavigate();

  // Step 1: Form Fill | Step 2: OTP Verification
  const [step, setStep] = useState(1);

  // Role Selection (Student, Company, Faculty - NO ADMIN)
  const [selectedRole, setSelectedRole] = useState('student');

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Student Fields
  const [rollNumber, setRollNumber] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  // Company Fields
  const [companyName, setCompanyName] = useState('');
  const [hrName, setHrName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  // Faculty Fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes expiry (600s)
  const [resendCooldown, setResendCooldown] = useState(30); // 30s resend cooldown
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Countdown timer for OTP expiry and resend
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

  // Validate Step 1 Form
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9]{10,14}$/.test(phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (selectedRole === 'student') {
      if (!name.trim()) errors.name = 'Full name is required.';
      if (!rollNumber.trim()) errors.rollNumber = 'Roll number is required.';
      if (!college.trim()) errors.college = 'College/Institute name is required.';
      if (!department.trim()) errors.department = 'Department is required.';
    } else if (selectedRole === 'company') {
      if (!companyName.trim()) errors.companyName = 'Company name is required.';
      if (!hrName.trim()) errors.hrName = 'HR / Recruiter name is required.';
      if (!industry.trim()) errors.industry = 'Industry sector is required.';
      if (!website.trim()) errors.website = 'Company website is required.';
      if (!address.trim()) errors.address = 'Company headquarters address is required.';
    } else if (selectedRole === 'faculty') {
      if (!name.trim()) errors.name = 'Full name is required.';
      if (!employeeId.trim()) errors.employeeId = 'Employee ID is required.';
      if (!college.trim()) errors.college = 'College/Institute name is required.';
      if (!department.trim()) errors.department = 'Department is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPayload = () => ({
    role: selectedRole,
    email: email.trim().toLowerCase(),
    password,
    phone: phone.trim(),
    ...(selectedRole === 'student' && {
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      college: college.trim(),
      department: department.trim(),
      yearOfStudy
    }),
    ...(selectedRole === 'company' && {
      companyName: companyName.trim(),
      name: companyName.trim(),
      hrName: hrName.trim(),
      industry: industry.trim(),
      website: website.trim(),
      address: address.trim()
    }),
    ...(selectedRole === 'faculty' && {
      name: name.trim(),
      employeeId: employeeId.trim(),
      college: college.trim(),
      department: department.trim(),
      designation: designation.trim()
    })
  });

  // Step 1: Submit Form & Send Email OTP
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = getPayload();

      const response = await fetch('/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch verification code.');
      }

      setStep(2);
      setOtpTimer(600);
      setResendCooldown(30);
      setVerificationAttempts(0);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${email.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Registration OTP dispatch error:', err);
      setErrorMsg(err.message || 'Failed to initiate registration.');
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
      const payload = getPayload();

      const response = await fetch('/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend verification code.');
      }

      setOtpTimer(600);
      setResendCooldown(30);
      setSuccessMsg(`New 6-digit code sent to ${email.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (otpTimer <= 0) {
      setErrorMsg('Verification code has expired. Please click "Resend Code".');
      return;
    }

    if (verificationAttempts >= MAX_ATTEMPTS) {
      setErrorMsg('Maximum verification attempts exceeded. Please request a new OTP code.');
      return;
    }

    setLoading(true);
    setVerificationAttempts(prev => prev + 1);

    try {
      const response = await fetch('/api/auth/verify-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code. Please check and retry.');
      }

      setSuccessMsg(
        selectedRole === 'company'
          ? 'Corporate registration verified! Account is pending admin approval. Redirecting to login...'
          : 'Email verified and account created successfully! Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);

    } catch (err) {
      console.error('OTP verification error:', err);
      setErrorMsg(err.message || 'Verification failed. Please retry.');
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
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* ━━━━━━━━━━━━━━━━━━━━ LEFT COLUMN: HERO & VALUE PROPOSITIONS ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-4 relative hidden lg:flex flex-col justify-between p-8 bg-slate-950/60 border-r border-slate-800 overflow-hidden">
          
          {/* Realistic Professional Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" 
              alt="Engineers and students collaborating in modern workspace" 
              className="w-full h-full object-cover object-center filter brightness-[0.28] contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          </div>

          {/* Top Branding */}
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
              Join the next-generation micro-curricular AI ecosystem for dynamic student placements.
            </p>
          </div>

          {/* Value Propositions */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>For Students</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Personalized skill assessment tests, gap analysis, and tailored campus recruitment drives.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold font-mono">
                <Building2 className="h-3.5 w-3.5" />
                <span>For Employers</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Post full-time jobs and internships with automated verified candidate benchmarking.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold font-mono">
                <School className="h-3.5 w-3.5" />
                <span>For Faculty</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Supervise departmental cohorts, track eligible student pools, and oversee placement drives.
              </p>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Verified 2FA Email OTP</span>
            <span className="text-emerald-400 font-bold">● Multi-Tenant</span>
          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━ RIGHT COLUMN: REGISTRATION & OTP FORM ━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between text-left space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Edit Registration Details</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Already have an account? Sign In</span>
                </Link>
              )}
              <span className="text-[11px] text-slate-500 font-mono">
                {step === 1 ? 'Step 1 of 2: Details' : 'Step 2 of 2: OTP Verification'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {step === 1 ? 'Create Your Account' : 'Verify Email Address'}
            </h1>
            <p className="text-xs text-slate-400">
              {step === 1 
                ? 'Select your role to configure your customized platform workspace.'
                : `Enter the 6-digit verification code sent to ${email}.`}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center space-x-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ════════════════════ STEP 1: REGISTRATION FORM ════════════════════ */}
          {step === 1 && (
            <>
              {/* Role Selection Tabs (Student, Company, Faculty ONLY) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Choose Registration Role:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {REG_ROLES.map(r => {
                    const IconComponent = r.icon;
                    const isSelected = selectedRole === r.id;

                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.id);
                          setFieldErrors({});
                          setErrorMsg('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-xs'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${isSelected ? r.color : 'text-slate-500'}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{r.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight block truncate max-w-[130px]">{r.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleInitiateRegistration} className="space-y-4">
                
                {/* 1. Student Fields */}
                {selectedRole === 'student' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Full Name *</label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Alex Chen"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.name ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.name && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.name}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Roll / Registration Number *</label>
                        <div className="relative">
                          <Hash className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. 21CS045"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.rollNumber ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.rollNumber && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.rollNumber}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">College / Institute Name *</label>
                        <div className="relative">
                          <School className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. National Institute of Technology"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.college ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.college && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.college}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Department / Branch *</label>
                        <div className="relative">
                          <BookOpen className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Computer Science & Engineering"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.department ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.department && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.department}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Year of Study *</label>
                        <select
                          value={yearOfStudy}
                          onChange={(e) => setYearOfStudy(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="1st Year">1st Year (Freshman)</option>
                          <option value="2nd Year">2nd Year (Sophomore)</option>
                          <option value="3rd Year">3rd Year (Junior)</option>
                          <option value="4th Year">4th Year (Senior / Final)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Phone Number *</label>
                        <div className="relative">
                          <Phone className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.phone ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.phone && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.phone}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Company Fields */}
                {selectedRole === 'company' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Company Name *</label>
                        <div className="relative">
                          <Building2 className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. TechNova Cloud Technologies"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.companyName ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.companyName && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.companyName}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">HR / Recruiter Name *</label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Sarah Jenkins"
                            value={hrName}
                            onChange={(e) => setHrName(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.hrName ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.hrName && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.hrName}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Industry Sector *</label>
                        <div className="relative">
                          <Briefcase className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Cloud Infrastructure, AI, Fintech"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.industry ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.industry && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.industry}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Company Website *</label>
                        <div className="relative">
                          <Globe className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="url"
                            placeholder="https://technova.io"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.website ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.website && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.website}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">HQ Address / Location *</label>
                        <div className="relative">
                          <MapPin className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Bengaluru, Karnataka, India"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.address ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.address && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.address}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">HR Contact Phone *</label>
                        <div className="relative">
                          <Phone className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 ${fieldErrors.phone ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.phone && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.phone}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Faculty Fields */}
                {selectedRole === 'faculty' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Full Name *</label>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Dr. Rajesh Kumar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 ${fieldErrors.name ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.name && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.name}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Employee / Faculty ID *</label>
                        <div className="relative">
                          <Hash className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. FAC-2024-88"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 ${fieldErrors.employeeId ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.employeeId && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.employeeId}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">College / Institute Name *</label>
                        <div className="relative">
                          <School className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. National Institute of Technology"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 ${fieldErrors.college ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.college && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.college}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Department *</label>
                        <div className="relative">
                          <BookOpen className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="e.g. Computer Science & Engineering"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 ${fieldErrors.department ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.department && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.department}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Academic Designation *</label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                          <option value="Head of Department">Head of Department (HOD)</option>
                          <option value="Placement Officer">Training & Placement Officer (TPO)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Phone Number *</label>
                        <div className="relative">
                          <Phone className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 ${fieldErrors.phone ? 'border-rose-500' : 'border-slate-800'}`}
                          />
                        </div>
                        {fieldErrors.phone && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.phone}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Credentials (Email & Password) */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Account Email Address *</label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="email"
                        placeholder="Enter valid work or academic email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.email ? 'border-rose-500' : 'border-slate-800'}`}
                      />
                    </div>
                    {fieldErrors.email && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.email}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Create Password *</label>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-10 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.password ? 'border-rose-500' : 'border-slate-800'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {fieldErrors.password && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.password}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 ${fieldErrors.confirmPassword ? 'border-rose-500' : 'border-slate-800'}`}
                        />
                      </div>
                      {fieldErrors.confirmPassword && <span className="text-[10px] text-rose-400 font-bold">{fieldErrors.confirmPassword}</span>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Dispatching Email OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to OTP Verification</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

              </form>
            </>
          )}

          {/* ════════════════════ STEP 2: OTP VERIFICATION SCREEN ════════════════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Two-Factor Authentication Code Sent</span>
                </div>
                <p className="text-xs text-slate-300">
                  Please check your inbox at <span className="font-mono text-emerald-400 font-bold">{email}</span> for the 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                
                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold text-slate-300 block text-left">
                    Enter 6-Digit Email OTP Code:
                  </label>
                  
                  <div className="relative">
                    <KeyRound className="h-5 w-5 absolute left-4 top-3 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xl font-mono tracking-[0.5em] text-emerald-400 outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                    <span>Code Expiry: <strong className={otpTimer < 60 ? 'text-rose-400' : 'text-white'}>{formatTimer(otpTimer)}</strong></span>
                    <span>Attempts: <strong>{verificationAttempts}/{MAX_ATTEMPTS}</strong></span>
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || otpTimer <= 0 || verificationAttempts >= MAX_ATTEMPTS}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Security Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Create Account</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Didn't receive the email code?</span>
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

            </div>
          )}

          {/* Sign In Link */}
          <div className="text-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Already have an account? </span>
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
