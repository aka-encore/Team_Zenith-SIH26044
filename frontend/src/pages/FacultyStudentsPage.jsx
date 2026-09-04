import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Search, RefreshCw, AlertCircle, ArrowLeft,
  Eye, X, FileText, ExternalLink, Filter, ChevronDown,
  UserCheck, GraduationCap, Award, Briefcase, BarChart3,
  Target, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

function PlacementChip({ status }) {
  const map = {
    placed:           { label: 'Placed',       cls: 'fac-badge-emerald' },
    active_applicant: { label: 'Active',        cls: 'fac-badge-gold'    },
    not_applied:      { label: 'Not Applied',   cls: 'fac-badge-dark'    },
  };
  const s = map[status] || { label: status?.replace('_', ' ') || 'Unknown', cls: 'fac-badge-dark' };
  return <span className={s.cls}>{s.label}</span>;
}

function ProfileBar({ pct }) {
  const color = pct >= 80 ? 'var(--fac-emerald-bright)' : pct >= 50 ? 'var(--fac-gold)' : 'var(--fac-text-muted)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <div style={{ flex: 1, height: '4px', background: 'var(--fac-track-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '10.5px', fontWeight: 700, color, minWidth: '28px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function FacultyStudentsPage() {
  const { token } = useAuth();

  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  const [searchQuery,  setSearchQuery]  = useState('');
  const [deptFilter,   setDeptFilter]   = useState('all');
  const [yearFilter,   setYearFilter]   = useState('all');
  const [skillFilter,  setSkillFilter]  = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim())   params.append('search',     searchQuery.trim());
      if (deptFilter !== 'all') params.append('department', deptFilter);
      if (yearFilter !== 'all') params.append('year',       yearFilter);
      if (skillFilter.trim())   params.append('skill',      skillFilter.trim());

      const res = await fetch(`/api/faculty/students?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to retrieve students roster.');
      setStudents(data.students || []);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to student directory service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchStudents(); }, [token, deptFilter, yearFilter, skillFilter]);
  useEffect(() => {
    const t = setTimeout(() => { if (token) fetchStudents(); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredStudents = students.filter(st =>
    statusFilter === 'all' || st.placementStatus === statusFilter
  );

  const handleReset = () => {
    setSearchQuery(''); setDeptFilter('all'); setYearFilter('all');
    setSkillFilter(''); setStatusFilter('all');
  };

  const hasFilters = searchQuery || deptFilter !== 'all' || yearFilter !== 'all' || skillFilter || statusFilter !== 'all';

  return (
    <div className="fac-theme-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-emerald-bright)', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--fac-emerald-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '18px', height: '18px', color: 'var(--fac-emerald-bright)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Student Talent Directory</h1>
              <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: 0 }}>Academic records, competency profiles, and placement tracking</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchStudents(true)}
          disabled={refreshing}
          className="fac-btn-dark"
          style={{ flexShrink: 0, marginTop: '20px' }}
        >
          <RefreshCw style={{ width: '12px', height: '12px', ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
          Refresh
        </button>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(224, 82, 82, 0.1)', border: '1px solid rgba(224, 82, 82, 0.25)',
          color: 'var(--fac-error)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="fac-theme-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px 180px', gap: '10px', marginBottom: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--fac-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by student name, email, or skill…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="fac-theme-input"
              style={{ paddingLeft: '32px', height: '36px' }}
            />
          </div>
          {/* Department */}
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="fac-theme-select" style={{ height: '36px' }}>
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics & Communication</option>
            <option value="Data Science">AI & Data Science</option>
            <option value="Mechanical">Mechanical Engineering</option>
          </select>
          {/* Year */}
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="fac-theme-select" style={{ height: '36px' }}>
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year (Final)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--fac-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--fac-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Filter by skill (e.g. React, Python)…"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
                className="fac-theme-input"
                style={{ paddingLeft: '26px', height: '32px', fontSize: '11.5px', width: '220px' }}
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="fac-theme-select" style={{ height: '32px', fontSize: '11.5px' }}>
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="active_applicant">Active Applicant</option>
              <option value="not_applied">Not Applied</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {hasFilters && (
              <button onClick={handleReset} className="fac-btn-dark" style={{ height: '32px', fontSize: '11.5px', padding: '0 12px' }}>
                Clear Filters
              </button>
            )}
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-text-muted)' }}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '10px', color: 'var(--fac-text-secondary)' }}>
          <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite', color: 'var(--fac-emerald-bright)' }} />
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Loading student directory…</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="fac-theme-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--fac-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--fac-text-muted)' }}>
            <Users style={{ width: '20px', height: '20px' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fac-text-primary)', margin: '0 0 6px' }}>No students found</p>
          <p style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', margin: '0 0 16px' }}>Adjust your search query or reset active filters.</p>
          <button onClick={handleReset} className="fac-btn-emerald" style={{ margin: '0 auto' }}>Show All Students</button>
        </div>
      ) : (
        <div className="fac-theme-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="fac-theme-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>CGPA</th>
                  <th>Profile</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, color: '#FFFFFF', flexShrink: 0, overflow: 'hidden',
                        }}>
                          {student.avatarUrl ? <img src={student.avatarUrl} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.name?.charAt(0) || 'S'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fac-text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{student.name}</p>
                          <p style={{ fontSize: '10px', color: 'var(--fac-text-muted)', margin: 0, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--fac-text-secondary)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.department || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--fac-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Year {student.year || '?'}</td>
                    <td>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 700,
                        color: (student.cgpa >= 8) ? 'var(--fac-emerald-bright)' : (student.cgpa >= 6) ? 'var(--fac-gold)' : 'var(--fac-error)',
                      }}>
                        {student.cgpa || '—'}
                      </span>
                    </td>
                    <td style={{ minWidth: '100px' }}>
                      <ProfileBar pct={student.profileCompletion || 0} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {(student.skills || []).slice(0, 2).map((sk, i) => (
                          <span key={i} style={{ fontSize: '9.5px', fontFamily: 'monospace', padding: '1px 6px', borderRadius: '4px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', color: 'var(--fac-text-primary)' }}>{sk.name}</span>
                        ))}
                        {(student.skills || []).length > 2 && (
                          <span style={{ fontSize: '9.5px', color: 'var(--fac-text-muted)' }}>+{student.skills.length - 2}</span>
                        )}
                        {!(student.skills?.length) && <span style={{ fontSize: '10.5px', color: 'var(--fac-text-muted)', fontStyle: 'italic' }}>None</span>}
                      </div>
                    </td>
                    <td><PlacementChip status={student.placementStatus} /></td>
                    <td>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="fac-btn-dark"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        <Eye style={{ width: '11px', height: '11px' }} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Detail Modal ── */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="fac-theme-card" style={{ maxWidth: '640px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--fac-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #16A36A 0%, #0F8F60 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#FFFFFF', overflow: 'hidden' }}>
                  {selectedStudent.avatarUrl ? <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedStudent.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fac-text-primary)', margin: 0 }}>{selectedStudent.name}</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--fac-text-secondary)', margin: 0 }}>{selectedStudent.department} · Year {selectedStudent.year}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--fac-border)', background: 'var(--fac-bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fac-text-secondary)' }}>
                <X style={{ width: '13px', height: '13px' }} />
              </button>
            </div>

            <div style={{ background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Academic Background</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Institution', selectedStudent.college || '—'],
                  ['CGPA', selectedStudent.cgpa ? `${selectedStudent.cgpa} / 10` : '—'],
                  ['Department', selectedStudent.department || '—'],
                  ['Applications', `${selectedStudent.applicationsCount || 0} submitted`],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <span style={{ fontSize: '10px', color: 'var(--fac-text-muted)', display: 'block', fontWeight: 600, marginBottom: '2px' }}>{label}</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>Profile Completion</span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fac-emerald-bright)' }}>{selectedStudent.profileCompletion || 0}%</span>
              </div>
              <ProfileBar pct={selectedStudent.profileCompletion || 0} />
            </div>

            {selectedStudent.bio && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Bio</div>
                <p style={{ fontSize: '12.5px', color: 'var(--fac-text-secondary)', lineHeight: 1.6, margin: 0 }}>{selectedStudent.bio}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Verified Skills ({(selectedStudent.skills || []).length})</div>
              {(selectedStudent.skills || []).length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--fac-text-muted)', fontStyle: 'italic' }}>No skills recorded yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {selectedStudent.skills.map((sk, i) => (
                    <div key={i} style={{ padding: '6px 10px', borderRadius: '7px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>{sk.name}</span>
                      <span className="fac-badge-emerald" style={{ fontSize: '9px' }}>{sk.proficiencyLevel}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent.projects?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fac-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Featured Projects</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedStudent.projects.map((proj, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fac-text-primary)' }}>{proj.title}</span>
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: 'var(--fac-emerald-bright)', textDecoration: 'none' }}><ExternalLink style={{ width: '10px', height: '10px' }} />Link</a>}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--fac-text-secondary)', margin: 0, lineHeight: 1.5 }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.resumeUrl && (
              <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: 'var(--fac-bg-surface)', border: '1px solid var(--fac-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fac-text-primary)' }}>Resume Document</span>
                <a href={selectedStudent.resumeUrl} target="_blank" rel="noreferrer" className="fac-btn-emerald" style={{ textDecoration: 'none', padding: '5px 12px', fontSize: '11px' }}>
                  <FileText style={{ width: '11px', height: '11px' }} /> View PDF
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--fac-border)' }}>
              <button onClick={() => setSelectedStudent(null)} className="fac-btn-dark">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
