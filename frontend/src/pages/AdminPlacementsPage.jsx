import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, Users, Briefcase, Calendar, 
  Clock, Award, Sparkles, ChevronRight, GraduationCap, 
  TrendingUp, Layers, MapPin, DollarSign, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPlacementsPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & Status State
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Viewing Drive Details & Candidates
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  // Fetch Placements & Drives from MongoDB
  const fetchPlacements = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (companyFilter !== 'all') params.append('company', companyFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/placements?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve placement statistics.');
      }

      setStats(data.stats || null);
      setDrives(data.drives || []);
    } catch (err) {
      console.error('Admin Placements fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to placements service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlacements();
    }
  }, [token, statusFilter, companyFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchPlacements();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyFilter('all');
    setStatusFilter('all');
  };

  // Unique companies list for filtering
  const uniqueCompanies = Array.from(new Set(drives.map(d => d.company?.name).filter(Boolean)));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ongoing':
        return { label: 'Ongoing Drive', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'upcoming':
        return { label: 'Upcoming Drive', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'completed':
        return { label: 'Completed Drive', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      default:
        return { label: status, color: 'bg-slate-100 dark:bg-slate-800 text-slate-500' };
    }
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/admin" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Command Center</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <GraduationCap className="h-7 w-7 text-indigo-500" />
            <span>Campus Placement Command</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Platform placement telemetry, drive pipelines, corporate recruitment drives, and student offer conversion metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchPlacements(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Placement Data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ KPI METRICS GRID ━━━━━━━━━━━━━━━━━━━━ */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ongoing Drives</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.ongoingDrivesCount}
            </div>
            <span className="text-[10px] text-slate-400">Active Hiring</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Drives</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {stats.upcomingDrivesCount}
            </div>
            <span className="text-[10px] text-slate-400">Scheduled Soon</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligible Pool</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalEligibleStudents}
            </div>
            <span className="text-[10px] text-slate-400">CGPA Qualified</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applications</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.totalApplications}
            </div>
            <span className="text-[10px] text-slate-400">Total Submissions</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shortlisted</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {stats.shortlistedStudents}
            </div>
            <span className="text-[10px] text-slate-400">Interview Bound</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placements Made</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.selectedStudents}
            </div>
            <span className="text-[10px] text-slate-400">Offers Extended</span>
          </div>

        </div>
      )}

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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Recruiting Companies</option>
              {uniqueCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Drive Statuses</option>
              <option value="ongoing">Ongoing Drives</option>
              <option value="upcoming">Upcoming Drives</option>
              <option value="completed">Completed Drives</option>
            </select>
          </div>

        </div>

        {(searchQuery || companyFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {drives.length} Placement Drives Matching Filters
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

      {/* ━━━━━━━━━━━━━━━━━━━━ PLACEMENT DRIVES TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <span>Campus Placement Drives</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live corporate recruitment drives with candidate pipeline tracking
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {drives.length} Drives
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Placement Drives...</span>
          </div>
        ) : drives.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <GraduationCap className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No placement drives found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Recruiting Company</th>
                  <th className="p-3.5">Job Role & Type</th>
                  <th className="p-3.5">Placement Date</th>
                  <th className="p-3.5">Eligible / Applied</th>
                  <th className="p-3.5">Shortlisted / Selected</th>
                  <th className="p-3.5">Drive Status</th>
                  <th className="p-3.5 text-right">Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {drives.map(d => {
                  const pDate = d.placementDate ? new Date(d.placementDate) : null;
                  const statusMeta = getStatusBadge(d.status);

                  return (
                    <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Company Name & Logo */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                            {d.company?.logo ? (
                              <img src={d.company.logo} alt={d.company.name} className="w-full h-full object-cover" />
                            ) : (
                              d.company?.name?.charAt(0) || 'C'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {d.company?.name}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {d.company?.industry} • {d.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Role & Type */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {d.role}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase inline-block">
                            {d.type}
                          </span>
                        </div>
                      </td>

                      {/* Placement Date */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {pDate ? pDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Eligible / Applied */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 block">Eligible: <span className="font-bold text-slate-900 dark:text-white">{d.metrics?.eligibleStudentsCount}</span></span>
                          <span className="text-indigo-600 dark:text-indigo-400 block font-bold">Applied: {d.metrics?.applicationsCount}</span>
                        </div>
                      </td>

                      {/* Shortlisted / Selected */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="space-y-0.5">
                          <span className="text-purple-600 dark:text-purple-400 block font-bold">Shortlisted: {d.metrics?.shortlistedCount}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 block font-bold">Selected: {d.metrics?.selectedCount}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${statusMeta.color}`}>
                          ● {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedDrive(d);
                            setDriveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
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

      {/* ━━━━━━━━━━━━━━━━━━━━ DRIVE DETAILS & PIPELINE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {driveModalOpen && selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedDrive.company?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedDrive.role}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDrive.company?.name} • {selectedDrive.location}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setDriveModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pipeline Stage Tallies */}
            <div className="grid grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Eligible Pool</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono text-base block">
                  {selectedDrive.metrics?.eligibleStudentsCount}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applied</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-base block">
                  {selectedDrive.metrics?.applicationsCount}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortlisted</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 font-mono text-base block">
                  {selectedDrive.metrics?.shortlistedCount}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-base block">
                  {selectedDrive.metrics?.selectedCount}
                </span>
              </div>
            </div>

            {/* Candidate Pipeline List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Candidates ({selectedDrive.appliedCandidates?.length || 0})
              </h4>

              {(!selectedDrive.appliedCandidates || selectedDrive.appliedCandidates.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  No student applications registered for this drive yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
                  {selectedDrive.appliedCandidates.map(cand => (
                    <div key={cand._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {cand.name}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {cand.department} • CGPA: {cand.cgpa}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cand.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : cand.status === 'shortlisted'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
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
                onClick={() => setDriveModalOpen(false)}
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
