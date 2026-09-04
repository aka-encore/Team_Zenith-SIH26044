import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles, ArrowRight, Sun, Moon, Menu, X,
  Target, Cpu, Briefcase, Award, GraduationCap,
  Building2, School, Search, CheckCircle2, ChevronRight,
  Layers, Terminal, ShieldCheck, Check, Code2, Users, FileText,
  BarChart3, Zap, ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const accentColor = isLight ? '#090C0B' : '#FFFFFF';
  const buttonAccent = isLight ? '#063F3A' : '#19B874';

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-500"
      style={{
        backgroundColor: 'var(--fac-bg-page)',
        color: 'var(--fac-text-primary)',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          1. NAVBAR (Notion-style Clean Minimal Navigation)
          ══════════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: isLight ? 'rgba(248, 249, 246, 0.95)' : 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--fac-border)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo / Project Name */}
          <Link to="/" className="inline-flex items-center gap-3 no-underline group">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isLight ? '#090C0B' : '#FFFFFF',
                color: isLight ? '#FFFFFF' : '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
                flexShrink: 0
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fac-text-primary)', letterSpacing: '-0.03em' }}>
              SkillNexus
            </span>
          </Link>

          {/* Desktop Navigation Links with Expanding Underline Animation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="nav-link-notion"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('for-students')}
              className="nav-link-notion"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              For Students
            </button>
            <button
              onClick={() => scrollToSection('for-companies')}
              className="nav-link-notion"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              For Companies
            </button>
            <button
              onClick={() => scrollToSection('for-faculty')}
              className="nav-link-notion"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              For Faculty
            </button>
          </nav>

          {/* Right Actions: Theme Toggle + Login + Register */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                color: 'var(--fac-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Moon style={{ width: '15px', height: '15px', color: '#090C0B' }} />
              ) : (
                <Sun style={{ width: '15px', height: '15px', color: '#D6A84F' }} />
              )}
            </button>

            {user ? (
              <Link
                to={
                  user.role === 'company'
                    ? '/company'
                    : ['faculty', 'institution', 'academician'].includes(user.role)
                    ? '/faculty'
                    : user.role === 'admin'
                    ? '/admin'
                    : '/student'
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isLight ? '#090C0B' : '#FFFFFF',
                  color: isLight ? '#FFFFFF' : '#000000',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Dashboard</span>
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--fac-border)',
                    background: 'var(--fac-bg-card)',
                    color: 'var(--fac-text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-slate-400"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isLight ? '#090C0B' : '#FFFFFF',
                    color: isLight ? '#FFFFFF' : '#000000',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:opacity-90"
                >
                  <span>Get Started</span>
                  <ArrowRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg border border-slate-300 dark:border-slate-800"
            >
              {mobileMenuOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-black">
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 font-semibold text-sm">How It Works</button>
            <button onClick={() => scrollToSection('for-students')} className="block w-full text-left py-2 font-semibold text-sm">For Students</button>
            <button onClick={() => scrollToSection('for-companies')} className="block w-full text-left py-2 font-semibold text-sm">For Companies</button>
            <button onClick={() => scrollToSection('for-faculty')} className="block w-full text-left py-2 font-semibold text-sm">For Faculty</button>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. HERO SECTION (Notion-style Bold Typography & Art)
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: isLight ? 'rgba(9, 12, 11, 0.06)' : 'rgba(255, 255, 255, 0.1)', color: 'var(--fac-text-primary)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart Academia–Industry Portal</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                lineHeight: '1.08',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--fac-text-primary)'
              }}
            >
              Build something <br />
              <span style={{ textDecoration: 'underline', textDecorationColor: isLight ? '#063F3A' : '#19B874', textUnderlineOffset: '8px' }}>
                beautiful.
              </span>
            </h1>

            <p
              style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: 'var(--fac-text-secondary)',
                maxWidth: '540px'
              }}
            >
              Portal for Academia–Industry Collaboration. Build skills. Prepare for industry. Find the right opportunities with verified benchmarks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                style={{
                  padding: '12px 26px',
                  borderRadius: '10px',
                  background: isLight ? '#090C0B' : '#FFFFFF',
                  color: isLight ? '#FFFFFF' : '#000000',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isLight ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)' : '0 10px 25px -5px rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                className="hover:scale-[1.02] active:scale-[0.99]"
              >
                <span>Get Started Free</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>

              <button
                onClick={() => scrollToSection('how-it-works')}
                style={{
                  padding: '12px 22px',
                  borderRadius: '10px',
                  border: '1px solid var(--fac-border)',
                  background: 'var(--fac-bg-card)',
                  color: 'var(--fac-text-primary)',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                className="hover:border-slate-400"
              >
                <span>How It Works</span>
                <ChevronRight style={{ width: '15px', height: '15px' }} />
              </button>
            </div>

            {/* Trusted Ecosystem / Partners Banner */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fac-text-muted)' }}>
                Integrated with Institutional Workflows & Top Employers
              </span>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold opacity-75">
                <span className="hover-underline-link">IIT Bombay</span>
                <span className="hover-underline-link">NIT Karnataka</span>
                <span className="hover-underline-link">Infosys Springboard</span>
                <span className="hover-underline-link">TCS iON</span>
                <span className="hover-underline-link">Cisco Academy</span>
              </div>
            </div>

          </div>

          {/* Right Clean Notion-style Editorial Art */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'var(--fac-bg-card)',
                border: '1px solid var(--fac-border)',
                boxShadow: isLight ? '0 20px 40px -10px rgba(0,0,0,0.08)' : '0 20px 40px -10px rgba(0,0,0,0.5)'
              }}
            >
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fac-text-muted)' }}>
                  SkillNexus • Readiness Matrix
                </span>
              </div>

              {/* Vector Artwork matching Notion style */}
              <div className="py-6 flex justify-center">
                <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
                  {/* Creative Notion-style collaboration illustration */}
                  <path d="M40 180 Q80 80 160 140 T280 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" className="text-slate-800 dark:text-slate-200" />
                  
                  {/* Box 1: Skills */}
                  <rect x="50" y="40" width="65" height="50" rx="8" fill={isLight ? '#F8FAFC' : '#1E293B'} stroke="currentColor" strokeWidth="2" />
                  <text x="62" y="68" fontSize="12" fontWeight="700" fill="currentColor">Skills</text>
                  <text x="62" y="80" fontSize="9" fill="currentColor" opacity="0.7">Assess</text>

                  {/* Box 2: Analysis */}
                  <rect x="135" y="90" width="70" height="50" rx="8" fill={isLight ? '#F8FAFC' : '#1E293B'} stroke="currentColor" strokeWidth="2" />
                  <text x="146" y="118" fontSize="12" fontWeight="700" fill="currentColor">Gaps</text>
                  <text x="146" y="130" fontSize="9" fill="currentColor" opacity="0.7">Analyze</text>

                  {/* Box 3: Placement */}
                  <rect x="220" y="30" width="70" height="50" rx="8" fill={isLight ? '#F8FAFC' : '#1E293B'} stroke="currentColor" strokeWidth="2" />
                  <text x="230" y="58" fontSize="12" fontWeight="700" fill="currentColor">Jobs</text>
                  <text x="230" y="70" fontSize="9" fill="currentColor" opacity="0.7">Placed</text>

                  {/* Connecting playful stars */}
                  <circle cx="90" cy="140" r="4" fill="#10B981" />
                  <circle cx="170" cy="50" r="4" fill="#8B5CF6" />
                  <circle cx="250" cy="120" r="4" fill="#F59E0B" />
                </svg>
              </div>

              {/* Quick stats without overflow */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="block text-lg font-black">94%</span>
                  <span className="block text-[11px] text-slate-500 font-semibold">Ready</span>
                </div>
                <div>
                  <span className="block text-lg font-black">1.4k+</span>
                  <span className="block text-[11px] text-slate-500 font-semibold">Tests</span>
                </div>
                <div>
                  <span className="block text-lg font-black">100%</span>
                  <span className="block text-[11px] text-slate-500 font-semibold">Verified</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. HOW IT WORKS (Structured 5-Step Process)
          ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="w-full py-16 border-t border-slate-200 dark:border-slate-800" style={{ background: 'var(--fac-bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="text-left max-w-2xl mb-12">
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isLight ? '#063F3A' : '#19B874' }}>
              Structured Process
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '6px', color: 'var(--fac-text-primary)' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--fac-text-secondary)', marginTop: '8px' }}>
              From initial career goal alignment to final verified placement in 5 continuous steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Choose Career Goal', desc: 'Select targeted industry roles like Fullstack, AI/ML, Cloud or DevOps.' },
              { step: '02', title: 'Build Skills', desc: 'Engage with structured syllabus-aligned learning and coding modules.' },
              { step: '03', title: 'Identify Skill Gaps', desc: 'Automated diagnostic tests highlight exact missing industry competencies.' },
              { step: '04', title: 'Practice & Prepare', desc: 'Targeted mock assessments and company-specific interview challenges.' },
              { step: '05', title: 'Apply & Get Placed', desc: 'Direct applications to pre-assessed campus and corporate hiring drives.' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'var(--fac-bg-card)',
                  border: '1px solid var(--fac-border)',
                  boxShadow: 'var(--fac-card-shadow)'
                }}
              >
                <div>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: isLight ? '#063F3A' : '#19B874', opacity: 0.8 }}>
                    {item.step}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: '8px', color: 'var(--fac-text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--fac-text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-bold" style={{ color: isLight ? '#063F3A' : '#19B874' }}>
                  <span>Step {idx + 1}</span>
                  <ArrowRight style={{ width: '12px', height: '12px' }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. FOR STUDENTS
          ══════════════════════════════════════════════════════════════ */}
      <section id="for-students" className="w-full py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Student Portal
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '6px', color: 'var(--fac-text-primary)' }}>
                For Students
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--fac-text-secondary)', marginTop: '6px' }}>
                Everything you need to benchmark your capabilities and crack top tier placements.
              </p>
            </div>
            <Link
              to="/register"
              className="hover-underline-link text-sm font-bold text-emerald-600 dark:text-emerald-400"
            >
              Create Student Account →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Skill Assessment', desc: 'Standardized MCQ and coding challenges evaluating core CS and domain skills.' },
              { icon: Cpu, title: 'Skill Gap Analysis', desc: 'Direct algorithmic mapping against live corporate job descriptions.' },
              { icon: Award, title: 'Company Preparation', desc: 'Customized mock tests tailored to TCS, Infosys, Cisco, and Google hiring patterns.' },
              { icon: Briefcase, title: 'Jobs & Internships', desc: 'Direct applications to pre-screened campus drives with verified skill badges.' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'var(--fac-bg-card)',
                    border: '1px solid var(--fac-border)',
                    boxShadow: 'var(--fac-card-shadow)'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isLight ? 'rgba(6, 63, 58, 0.08)' : 'rgba(25, 184, 116, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLight ? '#063F3A' : '#19B874', marginBottom: '16px' }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fac-text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. FOR COMPANIES
          ══════════════════════════════════════════════════════════════ */}
      <section id="for-companies" className="w-full py-16 border-t border-slate-200 dark:border-slate-800" style={{ background: 'var(--fac-bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Employer Gateway
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '6px', color: 'var(--fac-text-primary)' }}>
                For Companies
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--fac-text-secondary)', marginTop: '6px' }}>
                Access verified campus talent and reduce time-to-hire by 70%.
              </p>
            </div>
            <Link
              to="/register"
              className="hover-underline-link text-sm font-bold text-blue-600 dark:text-blue-400"
            >
              Post Recruitment Drive →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Post Opportunities', desc: 'Create verified campus and lateral drives with explicit role criteria.' },
              { icon: Search, title: 'Find Skilled Students', desc: 'Filter candidates by verified assessment percentiles, branch, and GPA.' },
              { icon: Zap, title: 'Skill-based Matching', desc: 'Automated candidate matching based on verified skill competency scores.' },
              { icon: Users, title: 'Manage Hiring Pipeline', desc: 'Track applicants, schedule technical interviews, and issue offer letters.' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'var(--fac-bg-card)',
                    border: '1px solid var(--fac-border)',
                    boxShadow: 'var(--fac-card-shadow)'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', marginBottom: '16px' }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fac-text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. FOR FACULTY & INSTITUTIONS
          ══════════════════════════════════════════════════════════════ */}
      <section id="for-faculty" className="w-full py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Academic Administration
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '6px', color: 'var(--fac-text-primary)' }}>
                For Faculty & Mentors
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--fac-text-secondary)', marginTop: '6px' }}>
                Gain real-time insights into cohort readiness and bridge curriculum gaps.
              </p>
            </div>
            <Link
              to="/register"
              className="hover-underline-link text-sm font-bold text-amber-600 dark:text-amber-400"
            >
              Access Faculty Suite →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Student Skill Insight', desc: 'Granular analytics on student batch strengths, weakness areas, and test scores.' },
              { icon: Layers, title: 'Department Benchmarks', desc: 'Compare year-over-year competency growth against national accreditation norms.' },
              { icon: Target, title: 'Curriculum Gap Analysis', desc: 'Identify topics missing from course syllabi that recruiters demand.' },
              { icon: Award, title: 'Placement Tracking', desc: 'Track eligible candidates, placement conversion ratios, and company visits.' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'var(--fac-bg-card)',
                    border: '1px solid var(--fac-border)',
                    boxShadow: 'var(--fac-card-shadow)'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isLight ? 'rgba(217, 119, 6, 0.08)' : 'rgba(214, 168, 79, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '16px' }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fac-text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. CALL TO ACTION & MINIMAL FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 border-t border-slate-200 dark:border-slate-800 text-center" style={{ background: 'var(--fac-bg-surface)' }}>
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.035em', color: 'var(--fac-text-primary)' }}>
            Ready to empower your career?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--fac-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Join thousands of students, faculties, and recruiters on the SkillNexus platform today.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/register"
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background: isLight ? '#090C0B' : '#FFFFFF',
                color: isLight ? '#FFFFFF' : '#000000',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              className="hover:opacity-90"
            >
              <span>Get Started</span>
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
            <Link
              to="/login"
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '1px solid var(--fac-border)',
                background: 'var(--fac-bg-card)',
                color: 'var(--fac-text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
              className="hover:border-slate-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-slate-200 dark:border-slate-800 text-xs" style={{ color: 'var(--fac-text-muted)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
              S
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">SkillNexus</span>
            <span>— Academia–Industry Collaboration Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover-underline-link">Privacy Policy</Link>
            <Link to="/" className="hover-underline-link">Terms of Service</Link>
            <Link to="/" className="hover-underline-link">Documentation</Link>
            <Link to="/login" className="hover-underline-link">Portal Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
