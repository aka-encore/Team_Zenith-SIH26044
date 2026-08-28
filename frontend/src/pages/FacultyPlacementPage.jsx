import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Briefcase, Users, Building2, Calendar, 
  Clock, CheckCircle2, UserCheck, AlertCircle, RefreshCw, 
  ArrowLeft, Search, Filter, ChevronRight, Eye, X, 
  DollarSign, MapPin, Target, Sparkles, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyPlacementPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State for Drive Pipeline Inspection
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Fetch Placement Data from MongoDB
  const fetchPlacementData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/faculty/placement?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve placement records.');
      }

      setData(resData);
    } catch (err) {
      console.error('Error loading faculty placement data:', err);
      setErrorMsg(err.message || 'Unable to connect to placement service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlacementData();
    }
  }, [token, statusFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchPlacementData();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4 text-left">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Loading Institutional Placement Intelligence...
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
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Placement Intelligence Unavailable</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => fetchPlacementData(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    activeDrivesCount: 0,
    upcomingDrivesCount: 0,
    totalEligibleStudents: 0,
    totalApplications: 0,
    shortlistedStudents: 0,
    selectedStudents: 0,
    overallPlacementRate: 0
  };

  const drives = data?.drives || [];

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/faculty" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Award className="h-7 w-7 text-emerald-500" />
            <span>Campus Placement Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor active hiring drives, eligible candidate pools, shortlist pipelines, and student selection metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchPlacementData(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Placement Records"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ 6 KPI SUMMARY METRICS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Active Drives */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Drives</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.activeDrivesCount}
          </div>
          <div className="text-[10px] text-slate-400">Open campus hiring</div>
        </div>

        {/* Upcoming Drives */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Upcoming</span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {stats.upcomingDrivesCount}
          </div>
          <div className="text-[10px] text-slate-400">Scheduled sessions</div>
        </div>

        {/* Eligible Students */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Eligible Pool</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {stats.totalEligibleStudents}
          </div>
          <div className="text-[10px] text-slate-400">CGPA ≥ 7.0 criteria</div>
        </div>

        {/* Applications */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Applications</span>
            <Target className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {stats.totalApplications}
          </div>
          <div className="text-[10px] text-slate-400">Total submitted</div>
        </div>

        {/* Shortlisted */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shortlisted</span>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.shortlistedStudents}
          </div>
          <div className="text-[10px] text-slate-400">In interview pipeline</div>
        </div>

        {/* Selected / Placed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Selected</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.selectedStudents}
          </div>
          <div className="text-[10px] text-emerald-500 font-bold font-mono">{stats.overallPlacementRate}% placed</div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* General Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Drive Types</option>
              <option value="job">Full-time Job Drives</option>
              <option value="internship">Internship Drives</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Drive Statuses</option>
              <option value="open">Active / Open Drives</option>
              <option value="closed">Closed / Completed Drives</option>
            </select>
          </div>

        </div>

        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {drives.length} Placement Drives
            </span>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ DRIVES LISTING TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              <span>Campus Placement Drives & Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time drive tracking with candidate enrollment and selection stages
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {drives.length} Drives Registered
          </span>
        </div>

        {drives.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Briefcase className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No placement drives found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Drive Dates</th>
                  <th className="p-3.5">Eligibility</th>
                  <th className="p-3.5">Pipeline (Applied / Shortlisted / Selected)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {drives.map(drive => {
                  const driveDate = drive.driveDate ? new Date(drive.driveDate) : null;
                  const deadlineDate = drive.deadline ? new Date(drive.deadline) : null;

                  return (
                    <tr key={drive._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Company & Role */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                            {drive.company?.logo ? (
                              <img src={drive.company.logo} alt={drive.company.name} className="w-full h-full object-cover" />
                            ) : (
                              drive.company?.name?.charAt(0) || 'C'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {drive.role}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                              {drive.company?.name} • <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{drive.stipend}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Drive Dates */}
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-900 dark:text-white">
                            Drive: {driveDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Apply By: {deadlineDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Eligibility */}
                      <td className="p-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            Min CGPA {drive.eligibility?.minCgpa}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 block truncate max-w-xs text-[10px]">
                            {drive.eligibility?.allowedBranches?.join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* Pipeline Stage Pills */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold" title="Applied Students">
                            {drive.metrics?.appliedCount} Applied
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold" title="Shortlisted for Interview">
                            {drive.metrics?.shortlistedCount} Shortlisted
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold" title="Selected / Placed">
                            {drive.metrics?.selectedCount} Selected
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          drive.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          ● {drive.status === 'open' ? 'Active Drive' : 'Completed'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedDrive(drive)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Pipeline</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ DRIVE PIPELINE CANDIDATES MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedDrive.company?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedDrive.role}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDrive.company?.name} • Placement Pipeline
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDrive(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pipeline Stage Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applied</span>
                <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">{selectedDrive.metrics?.appliedCount}</span>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortlisted</span>
                <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{selectedDrive.metrics?.shortlistedCount}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected / Hired</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{selectedDrive.metrics?.selectedCount}</span>
              </div>
            </div>

            {/* Candidates Enrolled in this Drive */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Applied Student Candidates ({selectedDrive.appliedCandidates?.length || 0})
              </h4>

              {selectedDrive.appliedCandidates?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  No student applications submitted yet for this placement drive.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {selectedDrive.appliedCandidates.map(cand => (
                    <div key={cand._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {cand.name}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {cand.department} • CGPA {cand.cgpa}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cand.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : cand.status === 'shortlisted'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        ● {cand.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end text-xs">
              <button
                onClick={() => setSelectedDrive(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close Pipeline
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
