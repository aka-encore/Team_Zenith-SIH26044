import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Search, Filter, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  Check, X, Eye, Users, Briefcase, Building2, 
  Calendar, Clock, Award, Sparkles, ChevronRight,
  GraduationCap, Video, MapPin, DollarSign, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminApplicationsPage() {
  const { token, user: currentAdmin } = useAuth();

  // Data & Status State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State for Viewing Application Details
  const [selectedApp, setSelectedApp] = useState(null);
  const [appModalOpen, setAppModalOpen] = useState(false);

  // Fetch Applications from MongoDB
  const fetchApplications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/applications?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve application records.');
      }

      setApplications(data.applications || []);
    } catch (err) {
      console.error('Admin Applications fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to application records service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token, statusFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchApplications();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'selected':
        return { label: 'Selected / Placed', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'interview':
        return { label: 'Interview Scheduled', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'shortlisted':
        return { label: 'Shortlisted', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'reviewed':
        return { label: 'Profile Reviewed', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      default:
        return { label: 'Application Submitted', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
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
            <FileText className="h-7 w-7 text-cyan-500" />
            <span>Platform Candidate Applications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-tenant monitoring across student applications, recruiter screenings, interview rounds, and placement offers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchApplications(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Applications"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-500' : ''}`} />
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

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* General Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Drive Types</option>
              <option value="job">Full-time Job Drives</option>
              <option value="internship">Corporate Internships</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Application Stages</option>
              <option value="applied">Applied</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview Scheduled</option>
              <option value="selected">Selected / Placed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

        </div>

        {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {applications.length} Applications Matching Criteria
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

      {/* ━━━━━━━━━━━━━━━━━━━━ APPLICATIONS TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              <span>Platform Applications Registry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live records from MongoDB tracking candidate submissions across all employers
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {applications.length} Applications
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-cyan-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p>No candidate applications found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Student Candidate</th>
                  <th className="p-3.5">Employer & Role</th>
                  <th className="p-3.5">Type & Compensation</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Application Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {applications.map(app => {
                  const appliedDate = app.appliedDate ? new Date(app.appliedDate) : null;
                  const statusMeta = getStatusBadge(app.status);

                  return (
                    <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      
                      {/* Student Candidate */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-extrabold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                            {app.student?.avatarUrl ? (
                              <img src={app.student.avatarUrl} alt={app.student.name} className="w-full h-full object-cover" />
                            ) : (
                              app.student?.name?.charAt(0) || 'S'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                              {app.student?.name}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono block">
                              {app.student?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Employer & Role */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {app.opportunity?.title}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{app.company?.name}</span>
                          </span>
                        </div>
                      </td>

                      {/* Type & Stipend */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase inline-block">
                            {app.opportunity?.type}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold block text-[11px]">
                            {app.opportunity?.stipend}
                          </span>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {appliedDate ? appliedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
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
                            setSelectedApp(app);
                            setAppModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
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

      {/* ━━━━━━━━━━━━━━━━━━━━ APPLICATION DETAIL MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {appModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedApp.student?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedApp.student?.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Applied for {selectedApp.opportunity?.title} at {selectedApp.company?.name}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overview Metadata */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Stage</span>
                <span className="font-extrabold uppercase font-mono text-cyan-600 dark:text-cyan-400 block">
                  {selectedApp.status}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate CGPA</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-base block">
                  {selectedApp.student?.cgpa}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                  {selectedApp.student?.branch || 'Computer Science'}
                </span>
              </div>
            </div>

            {/* Verified Candidate Skills */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Verified Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedApp.student?.skills?.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold border border-cyan-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interview details if scheduled */}
            {selectedApp.interviewDetails && (
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-2 text-xs">
                <h4 className="font-extrabold text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                  <Video className="h-4 w-4" />
                  <span>Interview Session Details</span>
                </h4>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <p>• Date & Time: <span className="font-bold">{selectedApp.interviewDetails.date || 'TBD'}</span></p>
                  <p>• Format: <span className="font-bold">{selectedApp.interviewDetails.type || 'Video Technical Round'}</span></p>
                  {selectedApp.interviewDetails.meetingLink && (
                    <p>• Meeting Link: <a href={selectedApp.interviewDetails.meetingLink} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">{selectedApp.interviewDetails.meetingLink}</a></p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end text-xs">
              <button
                onClick={() => setAppModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close Application
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
