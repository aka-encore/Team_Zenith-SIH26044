import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Video, MapPin, Phone, Users, Plus, 
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, 
  ArrowLeft, ChevronRight, Edit3, Trash2, X, Check, 
  ExternalLink, FileText, Sparkles, GraduationCap, AlertTriangle,
  Briefcase, Link as LinkIcon, Play, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyInterviewsPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [interviews, setInterviews] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'scheduled' | 'completed' | 'cancelled'
  const [modeFilter, setModeFilter] = useState('all');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Form State
  const [formApplicationId, setFormApplicationId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('11:00');
  const [formMode, setFormMode] = useState('video');
  const [formRound, setFormRound] = useState('Technical Evaluation Round 1');
  const [formInterviewType, setFormInterviewType] = useState('Technical Interview');
  const [formInterviewer, setFormInterviewer] = useState('Technical Hiring Panel');
  const [formMeetingLink, setFormMeetingLink] = useState('https://meet.google.com');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('scheduled');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch interviews for logged-in company
  const fetchInterviews = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/companies/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve company interviews.');
      }

      setInterviews(resData.interviews || []);
      setAvailableCandidates(resData.availableCandidates || []);
      setOpportunities(resData.opportunities || []);
      if (resData.availableCandidates && resData.availableCandidates.length > 0 && !formApplicationId) {
        setFormApplicationId(resData.availableCandidates[0].applicationId);
      }
    } catch (err) {
      console.error('Error loading interviews:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInterviews();
    }
  }, [token]);

  // Open Schedule Modal (Create)
  const handleOpenCreate = () => {
    setEditingInterview(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDate(tomorrow.toISOString().split('T')[0]);
    setFormTime('11:00');
    setFormMode('video');
    setFormRound('Technical Evaluation Round 1');
    setFormInterviewType('Technical Interview');
    setFormInterviewer('Technical Hiring Panel');
    setFormMeetingLink('https://meet.google.com/new');
    setFormNotes('');
    setFormStatus('scheduled');
    setFormError('');
    setShowScheduleModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (interview) => {
    setEditingInterview(interview);
    setFormApplicationId(interview.applicationId);
    
    // Parse date & time
    if (interview.rawDate) {
      const d = new Date(interview.rawDate);
      setFormDate(d.toISOString().split('T')[0]);
      setFormTime(d.toTimeString().slice(0, 5) || '11:00');
    } else {
      setFormDate('');
      setFormTime('11:00');
    }

    setFormMode(interview.mode || 'video');
    setFormRound(interview.round || 'Technical Evaluation Round 1');
    setFormInterviewType(interview.interviewType || 'Technical Interview');
    setFormInterviewer(interview.interviewer || 'Technical Hiring Panel');
    setFormMeetingLink(interview.meetingLink || 'https://meet.google.com');
    setFormNotes(interview.notes || '');
    setFormStatus(interview.status || 'scheduled');
    setFormError('');
    setShowScheduleModal(true);
  };

  // Handle Submit (Create or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formDate) {
      setFormError('Please select a valid interview date.');
      return;
    }

    const targetAppId = editingInterview ? editingInterview.applicationId : formApplicationId;
    if (!targetAppId) {
      setFormError('Please select a candidate to schedule.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const response = await fetch(`/api/companies/applications/${targetAppId}/interview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: formDate,
          time: formTime,
          mode: formMode,
          round: formRound,
          interviewType: formInterviewType,
          interviewer: formInterviewer,
          meetingLink: formMeetingLink,
          notes: formNotes,
          status: formStatus
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to save interview schedule.');
      }

      setSuccessMsg(`Interview ${editingInterview ? 'updated' : 'scheduled'} successfully!`);
      setShowScheduleModal(false);
      setEditingInterview(null);
      fetchInterviews(true);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.message || 'Error occurred while saving interview.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Interview
  const handleCancelInterview = async (id) => {
    try {
      const response = await fetch(`/api/companies/applications/${id}/interview/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to cancel interview.');
      }

      setInterviews(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'cancelled' } : inv));
      setCancelConfirmId(null);
      setSuccessMsg('Interview marked as cancelled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Cancel error:', err);
      setErrorMsg(err.message || 'Error occurred while cancelling interview.');
    }
  };

  // Filtered List
  const filteredInterviews = interviews.filter(inv => {
    if (statusFilter !== 'all' && (inv.status || 'scheduled') !== statusFilter) {
      return false;
    }
    if (modeFilter !== 'all' && inv.mode !== modeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (inv.studentName || '').toLowerCase().includes(q);
      const emailMatch = (inv.studentEmail || '').toLowerCase().includes(q);
      const oppMatch = (inv.opportunity?.title || '').toLowerCase().includes(q);
      const roundMatch = (inv.round || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !oppMatch && !roundMatch) return false;
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
            <Video className="h-7 w-7 text-indigo-500" />
            <span>Interview Pipeline & Scheduling</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Schedule virtual technical evaluations, live coding interviews, and manage meeting links and candidate briefings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchInterviews(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Interviews"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenCreate}
            disabled={availableCandidates.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Interview</span>
          </button>
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
            placeholder="Search by student name, email, opportunity, or round..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses ({interviews.length})</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="video">Virtual Video</option>
            <option value="onsite">On-Premises</option>
            <option value="phone">Telephonic</option>
          </select>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ INTERVIEW CARDS LIST ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Interview Schedules...</span>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No interviews found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || statusFilter !== 'all' || modeFilter !== 'all'
                ? 'Try clearing your filters or search keywords.'
                : 'Schedule technical rounds and candidate discussions with shortlisted applicants.'}
            </p>
          </div>
          {availableCandidates.length > 0 ? (
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Schedule New Interview
            </button>
          ) : (
            <Link
              to="/company/students"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              Find & Shortlist Students First
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterviews.map(interview => (
            <div 
              key={interview._id}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-3.5">
                
                {/* Header: Candidate Avatar & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                      {interview.avatarUrl ? (
                        <img src={interview.avatarUrl} alt={interview.studentName} className="w-full h-full object-cover" />
                      ) : (
                        interview.studentName?.charAt(0) || 'C'
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {interview.studentName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {interview.studentEmail}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${
                    interview.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : interview.status === 'cancelled'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    ● {interview.status || 'scheduled'}
                  </span>
                </div>

                {/* Opportunity & Evaluation Round */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Position</span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">{interview.opportunity?.type}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                    {interview.opportunity?.title}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block pt-0.5">
                    {interview.interviewType || interview.round}
                  </span>
                  {interview.interviewer && (
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Panel: {interview.interviewer}
                    </span>
                  )}
                </div>

                {/* Date, Time & Mode Details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>{interview.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>{interview.time} IST</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="capitalize">{interview.mode} Interview</span>
                  </div>
                </div>

                {/* Meeting Link / Venue */}
                {interview.meetingLink && (
                  <div className="pt-1">
                    <a
                      href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition border border-indigo-200 dark:border-indigo-500/20"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">Open Meeting Link</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Recruiter Notes */}
                {interview.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{interview.notes}"
                  </p>
                )}

              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(interview)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Edit Details</span>
                </button>

                {interview.status !== 'cancelled' && (
                  <button
                    onClick={() => setCancelConfirmId(interview._id)}
                    className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-500/20 transition flex items-center justify-center space-x-1 cursor-pointer"
                    title="Cancel Interview"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SCHEDULE / EDIT MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-white dark:bg-slate-950 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingInterview ? 'Edit Interview Details' : 'Schedule Candidate Interview'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingInterview ? editingInterview.studentName : 'Set date, time, and meeting details'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowScheduleModal(false);
                  setEditingInterview(null);
                }}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* Select Candidate (If creating new) */}
              {!editingInterview && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Select Shortlisted Candidate *
                  </label>
                  <select
                    required
                    value={formApplicationId}
                    onChange={(e) => setFormApplicationId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {availableCandidates.map(cand => (
                      <option key={cand.applicationId} value={cand.applicationId}>
                        {cand.studentName} ({cand.opportunityTitle})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
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
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
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
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value)}
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
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
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
                    value={formInterviewType}
                    onChange={(e) => setFormInterviewType(e.target.value)}
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
                    value={formInterviewer}
                    onChange={(e) => setFormInterviewer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Status Selector (If Editing) */}
              {editingInterview && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Interview Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed / Offer Discussion</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {/* Meeting Link / Instructions */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Meeting URL / Venue Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  value={formMeetingLink}
                  onChange={(e) => setFormMeetingLink(e.target.value)}
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
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingInterview(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingInterview ? 'Update Interview' : 'Confirm Schedule'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CANCEL CONFIRMATION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-950 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Cancel Scheduled Interview?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to cancel this interview session? The candidate status will remain shortlisted.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Keep Interview
              </button>
              <button
                onClick={() => handleCancelInterview(cancelConfirmId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Cancel Interview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
