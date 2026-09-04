import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Building2, Search, MapPin, Clock, DollarSign,
  Users, AlertCircle, RefreshCw, ArrowLeft, ExternalLink,
  Eye, X, Calendar, GraduationCap, CheckCircle2, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

function TypeChip({ type }) {
  if (type === 'internship') return <span className="fac-badge-emerald">Internship</span>;
  if (type === 'job')        return <span className="fac-badge-gold">Full-time</span>;
  return <span className="fac-badge-dark">{type}</span>;
}

export default function FacultyOpportunitiesPage() {
  const { token } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [skillFilter, setSkillFilter] = useState('');

  const [selectedOpp, setSelectedOpp] = useState(null);

  const fetchOpportunities = async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all')   params.append('type',   typeFilter);
      if (searchQuery.trim())     params.append('search', searchQuery.trim());
      if (skillFilter.trim())     params.append('skill',  skillFilter.trim());

      const res = await fetch(`/api/faculty/opportunities?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to retrieve opportunities.');
      setOpportunities(resData.opportunities || []);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to opportunities service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchOpportunities(); }, [token, typeFilter]);
  useEffect(() => {
    const t = setTimeout(() => { if (token) fetchOpportunities(); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, skillFilter]);

  const handleReset = () => { setSearchQuery(''); setTypeFilter('all'); setSkillFilter(''); };

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-emerald-bright)', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fac-gold-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase style={{ width: '18px', height: '18px', color: 'var(--fac-gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Campus Opportunities & Corporate Drives</h1>
              <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0 }}>Monitor active corporate hiring drives, internships, and required student competencies</p>
            </div>
          </div>
        </div>
        <button onClick={() => fetchOpportunities(true)} disabled={refreshing} className="fac-btn-dark" style={{ flexShrink: 0, marginTop: '20px' }}>
          <RefreshCw style={{ width: '12px', height: '12px', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
          Refresh
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(224, 82, 82, 0.1)', border: '1px solid rgba(224, 82, 82, 0.25)', color: 'var(--fac-error)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="fac-theme-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--fac-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by company, role title, location…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="fac-theme-input"
              style={{ paddingLeft: '28px', height: '34px', fontSize: '12px' }}
            />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="fac-theme-select" style={{ height: '34px', fontSize: '12px' }}>
            <option value="all">All Opportunity Types</option>
            <option value="job">Full-time Job Drives</option>
            <option value="internship">Internship Programs</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Filter by skill…"
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="fac-theme-input"
              style={{ flex: 1, height: '34px', fontSize: '12px' }}
            />
            {(searchQuery || typeFilter !== 'all' || skillFilter) && (
              <button onClick={handleReset} className="fac-btn-dark" style={{ height: '34px', padding: '0 10px', fontSize: '11px', whiteSpace: 'nowrap' }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--fac-text-secondary)' }}>
          <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Loading active campus drives…</span>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="fac-theme-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--fac-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--fac-text-muted)' }}>
            <Briefcase style={{ width: '20px', height: '20px' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fac-text-primary)', margin: '0 0 6px' }}>No opportunities found</p>
          <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '0 0 16px' }}>Adjust your search query or clear active filters.</p>
          <button onClick={handleReset} className="fac-btn-emerald" style={{ margin: '0 auto' }}>Show All Opportunities</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {opportunities.map(opp => (
            <div
              key={opp._id}
              className="fac-theme-card-interactive"
              style={{ padding: '18px 20px' }}
              onClick={() => setSelectedOpp(opp)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {opp.companyLogo ? <img src={opp.companyLogo} alt={opp.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 style={{ width: '16px', height: '16px', color: 'var(--fac-emerald-bright)' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fac-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.title}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--fac-text-secondary)', margin: 0 }}>{opp.companyName}</p>
                  </div>
                </div>
                <TypeChip type={opp.type} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '11px', color: 'var(--fac-text-muted)' }}>
                {opp.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin style={{ width: '11px', height: '11px' }} /> {opp.location}
                  </span>
                )}
                {opp.stipend && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--fac-emerald-bright)', fontWeight: 600 }}>
                    <DollarSign style={{ width: '11px', height: '11px' }} /> {opp.stipend}
                  </span>
                )}
                {opp.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '11px', height: '11px' }} /> {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {opp.applicantsCount != null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '11px', height: '11px' }} /> {opp.applicantsCount} applicants
                  </span>
                )}
              </div>

              {(opp.skillsRequired || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {opp.skillsRequired.slice(0, 4).map((sk, i) => (
                    <span key={i} style={{ fontSize: '9.5px', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', color: 'var(--fac-text-secondary)' }}>{sk}</span>
                  ))}
                  {opp.skillsRequired.length > 4 && <span style={{ fontSize: '9.5px', color: 'var(--fac-text-muted)' }}>+{opp.skillsRequired.length - 4}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Modal */}
      {selectedOpp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="fac-theme-card" style={{ maxWidth: '600px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {selectedOpp.companyLogo ? <img src={selectedOpp.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>{selectedOpp.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '2px 0 0' }}>{selectedOpp.companyName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOpp(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--fac-border)', background: 'var(--fac-bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fac-text-secondary)' }}>
                <X style={{ width: '13px', height: '13px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              <TypeChip type={selectedOpp.type} />
              {selectedOpp.location && <span className="fac-badge-dark"><MapPin style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} /> {selectedOpp.location}</span>}
              {selectedOpp.stipend && <span className="fac-badge-emerald">{selectedOpp.stipend}</span>}
            </div>

            {selectedOpp.description && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Description</div>
                <p style={{ fontSize: '12.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.6, margin: 0 }}>{selectedOpp.description}</p>
              </div>
            )}

            {(selectedOpp.skillsRequired || []).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Required Competencies</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {selectedOpp.skillsRequired.map((sk, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '5px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', color: 'var(--fac-text-primary)', fontFamily: 'monospace' }}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--fac-border)' }}>
              <button onClick={() => setSelectedOpp(null)} className="fac-btn-dark">Close</button>
              {selectedOpp.externalLink && (
                <a href={selectedOpp.externalLink} target="_blank" rel="noreferrer" className="fac-btn-emerald" style={{ textDecoration: 'none' }}>
                  <ExternalLink style={{ width: '12px', height: '12px' }} /> View Full Post
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
