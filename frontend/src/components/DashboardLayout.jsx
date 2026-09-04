import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Cpu, Target, Briefcase,
  User, LogOut, Sun, Moon, Sparkles, X, Menu,
  Building2, GraduationCap, School, Settings,
  FileText, Award, Bell, Video, Users, Search, BarChart3,
  ChevronDown, Calendar, TrendingUp, RefreshCw, Network,
  Layers, ChevronRight
} from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';


export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const rawRole = (user?.role || 'student').toLowerCase();
  const isFaculty = ['faculty', 'institution', 'academician'].includes(rawRole);
  const role = isFaculty ? 'faculty' : rawRole;
  const isLight = theme === 'light';

  /* ── Navigation Definitions ── */
  const studentNav = [
    { label: 'Dashboard',            path: '/student',       icon: LayoutDashboard },
    { label: 'My Profile',           path: '/profile',       icon: User },
    { label: 'Skills & Assessment',  path: '/skills',        icon: Target },
    { label: 'Skill Gap',            path: '/skill-gap',     icon: Cpu },
    { label: 'Company Preparation',  path: '/company-prep',  icon: Building2 },
    { label: 'Opportunities',        path: '/opportunities', icon: Briefcase },
    { label: 'Applications',         path: '/applications',  icon: FileText },
    { label: 'Interviews & Placement', path: '/interviews',  icon: Award },
    { label: 'Notifications',        path: '/notifications', icon: Bell },
    { label: 'Settings',             path: '/settings',      icon: Settings },
  ];

  const facultyNav = [
    { label: 'Dashboard',          path: '/faculty',                icon: LayoutDashboard },
    { label: 'Students',           path: '/faculty/students',       icon: Users },
    { label: 'Skill Intelligence', path: '/faculty/skills',         icon: BarChart3 },
    { label: 'Skill Gap Analysis', path: '/faculty/skill-gap',      icon: Target },
    { label: 'Opportunities',      path: '/faculty/opportunities',  icon: Briefcase },
    { label: 'Internships',        path: '/faculty/opportunities',  icon: GraduationCap },
    { label: 'Placements',         path: '/faculty/placement',      icon: Award },
    { label: 'Faculty Network',    path: '/faculty/network',        icon: Network },
    { label: 'Reports',            path: '/faculty/reports',        icon: FileText },
    { label: 'Notifications',      path: '/faculty/notifications',  icon: Bell, badge: 3 },
    { label: 'Settings',           path: '/faculty/settings',       icon: Settings },
  ];

  const companyNav = [
    { label: 'Dashboard',       path: '/company',               icon: LayoutDashboard },
    { label: 'Company Profile', path: '/company/profile',       icon: Building2 },
    { label: 'Opportunities',   path: '/company/opportunities',  icon: Briefcase },
    { label: 'Applicants',      path: '/company/applicants',    icon: Users },
    { label: 'Student Search',  path: '/company/students',      icon: Search },
    { label: 'Shortlisted',     path: '/company/shortlisted',   icon: Award },
    { label: 'Interviews',      path: '/company/interviews',    icon: Video },
    { label: 'Notifications',   path: '/company/notifications', icon: Bell },
  ];

  const adminNav = [
    { label: 'Dashboard',     path: '/admin',                icon: LayoutDashboard },
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

  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleIcon = () => {
    if (role === 'company') return Building2;
    if (role === 'faculty') return School;
    if (role === 'admin')   return Settings;
    return GraduationCap;
  };
  const RoleIcon = getRoleIcon();


  /* ══════════════════════════════════════════════════════════════
     FACULTY WORKSPACE LAYOUT (Supports both Light & Dark themes)
     ══════════════════════════════════════════════════════════════ */
  if (isFaculty) {
    const currentNav = facultyNav.find(n =>
      n.path === location.pathname ||
      (n.path !== '/faculty' && location.pathname.startsWith(n.path))
    );
    const pageTitle = currentNav?.label || 'Dashboard';

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

        {/* ── FACULTY SIDEBAR (Deep Green in Light, Black in Dark) ── */}
        <aside
          style={{
            width: sidebarOpen ? '240px' : '0',
            minWidth: sidebarOpen ? '240px' : '0',
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '240px' }}>

              {/* Logo Area */}
              <div style={{
                padding: '20px 18px 16px',
                borderBottom: isLight ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--fac-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link to="/faculty" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: isLight
                        ? 'linear-gradient(135deg, #D6A84F 0%, #E3BC6B 100%)'
                        : 'linear-gradient(135deg, rgba(214, 168, 79, 0.2) 0%, rgba(22, 163, 106, 0.2) 100%)',
                      border: isLight ? 'none' : '1px solid #202A26',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles style={{ width: '16px', height: '16px', color: isLight ? '#1A2E0A' : '#D6A84F' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        SkillNexus <span style={{ color: '#D6A84F' }}>AI</span>
                      </div>
                      <div style={{
                        fontSize: '8px', fontWeight: 800,
                        color: isLight ? '#D6A84F' : '#19B874',
                        letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px'
                      }}>
                        FACULTY WORKSPACE
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                    style={{
                      padding: '5px', borderRadius: '6px', border: 'none',
                      background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <X style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                {facultyNav.map((item, idx) => {
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/faculty' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;

                  const activeBg = isLight ? '#D6A84F' : 'var(--fac-nav-active-bg)';
                  const activeColor = isLight ? '#063F3A' : 'var(--fac-nav-active-color)';
                  const activeBorder = isLight ? '1px solid #D6A84F' : '1px solid var(--fac-nav-active-border)';
                  const activeIconColor = isLight ? '#063F3A' : 'var(--fac-nav-active-icon)';
                  const inactiveColor = isLight ? 'rgba(255, 255, 255, 0.75)' : 'var(--fac-nav-color)';
                  const inactiveIconColor = isLight ? 'rgba(255, 255, 255, 0.6)' : '#69736F';

                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px', borderRadius: '9px', marginBottom: '3px',
                        textDecoration: 'none', fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? activeBg : 'transparent',
                        border: isActive ? activeBorder : '1px solid transparent',
                        color: isActive ? activeColor : inactiveColor,
                        transition: 'all 0.14s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.08)' : 'var(--fac-bg-card-hover)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = inactiveColor;
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon style={{
                          width: '15px', height: '15px', flexShrink: 0,
                          color: isActive ? activeIconColor : inactiveIconColor
                        }} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span style={{
                          fontSize: '9.5px', fontWeight: 800,
                          background: isLight ? '#063F3A' : '#16A36A',
                          color: isLight ? '#D6A84F' : '#000000',
                          padding: '1px 6px', borderRadius: '9999px',
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
                  onClick={() => setProfileModalOpen(true)}
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
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#FFFFFF', overflow: 'hidden',
                  }}>
                    {user?.avatarUrl || user?.profilePhoto
                      ? <img src={user.avatarUrl || user.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (user?.name?.charAt(0) || 'D').toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name || user?.email || 'Faculty Member'}
                    </div>
                    <div style={{ fontSize: '9.5px', color: isLight ? 'rgba(255,255,255,0.6)' : 'var(--fac-text-muted)', fontWeight: 500 }}>
                      {user?.designation || (user?.role === 'institution' ? 'Institutional Representative' : 'Faculty')}
                    </div>
                  </div>
                  <ChevronDown style={{ width: '12px', height: '12px', color: isLight ? 'rgba(255,255,255,0.6)' : '#69736F', flexShrink: 0 }} />
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

          {/* ── TOP HEADER (Ivory in Light, Black in Dark) ── */}
          <header style={{
            height: '56px',
            background: 'var(--fac-bg-header)',
            borderBottom: '1px solid var(--fac-border)',
            display: 'flex', alignItems: 'center', padding: '0 24px',
            gap: '16px', position: 'sticky', top: 0, zIndex: 30,
            transition: 'background-color 0.2s ease, border-color 0.2s ease'
          }}>

            {/* Left: Hamburger + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <button
                onClick={() => setSidebarOpen(p => !p)}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: '1px solid var(--fac-border)',
                  background: 'var(--fac-bg-card)',
                  color: 'var(--fac-text-secondary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.14s ease',
                }}
                title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
              >
                <Menu style={{ width: '14px', height: '14px' }} />
              </button>

              <span style={{
                fontSize: '11px', fontWeight: 800,
                color: isLight ? '#063F3A' : '#F5F7F6',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>
                FACULTY WORKSPACE
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
                placeholder="Search students, skills, reports..."
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
                to="/faculty/notifications"
                style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  border: '1px solid var(--fac-border)',
                  background: 'var(--fac-bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fac-text-secondary)', textDecoration: 'none', position: 'relative',
                  transition: 'all 0.14s ease',
                }}
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

              {/* Academic Year Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                userSelect: 'none',
              }}>
                <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', fontWeight: 600 }}>Academic Year</span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>2025-26</span>
                <Calendar style={{ width: '11px', height: '11px', color: 'var(--fac-emerald)', marginLeft: '2px' }} />
              </div>

              {/* Profile Avatar Button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 10px 4px 4px', borderRadius: '8px',
                  border: '1px solid var(--fac-border)',
                  background: 'var(--fac-bg-card)',
                  cursor: 'pointer', transition: 'all 0.14s ease',
                }}
              >
                <div style={{ textAlign: 'right' }} className="hidden sm:block">
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-primary)', lineHeight: 1.2 }}>
                    {user?.name || user?.email || 'Faculty Member'}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--fac-text-muted)', fontWeight: 500 }}>
                    {user?.designation || (user?.role === 'institution' ? 'Institutional Representative' : 'Faculty')}
                  </div>
                </div>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#FFFFFF', overflow: 'hidden',
                }}>
                  {user?.avatarUrl || user?.profilePhoto
                    ? <img src={user.avatarUrl || user.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user?.name?.charAt(0) || user?.email?.charAt(0) || 'F').toUpperCase()
                  }
                </div>
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

        <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      </div>
    );
  }


  /* ══════════════════════════════════════════════════════════════
     STANDARD LAYOUT (Student / Company / Admin — preserved)
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden" aria-hidden="true" />
      )}

      {/* Standard Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-72 translate-x-0 shadow-2xl lg:shadow-none' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-r-0 p-0 opacity-0 pointer-events-none'
      }`}>
        {sidebarOpen && (
          <div className="flex flex-col h-full justify-between w-72">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight block">SkillNexus AI</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <RoleIcon className="h-3 w-3 inline" />
                      <span>{role === 'admin' ? 'Admin Center' : `${role} Workspace`}</span>
                    </span>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer" title="Close Sidebar">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] text-left">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Navigation Menu</div>
                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  const ItemIcon = item.icon;
                  return (
                    <Link key={idx} to={item.path} onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}>
                      <ItemIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button onClick={() => setProfileModalOpen(true)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left group">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden">
                    {user?.avatarUrl || user?.profilePhoto ? <img src={user.avatarUrl || user.profilePhoto} alt={user?.name || 'Profile'} className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">Edit Profile &amp; Password</p>
                  </div>
                </div>
                <Settings className="h-4 w-4 text-slate-400 group-hover:rotate-45 transition-transform shrink-0" />
              </button>
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer">
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Standard Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(p => !p)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs font-bold shadow-xs flex items-center justify-center" title={sidebarOpen ? 'Close Menu' : 'Open Menu'} aria-label="Toggle Navigation Menu">
              {sidebarOpen ? <X className="h-4 w-4 text-slate-600 dark:text-slate-300" /> : <Menu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            </button>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden sm:inline-block">
              {role === 'admin' ? 'Admin Command Center' : `${role} Workspace`}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer" title="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
            <button onClick={() => setProfileModalOpen(true)} className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/30 transition cursor-pointer text-right group" title="Click to view & edit profile">
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block transition truncate max-w-[140px]">{user?.name || user?.email}</span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">{user?.status || 'Active'}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden shadow-xs relative">
                {user?.avatarUrl || user?.profilePhoto ? <img src={user.avatarUrl || user.profilePhoto} alt={user?.name || 'Profile'} onError={e => { e.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" /> : null}
                <span className="select-none">{user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
