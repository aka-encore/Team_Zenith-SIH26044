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

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col justify-between font-sans selection:bg-rose-500 selection:text-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 50% 80%, rgba(234, 88, 12, 0.25) 0%, transparent 60%),
          linear-gradient(180deg, #090E17 0%, #111A2E 50%, #1A1224 100%)
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF'
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
              background: 'linear-gradient(135deg, #14B8A6 0%, #F43F5E 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)'
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            SkillNexus
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            style={{
              padding: '6px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-white/20"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Main Glassmorphism Registration Card (Inspired by Image 2) ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div 
          className="w-full max-w-2xl rounded-[28px] overflow-hidden p-8 sm:p-12 relative transition-all duration-300"
          style={{
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(20, 184, 166, 0.15)'
          }}
        >
          {/* Subtle Ambient Glowing Spheres */}
          <div 
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} 
          />
          <div 
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(20, 184, 166, 0.15)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} 
          />

          <div className="relative z-10 space-y-6">
            
            {/* Header: Centered Title matching Image 2 */}
            <div className="text-center space-y-2">
              <h1 
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  margin: 0
                }}
              >
                {step === 1 ? 'Register' : 'Verify Email OTP'}
              </h1>
              
              {/* Dynamic Subtitle / Realtime Helper Text ("jas field change karl tas side cha text change kar") */}
              <p 
                style={{ 
                  fontSize: '13.5px', 
                  color: 'rgba(255, 255, 255, 0.75)', 
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
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
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
                        background: isSelected ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                        color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.25)' : 'none',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:text-white"
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
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FECDD3'
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
                  background: 'rgba(20, 184, 166, 0.2)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  color: '#99F6E4'
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
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="1st Year" style={{ background: '#0F172A' }}>1st Year Undergraduate</option>
                        <option value="2nd Year" style={{ background: '#0F172A' }}>2nd Year Undergraduate</option>
                        <option value="3rd Year" style={{ background: '#0F172A' }}>3rd Year Undergraduate</option>
                        <option value="Final Year" style={{ background: '#0F172A' }}>Final Year Undergraduate</option>
                        <option value="Postgraduate" style={{ background: '#0F172A' }}>Postgraduate / Masters</option>
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
                        {fieldErrors.companyName && <span className="text-[11px] text-rose-300">{fieldErrors.companyName}</span>}
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
                        {fieldErrors.hrName && <span className="text-[11px] text-rose-300">{fieldErrors.hrName}</span>}
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
                        {fieldErrors.website && <span className="text-[11px] text-rose-300">{fieldErrors.website}</span>}
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
                        {fieldErrors.address && <span className="text-[11px] text-rose-300">{fieldErrors.address}</span>}
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
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Technology & Software" style={{ background: '#0F172A' }}>Technology & Software</option>
                        <option value="Financial Services & Fintech" style={{ background: '#0F172A' }}>Financial Services & Fintech</option>
                        <option value="Core Engineering & Manufacturing" style={{ background: '#0F172A' }}>Core Engineering & Manufacturing</option>
                        <option value="Healthcare & Life Sciences" style={{ background: '#0F172A' }}>Healthcare & Life Sciences</option>
                        <option value="Consulting & Business Services" style={{ background: '#0F172A' }}>Consulting & Business Services</option>
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
                        {fieldErrors.name && <span className="text-[11px] text-rose-300">{fieldErrors.name}</span>}
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
                        {fieldErrors.employeeId && <span className="text-[11px] text-rose-300">{fieldErrors.employeeId}</span>}
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
                        {fieldErrors.college && <span className="text-[11px] text-rose-300">{fieldErrors.college}</span>}
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
                        {fieldErrors.department && <span className="text-[11px] text-rose-300">{fieldErrors.department}</span>}
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
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#FFFFFF',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Assistant Professor" style={{ background: '#0F172A' }}>Assistant Professor</option>
                        <option value="Associate Professor" style={{ background: '#0F172A' }}>Associate Professor</option>
                        <option value="Professor & Head of Department" style={{ background: '#0F172A' }}>Professor & Head of Department</option>
                        <option value="Training & Placement Officer (TPO)" style={{ background: '#0F172A' }}>Training & Placement Officer (TPO)</option>
                        <option value="Dean / Principal" style={{ background: '#0F172A' }}>Dean / Principal</option>
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
                    {fieldErrors.email && <span className="text-[11px] text-rose-300">{fieldErrors.email}</span>}
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
                    {fieldErrors.phone && <span className="text-[11px] text-rose-300">{fieldErrors.phone}</span>}
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
                          color: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                    {fieldErrors.password && <span className="text-[11px] text-rose-300">{fieldErrors.password}</span>}
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
                    {fieldErrors.confirmPassword && <span className="text-[11px] text-rose-300">{fieldErrors.confirmPassword}</span>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    marginTop: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:bg-slate-100 active:scale-[0.99]"
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
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Code expires: {formatTimer(otpTimer)}</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: resendCooldown > 0 ? 'rgba(255, 255, 255, 0.4)' : '#38BDF8',
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
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#FFFFFF',
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
                      background: '#FFFFFF',
                      color: '#0F172A',
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
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#FFFFFF',
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
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between text-xs z-10" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
        <span>© {new Date().getFullYear()} SkillNexus Institutional Platform</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/" className="hover:text-white transition">Terms of Service</Link>
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
