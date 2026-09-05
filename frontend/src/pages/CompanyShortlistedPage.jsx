import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Users, Search, Filter, Calendar, Clock, Video, 
  MapPin, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ChevronRight, Sparkles, Eye, Trash2, Plus, ExternalLink, 
  FileText, GraduationCap, X, Check, AlertTriangle, Layers,
  Phone, Mail, Briefcase, UserX, Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CandidateProfileModal from '../components/CandidateProfileModal';

export default function CompanyShortlistedPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunityFilter, setOpportunityFilter] = useState('all');

  // Modals
  const [candidateModalStudent, setCandidateModalStudent] = useState(null);
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [removeConfirmId, setRemoveConfirmId] = useState(null);

  // Schedule Interview Form State
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('11:00');
  const [interviewMode, setInterviewMode] = useState('video');
  const [interviewRound, setInterviewRound] = useState('Technical Evaluation Round 1');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [interviewer, setInterviewer] = useState('Technical Hiring Panel');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  // Fetch all shortlisted students belonging strictly to the authenticated company
  const fetchShortlisted = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/companies/shortlisted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve shortlisted candidates.');
      }

      setShortlisted(resData.shortlisted || []);
    } catch (err) {
      console.error('Error fetching shortlisted candidates:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchShortlisted();
    }
  }, [token]);

  // Handle Remove from Shortlist
  const handleRemoveShortlist = async (appId) => {
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'reviewed' })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to remove from shortlist.');
      }

      setShortlisted(prev => prev.filter(a => a._id !== appId));
      setRemoveConfirmId(null);
      setSuccessMsg('Candidate removed from active shortlist.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Remove error:', err);
      setErrorMsg(err.message || 'Failed to remove candidate.');
    }
  };

  // Open Schedule Modal
  const handleOpenSchedule = (app) => {
    setScheduleModalApp(app);
    // Pre-populate with default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setInterviewTime('11:00');
    setInterviewMode(app.interviewDetails?.mode || 'video');
    setInterviewRound(app.interviewDetails?.round || 'Technical Evaluation Round 1');
    setInterviewType(app.interviewDetails?.interviewType || 'Technical Interview');
    setInterviewer(app.interviewDetails?.interviewer || 'Technical Hiring Panel');
    setMeetingLink(app.interviewDetails?.meetingLink || 'https://meet.google.com/new');
    setInterviewNotes(app.interviewDetails?.notes || '');
    setScheduleError('');
  };

  // Handle Submit Interview Schedule
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModalApp || !interviewDate) {
      setScheduleError('Please provide an interview date.');
      return;
    }

    setScheduling(true);
    setScheduleError('');

    try {
      const response = await fetch(`/api/companies/applications/${scheduleModalApp._id}/interview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: interviewDate,
          time: interviewTime,
          mode: interviewMode,
          round: interviewRound,
          interviewType,
          interviewer,
          meetingLink,
          notes: interviewNotes
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to schedule interview.');
      }

      setSuccessMsg(`Interview successfully scheduled with ${scheduleModalApp.name}!`);
      setScheduleModalApp(null);
      fetchShortlisted(true);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Scheduling error:', err);
      setScheduleError(err.message || 'Error occurred while scheduling interview.');
    } finally {
      setScheduling(false);
    }
  };

  // Unique opportunities for filter dropdown
  const uniqueOpportunities = Array.from(
    new Set(shortlisted.map(s => s.opportunity?.title).filter(Boolean))
  );

  // Filtered List
  const filteredShortlisted = shortlisted.filter(item => {
    if (opportunityFilter !== 'all' && item.opportunity?.title !== opportunityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const collegeMatch = (item.college || '').toLowerCase().includes(q);
      const deptMatch = (item.department || '').toLowerCase().includes(q);
      const skillMatch = (item.skills || []).some(s => s.name.toLowerCase().includes(q));
      if (!nameMatch && !collegeMatch && !deptMatch && !skillMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/company" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Award className="h-7 w-7 text-indigo-500" />
            <span>Shortlisted Candidates</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your curated candidate shortlist, view complete student profiles, schedule interviews, and track hiring progress.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchShortlisted(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Shortlisted List"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          
          <Link
            to="/company/students"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Find More Students</span>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, college, department, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Opportunity Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={opportunityFilter}
            onChange={(e) => setOpportunityFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Opportunities ({shortlisted.length})</option>
            {uniqueOpportunities.map((oppTitle, idx) => (
              <option key={idx} value={oppTitle}>
                {oppTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SHORTLISTED CARDS LIST ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Shortlisted Talent...</span>
        </div>
      ) : filteredShortlisted.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No shortlisted candidates yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || opportunityFilter !== 'all'
                ? 'Try adjusting your search query or opportunity filter.'
                : 'Browse student talent or screen applicants to add candidates to your shortlist.'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Link
              to="/company/students"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              Search Student Talent
            </Link>
            <Link
              to="/company/applicants"
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              View Applicants
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShortlisted.map(item => {
            const hasInterview = Boolean(item.interviewDetails?.scheduledAt);
            const interviewDateObj = hasInterview ? new Date(item.interviewDetails.scheduledAt) : null;

            return (
              <div 
                key={item._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3.5">
                  
                  {/* Header: Candidate Info & Shortlisted Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          item.name?.charAt(0) || 'S'
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {item.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 block">
                        CGPA {item.cgpa}
                      </span>
                    </div>
                  </div>

                  {/* College / Institution */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.college}</span>
                  </div>

                  {/* Opportunity & Shortlisted Date */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Opportunity</span>
                      <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">{item.opportunity?.type}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                      {item.opportunity?.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Shortlisted on: {new Date(item.shortlistedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Skills Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.skills.slice(0, 4).map((sk, skIdx) => (
                        <span 
                          key={skIdx} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {sk.name}
                        </span>
                      ))}
                      {item.skills.length > 4 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                          +{item.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interview Status Pill if Scheduled */}
                  {hasInterview && (
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Video className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-bold">Interview: {interviewDateObj.toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 bg-indigo-500/20 rounded">
                        {item.interviewDetails.mode}
                      </span>
                    </div>
                  )}

                </div>

                {/* Card Footer: Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCandidateModalStudent({
                        studentId: item.studentId,
                        opportunityId: item.opportunity?._id
                      })}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => handleOpenSchedule(item)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{hasInterview ? 'Reschedule' : 'Schedule'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setRemoveConfirmId(item._id)}
                    className="w-full py-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove from Shortlist</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW DETAILED STUDENT PROFILE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {candidateModalStudent && (
        <CandidateProfileModal
          studentId={candidateModalStudent.studentId}
          opportunityId={candidateModalStudent.opportunityId}
          token={token}
          onClose={() => setCandidateModalStudent(null)}
          onShortlistSuccess={() => fetchShortlisted(true)}
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SCHEDULE INTERVIEW MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-white dark:bg-slate-950 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Schedule Candidate Interview
                  </h3>
                  <p className="text-xs text-slate-400">
                    {scheduleModalApp.name} • {scheduleModalApp.opportunity?.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setScheduleModalApp(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {scheduleError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {scheduleError}
              </div>
            )}

            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs">
              
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Mode & Round */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Mode
                  </label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="video">Virtual Video (Google Meet / Zoom)</option>
                    <option value="onsite">On-Premises / Office</option>
                    <option value="phone">Telephonic Screening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Evaluation Round
                  </label>
                  <select
                    value={interviewRound}
                    onChange={(e) => setInterviewRound(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="Technical Evaluation Round 1">Technical Evaluation Round 1</option>
                    <option value="System Design & Architecture">System Design & Architecture</option>
                    <option value="Live Coding & Problem Solving">Live Coding & Problem Solving</option>
                    <option value="HR & Culture Fit Round">HR & Culture Fit Round</option>
                    <option value="Executive Partner Discussion">Executive Partner Discussion</option>
                  </select>
                </div>
              </div>

              {/* Interview Type & Interviewer Panel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Interview"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interviewer / Panel
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma - Staff Architect"
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Meeting Link / Instructions */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Meeting URL / Venue Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/abc-defg-hij or Bengaluru HQ Floor 4"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Recruiter Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Candidate Briefing & Preparation Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please be prepared to present your portfolio and demonstrate state management concepts."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer flex items-center space-x-2"
                >
                  {scheduling ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Confirm Interview Schedule</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ REMOVE CONFIRMATION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {removeConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-950 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Remove from Shortlist?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to remove this student from your active shortlisted candidates? Their application status will return to reviewed.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setRemoveConfirmId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveShortlist(removeConfirmId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Remove Candidate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
