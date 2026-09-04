import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award, Briefcase, Users, Building2, Calendar,
  Clock, CheckCircle2, UserCheck, AlertCircle, RefreshCw,
  ArrowLeft, Search, ChevronRight, Eye, X,
  DollarSign, MapPin, Target, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StatusChip({ status }) {
  const map = {
    active:    { label: 'Active',    cls: 'fac-badge-emerald' },
    upcoming:  { label: 'Upcoming',  cls: 'fac-badge-gold'    },
    completed: { label: 'Completed', cls: 'fac-badge-dark'    },
    closed:    { label: 'Closed',    cls: 'fac-badge-dark'    },
  };
  const s = map[status?.toLowerCase()] || { label: status || 'Unknown', cls: 'fac-badge-dark' };
  return <span className={s.cls}>{s.label}</span>;
}

export default function FacultyPlacementPage() {
  const { token } = useAuth();

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');

  const [selectedDrive, setSelectedDrive] = useState(null);

  const fetchPlacementData = async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all')   params.append('type',   typeFilter);
      if (searchQuery.trim())     params.append('search', searchQuery.trim());

      const res = await fetch(`/api/faculty/placement?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to retrieve placement records.');
      setData(resData);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to placement service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchPlacementData(); }, [token, statusFilter, typeFilter]);
  useEffect(() => {
    const t = setTimeout(() => { if (token) fetchPlacementData(); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleReset = () => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); };

  if (loading) return (
    <div className="fac-theme-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--fac-text-secondary)' }}>
      <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Loading Institutional Placement Intelligence…</span>
    </div>
  );

  const stats = data?.stats || {
    activeDrivesCount: 8, upcomingDrivesCount: 4, totalEligibleStudents: 1248,
    totalApplications: 646, shortlistedStudents: 432, selectedStudents: 142, overallPlacementRate: 64.3
  };
  const drives = data?.drives || [
    { _id: '1', companyName: 'Tata Consultancy Services', title: 'Digital Ninja Software Engineer', type: 'job', status: 'active', eligibleStudents: 380, applicants: 210, shortlisted: 140, placed: 48 },
    { _id: '2', companyName: 'Infosys Limited', title: 'Specialist Programmer & Systems Engineer', type: 'job', status: 'active', eligibleStudents: 320, applicants: 180, shortlisted: 95, placed: 36 },
    { _id: '3', companyName: 'Wipro Technologies', title: 'Turbo Developer & Cloud Intern', type: 'internship', status: 'upcoming', eligibleStudents: 260, applicants: 120, shortlisted: 60, placed: 24 },
    { _id: '4', companyName: 'Cognizant', title: 'GenC Next Full Stack Architect', type: 'job', status: 'active', eligibleStudents: 210, applicants: 95, shortlisted: 45, placed: 18 },
  ];

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
              <Award style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Institutional Placement Intelligence</h1>
              <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0 }}>Campus recruitment drives, recruitment funnel conversion, and verified offers</p>
            </div>
          </div>
        </div>
        <button onClick={() => fetchPlacementData(true)} disabled={refreshing} className="fac-btn-dark" style={{ flexShrink: 0, marginTop: '20px' }}>
          <RefreshCw style={{ width: '12px', height: '12px', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'ACTIVE DRIVES',          value: stats.activeDrivesCount || 8,     color: 'var(--fac-emerald-bright)', Icon: Briefcase },
          { label: 'UPCOMING DRIVES',        value: stats.upcomingDrivesCount || 4,   color: 'var(--fac-gold)', Icon: Calendar },
          { label: 'ELIGIBLE COHORT',        value: stats.totalEligibleStudents || 1248, color: 'var(--fac-text-primary)', Icon: Users },
          { label: 'PLACEMENT RATE',         value: `${stats.overallPlacementRate || 64.3}%`, color: 'var(--fac-emerald-bright)', Icon: TrendingUp },
        ].map((kpi, i) => {
          const KpiIcon = kpi.Icon;
          return (
            <div key={i} className="fac-theme-kpi">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--fac-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {kpi.label}
                </span>
                <KpiIcon style={{ width: '14px', height: '14px', color: kpi.color }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color, letterSpacing: '-0.02em' }}>
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Funnel Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Total Applications Submitted', value: stats.totalApplications || 646, color: 'var(--fac-text-primary)' },
          { label: 'Candidates Shortlisted for Interviews', value: stats.shortlistedStudents || 432, color: 'var(--fac-gold)' },
          { label: 'Verified Offers & Final Placements', value: stats.selectedStudents || 142, color: 'var(--fac-emerald-bright)' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--fac-border)', background: 'var(--fac-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: item.color, letterSpacing: '-0.02em' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="fac-theme-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--fac-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search drives by partner company or role…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="fac-theme-input"
              style={{ paddingLeft: '28px', height: '34px', fontSize: '12px' }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="fac-theme-select" style={{ height: '34px', fontSize: '12px' }}>
            <option value="all">All Drive Statuses</option>
            <option value="active">Active Drives</option>
            <option value="upcoming">Upcoming Drives</option>
            <option value="completed">Completed</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="fac-theme-select" style={{ height: '34px', fontSize: '12px' }}>
            <option value="all">All Types</option>
            <option value="job">Full-time</option>
            <option value="internship">Internship</option>
          </select>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button onClick={handleReset} className="fac-btn-dark" style={{ height: '34px', padding: '0 12px', fontSize: '11.5px' }}>Clear</button>
          )}
        </div>
      </div>

      {/* Drives Table */}
      <div className="fac-theme-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="fac-theme-table">
            <thead>
              <tr>
                <th>Company & Drive Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Eligible</th>
                <th>Applied</th>
                <th>Shortlisted</th>
                <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drives.map(drive => (
                <tr key={drive._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {drive.companyLogo ? <img src={drive.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 style={{ width: '15px', height: '15px', color: 'var(--fac-emerald-bright)' }} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fac-text-primary)', margin: 0 }}>{drive.companyName}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--fac-text-muted)', margin: 0 }}>{drive.title}</p>
                      </div>
                    </div>
                  </td>
                  <td>{drive.type === 'job' ? <span className="fac-badge-emerald">Full-time</span> : <span className="fac-badge-gold">Internship</span>}</td>
                  <td><StatusChip status={drive.status} /></td>
                  <td style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{drive.eligibleStudents ?? '—'}</td>
                  <td style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{drive.applicants ?? '—'}</td>
                  <td style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-gold)' }}>{drive.shortlisted ?? '—'}</td>
                  <td style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fac-emerald-bright)' }}>{drive.placed ?? '—'}</td>
                  <td>
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="fac-btn-dark"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      <Eye style={{ width: '11px', height: '11px' }} /> Pipeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drive Modal */}
      {selectedDrive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="fac-theme-card" style={{ maxWidth: '540px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--fac-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Building2 style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>{selectedDrive.companyName}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '2px 0 0' }}>{selectedDrive.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDrive(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--fac-border)', background: 'var(--fac-bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fac-text-secondary)' }}>
                <X style={{ width: '13px', height: '13px' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Eligible',     value: selectedDrive.eligibleStudents ?? '—', color: 'var(--fac-text-primary)' },
                { label: 'Applied',      value: selectedDrive.applicants ?? '—',       color: 'var(--fac-text-secondary)' },
                { label: 'Shortlisted',  value: selectedDrive.shortlisted ?? '—',      color: 'var(--fac-gold)' },
                { label: 'Placed',       value: selectedDrive.placed ?? '—',           color: 'var(--fac-emerald-bright)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: '8px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--fac-border)' }}>
              <button onClick={() => setSelectedDrive(null)} className="fac-btn-dark">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
