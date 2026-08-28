import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, CheckCircle2, Clock, XCircle, AlertCircle, 
  Building2, MapPin, Calendar, ArrowRight, ExternalLink,
  Loader2, Sparkles, Filter, Search
} from 'lucide-react';


const STATUS_BADGES = {
  applied: { label: 'Applied', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  reviewed: { label: 'In Review', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  accepted: { label: 'Offer Extended', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  rejected: { label: 'Not Selected', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
};


export default function StudentApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    if (token) fetchApplications();
  }, [token]);

  const filteredApps = applications.filter(app => {
    const status = app.status || 'applied';
    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
    const title = app.opportunityId?.title || 'Position';
    const company = app.opportunityId?.company?.name || 'Company';
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Hiring Pipeline</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Job & Internship Applications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Track submitted applications, reviewer notes, and live selection statuses in MongoDB.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          {applications.length} Total Applications
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {['All', 'Applied', 'Reviewed', 'Shortlisted', 'Accepted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading your applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
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

            return (
              <div
                key={app._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{opp.title || 'Technical Role'}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    {opp.company?.name || opp.companyId?.companyName || opp.company || 'Partner Company'} • {opp.location || 'Remote'}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="capitalize">{opp.type || 'Internship'}</span>
                  </div>
                </div>

                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition w-fit"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span>View Submitted Resume</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
