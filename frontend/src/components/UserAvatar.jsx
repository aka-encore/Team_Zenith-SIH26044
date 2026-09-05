import React, { useState, useEffect } from 'react';

/**
 * Robust UserAvatar component that prevents broken image icons.
 * Gracefully falls back to styled initials with theme-tailored gradients.
 */
export function UserAvatar({
  user,
  src,
  name,
  size = 36,
  className = '',
  style = {},
  role,
  fallbackLetter,
  bordered = true,
  onClick
}) {
  const [imgError, setImgError] = useState(false);

  const rawSrc = src || user?.avatarUrl || user?.profilePhoto || user?.logoUrl || '';
  const effectiveRole = (role || user?.role || 'student').toLowerCase();

  // Reset error state if image source changes
  useEffect(() => {
    setImgError(false);
  }, [rawSrc]);

  // Compute display initials
  const rawName = name || user?.name || user?.companyName || user?.email || '';
  const getInitials = () => {
    if (fallbackLetter) return fallbackLetter.toUpperCase();
    if (!rawName) {
      if (effectiveRole === 'faculty') return 'F';
      if (effectiveRole === 'company') return 'C';
      if (effectiveRole === 'admin') return 'A';
      return 'S';
    }

    const parts = rawName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return rawName.slice(0, 2).toUpperCase();
  };

  // Gradient styles per role
  const getGradient = () => {
    switch (effectiveRole) {
      case 'faculty':
      case 'institution':
      case 'academician':
        return 'linear-gradient(135deg, #063F3A 0%, #0F685F 100%)';
      case 'company':
      case 'recruiter':
        return 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)';
      case 'admin':
      case 'superadmin':
        return 'linear-gradient(135deg, #D97706 0%, #B45309 100%)';
      case 'student':
      default:
        return 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)';
    }
  };

  const hasValidImage = Boolean(rawSrc && !imgError && typeof rawSrc === 'string' && rawSrc.trim().length > 0);

  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 select-none overflow-hidden flex items-center justify-center font-bold text-white transition-transform ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: size <= 48 ? '50%' : '18px',
        background: getGradient(),
        border: bordered ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontSize: `${fontSize}px`,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {hasValidImage ? (
        <img
          src={rawSrc}
          alt={rawName || 'User Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      ) : (
        <span style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>
          {getInitials()}
        </span>
      )}
    </div>
  );
}

export default UserAvatar;
