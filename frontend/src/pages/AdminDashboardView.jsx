import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Users, Building2, GraduationCap, School, Briefcase,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Filter, RefreshCw,
  Search, Lock, Layers, BarChart3, ChevronRight, HelpCircle, Plus,
  Award, Zap, Loader2, Calendar, Clock, ArrowUpRight, TrendingUp,
  FileText, Check, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardView() {
  const { token, user } = useAuth();

  // State
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch admin dashboard data from MongoDB
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve admin system metrics.');
      }

      setStats(data.stats || {});
      setRecentUsers(data.recentUsers || []);
      setRecentCompanies(data.recentCompanies || []);
      setRecentOpportunities(data.recentOpportunities || []);
      setRecentApplications(data.recentApplications || []);
    } catch (err) {
      console.error('Admin Dashboard fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to admin analytics service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4 text-left">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Loading Platform Command Metrics...
        </span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-card p-10 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm text-left">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Admin System Telemetry Unavailable</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const s = stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCompanies: 0,
    activeJobs: 0,
    activeInternships: 0,
    totalApplications: 0,
    totalPlacements: 0
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Platform Executive Oversight</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            System Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-tenant monitoring across student cohorts, institutions, corporate recruiters, and placement pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Platform Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ 7 KEY SYSTEM KPIS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Total Students */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</span>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {s.totalStudents}
          </div>
          <div className="text-[10px] text-slate-400">Registered learners</div>
        </div>

        {/* Total Faculty */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Faculty</span>
            <School className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {s.totalFaculty}
          </div>
          <div className="text-[10px] text-slate-400">Academic mentors</div>
        </div>

        {/* Total Companies */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Companies</span>
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {s.totalCompanies}
          </div>
          <div className="text-[10px] text-slate-400">Partner employers</div>
        </div>

        {/* Active Jobs */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {s.activeJobs}
          </div>
          <div className="text-[10px] text-slate-400">Full-time drives</div>
        </div>

        {/* Active Internships */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Internships</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {s.activeInternships}
          </div>
          <div className="text-[10px] text-slate-400">Live programs</div>
        </div>

        {/* Total Applications */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Applications</span>
            <FileText className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {s.totalApplications}
          </div>
          <div className="text-[10px] text-slate-400">Total submitted</div>
        </div>

        {/* Total Placements */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Placements</span>
            <Award className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {s.totalPlacements}
          </div>
          <div className="text-[10px] text-rose-500 font-bold">Offers accepted</div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ 4 RECENT ACTIVITY STREAMS (2x2 GRID) ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. RECENT USERS */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Platform Users
              </h3>
            </div>
            <Link 
              to="/admin/users" 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Users</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No user accounts found.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentUsers.map(u => {
                const createdDate = u.createdAt ? new Date(u.createdAt) : new Date();
                return (
                  <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                          {u.name}
                        </span>
                        <span className="text-slate-400 text-[11px] block truncate font-mono">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase">
                        {u.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        ● {u.status || 'active'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. RECENT COMPANIES */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Building2 className="h-5 w-5 text-purple-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Employer Partners
              </h3>
            </div>
            <Link 
              to="/admin/companies" 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentCompanies.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No registered employers found.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentCompanies.map(c => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                      {c.companyName?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                        {c.companyName}
                      </span>
                      <span className="text-slate-400 text-[11px] block truncate">
                        {c.industry || 'Technology'} • {c.location || 'Bengaluru'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                    c.verificationStatus === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    ● {c.verificationStatus || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RECENT OPPORTUNITIES */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Hiring Opportunities
              </h3>
            </div>
            <Link 
              to="/admin/opportunities" 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Drives</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOpportunities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No active opportunities listed.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentOpportunities.map(opp => (
                <div key={opp._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                      {opp.title}
                    </span>
                    <span className="text-slate-400 text-[11px] block truncate">
                      {opp.companyId?.companyName || 'Enterprise Partner'} • <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{opp.stipend || 'Competitive'}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase">
                      {opp.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      opp.status === 'open'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      ● {opp.status || 'open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. RECENT CANDIDATE APPLICATIONS */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="h-5 w-5 text-cyan-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recent Application Activity
              </h3>
            </div>
            <Link 
              to="/admin/applications" 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No candidate applications submitted yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentApplications.map(app => (
                <div key={app._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                      {app.studentName}
                    </span>
                    <span className="text-slate-400 text-[11px] block truncate">
                      Applied for <span className="font-bold text-slate-700 dark:text-slate-300">{app.opportunityTitle}</span> ({app.companyName})
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                    app.status === 'accepted'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : app.status === 'shortlisted'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}>
                    ● {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
