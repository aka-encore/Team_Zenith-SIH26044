import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { 
  X, User, Mail, Phone, School, BookOpen, GraduationCap, Award, 
  Briefcase, Globe, FileText, ExternalLink, CheckCircle2, AlertCircle, 
  Loader2, Sparkles, Layers, Code2, ShieldCheck, Check, Calendar, 
  Target, AlertTriangle, Download, ArrowRight, RefreshCw, Star
} from 'lucide-react';

const GithubIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export default function CandidateProfileModal({
  isOpen,
  onClose,
  studentId,
  initialCandidate = null,
  opportunityId = '',
  onShortlist = null,
  onReject = null
}) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState(initialCandidate);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'assessments' | 'projects' | 'resume'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && (studentId || initialCandidate?._id || initialCandidate?.studentId)) {
      const targetId = studentId || initialCandidate?.studentId || initialCandidate?._id;
      fetchDetailedProfile(targetId);
    }
  }, [isOpen, studentId, opportunityId]);

  const fetchDetailedProfile = async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const oppParam = opportunityId ? `?opportunityId=${encodeURIComponent(opportunityId)}` : '';
      const response = await fetch(`/api/companies/students/${id}${oppParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.candidate) {
        setCandidate(resData.candidate);
      } else {
        // Fallback to initialCandidate if available
        if (initialCandidate) {
          setCandidate(initialCandidate);
        } else {
          throw new Error(resData.message || 'Failed to load detailed candidate profile.');
        }
      }
    } catch (err) {
      console.error('Error fetching candidate profile:', err);
      if (!initialCandidate) {
        setErrorMsg(err.message || 'Unable to load candidate details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentData = candidate || initialCandidate || {};
  const acad = currentData.academicInformation || {};
  const userObj = currentData.user || {};
  const name = currentData.name || userObj.name || 'Student Candidate';
  const email = currentData.email || userObj.email || '';
  const phone = currentData.phone || userObj.phone || '';
  const avatarUrl = currentData.avatarUrl || userObj.avatarUrl || null;
  const college = acad.college || currentData.college || 'Zenith University Partner';
  const degree = acad.degree || acad.course || currentData.degree || 'B.Tech';
  const branch = acad.branch || acad.department || currentData.branch || 'Engineering';
  const year = acad.year || currentData.year || 'Pre-final Year';
  const cgpa = acad.cgpa !== null && acad.cgpa !== undefined ? acad.cgpa : currentData.cgpa;

  const compatibilityPercentage = currentData.compatibilityPercentage ?? currentData.compatibilityScore ?? null;
  const matchedSkills = currentData.matchedSkills || [];
  const missingSkills = currentData.missingSkills || [];
  const isEligible = currentData.isEligible ?? true;
  const eligibilityReasons = currentData.eligibilityReasons || [];
  const targetOpp = currentData.targetOpportunity || null;

  const handleShortlistClick = async () => {
    if (!onShortlist) return;
    setActionLoading(true);
    try {
      await onShortlist(currentData);
      setCandidate(prev => prev ? { ...prev, applicationStatus: 'shortlisted' } : prev);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = async () => {
    if (!onReject) return;
    setActionLoading(true);
    try {
      await onReject(currentData);
      setCandidate(prev => prev ? { ...prev, applicationStatus: 'rejected' } : prev);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-card w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── 1. MODAL HEADER ── */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20 dark:from-slate-900/90 dark:via-slate-900 dark:to-emerald-950/20 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4 min-w-0">
            <UserAvatar
              src={avatarUrl}
              name={name}
              size={64}
              role="student"
              fallbackLetter="S"
              style={{ borderRadius: '16px' }}
            />

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {name}
                </h2>
                {currentData.applicationStatus === 'shortlisted' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                    Shortlisted
                  </span>
                )}
                {currentData.applicationStatus === 'rejected' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    Not Selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center space-x-1">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{[degree, branch].filter(Boolean).join(' • ') || 'Engineering'}</span>
                </span>
                <span>•</span>
                <span>{college}</span>
                {year && (
                  <>
                    <span>•</span>
                    <span>{year}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                {email && (
                  <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <Mail className="h-3 w-3" />
                    <span>{email}</span>
                  </span>
                )}
                {phone && (
                  <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <Phone className="h-3 w-3" />
                    <span>{phone}</span>
                  </span>
                )}
                {cgpa !== null && cgpa !== undefined && (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    CGPA: {cgpa} / 10
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── 2. COMPATIBILITY STRIP (HIGHLIGHTED IF AN OPPORTUNITY IS ACTIVE) ── */}
        {targetOpp && compatibilityPercentage !== null && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 border-b border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Skill Compatibility Engine</span>
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Role: <strong className="text-emerald-700 dark:text-emerald-400">{targetOpp.title}</strong>
                  </span>
                </div>
                
                {/* Matched & Missing Skills Inline */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {matchedSkills.length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Matched:</span>
                      {matchedSkills.map((sk, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Missing:</span>
                      {missingSkills.map((sk, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          ⚠ {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {!isEligible && eligibilityReasons.length > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      Criteria Gap: {eligibilityReasons[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="text-right shrink-0">
                <div className={`px-3 py-1.5 rounded-2xl text-sm font-black font-mono border inline-flex items-center space-x-1.5 shadow-sm ${
                  compatibilityPercentage >= 75
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : compatibilityPercentage >= 50
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-500/20 border-slate-500/40 text-slate-700 dark:text-slate-300'
                }`}>
                  <Target className="h-4 w-4" />
                  <span>{compatibilityPercentage}% Match</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. NAVIGATION TABS ── */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-xs font-bold bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview & Skills', count: currentData.skillsList?.length || currentData.skills?.length },
            { key: 'assessments', label: 'Assessments', count: currentData.assessments?.length },
            { key: 'projects', label: 'Projects', count: currentData.projects?.length },
            { key: 'experience', label: 'Internships & Certs', count: (currentData.internships?.length || 0) + (currentData.certifications?.length || 0) },
            { key: 'resume', label: 'Resume & Links' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 4. SCROLLABLE TAB CONTENT ── */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {loading && !candidate && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="text-slate-400 font-mono">Loading verified student profile records...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          {/* ══════════ TAB: OVERVIEW & SKILLS ══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Bio */}
              {currentData.bio && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Candidate Bio</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {currentData.bio}
                  </p>
                </div>
              )}

              {/* Academic Background Grid */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <School className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Academic Information</span>
                  </h4>
                  {cgpa !== null && (
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                      CGPA: {cgpa} / 10
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Degree</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{degree}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Discipline / Branch</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{branch}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Year of Study</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{year}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Institution</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block" title={college}>{college}</span>
                  </div>
                </div>
              </div>

              {/* Technical Skills with Proficiency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Skills & Proficiency Profile ({(currentData.skillsList?.length || currentData.skills?.length || 0)})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {(currentData.skillsList && currentData.skillsList.length > 0) ? (
                    currentData.skillsList.map((sk, idx) => {
                      const prof = sk.proficiency || 'Intermediate';
                      return (
                        <div 
                          key={idx} 
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{sk.name}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-black uppercase border shrink-0 ${
                            prof.toLowerCase().includes('expert')
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              : prof.toLowerCase().includes('adv')
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : prof.toLowerCase().includes('beg')
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                          }`}>
                            {prof}
                          </span>
                        </div>
                      );
                    })
                  ) : (currentData.skills && currentData.skills.length > 0) ? (
                    currentData.skills.map((sk, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{sk}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Intermediate
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-center italic">
                      No technical skills recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Career Interests */}
              {currentData.careerInterests && currentData.careerInterests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Career Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentData.careerInterests.map((interest, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ══════════ TAB: ASSESSMENTS ══════════ */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Technical Assessment Results ({currentData.assessments?.length || 0})</span>
                </h4>
              </div>

              {currentData.assessments && currentData.assessments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentData.assessments.map((test, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs">{test.skill}</h5>
                          <span className="text-[10px] text-slate-400">{test.category || 'Domain Assessment'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${
                          test.passed
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {test.passed ? 'Cleared ✓' : 'In Progress'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Score</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{test.percentage}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Proficiency</span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{test.proficiencyEarned || 'Intermediate'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Date</span>
                          <span className="text-slate-500">
                            {test.createdAt ? new Date(test.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Verified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                  <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Assessment Results Recorded</p>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    Candidate has not completed any timed technical skill assessments yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB: PROJECTS ══════════ */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                <span>Academic & Independent Projects ({currentData.projects?.length || 0})</span>
              </h4>

              {currentData.projects && currentData.projects.length > 0 ? (
                <div className="space-y-3">
                  {currentData.projects.map((proj, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-black text-slate-900 dark:text-white text-xs">{proj.title}</h5>
                          {proj.duration && (
                            <span className="text-[10px] text-slate-400 font-mono">{proj.duration}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {proj.githubUrl && (
                            <a 
                              href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition flex items-center space-x-1"
                            >
                              <GithubIcon className="h-3 w-3" />
                              <span>Code</span>
                            </a>
                          )}
                          {(proj.liveUrl || proj.link) && (
                            <a 
                              href={(proj.liveUrl || proj.link).startsWith('http') ? (proj.liveUrl || proj.link) : `https://${proj.liveUrl || proj.link}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold transition flex items-center space-x-1"
                            >
                              <span>Demo</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {proj.description && (
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                          {proj.description}
                        </p>
                      )}

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies.map((t, tidx) => (
                            <span key={tidx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                  <Briefcase className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Projects Documented</p>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    Student has not attached any project repositories to their profile yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB: INTERNSHIPS & CERTIFICATIONS ══════════ */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              
              {/* Internships */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-teal-500" />
                  <span>Work & Internship Experience ({currentData.internships?.length || 0})</span>
                </h4>

                {currentData.internships && currentData.internships.length > 0 ? (
                  <div className="space-y-3">
                    {currentData.internships.map((intern, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="font-black text-slate-900 dark:text-white text-xs">{intern.title}</h5>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{intern.company} • {intern.location || 'Remote'}</p>
                          </div>
                          {intern.duration && (
                            <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                              {intern.duration}
                            </span>
                          )}
                        </div>
                        {intern.description && (
                          <p className="text-slate-500 text-[11px] leading-relaxed pt-1">{intern.description}</p>
                        )}
                        {intern.certificateUrl && (
                          <a 
                            href={intern.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-600 hover:underline text-[10px] font-bold pt-1"
                          >
                            <span>Experience Certificate</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-center italic">
                    No previous corporate internships recorded.
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Award className="h-3.5 w-3.5 text-purple-500" />
                  <span>Verified Certifications ({currentData.certifications?.length || 0})</span>
                </h4>

                {currentData.certifications && currentData.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentData.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs">{cert.title}</h5>
                          <span className="text-[10px] text-slate-400 block">{cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}</span>
                        </div>
                        {cert.credentialUrl && (
                          <a 
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition shrink-0"
                            title="Verify Credential"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-center italic">
                    No verified certifications attached.
                  </div>
                )}
              </div>

              {/* Achievements */}
              {currentData.achievements && currentData.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    <span>Honors & Achievements</span>
                  </h4>
                  <div className="space-y-1.5">
                    {currentData.achievements.map((ach, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                        <span className="text-amber-500 font-bold">★</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ══════════ TAB: RESUME & LINKS ══════════ */}
          {activeTab === 'resume' && (
            <div className="space-y-5">
              
              {/* Resume Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Verified Student Resume</h4>
                      <p className="text-[10px] text-slate-400">{currentData.resumeName || 'Candidate_Resume.pdf'}</p>
                    </div>
                  </div>

                  {currentData.resumeUrl ? (
                    <a 
                      href={currentData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Open Resume PDF</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No resume uploaded</span>
                  )}
                </div>
              </div>

              {/* Digital Portfolio & Social Presence */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Digital Portfolio & Verified Profiles
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Portfolio Link */}
                  {currentData.socialLinks?.portfolio ? (
                    <a 
                      href={currentData.socialLinks.portfolio.startsWith('http') ? currentData.socialLinks.portfolio : `https://${currentData.socialLinks.portfolio}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition flex items-center space-x-3 text-slate-800 dark:text-slate-200"
                    >
                      <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate">Digital Portfolio</span>
                        <span className="text-[10px] text-slate-400 block truncate">{currentData.socialLinks.portfolio}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-slate-400">
                      <Globe className="h-4 w-4" />
                      <span>Portfolio not linked</span>
                    </div>
                  )}

                  {/* GitHub Link */}
                  {currentData.socialLinks?.github ? (
                    <a 
                      href={currentData.socialLinks.github.startsWith('http') ? currentData.socialLinks.github : `https://${currentData.socialLinks.github}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition flex items-center space-x-3 text-slate-800 dark:text-slate-200"
                    >
                      <GithubIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate">GitHub Profile</span>
                        <span className="text-[10px] text-slate-400 block truncate">{currentData.socialLinks.github}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-slate-400">
                      <GithubIcon className="h-4 w-4" />
                      <span>GitHub not linked</span>
                    </div>
                  )}

                  {/* LinkedIn Link */}
                  {currentData.socialLinks?.linkedin ? (
                    <a 
                      href={currentData.socialLinks.linkedin.startsWith('http') ? currentData.socialLinks.linkedin : `https://${currentData.socialLinks.linkedin}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition flex items-center space-x-3 text-slate-800 dark:text-slate-200"
                    >
                      <LinkedinIcon className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate">LinkedIn Network</span>
                        <span className="text-[10px] text-slate-400 block truncate">{currentData.socialLinks.linkedin}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-slate-400">
                      <LinkedinIcon className="h-4 w-4" />
                      <span>LinkedIn not linked</span>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── 5. MODAL ACTION FOOTER ── */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center space-x-2.5">
            {onReject && currentData.applicationStatus !== 'rejected' && (
              <button 
                type="button"
                onClick={handleRejectClick}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition cursor-pointer"
              >
                Reject Candidate
              </button>
            )}

            {onShortlist && (
              <button 
                type="button"
                onClick={handleShortlistClick}
                disabled={actionLoading || currentData.applicationStatus === 'shortlisted'}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-1.5 shadow-md ${
                  currentData.applicationStatus === 'shortlisted'
                    ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : currentData.applicationStatus === 'shortlisted' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Candidate Shortlisted</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Shortlist Candidate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
