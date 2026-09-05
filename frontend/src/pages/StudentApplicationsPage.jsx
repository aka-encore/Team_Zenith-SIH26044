import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, CheckCircle2, Clock, XCircle, AlertCircle, 
  Building2, MapPin, Calendar, ArrowRight, ExternalLink,
  Loader2, Sparkles, Filter, Search, Video, VideoOff, RefreshCw
} from 'lucide-react';

const STATUS_BADGES = {
  applied: { label: 'Applied', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  screening: { label: 'Screening', bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20' },
  reviewed: { label: 'Screening', bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  interview: { label: 'Interview Scheduled', bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30' },
  interviewing: { label: 'Interview Scheduled', bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30' },
  selected: { label: 'Selected / Offer Extended', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  accepted: { label: 'Selected / Offer Extended', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' }
};

const getStatusBadge = (status) => {
  const key = (status || 'applied').toLowerCase();
  return STATUS_BADGES[key]?.bg || 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
};

export default function StudentApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchApplications();
  }, [token]);

  const filteredApps = applications.filter(app => {
    const status = (app.status || 'applied').toLowerCase();
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const sf = statusFilter.toLowerCase();
      if (sf === 'interview') {
        matchesStatus = status === 'interview' || status === 'interviewing' || (app.interviewDetails && app.interviewDetails.scheduledAt && app.interviewDetails.status !== 'cancelled');
      } else if (sf === 'screening') {
        matchesStatus = status === 'screening' || status === 'reviewed';
      } else if (sf === 'selected') {
        matchesStatus = status === 'selected' || status === 'accepted';
      } else {
        matchesStatus = status === sf;
      }
    }

    const title = app.opportunityId?.title || 'Position';
    const company = app.opportunityId?.companyId?.companyName || app.opportunityId?.company?.name || 'Company';
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      company.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HEADER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Hiring Pipeline</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Job & Internship Applications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Track submitted applications, live recruitment stages, and scheduled interview sessions directly from verified employers.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={() => fetchApplications(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh Applications"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
            {applications.length} Total Submissions
          </div>
        </div>
      </div>

      {/* ── FILTER ROW ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {['All', 'Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── APPLICATIONS LIST ── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading your applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No applications found</h3>
          <p className="text-xs text-slate-500">Apply to open job and internship roles from the Opportunities page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isInterviewCancelled = (app.interviewDetails?.status || '').toLowerCase() === 'cancelled';
            const isInterviewCompleted = (app.interviewDetails?.status || '').toLowerCase() === 'completed';
            const interview = app.interviewDetails;

            return (
              <div
                key={app._id}
                className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 transition text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-sm shrink-0">
                      {app.opportunityId?.companyId?.companyName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {app.opportunityId?.title || 'Engineering Opportunity'}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        <span>{app.opportunityId?.companyId?.companyName || 'Corporate Partner'}</span>
                        <span>•</span>
                        <span className="capitalize">{app.opportunityId?.type || 'Internship'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusBadge(app.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{app.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Applied On</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Resume Link</span>
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : <span className="text-slate-400">Not provided</span>}
                  </div>
                </div>

                {interview && (interview.scheduledAt || interview.date) && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    isInterviewCancelled 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      : isInterviewCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-slate-700 dark:text-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/10 pb-2">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-indigo-500" />
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {interview.interviewType || interview.round || 'Interview Evaluation Round'}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isInterviewCancelled
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : isInterviewCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                      }`}>
                        Status: {interview.status || 'scheduled'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Scheduled Date</span>
                        <span className="font-bold">
                          {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (interview.date || 'TBD')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Time</span>
                        <span className="font-bold">
                          {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (interview.time || '10:00 AM')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Interview Mode</span>
                        <span className="font-bold capitalize">{interview.mode || 'Virtual Video'}</span>
                      </div>

                      {interview.interviewer && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Interviewer</span>
                          <span className="font-bold truncate block">{interview.interviewer}</span>
                        </div>
                      )}
                    </div>
                    {interview.meetingLink && !isInterviewCancelled && (
                      <a
                        href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition w-fit text-xs"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
