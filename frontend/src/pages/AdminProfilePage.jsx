import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Mail, Phone, ShieldCheck, Lock, Eye, EyeOff,
  Save, Camera, CheckCircle2, AlertCircle, Loader2,
  Sparkles, KeyRound, Shield, Activity, Database, Users,
  Building2, Server, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';

export default function AdminProfilePage() {
  const { user, token, loginWithToken, updateUser } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const accentColor = isLight ? '#063F3A' : '#19B874';

  const fileInputRef = useRef(null);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('System Administrator');
  const [department, setDepartment] = useState('Platform Operations & Governance');
  const [bio, setBio] = useState('Overseeing platform health, institutional data integrity, role-based governance, and recruiter verification.');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Statuses
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || 'Platform Administrator');
      setPhone(user.phone || '');
      setDesignation(user.designation || 'System Administrator');
      setDepartment(user.department || 'Platform Operations & Governance');
      setBio(user.bio || 'Overseeing platform health, institutional data integrity, role-based governance, and recruiter verification.');
    }
  }, [user]);

  // Handle Photo Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload administrator photo.');
      }

      const newAvatarUrl = data.avatarUrl;
      if (updateUser) {
        updateUser({ avatarUrl: newAvatarUrl, profilePhoto: newAvatarUrl });
      }
      setProfileSuccess('Admin profile picture updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Admin photo upload error:', err);
      setProfileError(err.message || 'Error uploading profile photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Administrator Name is required.');
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
          designation: designation.trim(),
          department: department.trim(),
          bio: bio.trim(),
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update administrator profile.');
      }

      if (updateUser) {
        updateUser({
          name: name.trim(),
          phone: phone.trim(),
          designation: designation.trim(),
          department: department.trim(),
          bio: bio.trim(),
        });
      }

      setProfileSuccess('Administrator profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Admin profile save error:', err);
      setProfileError(err.message || 'Error updating administrator profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

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

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Error changing password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 text-left">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* ── 1. HERO ADMIN PROFILE CARD ── */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6"
        style={{
          background: 'var(--fac-bg-surface)',
          borderColor: 'var(--fac-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 text-center sm:text-left">
          
          {/* Avatar with Camera Upload */}
          <div className="relative group shrink-0">
            <UserAvatar
              user={user}
              size={96}
              role="admin"
              fallbackLetter="A"
              style={{ borderRadius: '24px', boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)' }}
            />

            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-1 z-20 text-white">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Saving...</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg disabled:opacity-60 transition cursor-pointer"
              title="Upload Administrator Avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Identity Details */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 justify-center sm:justify-start">
              <span 
                className="text-xs px-3 py-1 rounded-full font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs"
                style={{
                  background: 'rgba(217, 119, 6, 0.12)',
                  color: '#D97706',
                  border: '1px solid rgba(217, 119, 6, 0.25)'
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Super Administrator • Enterprise Level</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--fac-text-primary)' }}>
              {user?.name || 'Administrator'}
            </h1>

            <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--fac-text-secondary)' }}>
              {designation} • {department}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs justify-center sm:justify-start pt-1 font-mono" style={{ color: 'var(--fac-text-muted)' }}>
              <span className="flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{user?.email}</span>
              </span>
              {phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 relative z-10">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-2"
            style={{
              borderColor: 'var(--fac-border)',
              background: 'var(--fac-bg-card)',
              color: 'var(--fac-text-primary)',
              textDecoration: 'none'
            }}
          >
            <Users className="h-3.5 w-3.5" />
            <span>User Management</span>
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2"
            style={{
              background: accentColor,
              color: isLight ? '#FFFFFF' : '#000000',
              textDecoration: 'none'
            }}
          >
            <span>Command Center</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {profileSuccess && (
        <div 
          className="p-4 rounded-2xl flex items-center space-x-2.5 text-xs font-bold shadow-xs"
          style={{
            background: 'var(--fac-emerald-tint)',
            border: '1px solid rgba(22, 163, 106, 0.3)',
            color: 'var(--fac-emerald-bright)'
          }}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div 
          className="p-4 rounded-2xl flex items-center space-x-2.5 text-xs font-bold shadow-xs"
          style={{
            background: 'rgba(224, 82, 82, 0.08)',
            border: '1px solid rgba(224, 82, 82, 0.3)',
            color: 'var(--fac-error)'
          }}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {/* ── 2. EDIT ADMINISTRATOR DETAILS FORM ── */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
        style={{
          background: 'var(--fac-bg-surface)',
          borderColor: 'var(--fac-border)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--fac-border)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--fac-text-primary)' }}>
              Administrator Identity &amp; Contact Information
            </h2>
            <p className="text-xs" style={{ color: 'var(--fac-text-secondary)' }}>
              Update your administrative profile details visible across system audit logs.
            </p>
          </div>
          <Shield className="h-5 w-5 text-amber-500" />
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Administrator Name
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fac-text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="fac-theme-input"
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
                  placeholder="e.g. System Administrator"
                  required
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                System Email (Verified)
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fac-text-muted)' }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="fac-theme-input opacity-70 cursor-not-allowed"
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Administrative Title
              </label>
              <div className="relative">
                <ShieldCheck className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fac-text-muted)' }} />
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="fac-theme-input"
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
                  placeholder="e.g. System Administrator"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Emergency Contact Phone
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fac-text-muted)' }} />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="fac-theme-input"
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Administrative Responsibility / Domain
              </label>
              <div className="relative">
                <Activity className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fac-text-muted)' }} />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="fac-theme-input"
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
                  placeholder="e.g. Platform Operations & Governance"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Administrative Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="fac-theme-input"
                style={{ height: 'auto', padding: '12px 14px', fontSize: '13px', lineHeight: 1.5 }}
                placeholder="Overview of administrative functions..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
              style={{
                background: accentColor,
                color: isLight ? '#FFFFFF' : '#000000',
              }}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Administrator Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. PASSWORD & ACCESS CREDENTIALS ── */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
        style={{
          background: 'var(--fac-bg-surface)',
          borderColor: 'var(--fac-border)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--fac-border)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--fac-text-primary)' }}>
              Administrator Password &amp; Session Key
            </h2>
            <p className="text-xs" style={{ color: 'var(--fac-text-secondary)' }}>
              Maintain system-level security with periodic password rotations.
            </p>
          </div>
          <KeyRound className="h-5 w-5 text-amber-500" />
        </div>

        {passwordSuccess && (
          <div 
            className="p-3.5 rounded-xl flex items-center space-x-2 text-xs font-bold"
            style={{ background: 'var(--fac-emerald-tint)', color: 'var(--fac-emerald-bright)' }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div 
            className="p-3.5 rounded-xl flex items-center space-x-2 text-xs font-bold"
            style={{ background: 'rgba(224, 82, 82, 0.08)', color: 'var(--fac-error)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="fac-theme-input"
              style={{ height: '40px', fontSize: '13px' }}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="fac-theme-input"
                style={{ height: '40px', fontSize: '13px' }}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--fac-text-primary)' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="fac-theme-input"
                style={{ height: '40px', fontSize: '13px' }}
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              style={{ color: 'var(--fac-text-secondary)', background: 'transparent', border: 'none' }}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showPassword ? 'Hide password characters' : 'Show password characters'}</span>
            </button>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
              style={{
                background: accentColor,
                color: isLight ? '#FFFFFF' : '#000000',
              }}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
