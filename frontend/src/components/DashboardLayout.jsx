import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Cpu, Target, Briefcase,
  User, LogOut, Sun, Moon, Sparkles, X, Menu,
  Building2, GraduationCap, School, Settings,
  FileText, Award, Bell, Video, Users, Search, BarChart3, BrainCircuit,
  ChevronDown, Calendar, TrendingUp, RefreshCw, Network,
  Layers, ChevronRight
} from 'lucide-react';
import UserAvatar from './UserAvatar';

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const rawRole = (user?.role || 'student').toLowerCase();
  const isFaculty = ['faculty', 'institution', 'academician'].includes(rawRole);
  const isCompany = ['company', 'recruiter', 'employer'].includes(rawRole);
  const isAdmin = ['admin', 'superadmin'].includes(rawRole);
  const role = isFaculty ? 'faculty' : isCompany ? 'company' : isAdmin ? 'admin' : 'student';
  const isLight = theme === 'light';

  // Dedicated role-based profile paths
  const getProfilePath = () => {
    if (role === 'company') return '/company/profile';
    if (role === 'faculty') return '/faculty/profile';
    if (role === 'admin') return '/admin/profile';
    return '/profile';
  };

  /* ── Navigation Definitions ── */
  const studentNav = [
    { label: 'Dashboard',            path: '/student',        icon: LayoutDashboard },
    { label: 'My Profile',           path: '/profile',        icon: User },
    { label: 'Skills & Assessment',  path: '/skills',         icon: Target },
    { label: 'Skill Gap',            path: '/skill-gap',      icon: Cpu },
    {
      isSection: true,
      sectionTitle: 'Practice',
      items: [
        { label: 'Company Preparation', path: '/company-prep',   icon: Building2 },
        { label: 'Mock Interview',      path: '/mock-interview', icon: Video },
      ]
    },
    { label: 'Opportunities',        path: '/opportunities',  icon: Briefcase },
    { label: 'Applications',         path: '/applications',   icon: FileText },
    { label: 'Interviews & Placement', path: '/interviews',   icon: Award },
    { label: 'Notifications',        path: '/notifications',  icon: Bell },
    { label: 'Settings',             path: '/settings',       icon: Settings },
  ];

  const facultyNav = [
    { label: 'Dashboard',          path: '/faculty',                icon: LayoutDashboard },
    { label: 'Faculty Profile',    path: '/faculty/profile',        icon: User },
    { label: 'Student Directory',  path: '/faculty/students',       icon: Users },
    { label: 'Skill Analytics',    path: '/faculty/skills',         icon: BarChart3 },
    { label: 'Skill Gap Matrix',   path: '/faculty/skill-gap',      icon: Layers },
    { label: 'Internships',        path: '/faculty/opportunities',  icon: GraduationCap },
    { label: 'Placements',         path: '/faculty/placement',      icon: Award },
    { label: 'Faculty Network',    path: '/faculty/network',        icon: Network },
    { label: 'Reports',            path: '/faculty/reports',        icon: FileText },
    { label: 'Notifications',      path: '/faculty/notifications',  icon: Bell, badge: 3 },
    { label: 'Settings',           path: '/faculty/settings',       icon: Settings },
  ];

  const companyNav = [
    { label: 'Dashboard',               path: '/company',                          icon: LayoutDashboard },

    {
      isSection: true,
      sectionTitle: 'Company',
      items: [
        { label: 'Company Profile',          path: '/company/profile',                  icon: Building2 },
      ]
    },
    {
      isSection: true,
      sectionTitle: 'Talent',
      items: [
        { label: 'Recommended Candidates',  path: '/company/recommended-candidates',   icon: Sparkles },
        { label: 'Student Search',          path: '/company/students',                 icon: Search },
        { label: 'Skill Insights',          path: '/company/skill-insights',           icon: BrainCircuit },
      ]
    },
    {
      isSection: true,
      sectionTitle: 'Recruitment',
      items: [
        { label: 'Opportunities',           path: '/company/opportunities',            icon: Briefcase },
        { label: 'Applicants',              path: '/company/applicants',               icon: Users },
        { label: 'Shortlisted',             path: '/company/shortlisted',              icon: Award },
        { label: 'Interviews',              path: '/company/interviews',               icon: Video },
      ]
    },
    {
      isSection: true,
      sectionTitle: 'Preferences',
      items: [
        { label: 'Notifications',           path: '/company/notifications',            icon: Bell },
        { label: 'Settings',                path: '/settings',                         icon: Settings },
      ]
    }
  ];

  const adminNav = [
    { label: 'Dashboard',     path: '/admin',                icon: LayoutDashboard },
    { label: 'Admin Profile', path: '/admin/profile',        icon: User },
    { label: 'Users',         path: '/admin/users',          icon: Users },
    { label: 'Companies',     path: '/admin/companies',      icon: Building2 },
    { label: 'Opportunities', path: '/admin/opportunities',  icon: Briefcase },
    { label: 'Assessments',   path: '/admin/assessments',    icon: Award },
    { label: 'Applications',  path: '/admin/applications',  icon: FileText },
    { label: 'Placements',    path: '/admin/placements',    icon: GraduationCap },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  const navItems =
    role === 'admin'   ? adminNav   :
    role === 'company' ? companyNav :
    role === 'faculty' ? facultyNav :
    studentNav;

  const roleMeta = {
    faculty: {
      title: 'FACULTY WORKSPACE',
      homePath: '/faculty',
      badgeLabel: 'Academic Year',
      badgeText: '2025-26',
      badgeIcon: Calendar,
      searchPlaceholder: 'Search students, skills, reports...',
      subtitle: user?.designation || (user?.role === 'institution' ? 'Institutional Representative' : 'Faculty Member'),
      notificationsPath: '/faculty/notifications',
      defaultAvatarLetter: 'F'
    },
    student: {
      title: 'STUDENT WORKSPACE',
      homePath: '/student',
      badgeLabel: 'Academic Year',
      badgeText: '2025-26',
      badgeIcon: GraduationCap,
      searchPlaceholder: 'Search opportunities, skills, companies...',
      subtitle: user?.department ? `${user.department} • Student` : 'Student / Candidate',
      notificationsPath: '/notifications',
      defaultAvatarLetter: 'S'
    },
    company: {
      title: 'COMPANY PORTAL',
      homePath: '/company',
      badgeLabel: 'Recruitment Cycle',
      badgeText: '2025-26',
      badgeIcon: Briefcase,
      searchPlaceholder: 'Search candidates, jobs, interviews...',
      subtitle: user?.companyName || user?.designation || 'Recruiter / Employer',
      notificationsPath: '/company/notifications',
      defaultAvatarLetter: 'C'
    },
    admin: {
      title: 'ADMIN COMMAND CENTER',
      homePath: '/admin',
      badgeLabel: 'Control Platform',
      badgeText: 'v3.2 Enterprise',
      badgeIcon: Settings,
      searchPlaceholder: 'Search users, companies, audit logs...',
      subtitle: 'System Administrator',
      notificationsPath: '/admin/notifications',
      defaultAvatarLetter: 'A'
    }
  }[role] || {
    title: 'DASHBOARD WORKSPACE',
    homePath: '/',
    badgeLabel: 'Platform',
    badgeText: 'SkillNexus',
    badgeIcon: Sparkles,
    searchPlaceholder: 'Search platform...',
    subtitle: user?.role || 'User',
    notificationsPath: '/notifications',
    defaultAvatarLetter: 'U'
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const BadgeIcon = roleMeta.badgeIcon;

  return (
    <div
      className="fac-theme-page"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--fac-bg-page)',
        color: 'var(--fac-text-primary)',
        fontFamily: 'inherit',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: isLight ? 'rgba(6,63,58,0.45)' : 'rgba(0,0,0,0.75)',
            zIndex: 40, backdropFilter: 'blur(4px)'
          }}
          className="lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── UNIFIED INSTITUTIONAL SIDEBAR (Deep Green in Light, Pure Black in Dark) ── */}
      <aside
        style={{
          width: sidebarOpen ? '256px' : '0',
          minWidth: sidebarOpen ? '256px' : '0',
          background: 'var(--fac-bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          borderRight: isLight ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--fac-border)',
          transition: 'width 0.25s ease, min-width 0.25s ease, background-color 0.2s ease',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {sidebarOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '256px' }}>

            {/* Logo Area */}
            <div style={{
              padding: '22px 20px 18px',
              borderBottom: isLight ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--fac-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to={roleMeta.homePath} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: isLight
                      ? 'linear-gradient(135deg, #D6A84F 0%, #E3BC6B 100%)'
                      : 'linear-gradient(135deg, rgba(214, 168, 79, 0.2) 0%, rgba(22, 163, 106, 0.2) 100%)',
                    border: isLight ? 'none' : '1px solid #202A26',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles style={{ width: '18px', height: '18px', color: isLight ? '#1A2E0A' : '#D6A84F' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      SkillNexus <span style={{ color: '#D6A84F' }}>AI</span>
                    </div>
                    <div style={{
                      fontSize: '9px', fontWeight: 800,
                      color: isLight ? '#D6A84F' : '#19B874',
                      letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px'
                    }}>
                      {roleMeta.title}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                  style={{
                    padding: '6px', borderRadius: '6px', border: 'none',
                    background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto', scrollbarWidth: 'none' }}>
              {navItems.map((item, idx) => {
                const activeBg = isLight ? '#D6A84F' : 'var(--fac-nav-active-bg)';
                const activeColor = isLight ? '#063F3A' : 'var(--fac-nav-active-color)';
                const activeBorder = isLight ? '1px solid #D6A84F' : '1px solid var(--fac-nav-active-border)';
                const activeIconColor = isLight ? '#063F3A' : 'var(--fac-nav-active-icon)';
                const inactiveColor = isLight ? 'rgba(255, 255, 255, 0.85)' : '#D1D5DB';
                const inactiveIconColor = isLight ? 'rgba(255, 255, 255, 0.7)' : '#9CA3AF';

                if (item.isSection) {
                  return (
                    <div key={idx} style={{ marginTop: '12px', marginBottom: '6px' }}>
                      {/* Section Heading */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isLight ? '#D6A84F' : '#94A3B8',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        userSelect: 'none'
                      }}>
                        <span>{item.sectionTitle}</span>
                      </div>

                      {/* Section Sub-items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '8px' }}>
                        {item.items.map((subItem, sIdx) => {
                          const isSubActive = location.pathname === subItem.path ||
                            (subItem.path !== roleMeta.homePath && location.pathname.startsWith(subItem.path));
                          const SubIcon = subItem.icon;

                          return (
                            <Link
                              key={sIdx}
                              to={subItem.path}
                              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '9px 12px',
                                borderRadius: '9px',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: isSubActive ? 700 : 500,
                                background: isSubActive ? activeBg : 'transparent',
                                border: isSubActive ? activeBorder : '1px solid transparent',
                                color: isSubActive ? activeColor : inactiveColor,
                                transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                              onMouseEnter={e => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.08)' : 'var(--fac-bg-card-hover)';
                                  e.currentTarget.style.color = '#FFFFFF';
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = inactiveColor;
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SubIcon style={{
                                  width: '16px',
                                  height: '16px',
                                  flexShrink: 0,
                                  color: isSubActive ? activeIconColor : inactiveIconColor
                                }} />
                                <span>{subItem.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const isActive = location.pathname === item.path ||
                  (item.path !== roleMeta.homePath && location.pathname.startsWith(item.path));
                const Icon = item.icon;

                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      marginBottom: '4px',
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? activeBg : 'transparent',
                      border: isActive ? activeBorder : '1px solid transparent',
                      color: isActive ? activeColor : inactiveColor,
                      transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.08)' : 'var(--fac-bg-card-hover)';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = inactiveColor;
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon style={{
                        width: '17px',
                        height: '17px',
                        flexShrink: 0,
                        color: isActive ? activeIconColor : inactiveIconColor
                      }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: isLight ? '#063F3A' : '#16A36A',
                        color: isLight ? '#D6A84F' : '#000000',
                        padding: '1px 7px',
                        borderRadius: '9999px',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom: Profile & Logout */}
            <div style={{
              borderTop: isLight ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--fac-border)',
              padding: '14px 12px 18px',
              background: 'var(--fac-bg-sidebar)'
            }}>
              {/* Profile Card */}
              <button
                onClick={() => navigate(getProfilePath())}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '10px',
                  border: isLight ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--fac-border)',
                  background: isLight ? 'rgba(255,255,255,0.06)' : 'var(--fac-bg-card)',
                  cursor: 'pointer', textAlign: 'left', marginBottom: '10px',
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.12)' : 'var(--fac-bg-card-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.06)' : 'var(--fac-bg-card)';
                }}
                title="View & Edit Profile"
              >
                <UserAvatar user={user} size={32} role={role} fallbackLetter={roleMeta.defaultAvatarLetter} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || user?.email || 'User'}
                  </div>
                  <div style={{ fontSize: '9.5px', color: isLight ? 'rgba(255,255,255,0.6)' : 'var(--fac-text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {roleMeta.subtitle}
                  </div>
                </div>
                <ChevronRight style={{ width: '12px', height: '12px', color: isLight ? 'rgba(255,255,255,0.6)' : '#69736F', flexShrink: 0 }} />
              </button>

              {/* Sign Out Button in Gold */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px', borderRadius: '8px',
                  border: '1px solid rgba(214, 168, 79, 0.4)',
                  background: isLight ? 'rgba(214, 168, 79, 0.1)' : 'rgba(214, 168, 79, 0.04)',
                  color: '#D6A84F',
                  cursor: 'pointer', fontSize: '11.5px', fontWeight: 700,
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(214, 168, 79, 0.2)';
                  e.currentTarget.style.borderColor = '#D6A84F';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isLight ? 'rgba(214, 168, 79, 0.1)' : 'rgba(214, 168, 79, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(214, 168, 79, 0.4)';
                }}
              >
                <LogOut style={{ width: '13px', height: '13px' }} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--fac-bg-page)' }}>

        {/* ── TOP HEADER (Ivory in Light, Pure Black in Dark) ── */}
        <header style={{
          height: '56px',
          background: 'var(--fac-bg-header)',
          borderBottom: '1px solid var(--fac-border)',
          display: 'flex', alignItems: 'center', padding: '0 28px',
          gap: '20px', position: 'sticky', top: 0, zIndex: 30,
          transition: 'background-color 0.2s ease, border-color 0.2s ease'
        }}>

          {/* Left: Workspace Breadcrumb Title (Cleanly aligned without hamburger) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontSize: '12px', fontWeight: 800,
              color: isLight ? '#063F3A' : '#F5F7F6',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              {roleMeta.title}
            </span>
          </div>

          {/* Center: Search Bar with Ctrl + K */}
          <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '13px', height: '13px', color: 'var(--fac-text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder={roleMeta.searchPlaceholder}
              className="fac-theme-input"
              style={{ paddingLeft: '34px', paddingRight: '64px', height: '34px', fontSize: '12px' }}
            />
            <span style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '9.5px', fontWeight: 700,
              color: 'var(--fac-text-muted)',
              background: 'var(--fac-bg-subtle)',
              border: '1px solid var(--fac-border)',
              padding: '2px 6px', borderRadius: '4px',
            }}>
              Ctrl + K
            </span>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>

            {/* Notification Bell */}
            <Link
              to={roleMeta.notificationsPath}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fac-text-secondary)', textDecoration: 'none', position: 'relative',
                transition: 'all 0.14s ease',
              }}
              title="Notifications"
            >
              <Bell style={{ width: '14px', height: '14px' }} />
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--fac-gold)',
              }} />
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fac-text-secondary)', transition: 'all 0.14s ease',
              }}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Moon style={{ width: '14px', height: '14px', color: '#063F3A' }} />
              ) : (
                <Sun style={{ width: '14px', height: '14px', color: '#D6A84F' }} />
              )}
            </button>

            {/* Role Metadata Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: '8px',
              border: '1px solid var(--fac-border)',
              background: 'var(--fac-bg-card)',
              userSelect: 'none',
            }}>
              <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', fontWeight: 600 }}>{roleMeta.badgeLabel}</span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{roleMeta.badgeText}</span>
              <BadgeIcon style={{ width: '11px', height: '11px', color: 'var(--fac-emerald)', marginLeft: '2px' }} />
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => navigate(getProfilePath())}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 10px 4px 4px', borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                cursor: 'pointer', transition: 'all 0.14s ease',
              }}
              title="Click to view & edit profile"
            >
              <div style={{ textAlign: 'right' }} className="hidden sm:block">
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-primary)', lineHeight: 1.2 }}>
                  {user?.name || user?.email || 'User'}
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--fac-text-muted)', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleMeta.subtitle}
                </div>
              </div>
              <UserAvatar user={user} size={28} role={role} fallbackLetter={roleMeta.defaultAvatarLetter} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Workspace */}
        <main style={{
          flex: 1, overflowY: 'auto', padding: '24px 28px 48px',
          background: 'var(--fac-bg-page)',
          transition: 'background-color 0.2s ease'
        }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
