import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Building2, Bell, LayoutDashboard, Palette,
  ShieldCheck, Lock, Eye, Download, AlertTriangle,
  CheckCircle2, AlertCircle, RefreshCw, ArrowLeft,
  Camera, Check, Save, ExternalLink, KeyRound,
  FileText, Smartphone, Laptop, Globe, Info,
  LogOut, Trash2, X, ChevronRight, Upload, Image
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────────────────────────
   Accessible Custom Toggle Switch
──────────────────────────────────────────────────────────── */
function SettingToggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '13px 0',
      borderBottom: '1px solid var(--fac-border)'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fac-text-primary)', marginBottom: '2px' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.4 }}>
            {description}
          </div>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          position: 'relative',
          width: '38px',
          height: '20px',
          borderRadius: '9999px',
          background: checked ? 'var(--fac-emerald-bright)' : 'var(--fac-border-hover)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
          marginTop: '2px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#FFFFFF',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FACULTY ACCOUNT & WORKSPACE SETTINGS
══════════════════════════════════════════════════════════════ */
export default function FacultySettingsPage() {
  const { user, token, loginWithToken, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('profile');

  // ── Profile Form State (Populated strictly from authenticated user) ──
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [bio, setBio] = useState('');

  // ── Avatar Upload & Preview State ──
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [photoError, setPhotoError] = useState('');

  // ── Password Form State ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Workspace Preferences State ──
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [defaultStudentView, setDefaultStudentView] = useState('table');
  const [defaultDeptFilter, setDefaultDeptFilter] = useState('all');
  const [dataDensity, setDataDensity] = useState('comfortable');
  const [analyticsRange, setAnalyticsRange] = useState('year');

  // ── Notification Toggles ──
  const [notifications, setNotifications] = useState({
    // Academic
    studentAssessments: true,
    studentSkills: true,
    skillGapAlerts: true,
    // Industry
    newInternships: true,
    industryProjects: true,
    industryWorkshops: true,
    fdpOpportunities: true,
    // Placement
    placementDrives: true,
    candidateShortlists: true,
    interviewUpdates: true,
    offerUpdates: true,
    // System
    platformUpdates: false,
    securityAlerts: true,
  });

  // ── Privacy Toggles ──
  const [privacy, setPrivacy] = useState({
    publicFacultyDirectory: true,
    industryVisibility: true,
    showEmailToStudents: true,
  });

  // ── UI Feedback States ──
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Synchronize with Authenticated User State ──
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setDesignation(user.designation || '');
      setEmployeeId(user.employeeId || '');
      setOfficeLocation(user.officeLocation || '');
      setBio(user.bio || '');
      setPreviewUrl(user.avatarUrl || user.profilePhoto || '');

      if (user.preferences) {
        if (user.preferences.academicYear) setAcademicYear(user.preferences.academicYear);
        if (user.preferences.defaultStudentView) setDefaultStudentView(user.preferences.defaultStudentView);
        if (user.preferences.defaultDeptFilter) setDefaultDeptFilter(user.preferences.defaultDeptFilter);
        if (user.preferences.dataDensity) setDataDensity(user.preferences.dataDensity);
        if (user.preferences.analyticsRange) setAnalyticsRange(user.preferences.analyticsRange);
        if (user.preferences.notifications) setNotifications(prev => ({ ...prev, ...user.preferences.notifications }));
        if (user.preferences.privacy) setPrivacy(prev => ({ ...prev, ...user.preferences.privacy }));
      }
    }
  }, [user]);

  // ── Profile Photo File Selection ──
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoSuccess('');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image is too large. Maximum allowed size is 5 MB.');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  // ── Upload Selected Profile Photo ──
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    setUploadingPhoto(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to upload photo.');
      }

      loginWithToken(token, data.user);
      setSelectedFile(null);
      setPreviewUrl(data.avatarUrl || data.user.avatarUrl);
      setPhotoSuccess('Profile photo updated successfully');
      setTimeout(() => setPhotoSuccess(''), 4000);
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Remove Profile Photo ──
  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl: '' })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove photo.');
      }

      loginWithToken(token, data.user);
      setSelectedFile(null);
      setPreviewUrl('');
      setPhotoSuccess('Profile photo removed');
      setTimeout(() => setPhotoSuccess(''), 4000);
    } catch (err) {
      setPhotoError(err.message || 'Error removing photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Profile Information Save Handler ──
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Full name is required.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          department: department.trim(),
          designation: designation.trim(),
          employeeId: employeeId.trim(),
          officeLocation: officeLocation.trim(),
          bio: bio.trim()
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to save profile changes.');
      }

      loginWithToken(token, data.user);
      setProfileSuccess('Profile changes saved successfully');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Error saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password Change Handler ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password.');
      }

      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Unable to update password. Check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Preferences Save Handler ──
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    setPreferencesSuccess('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: {
            academicYear,
            defaultStudentView,
            defaultDeptFilter,
            dataDensity,
            analyticsRange,
            notifications,
            privacy,
          }
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginWithToken(token, data.user);
        setPreferencesSuccess('Preferences saved');
        setTimeout(() => setPreferencesSuccess(''), 3500);
      }
    } catch (err) {
      console.error('Error persisting preferences:', err);
    } finally {
      setSavingPreferences(false);
    }
  };

  // ── Data Export Handler ──
  const handleExportData = (type) => {
    if (type === 'profile') {
      const profileData = {
        name: user?.name,
        email: user?.email,
        role: user?.role,
        department: user?.department || department,
        designation: user?.designation || designation,
        employeeId: user?.employeeId || employeeId,
        officeLocation: user?.officeLocation || officeLocation,
        institution: user?.institution || 'SkillNexus Partner University',
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faculty-profile-${(user?.name || 'export').replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
    } else if (type === 'analytics') {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Competency Dimension,Cohort Proficiency,Industry Demand,Curriculum Gap\n" +
        "Technical Skills,72%,86%,-14%\n" +
        "Domain Knowledge,68%,82%,-14%\n" +
        "Cognitive Ability,62%,76%,-14%\n" +
        "Communication,71%,80%,-9%\n" +
        "Problem Solving,64%,78%,-14%\n" +
        "Leadership,58%,70%,-12%\n" +
        "Practical Skills,55%,72%,-17%\n" +
        "Research & Innovation,48%,65%,-17%\n";
      const encodedUri = encodeURI(csvContent);
      const a = document.createElement('a');
      a.href = encodedUri;
      a.download = `faculty-competency-benchmark-report-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    }
  };

  // ── Navigation Categories ──
  const navCategories = [
    {
      group: 'ACCOUNT',
      items: [
        { id: 'profile',     label: 'Profile',     icon: User,        desc: 'Personal & faculty credentials' },
        { id: 'institution', label: 'Institution', icon: Building2,   desc: 'Campus & department profile' },
      ]
    },
    {
      group: 'PREFERENCES',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell,            desc: 'Academic & placement alerts' },
        { id: 'workspace',     label: 'Workspace',     icon: LayoutDashboard, desc: 'Defaults & cohort filtering' },
        { id: 'appearance',    label: 'Appearance',    icon: Palette,         desc: 'Theme & interface style' },
      ]
    },
    {
      group: 'SECURITY & PRIVACY',
      items: [
        { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Password & active sessions' },
        { id: 'privacy',  label: 'Privacy',  icon: Eye,         desc: 'Data visibility & governance' },
      ]
    },
    {
      group: 'DATA',
      items: [
        { id: 'export', label: 'Data & Export', icon: Download, desc: 'Analytics & report downloads' },
      ]
    },
    {
      group: 'DANGER ZONE',
      items: [
        { id: 'account', label: 'Account Actions', icon: AlertTriangle, desc: 'Sign out & account deprecation' },
      ]
    }
  ];

  const roleDisplay = user?.role === 'institution'
    ? 'Institutional Representative'
    : user?.role === 'academician'
      ? 'Academician'
      : 'Faculty Member';

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '80vh' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--fac-border)' }}>
        <div>
          <Link
            to="/faculty"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--fac-emerald-bright)',
              textDecoration: 'none',
              marginBottom: '6px'
            }}
          >
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Faculty Settings
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--fac-emerald-bright)',
              background: 'var(--fac-emerald-tint)',
              border: '1px solid rgba(22, 163, 106, 0.3)',
              padding: '2px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.03em',
            }}>
              {roleDisplay}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
            Manage your faculty profile, workspace preferences, security, and academic notifications.
          </p>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── LEFT SETTINGS SIDEBAR ── */}
        <aside
          className="fac-theme-card"
          style={{
            padding: '12px',
            position: 'sticky',
            top: '76px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {navCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              <div style={{
                fontSize: '9.5px',
                fontWeight: 800,
                color: 'var(--fac-text-muted)',
                letterSpacing: '0.08em',
                padding: '4px 8px 6px',
                textTransform: 'uppercase'
              }}>
                {cat.group}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {cat.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'var(--fac-nav-active-bg)' : 'transparent',
                        color: isActive ? 'var(--fac-nav-active-color)' : 'var(--fac-text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.14s ease',
                        borderLeft: isActive ? '2px solid var(--fac-emerald-bright)' : '2px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--fac-bg-surface)';
                          e.currentTarget.style.color = 'var(--fac-text-primary)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--fac-text-secondary)';
                        }
                      }}
                    >
                      <Icon style={{
                        width: '15px',
                        height: '15px',
                        color: isActive ? 'var(--fac-emerald-bright)' : 'var(--fac-text-muted)',
                        flexShrink: 0
                      }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: isActive ? 700 : 500, lineHeight: 1.2 }}>
                          {item.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* ── RIGHT SETTINGS CONTENT PANEL ── */}
        <main className="fac-theme-card" style={{ padding: '24px 28px', minHeight: '520px' }}>

          {/* ══════════════════════════════════════════
              SECTION 1: PROFILE INFORMATION & AVATAR
              ══════════════════════════════════════════ */}
          {activeSection === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Profile Information
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Manage the details and credentials associated with your faculty workspace account.
                </p>
              </div>

              {/* ── Profile Photo Upload Card ── */}
              <div style={{
                background: 'var(--fac-bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--fac-border)',
                padding: '18px 20px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fac-emerald-bright)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Profile Photo
                </div>

                {photoSuccess && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: 'var(--fac-emerald-tint)',
                    border: '1px solid rgba(22, 163, 106, 0.3)',
                    color: 'var(--fac-emerald-bright)',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    <CheckCircle2 style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                    <span>{photoSuccess}</span>
                  </div>
                )}

                {photoError && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    background: 'rgba(224, 82, 82, 0.1)',
                    border: '1px solid rgba(224, 82, 82, 0.25)',
                    color: 'var(--fac-error)',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    <AlertCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                    <span>{photoError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Photo Display */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'relative',
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: '2px solid var(--fac-border-hover)',
                    }}
                    title="Click to select new profile photo"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user?.name?.charAt(0) || user?.email?.charAt(0) || 'F').toUpperCase()
                    )}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <Camera style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
                    </div>
                  </div>

                  {/* Photo Controls */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '2px' }}>
                      {user?.name || user?.email || 'Faculty Member'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--fac-text-muted)', marginBottom: '12px' }}>
                      JPG, PNG or WebP. Maximum size 5 MB.
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="fac-btn-emerald"
                        style={{ height: '32px', fontSize: '11.5px', padding: '0 12px' }}
                      >
                        <Upload style={{ width: '12px', height: '12px' }} />
                        <span>{selectedFile ? 'Choose Another' : 'Upload Photo'}</span>
                      </button>

                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleUploadPhoto}
                          disabled={uploadingPhoto}
                          className="fac-btn-gold"
                          style={{ height: '32px', fontSize: '11.5px', padding: '0 12px' }}
                        >
                          {uploadingPhoto ? (
                            <>
                              <RefreshCw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Save style={{ width: '12px', height: '12px' }} />
                              <span>Save Photo</span>
                            </>
                          )}
                        </button>
                      )}

                      {(previewUrl || user?.avatarUrl) && !selectedFile && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={uploadingPhoto}
                          className="fac-btn-dark"
                          style={{ height: '32px', fontSize: '11.5px', padding: '0 12px' }}
                        >
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Profile Information Form ── */}
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {profileSuccess && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--fac-emerald-tint)',
                    border: '1px solid rgba(22, 163, 106, 0.3)',
                    color: 'var(--fac-emerald-bright)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(224, 82, 82, 0.1)',
                    border: '1px solid rgba(224, 82, 82, 0.25)',
                    color: 'var(--fac-error)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Personal Information Group */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-emerald-bright)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Personal Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. Dr. Jane Smith"
                      />
                    </div>

                    {/* Institutional Email (Read-Only) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)' }}>
                          Institutional Email
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="fac-badge-emerald" style={{ fontSize: '9px' }}>Verified</span>
                          <span style={{ fontSize: '9.5px', color: 'var(--fac-text-muted)', fontWeight: 600 }}>Read-only</span>
                        </div>
                      </div>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="fac-theme-input"
                        style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--fac-bg-surface)' }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Credentials Group */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-gold)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Academic & Faculty Assignments
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Faculty ID */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Faculty / Employee ID
                      </label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={e => setEmployeeId(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. FAC-2024-001"
                      />
                    </div>

                    {/* Academic Designation */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Academic Designation / Title
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={e => setDesignation(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. Associate Professor & Placement In-charge"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Department / Branch
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. Computer Science & Engineering"
                      />
                    </div>

                    {/* Office Location */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Office / Cabin Location
                      </label>
                      <input
                        type="text"
                        value={officeLocation}
                        onChange={e => setOfficeLocation(e.target.value)}
                        className="fac-theme-input"
                        placeholder="e.g. Academic Block 2, Room 304"
                      />
                    </div>

                    {/* Bio */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Faculty Bio & Research Focus
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="fac-theme-input"
                        style={{ resize: 'vertical' }}
                        placeholder="Brief overview of research specializations, student mentorship focus, and academic interests..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--fac-border)' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="fac-btn-emerald"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save style={{ width: '13px', height: '13px' }} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 2: INSTITUTION INFORMATION
              ══════════════════════════════════════════ */}
          {activeSection === 'institution' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                      Institution Information
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                      Institutional affiliation and campus governance settings.
                    </p>
                  </div>
                  <span className="fac-badge-dark" style={{ fontSize: '10px' }}>
                    Managed by Institution
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Institution Name', value: user?.institution || 'SkillNexus Partner University', readOnly: true },
                  { label: 'Department Affiliation', value: department || user?.department || 'Not Assigned', readOnly: true },
                  { label: 'Faculty Role', value: roleDisplay, readOnly: true },
                  { label: 'Institutional Domain', value: user?.email ? user.email.split('@')[1] : 'institution.edu', readOnly: true },
                  { label: 'Academic Year Cycle', value: '2025–26 (Active)', readOnly: true },
                  { label: 'Accreditation Status', value: 'UGC & AICTE Recognized', readOnly: true },
                  { label: 'Campus Headquarters', value: officeLocation || 'Main Academic Campus', readOnly: true },
                  { label: 'Portal Verification', value: 'Verified Faculty Account', readOnly: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--fac-bg-surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--fac-border)'
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: 'var(--fac-bg-surface)',
                borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '11.5px',
                color: 'var(--fac-text-secondary)'
              }}>
                <Info style={{ width: '15px', height: '15px', color: 'var(--fac-gold)', flexShrink: 0 }} />
                <span>
                  Institutional master details are synchronized with the Central Academic Registry. To request organizational profile changes, contact your university registrar.
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 3: NOTIFICATIONS
              ══════════════════════════════════════════ */}
          {activeSection === 'notifications' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                      Notification Preferences
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                      Control alerts, recruitment notifications, and student assessment summaries.
                    </p>
                  </div>
                  {preferencesSuccess && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-emerald-bright)', fontWeight: 700 }}>
                      ✓ {preferencesSuccess}
                    </span>
                  )}
                </div>
              </div>

              {/* Academic Notifications */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-emerald-bright)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Academic & Student Competency Alerts
                </div>
                <SettingToggle
                  label="Student Assessment Completed"
                  description="Receive alerts when students complete standardized technical or domain assessments."
                  checked={notifications.studentAssessments}
                  onChange={val => {
                    const updated = { ...notifications, studentAssessments: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Student Skill Profile Updated"
                  description="Notifications when students add verified projects, certifications, or portfolio links."
                  checked={notifications.studentSkills}
                  onChange={val => {
                    const updated = { ...notifications, studentSkills: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Skill-Gap Diagnostic Alerts"
                  description="Periodic analytical summaries highlighting emerging curriculum deficit areas."
                  checked={notifications.skillGapAlerts}
                  onChange={val => {
                    const updated = { ...notifications, skillGapAlerts: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
              </div>

              {/* Industry & Corporate Notifications */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Industry & Corporate Collaboration
                </div>
                <SettingToggle
                  label="New Internship Opportunities"
                  description="Alerts when partner corporations post new student internship drives."
                  checked={notifications.newInternships}
                  onChange={val => {
                    const updated = { ...notifications, newInternships: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Industry Capstone Projects"
                  description="Notifications for corporate-sponsored final year research and engineering projects."
                  checked={notifications.industryProjects}
                  onChange={val => {
                    const updated = { ...notifications, industryProjects: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Faculty Development Programs (FDP)"
                  description="Invitations and schedules for industry faculty training and upskilling workshops."
                  checked={notifications.fdpOpportunities}
                  onChange={val => {
                    const updated = { ...notifications, fdpOpportunities: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
              </div>

              {/* Placement & Drive Notifications */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-emerald-bright)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Placement & Campus Hiring
                </div>
                <SettingToggle
                  label="Placement Drive Announcements"
                  description="Real-time updates when on-campus and virtual hiring drives are scheduled."
                  checked={notifications.placementDrives}
                  onChange={val => {
                    const updated = { ...notifications, placementDrives: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Candidate Shortlist Updates"
                  description="Notices when cohort students clear initial screening and technical rounds."
                  checked={notifications.candidateShortlists}
                  onChange={val => {
                    const updated = { ...notifications, candidateShortlists: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Verified Offer Letter Updates"
                  description="Alerts when final placement offers and package details are issued."
                  checked={notifications.offerUpdates}
                  onChange={val => {
                    const updated = { ...notifications, offerUpdates: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
              </div>

              {/* System Notifications */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--fac-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  System & Security
                </div>
                <SettingToggle
                  label="Security & Session Alerts"
                  description="Critical notices regarding sign-in activity and password modifications."
                  checked={notifications.securityAlerts}
                  onChange={val => {
                    const updated = { ...notifications, securityAlerts: val };
                    setNotifications(updated);
                    handleSavePreferences();
                  }}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 4: WORKSPACE PREFERENCES
              ══════════════════════════════════════════ */}
          {activeSection === 'workspace' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                      Faculty Workspace Preferences
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                      Configure default filtering, data density, and cohort intelligence views.
                    </p>
                  </div>
                  {preferencesSuccess && (
                    <span style={{ fontSize: '11px', color: 'var(--fac-emerald-bright)', fontWeight: 700 }}>
                      ✓ {preferencesSuccess}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                    Default Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={e => { setAcademicYear(e.target.value); handleSavePreferences(); }}
                    className="fac-theme-select"
                  >
                    <option value="2025-26">2025–26 (Current Academic Year)</option>
                    <option value="2024-25">2024–25 (Previous Cohort)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                    Default Student Directory View
                  </label>
                  <select
                    value={defaultStudentView}
                    onChange={e => { setDefaultStudentView(e.target.value); handleSavePreferences(); }}
                    className="fac-theme-select"
                  >
                    <option value="table">Table List View (High Density)</option>
                    <option value="cards">Card Grid View (Visual Cards)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                    Default Department Scope
                  </label>
                  <select
                    value={defaultDeptFilter}
                    onChange={e => { setDefaultDeptFilter(e.target.value); handleSavePreferences(); }}
                    className="fac-theme-select"
                  >
                    <option value="all">All Departments (Institutional)</option>
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics & Communication</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                    Default Analytics Time Horizon
                  </label>
                  <select
                    value={analyticsRange}
                    onChange={e => { setAnalyticsRange(e.target.value); handleSavePreferences(); }}
                    className="fac-theme-select"
                  >
                    <option value="year">Full Academic Year (2025–26)</option>
                    <option value="semester">Current Semester</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--fac-border)' }}>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="fac-btn-emerald"
                >
                  <Save style={{ width: '13px', height: '13px' }} />
                  <span>Save Workspace Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 5: APPEARANCE
              ══════════════════════════════════════════ */}
          {activeSection === 'appearance' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Appearance & Theme
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Select the visual style for your institutional workspace.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme('dark')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: theme === 'dark' ? '2px solid var(--fac-emerald-bright)' : '1px solid var(--fac-border)',
                    background: '#080B0A',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#19B874' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#F5F7F6' }}>Dark Institutional Theme</span>
                    </div>
                    {theme === 'dark' && (
                      <span className="fac-badge-emerald">Active</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#A8B2AE', margin: 0, lineHeight: 1.4 }}>
                    Pure black institutional interface with emerald green and champagne gold accents.
                  </p>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme('light')}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: theme === 'light' ? '2px solid #063F3A' : '1px solid var(--fac-border)',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    color: '#10201D'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#063F3A' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#10201D' }}>Light Institutional Theme</span>
                    </div>
                    {theme === 'light' && (
                      <span style={{ fontSize: '9px', fontWeight: 800, background: '#D6A84F', color: '#063F3A', padding: '2px 8px', borderRadius: '9999px' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#66736F', margin: 0, lineHeight: 1.4 }}>
                    Warm ivory background with deep institutional forest green sidebar and gold highlights.
                  </p>
                </div>
              </div>

              <div style={{
                padding: '14px 16px',
                background: 'var(--fac-bg-surface)',
                borderRadius: '10px',
                border: '1px solid var(--fac-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                    Quick Theme Switcher
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)' }}>
                    Toggle instantly between Dark and Light mode from anywhere using the header icon.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="fac-btn-dark"
                >
                  Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 6: SECURITY & AUTHENTICATION
              ══════════════════════════════════════════ */}
          {activeSection === 'security' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Security & Authentication
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Manage your account password, active sessions, and authentication security.
                </p>
              </div>

              {passwordSuccess && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--fac-emerald-tint)',
                  border: '1px solid rgba(22, 163, 106, 0.3)',
                  color: 'var(--fac-emerald-bright)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <CheckCircle2 style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(224, 82, 82, 0.1)',
                  border: '1px solid rgba(224, 82, 82, 0.25)',
                  color: 'var(--fac-error)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Password Change Form */}
              <div style={{
                background: 'var(--fac-bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--fac-border)',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '4px' }}>
                  Change Account Password
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', marginBottom: '16px' }}>
                  Ensure your new password contains at least 6 characters.
                </div>

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="fac-theme-input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="fac-theme-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-secondary)', marginBottom: '5px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="fac-theme-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="fac-btn-emerald"
                    >
                      {changingPassword ? (
                        <>
                          <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound style={{ width: '13px', height: '13px' }} />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions */}
              <div style={{
                background: 'var(--fac-bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--fac-border)',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '4px' }}>
                  Active Institutional Sessions
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', marginBottom: '14px' }}>
                  Devices currently authenticated to this faculty workspace account.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'var(--fac-bg-card)', border: '1px solid var(--fac-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Laptop style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                        Current Active Session
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--fac-text-muted)' }}>
                        Authenticated · Institutional Portal
                      </div>
                    </div>
                  </div>
                  <span className="fac-badge-emerald">This Device</span>
                </div>
              </div>

              {/* Authentication Providers */}
              <div style={{
                background: 'var(--fac-bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--fac-border)',
                padding: '18px 20px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '4px' }}>
                  Authentication Methods
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', marginBottom: '14px' }}>
                  Connected Single Sign-On (SSO) and direct email credentials.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'var(--fac-bg-card)', border: '1px solid var(--fac-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>Email & Password</span>
                    <span className="fac-badge-emerald">Active</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'var(--fac-bg-card)', border: '1px solid var(--fac-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>Google / OAuth</span>
                    <span className="fac-badge-dark">Available</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 7: PRIVACY & DATA GOVERNANCE
              ══════════════════════════════════════════ */}
          {activeSection === 'privacy' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Privacy & Data Governance
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Manage faculty directory visibility and student academic data compliance.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <SettingToggle
                  label="Institutional Directory Visibility"
                  description="Display your name, department, and academic title in the institutional faculty roster."
                  checked={privacy.publicFacultyDirectory}
                  onChange={val => {
                    const updated = { ...privacy, publicFacultyDirectory: val };
                    setPrivacy(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Industry Partner Visibility"
                  description="Allow verified corporate recruiters to see your department contact for campus drives and capstone projects."
                  checked={privacy.industryVisibility}
                  onChange={val => {
                    const updated = { ...privacy, industryVisibility: val };
                    setPrivacy(updated);
                    handleSavePreferences();
                  }}
                />
                <SettingToggle
                  label="Display Email to Enrolled Students"
                  description="Make your institutional email address visible on student portal mentorship pages."
                  checked={privacy.showEmailToStudents}
                  onChange={val => {
                    const updated = { ...privacy, showEmailToStudents: val };
                    setPrivacy(updated);
                    handleSavePreferences();
                  }}
                />
              </div>

              <div style={{
                padding: '14px 16px',
                background: 'var(--fac-bg-surface)',
                borderRadius: '10px',
                border: '1px solid var(--fac-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <ShieldCheck style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--fac-text-primary)', display: 'block', marginBottom: '2px' }}>
                    FERPA & Data Protection Compliance
                  </strong>
                  Student grades, assessment metrics, and interview evaluations accessed through your Faculty Workspace are protected under academic data governance policies. Exported reports must be handled in accordance with university data safety guidelines.
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 8: DATA & EXPORT
              ══════════════════════════════════════════ */}
          {activeSection === 'export' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Data & Reports Export
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Download structured analytics, competency benchmarks, and faculty profile summaries.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{
                  padding: '18px 20px',
                  background: 'var(--fac-bg-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--fac-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '4px' }}>
                      Cohort Competency Benchmark Report
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.4 }}>
                      Export a CSV report containing 8-dimension student competency scores vs. market demand benchmarks.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportData('analytics')}
                    className="fac-btn-emerald"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Download style={{ width: '13px', height: '13px' }} />
                    <span>Download CSV Dataset</span>
                  </button>
                </div>

                <div style={{
                  padding: '18px 20px',
                  background: 'var(--fac-bg-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--fac-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '4px' }}>
                      Faculty Profile & Role Summary
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.4 }}>
                      Export your complete faculty credentials, bio, and institutional assignments in structured JSON.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportData('profile')}
                    className="fac-btn-dark"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Download style={{ width: '13px', height: '13px' }} />
                    <span>Export JSON Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              SECTION 9: DANGER ZONE & ACCOUNT ACTIONS
              ══════════════════════════════════════════ */}
          {activeSection === 'account' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-error)', margin: 0 }}>
                  Account Actions & Danger Zone
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '4px 0 0' }}>
                  Session termination and faculty account management.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Sign Out Card */}
                <div style={{
                  padding: '18px 20px',
                  background: 'var(--fac-bg-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--fac-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '2px' }}>
                      Sign Out of Faculty Workspace
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)' }}>
                      End your active browser session on this device.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); navigate('/login'); }}
                    className="fac-btn-gold"
                    style={{ flexShrink: 0 }}
                  >
                    <LogOut style={{ width: '13px', height: '13px' }} />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Account Deletion Card */}
                <div style={{
                  padding: '18px 20px',
                  background: 'rgba(224, 82, 82, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(224, 82, 82, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-error)', marginBottom: '2px' }}>
                      Faculty Account Deprecation
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)' }}>
                      Faculty and institutional accounts are governed by university administrator policies.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      background: 'rgba(224, 82, 82, 0.15)',
                      color: 'var(--fac-error)',
                      border: '1px solid rgba(224, 82, 82, 0.3)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      transition: 'all 0.14s ease'
                    }}
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                    <span>Request Deletion</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Deletion Request Modal ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div
            className="fac-theme-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(224, 82, 82, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fac-error)'
              }}>
                <AlertTriangle style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>
                  Institutional Account Governance
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--fac-text-muted)' }}>
                  Faculty Profile Deactivation
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', lineHeight: 1.6, margin: '0 0 18px' }}>
              In accordance with university compliance standards, faculty accounts cannot be deleted directly from the user portal. Academic records, student recommendation logs, and assessment histories must be transferred to a designated department administrator before deactivation.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="fac-btn-dark"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
