import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, CheckCircle2, Clock, XCircle, AlertCircle, 
  Building2, MapPin, Calendar, ArrowRight, ExternalLink,
  Loader2, Sparkles, Filter, Search, Video, VideoOff, RefreshCw
} from 'lucide-react';

const STATUS_BADGES = {
  applied: { label: 'Applied', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  reviewed: { label: 'In Review', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  interview: { label: 'Interview Scheduled', bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30' },
  accepted: { label: 'Offer Extended', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Not Selected', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' }
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
      if (statusFilter.toLowerCase() === 'interview') {
        matchesStatus = status === 'interview' || (app.interviewDetails && app.interviewDetails.scheduledAt && app.interviewDetails.status !== 'cancelled');
      } else {
        matchesStatus = status === statusFilter.toLowerCase();
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
          {['All', 'Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Accepted'].map((st) => (
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
            const opp = app.opportunityId || {};
            const statusKey = (app.status || 'applied').toLowerCase();
            const badge = STATUS_BADGES[statusKey] || STATUS_BADGES.applied;
            const interview = app.interviewDetails;
            const hasInterview = interview && (interview.scheduledAt || interview.date || app.status === 'interview');
            const isInterviewCancelled = (interview?.status || '').toLowerCase() === 'cancelled';
            const isInterviewCompleted = (interview?.status || '').toLowerCase() === 'completed';

            return (
              <div
                key={app._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 transition text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{opp.title || 'Technical Role'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {opp.companyId?.companyName || opp.company?.name || opp.company || 'Partner Company'} • {opp.location || 'Remote'}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{opp.type || 'Internship'}</span>
                      <span>•</span>
                      <span>{opp.stipend || 'Competitive'}</span>
                    </div>
                  </div>

                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition w-fit shrink-0"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Submitted Resume</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  )}
                </div>

                {/* ── SCHEDULED INTERVIEW BANNER ── */}
                {hasInterview && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    isInterviewCancelled
                      ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20'
                      : isInterviewCompleted
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20'
                      : 'bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-500/20'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/10 pb-2">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-indigo-500" />
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {interview.round || 'Interview Evaluation Round'}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
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
                    </div>

                    {/* Meeting URL Button */}
                    {interview.meetingLink && !isInterviewCancelled && (
                      <div className="pt-1 flex items-center justify-between gap-3">
                        <a
                          href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition shadow-xs text-xs"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Join Live Interview Meeting</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>

                        {interview.notes && (
                          <span className="text-[11px] text-slate-400 italic truncate max-w-sm">
                            "{interview.notes}"
                          </span>
                        )}
                      </div>
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
