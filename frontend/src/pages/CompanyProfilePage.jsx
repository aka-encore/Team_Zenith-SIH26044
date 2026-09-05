import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Globe, MapPin, Mail, Phone, User, Calendar, 
  Users, Edit3, Save, X, CheckCircle2, Clock, AlertTriangle, 
  Upload, Image as ImageIcon, Sparkles, ShieldCheck, RefreshCw,
  ExternalLink, FileText, Check, AlertCircle, ArrowLeft, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyProfilePage() {
  const { token, user, updateUser } = useAuth();

  // State Management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields (11 required items + tech & hiring areas)
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [hrName, setHrName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [technologiesUsed, setTechnologiesUsed] = useState('');
  const [hiringAreas, setHiringAreas] = useState('');

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState({});

  const fileInputRef = useRef(null);

  // Fetch company profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/companies/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve company profile.');
      }

      const p = resData.profile || {};
      setProfile(p);

      // Populate Form States
      setCompanyName(p.companyName || user?.name || '');
      setLogoUrl(p.logoUrl || '');
      setIndustry(p.industry || '');
      setDescription(p.description || '');
      setWebsite(p.website || '');
      setLocation(p.location || '');
      setHrName(p.hrName || '');
      setContactEmail(p.contactEmail || user?.email || '');
      setContactPhone(p.contactPhone || '');
      setCompanySize(p.companySize || '11-50 employees');
      setFoundedYear(p.foundedYear || '');
      setTechnologiesUsed(Array.isArray(p.technologiesUsed) ? p.technologiesUsed.join(', ') : (p.technologiesUsed || ''));
      setHiringAreas(Array.isArray(p.hiringAreas) ? p.hiringAreas.join(', ') : (p.hiringAreas || ''));
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setErrorMsg(err.message || 'Unable to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Client-side Validation
  const validateForm = () => {
    const errors = {};

    if (!companyName.trim()) {
      errors.companyName = 'Company Name is required.';
    }

    if (contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        errors.contactEmail = 'Please enter a valid HR/Contact email address.';
      }
    }

    if (website.trim()) {
      try {
        const urlToCheck = website.startsWith('http://') || website.startsWith('https://') 
          ? website 
          : `https://${website}`;
        new URL(urlToCheck);
      } catch (_) {
        errors.website = 'Please enter a valid website URL (e.g. https://company.com).';
      }
    }

    if (contactPhone.trim()) {
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{7,15}$/;
      if (!phoneRegex.test(contactPhone.trim())) {
        errors.contactPhone = 'Please enter a valid phone number (e.g. +91 98765 43210).';
      }
    }

    if (foundedYear.trim()) {
      const year = parseInt(foundedYear.trim(), 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear + 1) {
        errors.foundedYear = `Please enter a realistic founding year (1800 - ${currentYear}).`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Format website with https:// if missing
    let formattedWebsite = website.trim();
    if (formattedWebsite && !formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const payload = {
      companyName: companyName.trim(),
      logoUrl: logoUrl.trim(),
      industry: industry.trim(),
      description: description.trim(),
      website: formattedWebsite,
      location: location.trim(),
      hrName: hrName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      companySize: companySize.trim(),
      foundedYear: foundedYear.trim(),
      technologiesUsed: technologiesUsed.split(',').map(s => s.trim()).filter(Boolean),
      hiringAreas: hiringAreas.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const response = await fetch('/api/companies/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update company profile.');
      }

      setProfile(resData.profile);
      if (updateUser && companyName.trim()) {
        updateUser({ name: companyName.trim() });
      }
      setSuccessMsg('Company profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error updating company profile:', err);
      setErrorMsg(err.message || 'Error occurred while saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Logo File Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Logo file size must be less than 5MB.');
      return;
    }

    setUploadingLogo(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/companies/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to upload company logo.');
      }

      setLogoUrl(resData.logoUrl);
      if (profile) {
        setProfile({ ...profile, logoUrl: resData.logoUrl });
      }
      setSuccessMsg('Logo uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Logo upload error:', err);
      setErrorMsg(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setCompanyName(profile.companyName || user?.name || '');
      setLogoUrl(profile.logoUrl || '');
      setIndustry(profile.industry || '');
      setDescription(profile.description || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
      setHrName(profile.hrName || '');
      setContactEmail(profile.contactEmail || user?.email || '');
      setContactPhone(profile.contactPhone || '');
      setCompanySize(profile.companySize || '11-50 employees');
      setFoundedYear(profile.foundedYear || '');
      setTechnologiesUsed(Array.isArray(profile.technologiesUsed) ? profile.technologiesUsed.join(', ') : (profile.technologiesUsed || ''));
      setHiringAreas(Array.isArray(profile.hiringAreas) ? profile.hiringAreas.join(', ') : (profile.hiringAreas || ''));
    }
    setFormErrors({});
    setErrorMsg('');
    setIsEditing(false);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-8 pb-16 text-left max-w-5xl mx-auto">
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-300 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 w-80 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
        </div>
        <div className="flex items-center justify-center p-12 text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Company Profile...</span>
        </div>
      </div>
    );
  }

  // Verification status badges & metadata
  const verificationStatus = profile?.verificationStatus || 'pending';

  return (
    <div className="space-y-8 pb-20 text-left max-w-5xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/company" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Company Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your organization details, recruiter contacts, branding, and verification status.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VERIFICATION STATUS CARD ━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        verificationStatus === 'verified'
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/25'
          : verificationStatus === 'pending'
          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/25'
          : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/25'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            verificationStatus === 'verified'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : verificationStatus === 'pending'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            {verificationStatus === 'verified' ? (
              <ShieldCheck className="h-5 w-5" />
            ) : verificationStatus === 'pending' ? (
              <Clock className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Corporate Status:</span>
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                verificationStatus === 'verified'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : verificationStatus === 'pending'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}>
                {verificationStatus === 'verified'
                  ? 'Verified'
                  : verificationStatus === 'pending'
                  ? 'Pending Verification'
                  : 'Rejected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {verificationStatus === 'verified'
                ? 'Your corporate account has been verified by the platform administrators. All job and internship postings carry verified recruiter credentials.'
                : verificationStatus === 'pending'
                ? 'Your company profile is under administrative review. Once verified, your opportunities will be highlighted in student discovery catalogs.'
                : 'Your corporate verification was rejected by platform administrators. Please review your organization details and contact info, update them, and reach out to administrator support.'}
            </p>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ MAIN CONTENT: VIEW OR EDIT ━━━━━━━━━━━━━━━━━━━━ */}
      {!isEditing ? (
        /* ════════════════════ VIEW MODE ════════════════════ */
        <div className="space-y-6">
          
          {/* Main Card: Logo & Core Info */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              
              {/* Logo Preview */}
              <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="h-10 w-10 text-slate-400" />
                )}
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                    {companyName || 'Corporate Partner'}
                  </h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {industry && (
                    <span className="flex items-center space-x-1">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{industry}</span>
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{location}</span>
                    </span>
                  )}
                  {website && (
                    <a 
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>{website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">About Company</h3>
              {description ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No company description provided yet. Click "Edit Profile" to tell students about your domains, work culture, and tech stack.
                </p>
              )}
            </div>
          </div>

          {/* Grid: Company Details & HR Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Company Metadata Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-emerald-500" />
                <span>Organization Overview</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Industry Sector</span>
                  <span className="font-bold text-slate-900 dark:text-white">{industry || 'Not Specified'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Company Size</span>
                  <span className="font-bold text-slate-900 dark:text-white">{companySize || 'Not Specified'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Founded Year</span>
                  <span className="font-bold text-slate-900 dark:text-white">{foundedYear || 'Not Specified'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Headquarters</span>
                  <span className="font-bold text-slate-900 dark:text-white">{location || 'Remote / Not Set'}</span>
                </div>
              </div>
            </div>

            {/* Recruiter & HR Contact Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-2">
                <User className="h-4 w-4 text-emerald-500" />
                <span>HR & Recruiter Contact Details</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Lead Recruiter</span>
                  <span className="font-bold text-slate-900 dark:text-white">{hrName || user?.name || 'Not Set'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Contact Email</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{contactEmail || user?.email || 'Not Set'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Contact Phone</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{contactPhone || 'Not Set'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Official Website</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[180px]">
                    {website || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Tech Stack & Hiring Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tech Stack */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>Technologies & Tools Used</span>
              </h3>
              {profile?.technologiesUsed && profile.technologiesUsed.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.technologiesUsed.map((tech, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific technologies listed yet.</p>
              )}
            </div>

            {/* Hiring Areas */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <span>Active Hiring Domains & Roles</span>
              </h3>
              {profile?.hiringAreas && profile.hiringAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.hiringAreas.map((area, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hiring areas specified yet.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* ════════════════════ EDIT MODE ════════════════════ */
        <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-xl">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Edit Company Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update corporate parameters, contacts, and verification details</p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Logo Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Company Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo Image'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or enter direct Logo Image URL (e.g. https://.../logo.png)"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* 1. Company Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Microsoft Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900/70 border p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition ${
                  formErrors.companyName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                }`}
              />
              {formErrors.companyName && <p className="text-rose-500 text-[10px]">{formErrors.companyName}</p>}
            </div>

            {/* 2. Industry */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Industry Sector
              </label>
              <input
                type="text"
                placeholder="e.g. Cloud Computing & AI"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Website */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Company Website
              </label>
              <input
                type="text"
                placeholder="e.g. https://www.technovasolutions.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900/70 border p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition ${
                  formErrors.website ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                }`}
              />
              {formErrors.website && <p className="text-rose-500 text-[10px]">{formErrors.website}</p>}
            </div>

            {/* 4. Location */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Headquarters Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* 5. Company Size */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="1-10 employees">1 - 10 employees (Early Stage)</option>
                <option value="11-50 employees">11 - 50 employees (Startup)</option>
                <option value="51-200 employees">51 - 200 employees (Scale-up)</option>
                <option value="201-500 employees">201 - 500 employees (Mid-size)</option>
                <option value="501-1000 employees">501 - 1000 employees (Large)</option>
                <option value="1000+ employees">1000+ employees (Enterprise)</option>
              </select>
            </div>

            {/* 6. Founded Year */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Founded Year
              </label>
              <input
                type="number"
                placeholder="e.g. 2018"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900/70 border p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition ${
                  formErrors.foundedYear ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                }`}
              />
              {formErrors.foundedYear && <p className="text-rose-500 text-[10px]">{formErrors.foundedYear}</p>}
            </div>

            {/* 7. Lead HR / Recruiter Name */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                HR / Lead Recruiter Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Nair"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* 8. HR Contact Email */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                HR / Recruitment Email
              </label>
              <input
                type="email"
                placeholder="e.g. hr@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900/70 border p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition ${
                  formErrors.contactEmail ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                }`}
              />
              {formErrors.contactEmail && <p className="text-rose-500 text-[10px]">{formErrors.contactEmail}</p>}
            </div>

            {/* 9. HR Contact Phone */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Contact Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900/70 border p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition ${
                  formErrors.contactPhone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                }`}
              />
              {formErrors.contactPhone && <p className="text-rose-500 text-[10px]">{formErrors.contactPhone}</p>}
            </div>

            {/* 10. Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Company Description & Culture
              </label>
              <textarea
                rows="4"
                placeholder="Tell students about your company vision, product architecture, technologies used, mentorship opportunities, and workplace perks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* 11. Technologies Used */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Technologies & Tools Used (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB"
                value={technologiesUsed}
                onChange={(e) => setTechnologiesUsed(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            {/* 12. Hiring Areas */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Hiring Areas & Domains (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Engineering, Cloud Architecture, DevOps, AI/ML, Data Engineering"
                value={hiringAreas}
                onChange={(e) => setHiringAreas(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3 text-xs">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
