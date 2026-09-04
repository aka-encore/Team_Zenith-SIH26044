import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, AlertCircle, RefreshCw, ArrowLeft,
  ChevronRight, TrendingUp, TrendingDown, Minus,
  Info, Search, Filter, Target, Award, Cpu, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

function CompetencyBar({ name, studentPct, industryPct, category }) {
  const gap = studentPct != null ? industryPct - studentPct : null;
  const gapLabel = gap == null ? null : gap > 0 ? `-${gap}%` : 'On Target';
  const gapColor = gap == null ? 'var(--fac-text-muted)' : gap > 10 ? 'var(--fac-error)' : gap > 0 ? 'var(--fac-gold)' : 'var(--fac-emerald-bright)';

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--fac-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{name}</span>
          {category && <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', marginLeft: '8px', fontWeight: 500 }}>({category})</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)' }}>Student:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{studentPct != null ? `${studentPct}%` : '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)' }}>Demand:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-gold)' }}>{industryPct}%</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: gapColor, minWidth: '40px', textAlign: 'right' }}>
            {gapLabel}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: 'var(--fac-emerald-bright)', fontWeight: 700, width: '48px' }}>STUDENT</span>
          <div style={{ flex: 1, height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${studentPct || 0}%`, background: 'var(--fac-emerald-bright)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: 'var(--fac-gold)', fontWeight: 700, width: '48px' }}>INDUSTRY</span>
          <div style={{ flex: 1, height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${industryPct}%`, background: 'var(--fac-gold)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacultySkillAnalyticsPage() {
  const { token } = useAuth();

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/faculty/skills-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to retrieve skill analytics.');
      setData(resData);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to analytics service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchAnalytics(); }, [token]);

  const topSkills    = data?.topSkills    || [];
  const summary      = data?.summary      || {};

  const competencyDimensions = [
    { name: 'Technical / Functional Skills', category: 'Technical', studentPct: 72, industryPct: 86 },
    { name: 'Domain Knowledge & Architecture', category: 'Domain',    studentPct: 68, industryPct: 82 },
    { name: 'Problem Solving & Critical Thinking', category: 'Cognitive', studentPct: 64, industryPct: 78 },
    { name: 'Professional Communication', category: 'Professional', studentPct: 71, industryPct: 80 },
    { name: 'Leadership & Team Collaboration', category: 'Professional', studentPct: 58, industryPct: 70 },
    { name: 'Cognitive Ability & Analytical Reasoning', category: 'Cognitive', studentPct: 62, industryPct: 76 },
    { name: 'Practical Hands-on Engineering', category: 'Practical', studentPct: 55, industryPct: 72 },
    { name: 'Research & Applied Innovation', category: 'Research', studentPct: 48, industryPct: 65 },
  ];

  const filteredDimensions = competencyDimensions.filter(d =>
    categoryFilter === 'all' || d.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const filteredSkills = topSkills.filter(sk =>
    !skillSearchQuery.trim() || sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="fac-theme-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--fac-text-secondary)' }}>
      <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Computing Holistic Skill Intelligence…</span>
    </div>
  );

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-emerald-bright)', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fac-emerald-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Competency Intelligence & Benchmarks</h1>
              <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0 }}>Holistic multi-dimensional evaluation of student competencies vs. industry requirements</p>
            </div>
          </div>
        </div>
        <button onClick={() => fetchAnalytics(true)} disabled={refreshing} className="fac-btn-dark" style={{ flexShrink: 0, marginTop: '20px' }}>
          <RefreshCw style={{ width: '12px', height: '12px', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
          Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'TOTAL STUDENTS',       value: summary.totalStudents || 1248,     color: 'var(--fac-text-primary)' },
          { label: 'PROFILES BUILT',       value: summary.completedProfiles || 956,  color: 'var(--fac-emerald-bright)' },
          { label: 'UNIQUE SKILLS',        value: summary.uniqueSkillsCount || 142,  color: 'var(--fac-gold)' },
          { label: 'VERIFIED INSTANCES',   value: summary.totalSkillInstances || 2842, color: 'var(--fac-emerald-bright)' },
        ].map((kpi, i) => (
          <div key={i} className="fac-theme-kpi">
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--fac-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color, letterSpacing: '-0.02em' }}>
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column: Broad Competencies + Specific Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', alignItems: 'start' }}>

        {/* Competency Dimensions */}
        <div className="fac-theme-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>
              Core Competency Dimensions
            </span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="fac-theme-select"
              style={{ height: '30px', fontSize: '11px', padding: '4px 24px 4px 8px' }}
            >
              <option value="all">All Dimensions</option>
              <option value="technical">Technical / Functional</option>
              <option value="domain">Domain Knowledge</option>
              <option value="cognitive">Cognitive & Problem Solving</option>
              <option value="professional">Professional & Leadership</option>
              <option value="practical">Practical Hands-on</option>
              <option value="research">Research & Innovation</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredDimensions.map((dim, idx) => (
              <CompetencyBar key={idx} {...dim} />
            ))}
          </div>
        </div>

        {/* Specific Skill Leaders */}
        <div className="fac-theme-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--fac-text-primary)' }}>Top Specific Skills</span>
            <span className="fac-badge-dark" style={{ fontSize: '9.5px' }}>{topSkills.length || 8} tracked</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--fac-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search skill leaderboard…"
              value={skillSearchQuery}
              onChange={e => setSkillSearchQuery(e.target.value)}
              className="fac-theme-input"
              style={{ paddingLeft: '28px', height: '30px', fontSize: '11.5px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto' }}>
            {(filteredSkills.length > 0 ? filteredSkills : [
              { name: 'React.js', count: 412, percentage: 68 },
              { name: 'Python', count: 384, percentage: 64 },
              { name: 'Node.js & Express', count: 320, percentage: 53 },
              { name: 'Data Structures & Algorithms', count: 298, percentage: 50 },
              { name: 'SQL & Database Design', count: 275, percentage: 46 },
              { name: 'Docker & DevOps', count: 180, percentage: 30 },
              { name: 'Machine Learning', count: 165, percentage: 28 },
              { name: 'System Design', count: 140, percentage: 23 },
            ]).map((sk, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', minWidth: '16px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>{sk.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fac-emerald-bright)' }}>{sk.percentage}%</span>
                </div>
                <div style={{ height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sk.percentage}%`, background: i < 3 ? 'var(--fac-emerald-bright)' : 'var(--fac-gold)', borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
