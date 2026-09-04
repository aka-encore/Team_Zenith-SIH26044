import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Users, User, GraduationCap, Briefcase, BarChart3,
  ArrowUpRight, AlertCircle, ChevronRight,
  RefreshCw, Award, Target, TrendingUp, TrendingDown,
  CheckCircle, UserCheck, Minus, BookOpen, Activity,
  Building2, FileText, Sparkles, ArrowRight, Info,
  ChevronDown, Layers, HelpCircle, CheckCircle2,
  Megaphone, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

/* ────────────────────────────────────────────────────────────
   Neoclassical University Dome Architecture Illustration
──────────────────────────────────────────────────────────── */
function UniversityIllustration({ isLight }) {
  const strokeColor = '#D6A84F';
  const fillBg = isLight ? '#063F3A' : '#080B0A';

  return (
    <svg
      viewBox="0 0 460 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        right: '-10px',
        bottom: '-10px',
        height: '110%',
        width: 'auto',
        opacity: isLight ? 0.25 : 0.35,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <radialGradient id="univGlow" cx="60%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#D6A84F" stopOpacity={isLight ? "0.2" : "0.15"} />
        <stop offset="100%" stopColor="#D6A84F" stopOpacity="0" />
      </radialGradient>
      <rect width="460" height="220" fill="url(#univGlow)" />

      {/* Main Base Steps */}
      <line x1="20" y1="210" x2="440" y2="210" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="40" y1="204" x2="420" y2="204" stroke={strokeColor} strokeWidth="1.2" />
      <line x1="60" y1="198" x2="400" y2="198" stroke={strokeColor} strokeWidth="1" />

      {/* Main Building Base Blocks */}
      <rect x="70" y="140" width="320" height="58" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 2" fill={fillBg} fillOpacity="0.4" />

      {/* 8 Classical Columns */}
      {[130, 155, 180, 205, 230, 255, 280, 305].map((x, idx) => (
        <g key={idx}>
          <line x1={x} y1="110" x2={x} y2="198" stroke={strokeColor} strokeWidth="2.5" />
          <line x1={x + 7} y1="110" x2={x + 7} y2="198" stroke={strokeColor} strokeWidth="2.5" />
          <rect x={x - 3} y="106" width="13" height="4" stroke={strokeColor} strokeWidth="1" fill={strokeColor} fillOpacity="0.3" />
          <rect x={x - 2} y="194" width="11" height="4" stroke={strokeColor} strokeWidth="1" fill={strokeColor} fillOpacity="0.3" />
        </g>
      ))}

      {/* Entablature */}
      <rect x="110" y="100" width="220" height="8" stroke={strokeColor} strokeWidth="1.5" fill={fillBg} />
      <line x1="110" y1="104" x2="330" y2="104" stroke={strokeColor} strokeWidth="0.8" />

      {/* Triangular Pediment */}
      <polygon points="105,100 220,55 335,100" stroke={strokeColor} strokeWidth="1.8" fill={fillBg} fillOpacity="0.7" />
      <polygon points="125,96 220,60 315,96" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="220" cy="78" r="7" stroke={strokeColor} strokeWidth="1" />
      <circle cx="220" cy="78" r="3" fill={strokeColor} />

      {/* Dome Drum */}
      <rect x="175" y="42" width="90" height="16" stroke={strokeColor} strokeWidth="1.2" fill={fillBg} />
      {[185, 198, 210, 222, 235, 248].map((dx, i) => (
        <line key={i} x1={dx} y1="42" x2={dx} y2="58" stroke={strokeColor} strokeWidth="1" />
      ))}

      {/* Main Dome */}
      <path d="M 170 42 C 170 12, 270 12, 270 42 Z" stroke={strokeColor} strokeWidth="2" fill={fillBg} fillOpacity="0.6" />
      <path d="M 220 16 L 220 42" stroke={strokeColor} strokeWidth="1" />
      <path d="M 220 16 Q 195 24 190 42" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2 1" />
      <path d="M 220 16 Q 245 24 250 42" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2 1" />

      {/* Lantern */}
      <rect x="214" y="6" width="12" height="10" stroke={strokeColor} strokeWidth="1.2" fill={strokeColor} fillOpacity="0.4" />
      <line x1="220" y1="0" x2="220" y2="6" stroke={strokeColor} strokeWidth="1.8" />
      <circle cx="220" cy="0" r="1.5" fill={strokeColor} />

      {/* Side Wings */}
      <rect x="70" y="115" width="50" height="83" stroke={strokeColor} strokeWidth="1" fill={fillBg} />
      <rect x="320" y="115" width="70" height="83" stroke={strokeColor} strokeWidth="1" fill={fillBg} />

      {/* Arched Windows */}
      {[85, 340, 365].map((wx, i) => (
        <g key={i}>
          <path d={`M ${wx} 160 L ${wx} 140 Q ${wx + 9} 130 ${wx + 18} 140 L ${wx + 18} 160 Z`} stroke={strokeColor} strokeWidth="1" fill={strokeColor} fillOpacity="0.1" />
          <line x1={wx + 9} y1="133" x2={wx + 9} y2="160" stroke={strokeColor} strokeWidth="0.8" />
          <line x1={wx} y1="147" x2={wx + 18} y2="147" stroke={strokeColor} strokeWidth="0.8" />
        </g>
      ))}

      <line x1="68" y1="115" x2="120" y2="115" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="320" y1="115" x2="392" y2="115" stroke={strokeColor} strokeWidth="1.5" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Radar / Spider Chart for 8 Competency Dimensions
──────────────────────────────────────────────────────────── */
function CompetencyRadarChart({ dimensions, size = 260 }) {
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = dimensions.length;

  const getCoord = (index, value) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const levels = [0.25, 0.5, 0.75, 1.0];

  const studentPoints = dimensions.map((d, i) => {
    const pt = getCoord(i, d.student || 0);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const industryPoints = dimensions.map((d, i) => {
    const pt = getCoord(i, d.industry || 0);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {levels.map((lvl, idx) => {
          const polyPts = dimensions.map((_, i) => {
            const pt = getCoord(i, lvl * 100);
            return `${pt.x},${pt.y}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={polyPts}
              fill="none"
              stroke="var(--fac-border)"
              strokeWidth={idx === levels.length - 1 ? "1.2" : "0.8"}
              strokeDasharray={idx < levels.length - 1 ? "2 2" : "none"}
            />
          );
        })}

        {dimensions.map((dim, i) => {
          const outerPt = getCoord(i, 100);
          const labelPt = getCoord(i, 126);
          return (
            <g key={i}>
              <line
                x1={center} y1={center}
                x2={outerPt.x} y2={outerPt.y}
                stroke="var(--fac-border)" strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--fac-text-secondary)"
                fontSize="8.5px"
                fontWeight="600"
              >
                {dim.shortName || dim.name}
              </text>
            </g>
          );
        })}

        {/* Industry Polygon (Gold) */}
        <polygon
          points={industryPoints}
          fill="rgba(214, 168, 79, 0.14)"
          stroke="#D6A84F"
          strokeWidth="1.6"
        />
        {dimensions.map((d, i) => {
          const pt = getCoord(i, d.industry);
          return (
            <circle
              key={`ind-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill="#D6A84F"
            />
          );
        })}

        {/* Student Polygon (Emerald) */}
        <polygon
          points={studentPoints}
          fill="var(--fac-emerald-tint)"
          stroke="var(--fac-emerald-bright)"
          strokeWidth="2"
        />
        {dimensions.map((d, i) => {
          const pt = getCoord(i, d.student || 0);
          return (
            <circle
              key={`stu-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill="var(--fac-emerald-bright)"
              stroke="var(--fac-bg-card)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--fac-emerald-bright)', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: 'var(--fac-text-primary)', fontWeight: 600 }}>Student Proficiency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D6A84F', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: '#D6A84F', fontWeight: 600 }}>Industry Demand</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Circular Radial Progress Meter
──────────────────────────────────────────────────────────── */
function CircularProgress({ percentage, size = 48, strokeWidth = 4, isGold = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const strokeColor = isGold ? '#D6A84F' : 'var(--fac-emerald-bright)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--fac-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11.5px', fontWeight: 800, color: 'var(--fac-text-primary)',
      }}>
        {percentage}%
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   MAIN FACULTY DASHBOARD COMPONENT
══════════════════════════════════════════════════════════════ */
export default function CollegeDashboardView() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/faculty/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to retrieve institutional analytics.');
      setData(resData);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
      setErrorMsg(err.message || 'Unable to connect to database server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchDashboardData(); }, [token]);

  /* ── Skeleton Loading ── */
  if (loading) {
    return (
      <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="fac-theme-skeleton" style={{ height: '170px', borderRadius: '14px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="fac-theme-card" style={{ padding: '16px', minHeight: '96px' }}>
              <div className="fac-theme-skeleton" style={{ height: '10px', width: '60%', marginBottom: '10px' }} />
              <div className="fac-theme-skeleton" style={{ height: '24px', width: '40%', marginBottom: '8px' }} />
              <div className="fac-theme-skeleton" style={{ height: '8px', width: '80%' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--fac-text-secondary)' }}>
          <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Loading Institutional Command Center…</span>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (errorMsg) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="fac-theme-card" style={{ maxWidth: '460px', width: '100%', padding: '36px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(224, 82, 82, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--fac-error)' }}>
            <AlertCircle style={{ width: '22px', height: '22px' }} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fac-text-primary)', marginBottom: '6px' }}>Unable to Load Dashboard</h3>
          <p style={{ fontSize: '12px', color: 'var(--fac-error)', marginBottom: '20px' }}>{errorMsg}</p>
          <button onClick={() => fetchDashboardData(true)} className="fac-btn-emerald" style={{ margin: '0 auto' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  /* ── Process Data from API or fallbacks ── */
  const stats = data?.stats || {};
  const topSkills = data?.topSkills || [];
  const recentActivity = data?.recentActivity || [];
  const placementBreakdown = data?.placementBreakdown || { placed: 0, activeApplicants: 0, notApplied: 0 };

  const totalStudents  = stats.totalStudents     || 1248;
  const profilesBuilt  = stats.completedProfiles || 956;
  const skillInstances = stats.totalSkillInstances || stats.uniqueSkillsCount || 2842;
  const activeInterns  = stats.activeInternships  || 24;
  const placedCount    = stats.placementCount     || 18;
  const totalOpps      = stats.totalOpportunities || 57;
  const placementRate  = stats.placementRate      || 64.3;

  /* ── 8 Competency Dimensions ── */
  const competencyDimensions = [
    { name: 'Technical Skills',      shortName: 'Technical Skills',     student: 72, industry: 86, gap: -14 },
    { name: 'Domain Knowledge',      shortName: 'Domain Knowledge',     student: 68, industry: 82, gap: -14 },
    { name: 'Cognitive Ability',     shortName: 'Cognitive Ability',    student: 62, industry: 76, gap: -14 },
    { name: 'Communication',         shortName: 'Communication',        student: 71, industry: 80, gap: -9  },
    { name: 'Problem Solving',       shortName: 'Problem Solving',      student: 64, industry: 78, gap: -14 },
    { name: 'Leadership',            shortName: 'Leadership',           student: 58, industry: 70, gap: -12 },
    { name: 'Practical Skills',      shortName: 'Practical Skills',     student: 55, industry: 72, gap: -17 },
    { name: 'Research & Innovation', shortName: 'Research & Innovation',student: 48, industry: 65, gap: -17 },
  ];

  /* ── Placement Funnel Pipeline ── */
  const funnelStages = [
    { label: 'Registered',  count: 1248, pct: 100,  widthPct: 100, color: 'var(--fac-emerald-bright)' },
    { label: 'Assessed',    count: 956,  pct: 76.8, widthPct: 84,  color: 'var(--fac-emerald)' },
    { label: 'Shortlisted', count: 432,  pct: 34.6, widthPct: 68,  color: '#84CC16' },
    { label: 'Interviewed', count: 214,  pct: 17.1, widthPct: 52,  color: '#E0B75F' },
    { label: 'Placed',      count: 142,  pct: 11.4, widthPct: 36,  color: 'var(--fac-gold)' },
  ];

  /* ── KPI Cards ── */
  const kpiCards = [
    {
      label: 'TOTAL STUDENTS',
      value: '1,248',
      trend: '↑ 12.5% vs last month',
      trendColor: 'var(--fac-emerald-bright)',
      iconColor: 'var(--fac-emerald-bright)',
      iconBg: 'var(--fac-emerald-tint)',
      Icon: Users,
    },
    {
      label: 'SKILL PROFILES BUILT',
      value: '956',
      trend: '76.8% completion',
      trendColor: 'var(--fac-emerald-bright)',
      iconColor: 'var(--fac-gold)',
      iconBg: 'var(--fac-gold-tint)',
      Icon: UserCheck,
    },
    {
      label: 'VERIFIED SKILLS',
      value: '2,842',
      trend: 'Across all students',
      trendColor: 'var(--fac-emerald-bright)',
      iconColor: 'var(--fac-emerald-bright)',
      iconBg: 'var(--fac-emerald-tint)',
      Icon: Award,
    },
    {
      label: 'INTERNSHIPS LIVE',
      value: '24',
      trend: '↑ 8 this month',
      trendColor: 'var(--fac-emerald-bright)',
      iconColor: 'var(--fac-gold)',
      iconBg: 'var(--fac-gold-tint)',
      Icon: Briefcase,
    },
    {
      label: 'PLACEMENTS',
      value: '18',
      trend: '64.3% placement rate',
      trendColor: 'var(--fac-emerald-bright)',
      iconColor: 'var(--fac-emerald-bright)',
      iconBg: 'var(--fac-emerald-tint)',
      Icon: GraduationCap,
    },
    {
      label: 'ACTIVE OPPORTUNITIES',
      value: '57',
      trend: 'From 32 companies',
      trendColor: 'var(--fac-gold)',
      iconColor: 'var(--fac-gold)',
      iconBg: 'var(--fac-gold-tint)',
      Icon: Target,
    },
  ];

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ════════════════════════════════════════════
          1. HERO: ACADEMIC COMMAND CENTER
          ════════════════════════════════════════════ */}
      <div className="fac-theme-hero" style={{ padding: '28px 32px', position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center' }}>
        <UniversityIllustration isLight={isLight} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '620px' }}>
          {/* Label */}
          <div style={{
            fontSize: '10px', fontWeight: 800,
            color: isLight ? '#D6A84F' : '#19B874',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px'
          }}>
            ACADEMIC COMMAND CENTER
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--fac-hero-title)', letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.2 }}>
            Institutional Intelligence Hub
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '12.5px', color: 'var(--fac-hero-desc)', margin: '0 0 20px', lineHeight: 1.55, maxWidth: '500px' }}>
            Real-time insights into student competencies, skill readiness, and placement outcomes for data-driven academic excellence.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/faculty/skill-gap" className={isLight ? "fac-btn-gold" : "fac-btn-emerald"} style={{ textDecoration: 'none' }}>
              <span>Generate Insight Report</span>
              <TrendingUp style={{ width: '13px', height: '13px' }} />
            </Link>
            <Link to="/faculty/skill-gap" className="fac-btn-dark" style={{ textDecoration: 'none', background: isLight ? 'rgba(255,255,255,0.15)' : 'var(--fac-bg-surface)', border: isLight ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--fac-border)', color: '#FFFFFF !important' }}>
              <span>Skill Gap Analysis</span>
              <Target style={{ width: '13px', height: '13px', color: '#D6A84F' }} />
            </Link>
          </div>
        </div>

        {/* Institution Score & Mini Sparkline */}
        <div style={{
          position: 'absolute', right: '360px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px',
        }} className="hidden xl:flex">
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--fac-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Institution Score
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.02em' }}>
              78.4 <span style={{ fontSize: '14px', color: isLight ? 'rgba(255,255,255,0.6)' : 'var(--fac-text-muted)', fontWeight: 600 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '11px', color: isLight ? '#D6A84F' : '#19B874', fontWeight: 700, marginTop: '4px' }}>
              ↑ 8.2 vs last month
            </div>
          </div>

          {/* Sparkline SVG */}
          <svg width="120" height="42" viewBox="0 0 120 42" fill="none">
            <polyline
              points="10,34 30,28 50,30 70,16 90,20 110,8"
              stroke={isLight ? "#D6A84F" : "#19B874"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="110" cy="8" r="3.5" fill={isLight ? "#D6A84F" : "#19B874"} />
          </svg>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          2. KPI CARDS ROW (6 Cards)
          ════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
        {kpiCards.map((card, i) => {
          const CardIcon = card.Icon;
          return (
            <div key={i} className="fac-theme-kpi">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: card.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CardIcon style={{ width: '14px', height: '14px', color: card.iconColor }} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--fac-text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {card.label}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--fac-text-primary)', lineHeight: 1.1, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '10.5px', color: card.trendColor, fontWeight: 600 }}>
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════
          3. MIDDLE SECTION: Competency + Placement Pipeline
          ════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', alignItems: 'start' }}>

        {/* ── Student Competency & Industry Demand ── */}
        <div className="fac-theme-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>
                Student Competency & Industry Demand
              </span>
              <Info style={{ width: '13px', height: '13px', color: 'var(--fac-text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '20px', alignItems: 'center' }}>
            <CompetencyRadarChart dimensions={competencyDimensions} size={250} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 44px', gap: '8px', fontSize: '9.5px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px', borderBottom: '1px solid var(--fac-border)' }}>
                <span>Competency</span>
                <span>Student Avg.</span>
                <span>Industry Demand</span>
                <span style={{ textAlign: 'right' }}>Gap</span>
              </div>

              {competencyDimensions.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 44px', gap: '8px', alignItems: 'center', fontSize: '11.5px' }}>
                  <span style={{ color: 'var(--fac-text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>

                  {/* Student Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--fac-text-secondary)', minWidth: '24px' }}>{item.student}%</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.student}%`, background: 'var(--fac-emerald-bright)', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  {/* Industry Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: '#D6A84F', minWidth: '24px' }}>{item.industry}%</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.industry}%`, background: '#D6A84F', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  {/* Gap Indicator */}
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--fac-error)', textAlign: 'right' }}>
                    {item.gap}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Placement Pipeline ── */}
        <div className="fac-theme-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>
              Placement Pipeline
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '6px',
              background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)',
              fontSize: '10.5px', color: 'var(--fac-text-secondary)', fontWeight: 600,
            }}>
              <span>This Academic Year</span>
              <ChevronDown style={{ width: '10px', height: '10px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {funnelStages.map((stage, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
                  <User style={{ width: '13px', height: '13px', color: 'var(--fac-text-muted)' }} />
                  <span style={{ fontSize: '11.5px', color: 'var(--fac-text-primary)', fontWeight: 600 }}>{stage.label}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    height: '14px', width: `${stage.widthPct}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, rgba(214, 168, 79, 0.4) 100%)`,
                    borderRadius: '4px',
                    opacity: 0.85,
                  }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80px', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>{stage.count.toLocaleString()}</span>
                  <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)' }}>({stage.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          4. BOTTOM SECTION: Department Overview + Recent Activity
          ════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', alignItems: 'start' }}>

        {/* ── Department Overview ── */}
        <div className="fac-theme-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Link to="/faculty/students" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--fac-text-primary)' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800 }}>Department Overview</span>
              <ChevronRight style={{ width: '13px', height: '13px', color: 'var(--fac-text-muted)' }} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {[
              { name: 'Computer Science', students: 386, pct: 82, trend: '↑ 10%', isGold: false },
              { name: 'Information Tech.', students: 298, pct: 76, trend: '↑ 8%',  isGold: false },
              { name: 'Electronics',      students: 244, pct: 71, trend: '↑ 6%',  isGold: false },
              { name: 'Mechanical',       students: 198, pct: 68, trend: '↑ 5%',  isGold: true },
              { name: 'Civil Engineering',students: 122, pct: 64, trend: '↑ 4%',  isGold: true },
            ].map((dept, i) => (
              <div key={i} style={{
                background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', borderRadius: '10px',
                padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fac-text-primary)', height: '26px', lineHeight: 1.2 }}>
                  {dept.name}
                </span>

                <CircularProgress percentage={dept.pct} isGold={dept.isGold} size={46} strokeWidth={3.5} />

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>
                  {dept.students} <span style={{ fontSize: '9px', color: 'var(--fac-text-muted)', fontWeight: 500 }}>Students</span>
                </div>
                <div style={{ fontSize: '9.5px', color: 'var(--fac-emerald-bright)', fontWeight: 700 }}>
                  {dept.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="fac-theme-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>
              Recent Activity
            </span>
            <Link to="/faculty/notifications" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: 'var(--fac-text-muted)', textDecoration: 'none', fontWeight: 600 }}>
              <span>View All</span>
              <ChevronRight style={{ width: '11px', height: '11px' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: Briefcase, color: '#D6A84F', bg: 'var(--fac-gold-tint)', text: 'New internship posted by TCS', time: '2h ago' },
              { icon: FileText,  color: 'var(--fac-emerald-bright)', bg: 'var(--fac-emerald-tint)', text: 'Skill assessment completed by 48 students', time: '5h ago' },
              { icon: Building2, color: 'var(--fac-emerald-bright)', bg: 'var(--fac-emerald-tint)', text: 'Infosys placement drive scheduled', time: '1d ago' },
              { icon: GraduationCap, color: 'var(--fac-text-secondary)', bg: 'var(--fac-bg-surface)', text: 'New FDP opportunity from Wipro', time: '2d ago' },
              { icon: Megaphone, color: '#D6A84F', bg: 'var(--fac-gold-tint)', text: 'Industry workshop on Data Analytics announced', time: '2d ago' },
            ].map((act, i) => {
              const ActIcon = act.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: act.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <ActIcon style={{ width: '12px', height: '12px', color: act.color }} />
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--fac-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {act.text}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', flexShrink: 0 }}>
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
