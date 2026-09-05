import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Search, Filter, CheckCircle2, AlertCircle, RefreshCw, 
  ArrowLeft, FileText, ExternalLink, Mail, GraduationCap, 
  Check, X, Award, Briefcase, Eye, ChevronRight, Sparkles,
  Layers, MapPin, Calendar, Clock, Download, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CandidateProfileModal from '../components/CandidateProfileModal';

export default function CompanyApplicantsPage() {
  const { token, user } = useAuth();

  // Data State
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOppFilter, setSelectedOppFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal State: View Candidate Profile
  const [candidateModalStudent, setCandidateModalStudent] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fetch all applications for logged-in company
  const fetchApplications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/applications/company/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve candidate applications.');
      }

      setApplications(resData.applications || []);
      setOpportunities(resData.opportunities || []);
    } catch (err) {
      console.error('Error fetching company applications:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  // Handle Quick Status Update (Shortlist, Reject, Accept, Review)
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatusId(appId);
    setErrorMsg('');

    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update candidate status.');
      }

      // Update local state immediately
      setApplications(prev => prev.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));

      setSuccessMsg(`Candidate marked as ${newStatus.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMsg(err.message || 'Failed to update candidate status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered Applications List
  const filteredApplications = applications.filter(app => {
    // Opportunity Filter
    const oppId = app.opportunityId?._id || app.opportunityId;
    if (selectedOppFilter !== 'all' && oppId !== selectedOppFilter) {
      return false;
    }

    // Status Filter
    if (selectedStatusFilter !== 'all') {
      const currentSt = (app.status || 'applied').toLowerCase();
      if (selectedStatusFilter === 'screening') {
        if (currentSt !== 'screening' && currentSt !== 'reviewed') return false;
      } else if (selectedStatusFilter === 'selected') {
        if (currentSt !== 'selected' && currentSt !== 'accepted') return false;
      } else if (currentSt !== selectedStatusFilter) {
        return false;
      }
    }

    // Search Query (candidate name, email, college, skills, role title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = app.studentId?.userId?.name?.toLowerCase() || '';
      const studentEmail = app.studentId?.userId?.email?.toLowerCase() || '';
      const college = app.studentId?.academicInformation?.college?.toLowerCase() || '';
      const oppTitle = app.opportunityId?.title?.toLowerCase() || '';
      const skills = (app.studentId?.skillsList || []).map(s => s.name.toLowerCase()).concat(
        (app.studentId?.skills || []).map(s => s.toLowerCase())
      );

      const nameMatch = studentName.includes(q);
      const emailMatch = studentEmail.includes(q);
      const collegeMatch = college.includes(q);
      const oppMatch = oppTitle.includes(q);
      const skillMatch = skills.some(s => s.includes(q));

      if (!nameMatch && !emailMatch && !collegeMatch && !oppMatch && !skillMatch) {
        return false;
      }
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
            <Users className="h-7 w-7 text-indigo-500" />
            <span>Applicant Screening & Review</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review candidate applications, verified skill portfolios, AI compatibility scores, and manage shortlisting.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchApplications(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Candidate List"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
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
            placeholder="Search by student name, college, skill tag, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Opportunity Dropdown Filter */}
          <select
            value={selectedOppFilter}
            onChange={(e) => setSelectedOppFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer max-w-[220px]"
          >
            <option value="all">All Opportunities ({opportunities.length})</option>
            {opportunities.map(opp => (
              <option key={opp._id} value={opp._id}>
                {opp.title} ({opp.type})
              </option>
            ))}
          </select>

          {/* Status Dropdown Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected / Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ APPLICANTS TABLE / CARDS ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Applicants...</span>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No applicants found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || selectedOppFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'As students browse your open opportunities and submit applications, their verified profiles will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => {
            const student = app.studentId;
            const userObj = student?.userId;
            const opp = app.opportunityId;
            const skills = (student?.skillsList && student.skillsList.length > 0)
              ? student.skillsList.map(s => s.name)
              : (student?.skills || []);
            const isUpdating = updatingStatusId === app._id;

            return (
              <div 
                key={app._id} 
                className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition shadow-sm space-y-4 text-left"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    {/* Avatar Initial */}
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                      {userObj?.avatarUrl ? (
                        <img src={userObj.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        userObj?.name?.charAt(0) || 'A'
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {userObj?.name || 'Student Candidate'}
                        </h3>

                        {app.compatibilityScore !== null && app.compatibilityScore !== undefined && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                            app.compatibilityScore >= 80
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : app.compatibilityScore >= 50
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                          }`}>
                            {app.compatibilityScore}% Compatibility
                          </span>
                        )}

                        {/* Interactive Recruitment Stage Selector */}
                        <select
                          value={app.status || 'applied'}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={isUpdating}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border outline-none cursor-pointer transition ${
                            ['selected', 'accepted'].includes(app.status)
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : app.status === 'shortlisted'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                              : app.status === 'interview'
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                              : app.status === 'screening' || app.status === 'reviewed'
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center space-x-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{userObj?.email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                          <span>{student?.academicInformation?.college || student?.academicInformation?.degree || 'Enrolled Student'}</span>
                        </span>
                        {student?.academicInformation?.cgpa && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            CGPA: {student.academicInformation.cgpa}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position Applied Badge */}
                  <div className="text-left sm:text-right space-y-0.5">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Applied Opening</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 block">
                      {opp?.title || 'Open Position'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      {opp?.type || 'job'} • {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Candidate Verified Skills Badges */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mr-1">Verified Skills:</span>
                  {skills.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">No skill badges listed</span>
                  ) : (
                    skills.map((sk, skIdx) => (
                      <span key={skIdx} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md">
                        {sk}
                      </span>
                    ))
                  )}
                </div>

                {/* Cover Pitch Excerpt if present */}
                {app.coverLetter && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 not-italic block mb-0.5">Candidate Pitch:</span>
                    "{app.coverLetter}"
                  </div>
                )}

                {/* Action Controls Row */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Left: Resume Link */}
                  <div>
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition shadow-xs cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                        <span>View Resume PDF</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No resume uploaded</span>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* View Detailed Student Profile Button */}
                    <button
                      onClick={() => setCandidateModalStudent({
                        studentId: app.studentId?._id || app.studentId,
                        opportunityId: app.opportunityId?._id || app.opportunityId
                      })}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      <span>View Profile</span>
                    </button>

                    {/* Shortlist Button */}
                    {app.status !== 'shortlisted' && (
                      <button
                        onClick={() => handleStatusChange(app._id, 'shortlisted')}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Shortlist</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {app.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(app._id, 'rejected')}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-500/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW STUDENT PROFILE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {candidateModalStudent && (
        <CandidateProfileModal
          studentId={candidateModalStudent.studentId}
          opportunityId={candidateModalStudent.opportunityId}
          token={token}
          onClose={() => setCandidateModalStudent(null)}
          onShortlistSuccess={(updatedApp) => {
            setApplications(prev => prev.map(a => 
              a._id === updatedApp._id || (a.studentId?._id === updatedApp.studentId && (a.opportunityId?._id || a.opportunityId) === updatedApp.opportunityId)
                ? { ...a, status: updatedApp.status }
                : a
            ));
          }}
        />
      )}

    </div>
  );
}
