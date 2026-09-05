import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, 
  Sun, Moon, ArrowLeft, ArrowRight, ShieldCheck, 
  GraduationCap, Building2, School, Sparkles, Check,
  User, Mail, Lock, Phone, Hash, BookOpen, Layers, Globe, MapPin, Briefcase
} from 'lucide-react';

const REG_ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'faculty', label: 'Faculty', icon: School }
];

const ROLE_INFO = {
  student: {
    badge: 'Student Onboarding',
    title: 'Start your skill journey',
    description: 'Verify your engineering proficiencies, get real-time skill gap analysis, and unlock verified placement drives.',
    quote: '“Benchmark your technical skills against actual industry benchmarks.”'
  },
  company: {
    badge: 'Corporate Partner',
    title: 'Recruit verified talent',
    description: 'Create customized assessment drives, filter high-performing candidates, and build direct campus hiring pipelines.',
    quote: '“Connect with pre-assessed candidates possessing verified job-ready competencies.”'
  },
  faculty: {
    badge: 'Academic Mentor',
    title: 'Empower student success',
    description: 'Track cohort performance, analyze department curriculum gaps, and oversee campus recruitment metrics.',
    quote: '“Bridge the academia-industry gap with granular cohort analytics and training paths.”'
  }
};

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Step 1: Form Fill | Step 2: OTP Verification
  const [step, setStep] = useState(1);

  // 3 Roles: Student, Company, Faculty
  const [selectedRole, setSelectedRole] = useState('student');
  const [activeField, setActiveField] = useState('name');

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Student Specific
  const [rollNumber, setRollNumber] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  // Company Specific
  const [companyName, setCompanyName] = useState('');
  const [hrName, setHrName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  // Faculty Specific
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes (600s)
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Countdown timer for OTP
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

  // Dynamic field helper messages as user clicks through fields
  const getFieldHelperText = () => {
    switch (activeField) {
      case 'name':
        return selectedRole === 'company' ? 'Enter the registered legal name of your enterprise.' : 'Enter your legal full name as shown on institutional records.';
      case 'email':
        return selectedRole === 'student' ? 'Use your college email if available for fast verification.' : 'Enter your official communications email address.';
      case 'password':
        return 'Create a secure password with at least 6 characters.';
      case 'confirmPassword':
        return 'Re-enter your password to confirm accuracy.';
      case 'phone':
        return 'Enter a 10-digit mobile number for instant SMS alerts.';
      case 'rollNumber':
        return 'Your official PRN or University Roll Number.';
      case 'college':
        return 'Full name of your affiliated college or university.';
      case 'department':
        return 'Your enrolled branch or engineering discipline.';
      case 'employeeId':
        return 'Your unique faculty or staff identification number.';
      case 'companyName':
        return 'Name of your registered organization or corporate entity.';
      case 'hrName':
        return 'Primary recruitment coordinator or talent acquisition contact.';
      case 'website':
        return 'Official website URL (e.g. https://company.com).';
      default:
        return ROLE_INFO[selectedRole]?.description || 'Complete all required registration fields.';
    }
  };

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
      if (!rollNumber.trim()) errors.rollNumber = 'Roll / PRN number is required.';
      if (!college.trim()) errors.college = 'College / Institute is required.';
      if (!department.trim()) errors.department = 'Department is required.';
    } else if (selectedRole === 'company') {
      if (!companyName.trim()) errors.companyName = 'Company name is required.';
      if (!hrName.trim()) errors.hrName = 'Contact person name is required.';
      if (!industry.trim()) errors.industry = 'Industry domain is required.';
      if (!website.trim()) errors.website = 'Company website is required.';
      if (!address.trim()) errors.address = 'Headquarters location is required.';
    } else if (selectedRole === 'faculty') {
      if (!name.trim()) errors.name = 'Full name is required.';
      if (!employeeId.trim()) errors.employeeId = 'Employee ID is required.';
      if (!college.trim()) errors.college = 'College / Institute is required.';
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

  // Step 2: Verify OTP & Complete Account Creation
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
          ? 'Corporate registration verified! Account is pending verification. Redirecting to sign in...'
          : 'Account created successfully! Redirecting to sign in...'
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      console.error('OTP verification error:', err);
      setErrorMsg(err.message || 'Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = ROLE_INFO[selectedRole] || ROLE_INFO.student;

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '44px',
    borderRadius: '12px',
    padding: '0 14px 0 38px',
    fontSize: '13px',
    background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
    border: hasError ? '1px solid #EF4444' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)'),
    color: isLight ? '#090C0B' : '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s ease, background 0.2s ease'
  });

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '15px',
    height: '15px',
    color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.55)',
    pointerEvents: 'none'
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between font-sans selection:bg-emerald-500/20 selection:text-emerald-500"
      style={{
        background: isLight ? '#F8FAFC' : '#090D16',
        color: isLight ? '#0F172A' : '#FFFFFF',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* ── Top Floating Header ── */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-6 pb-2 flex items-center justify-between z-20">
        <Link to="/" className="inline-flex items-center gap-2.5 no-underline group">
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#059669',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: isLight ? '#090C0B' : '#FFFFFF' }}>
            SkillNexus
          </span>
        </Link>

        <div className="flex items-center gap-3">
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
              justifyContent: 'center'
            }}
            title="Toggle theme"
          >
            {isLight ? <Moon style={{ width: '16px', height: '16px' }} /> : <Sun style={{ width: '16px', height: '16px' }} />}
          </button>

          <Link
            to="/login"
            style={{
              padding: '7px 18px',
              borderRadius: '10px',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
              background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
              color: isLight ? '#0F172A' : '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-slate-100 dark:hover:bg-white/20"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Main Registration Card ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div 
          className="w-full max-w-2xl rounded-[24px] overflow-hidden p-8 sm:p-12 relative transition-all duration-300"
          style={{
            background: isLight ? '#FFFFFF' : '#14151E',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isLight 
              ? '0 20px 40px -12px rgba(0, 0, 0, 0.08)' 
              : '0 30px 60px -12px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div className="relative z-10 space-y-6">
            
            {/* Header: Centered Title */}
            <div className="text-center space-y-2">
              <h1 
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: isLight ? '#090C0B' : '#FFFFFF',
                  margin: 0
                }}
              >
                {step === 1 ? 'Create Account' : 'Verify Email OTP'}
              </h1>
              
              <p 
                style={{ 
                  fontSize: '13.5px', 
                  color: isLight ? '#475569' : '#94A3B8', 
                  maxWidth: '480px',
                  margin: '0 auto',
                  lineHeight: '1.5'
                }}
              >
                {step === 1 ? getFieldHelperText() : `Enter the 6-digit OTP code dispatched to ${email.toLowerCase()}`}
              </p>
            </div>

            {/* 3-Role Tab Selector: Student | Company | Faculty */}
            {step === 1 && (
              <div 
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl"
                style={{
                  background: isLight ? '#F1F5F9' : 'rgba(0, 0, 0, 0.35)',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {REG_ROLES.map(r => {
                  const isSelected = selectedRole === r.id;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.id);
                        setFieldErrors({});
                        setErrorMsg('');
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isSelected 
                          ? (isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.18)') 
                          : 'transparent',
                        color: isSelected 
                          ? (isLight ? '#059669' : '#10B981') 
                          : (isLight ? '#64748B' : '#94A3B8'),
                        boxShadow: isSelected ? (isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 4px 12px rgba(0, 0, 0, 0.25)') : 'none',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon style={{ width: '15px', height: '15px' }} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error and Success Feedback */}
            {errorMsg && (
              <div 
                className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444'
                }}
              >
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div 
                className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981'
                }}
              >
                <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ══════════════ STEP 1: REGISTRATION FORM ══════════════ */}
            {step === 1 && (
              <form onSubmit={handleInitiateRegistration} className="space-y-4">
                
                {/* ── 1. STUDENT FIELDS ── */}
                {selectedRole === 'student' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onFocus={() => setActiveField('name')}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                            }}
                            className="glassy-input"
                            style={inputStyle(fieldErrors.name)}
                          />
                          <User style={iconStyle} />
                        </div>
                        {fieldErrors.name && <span className="text-[11px] text-rose-300">{fieldErrors.name}</span>}
                      </div>

                      {/* Roll No */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Roll / PRN Number"
                            value={rollNumber}
                            onFocus={() => setActiveField('rollNumber')}
                            onChange={(e) => {
                              setRollNumber(e.target.value);
                              if (fieldErrors.rollNumber) setFieldErrors({ ...fieldErrors, rollNumber: '' });
                            }}
                            className="glassy-input"
                            style={inputStyle(fieldErrors.rollNumber)}
                          />
                          <Hash style={iconStyle} />
                        </div>
                        {fieldErrors.rollNumber && <span className="text-[11px] text-rose-300">{fieldErrors.rollNumber}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* College */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="College / Institute"
                            value={college}
                            onFocus={() => setActiveField('college')}
                            onChange={(e) => {
                              setCollege(e.target.value);
                              if (fieldErrors.college) setFieldErrors({ ...fieldErrors, college: '' });
                            }}
                            className="glassy-input"
                            style={inputStyle(fieldErrors.college)}
                          />
                          <School style={iconStyle} />
                        </div>
                        {fieldErrors.college && <span className="text-[11px] text-rose-300">{fieldErrors.college}</span>}
                      </div>

                      {/* Department */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Department / Branch"
                            value={department}
                            onFocus={() => setActiveField('department')}
                            onChange={(e) => {
                              setDepartment(e.target.value);
                              if (fieldErrors.department) setFieldErrors({ ...fieldErrors, department: '' });
                            }}
                            className="glassy-input"
                            style={inputStyle(fieldErrors.department)}
                          />
                          <BookOpen style={iconStyle} />
                        </div>
                        {fieldErrors.department && <span className="text-[11px] text-rose-300">{fieldErrors.department}</span>}
                      </div>
                    </div>

                    {/* Year of study */}
                    <div className="space-y-1">
                      <select
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          padding: '0 14px',
                          fontSize: '13px',
                          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                          border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#090C0B' : '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="1st Year" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>1st Year Undergraduate</option>
                        <option value="2nd Year" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>2nd Year Undergraduate</option>
                        <option value="3rd Year" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>3rd Year Undergraduate</option>
                        <option value="Final Year" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Final Year Undergraduate</option>
                        <option value="Postgraduate" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Postgraduate / Masters</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── 2. COMPANY FIELDS ── */}
                {selectedRole === 'company' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={companyName}
                            onFocus={() => setActiveField('companyName')}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              if (fieldErrors.companyName) setFieldErrors({ ...fieldErrors, companyName: '' });
                            }}
                            style={inputStyle(fieldErrors.companyName)}
                          />
                          <Building2 style={iconStyle} />
                        </div>
                        {fieldErrors.companyName && <span className="text-[11px] text-rose-500">{fieldErrors.companyName}</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="HR / Contact Person"
                            value={hrName}
                            onFocus={() => setActiveField('hrName')}
                            onChange={(e) => {
                              setHrName(e.target.value);
                              if (fieldErrors.hrName) setFieldErrors({ ...fieldErrors, hrName: '' });
                            }}
                            style={inputStyle(fieldErrors.hrName)}
                          />
                          <User style={iconStyle} />
                        </div>
                        {fieldErrors.hrName && <span className="text-[11px] text-rose-500">{fieldErrors.hrName}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Company Website"
                            value={website}
                            onFocus={() => setActiveField('website')}
                            onChange={(e) => {
                              setWebsite(e.target.value);
                              if (fieldErrors.website) setFieldErrors({ ...fieldErrors, website: '' });
                            }}
                            style={inputStyle(fieldErrors.website)}
                          />
                          <Globe style={iconStyle} />
                        </div>
                        {fieldErrors.website && <span className="text-[11px] text-rose-500">{fieldErrors.website}</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Headquarters Location"
                            value={address}
                            onFocus={() => setActiveField('address')}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
                            }}
                            style={inputStyle(fieldErrors.address)}
                          />
                          <MapPin style={iconStyle} />
                        </div>
                        {fieldErrors.address && <span className="text-[11px] text-rose-500">{fieldErrors.address}</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          padding: '0 14px',
                          fontSize: '13px',
                          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                          border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#090C0B' : '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Technology & Software" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Technology & Software</option>
                        <option value="Financial Services & Fintech" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Financial Services & Fintech</option>
                        <option value="Core Engineering & Manufacturing" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Core Engineering & Manufacturing</option>
                        <option value="Healthcare & Life Sciences" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Healthcare & Life Sciences</option>
                        <option value="Consulting & Business Services" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Consulting & Business Services</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── 3. FACULTY FIELDS ── */}
                {selectedRole === 'faculty' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onFocus={() => setActiveField('name')}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                            }}
                            style={inputStyle(fieldErrors.name)}
                          />
                          <User style={iconStyle} />
                        </div>
                        {fieldErrors.name && <span className="text-[11px] text-rose-500">{fieldErrors.name}</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Employee / Staff ID"
                            value={employeeId}
                            onFocus={() => setActiveField('employeeId')}
                            onChange={(e) => {
                              setEmployeeId(e.target.value);
                              if (fieldErrors.employeeId) setFieldErrors({ ...fieldErrors, employeeId: '' });
                            }}
                            style={inputStyle(fieldErrors.employeeId)}
                          />
                          <Hash style={iconStyle} />
                        </div>
                        {fieldErrors.employeeId && <span className="text-[11px] text-rose-500">{fieldErrors.employeeId}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="College / Institute"
                            value={college}
                            onFocus={() => setActiveField('college')}
                            onChange={(e) => {
                              setCollege(e.target.value);
                              if (fieldErrors.college) setFieldErrors({ ...fieldErrors, college: '' });
                            }}
                            style={inputStyle(fieldErrors.college)}
                          />
                          <School style={iconStyle} />
                        </div>
                        {fieldErrors.college && <span className="text-[11px] text-rose-500">{fieldErrors.college}</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Department"
                            value={department}
                            onFocus={() => setActiveField('department')}
                            onChange={(e) => {
                              setDepartment(e.target.value);
                              if (fieldErrors.department) setFieldErrors({ ...fieldErrors, department: '' });
                            }}
                            style={inputStyle(fieldErrors.department)}
                          />
                          <BookOpen style={iconStyle} />
                        </div>
                        {fieldErrors.department && <span className="text-[11px] text-rose-500">{fieldErrors.department}</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '12px',
                          padding: '0 14px',
                          fontSize: '13px',
                          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                          border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isLight ? '#090C0B' : '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Assistant Professor" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Assistant Professor</option>
                        <option value="Associate Professor" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Associate Professor</option>
                        <option value="Professor & Head of Department" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Professor & Head of Department</option>
                        <option value="Training & Placement Officer (TPO)" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Training & Placement Officer (TPO)</option>
                        <option value="Dean / Principal" style={{ background: isLight ? '#FFFFFF' : '#0F172A', color: isLight ? '#0F172A' : '#FFFFFF' }}>Dean / Principal</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── COMMON CONTACT & CREDENTIAL FIELDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Email */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onFocus={() => setActiveField('email')}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                        }}
                        style={inputStyle(fieldErrors.email)}
                      />
                      <Mail style={iconStyle} />
                    </div>
                    {fieldErrors.email && <span className="text-[11px] text-rose-500">{fieldErrors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onFocus={() => setActiveField('phone')}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                        }}
                        style={inputStyle(fieldErrors.phone)}
                      />
                      <Phone style={iconStyle} />
                    </div>
                    {fieldErrors.phone && <span className="text-[11px] text-rose-500">{fieldErrors.phone}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (min. 6 chars)"
                        value={password}
                        onFocus={() => setActiveField('password')}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                        }}
                        style={inputStyle(fieldErrors.password)}
                      />
                      <Lock style={iconStyle} />
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
                          color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                    {fieldErrors.password && <span className="text-[11px] text-rose-500">{fieldErrors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onFocus={() => setActiveField('confirmPassword')}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                        }}
                        style={inputStyle(fieldErrors.confirmPassword)}
                      />
                      <Lock style={iconStyle} />
                    </div>
                    {fieldErrors.confirmPassword && <span className="text-[11px] text-rose-500">{fieldErrors.confirmPassword}</span>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    background: isLight ? '#059669' : '#10B981',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    marginTop: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:brightness-110 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            )}

            {/* ══════════════ STEP 2: OTP VERIFICATION ══════════════ */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '14px',
                      padding: '0 14px',
                      fontSize: '22px',
                      letterSpacing: '0.4em',
                      textAlign: 'center',
                      fontWeight: 800,
                      background: isLight ? '#F8FAFC' : 'rgba(0, 0, 0, 0.45)',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.25)',
                      color: isLight ? '#090C0B' : '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.7)' }}>Code expires: {formatTimer(otpTimer)}</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: resendCooldown > 0 ? '#94A3B8' : (isLight ? '#059669' : '#10B981'),
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    style={{
                      height: '44px',
                      borderRadius: '12px',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
                      background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.06)',
                      color: isLight ? '#0F172A' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Edit Details
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      height: '44px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isLight ? '#059669' : '#10B981',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {loading ? <Loader2 className="animate-spin" style={{ width: '15px', height: '15px' }} /> : 'Verify & Finish'}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom: Already have an account? Login */}
            <div className="text-center pt-2">
              <span style={{ fontSize: '13px', color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.75)' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: isLight ? '#059669' : '#10B981',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  className="hover:underline"
                >
                  Login
                </Link>
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between text-xs z-10" style={{ color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' }}>
        <span>© {new Date().getFullYear()} SkillNexus Institutional Platform</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:underline transition">Privacy Policy</Link>
          <Link to="/" className="hover:underline transition">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}

// Inline input styling helper
const inputStyle = (hasError) => ({
  width: '100%',
  height: '44px',
  borderRadius: '12px',
  padding: '0 14px 0 38px',
  fontSize: '13px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: hasError ? '1px solid #F43F5E' : '1px solid rgba(255, 255, 255, 0.18)',
  color: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.2s ease, background 0.2s ease'
});

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '15px',
  height: '15px',
  color: 'rgba(255, 255, 255, 0.55)',
  pointerEvents: 'none'
};
