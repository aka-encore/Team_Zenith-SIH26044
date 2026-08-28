import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, Ban, Building2, MapPin, Calendar, 
  Clock, DollarSign, Users, Award, Sparkles, ChevronRight,
  Shield, CheckCheck, AlertTriangle, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOpportunitiesPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & Status State
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Inspecting Opportunity
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [oppModalOpen, setOppModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [oppApplications, setOppApplications] = useState([]);

  // Action Loading State
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Opportunities from MongoDB
  const fetchOpportunities = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/opportunities?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve platform opportunities.');
      }

      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Admin Opportunities fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to opportunities service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token, typeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchOpportunities();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update opportunity status (approve, reject, suspend)
  const handleUpdateStatus = async (oppId, newStatus) => {
    setActionLoadingId(oppId);
    setActionSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/opportunities/${oppId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update opportunity status.');
      }

      setOpportunities(prev => prev.map(o => o._id === oppId ? { ...o, status: newStatus } : o));
      if (selectedOpp && selectedOpp._id === oppId) {
        setSelectedOpp(prev => ({ ...prev, status: newStatus }));
      }

      setActionSuccessMsg(`Opportunity status successfully updated to "${newStatus.toUpperCase()}".`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Opportunity status update error:', err);
      setErrorMsg(err.message || 'Failed to update opportunity.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Inspect Opportunity in Modal
  const handleInspectOpp = async (opp) => {
    setSelectedOpp(opp);
    setOppApplications([]);
    setOppModalOpen(true);
    setLoadingDetails(true);

    try {
      const response = await fetch(`/api/admin/opportunities/${opp._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOppApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching opportunity applications:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
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
            <Briefcase className="h-7 w-7 text-emerald-500" />
            <span>Platform Opportunities & Drives</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervise job openings and internship drives across all employers with moderation approval and suspension controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOpportunities(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Opportunities"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
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
              placeholder="Search by job title, company name, skill..."
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
              <option value="all">All Opportunity Types</option>
              <option value="job">Full-time Job Openings</option>
              <option value="internship">Corporate Internships</option>
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
              <option value="open">Active / Approved Drives</option>
              <option value="suspended">Suspended Drives</option>
              <option value="rejected">Rejected Drives</option>
              <option value="closed">Closed Drives</option>
            </select>
          </div>

        </div>

        {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {opportunities.length} Hiring Drives Matching Criteria
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

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITIES TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              <span>Campus Hiring Drives & Openings</span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time drive inventory with admin moderation and application tallies
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {opportunities.length} Drives
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Platform Opportunities...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Briefcase className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No hiring drives found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Position & Company</th>
                  <th className="p-3.5">Type & Compensation</th>
                  <th className="p-3.5">Required Skills</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {opportunities.map(opp => {
                  const deadlineDate = opp.deadline ? new Date(opp.deadline) : null;
                  const isActionLoading = actionLoadingId === opp._id;

                  return (
                    <tr key={opp._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Title & Company */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                            {opp.company?.logo ? (
                              <img src={opp.company.logo} alt={opp.company.name} className="w-full h-full object-cover" />
                            ) : (
                              opp.company?.name?.charAt(0) || 'C'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {opp.title}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {opp.company?.name} • {opp.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type & Stipend */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase inline-block">
                            {opp.type}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold block text-[11px]">
                            {opp.stipend}
                          </span>
                        </div>
                      </td>

                      {/* Required Skills */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {opp.requiredSkills?.slice(0, 3).map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                              {sk}
                            </span>
                          ))}
                          {opp.requiredSkills?.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{opp.requiredSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {deadlineDate ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          opp.status === 'open' || opp.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : opp.status === 'suspended'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : opp.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          ● {opp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => handleInspectOpp(opp)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                          title="Inspect Opportunity"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        {/* Approve Button */}
                        {opp.status !== 'open' && opp.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(opp._id, 'open')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Approve Drive"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {opp.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(opp._id, 'rejected')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Reject Drive"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* Suspend Button */}
                        {(opp.status === 'open' || opp.status === 'approved') && (
                          <button
                            onClick={() => handleUpdateStatus(opp._id, 'suspended')}
                            disabled={isActionLoading}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                            title="Suspend Drive"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITY DETAIL MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {oppModalOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedOpp.company?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedOpp.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedOpp.company?.name} • {selectedOpp.location}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setOppModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overview Metadata */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
                <span className="font-extrabold uppercase font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedOpp.type}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compensation</span>
                <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedOpp.stipend || 'Competitive'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Drive Status</span>
                <span className="font-extrabold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedOpp.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Opportunity Description</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedOpp.description}
              </p>
            </div>

            {/* Required Skills Matrix */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Skills Required</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedOpp.requiredSkills?.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Applications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Candidate Pipeline ({oppApplications.length} Applicants)
              </h4>

              {loadingDetails ? (
                <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                  <span>Loading Candidate Records...</span>
                </div>
              ) : oppApplications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  No candidate applications submitted for this opening yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {oppApplications.map(app => (
                    <div key={app._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {app.studentId?.userId?.name || 'Student Candidate'}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {app.studentId?.userId?.email || 'N/A'}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
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

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-x-2">
                {selectedOpp.status !== 'open' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOpp._id, 'open')}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Approve Drive
                  </button>
                )}

                {selectedOpp.status === 'open' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOpp._id, 'suspended')}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl transition cursor-pointer"
                  >
                    Suspend Drive
                  </button>
                )}
              </div>

              <button
                onClick={() => setOppModalOpen(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
