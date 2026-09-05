import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Sparkles, Briefcase, GraduationCap, Award, Search,
  CheckCircle2, XCircle, AlertCircle, Eye, Check, X,
  ExternalLink, FileText, ChevronRight, RefreshCw,
  Filter, MapPin, DollarSign, Clock, Target, Users,
  BookOpen, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';
import CandidateProfileModal from '../components/CandidateProfileModal';

export default function CompanyRecommendedCandidatesPage() {
  const { token, user } = useAuth();

  // Data states
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [activeOpportunity, setActiveOpportunity] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // all | 80 | 60 | 40
  const [eligibilityFilter, setEligibilityFilter] = useState('all'); // all | eligible | ineligible
  const [statusFilter, setStatusFilter] = useState('all'); // all | new | shortlisted
  const [includeRejected, setIncludeRejected] = useState(false);

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);

  // Rejection modal
  const [rejectModalCandidate, setRejectModalCandidate] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch recommendations for active or selected opportunity
  const fetchRecommendations = async (oppId = '', isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const targetId = oppId || selectedOppId;
      const params = new URLSearchParams();
      if (targetId && targetId !== 'all') params.append('opportunityId', targetId);
      if (includeRejected) params.append('includeRejected', 'true');

      const url = `/api/company/recommended-candidates?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve candidate recommendations.');
      }

      setOpportunities(resData.opportunities || []);
      setActiveOpportunity(resData.activeOpportunity || null);
      if (resData.activeOpportunity && (!selectedOppId || selectedOppId === 'all')) {
        setSelectedOppId(resData.activeOpportunity._id);
      }
      setCandidates(resData.candidates || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setErrorMsg(err.message || 'Unable to connect to talent matching service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecommendations(selectedOppId);
    }
  }, [token, selectedOppId, includeRejected]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Handle direct candidate shortlist
  const handleShortlist = async (candidate) => {
    if (!activeOpportunity) return;
    setActionLoadingId(candidate._id + '_shortlist');

    try {
      const response = await fetch(`/api/company/students/${candidate.studentId || candidate._id}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: activeOpportunity._id,
          notes: `Direct shortlist via Skill Compatibility Engine (${candidate.compatibilityScore || 0}% Match)`
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to shortlist candidate');
      }

      // Update candidate applicationStatus in local state
      setCandidates(prev => prev.map(c =>
        c._id === candidate._id ? { ...c, applicationStatus: 'shortlisted' } : c
      ));

      if (selectedCandidateModal && selectedCandidateModal._id === candidate._id) {
        setSelectedCandidateModal(prev => ({ ...prev, applicationStatus: 'shortlisted' }));
      }

      showToast(`Candidate ${candidate.name} shortlisted for ${activeOpportunity.title}!`);
    } catch (err) {
      console.error('Shortlist error:', err);
      setErrorMsg(err.message || 'Failed to shortlist candidate.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open rejection confirmation modal
  const openRejectModal = (candidate) => {
    setRejectModalCandidate(candidate);
    setRejectReason('Candidate skill profile does not align with current opening requirements.');
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectModalCandidate || !activeOpportunity) return;
    const candId = rejectModalCandidate._id;
    setActionLoadingId(candId + '_reject');

    try {
      const response = await fetch(`/api/company/students/${rejectModalCandidate.studentId || candId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: activeOpportunity._id,
          reason: rejectReason
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to reject candidate');
      }

      // Remove or update candidate
      if (!includeRejected) {
        setCandidates(prev => prev.filter(c => c._id !== candId));
      } else {
        setCandidates(prev => prev.map(c =>
          c._id === candId ? { ...c, applicationStatus: 'rejected' } : c
        ));
      }

      if (selectedCandidateModal && selectedCandidateModal._id === candId) {
        setSelectedCandidateModal(null);
      }

      showToast(`Candidate marked as rejected for this opening.`);
      setRejectModalCandidate(null);
    } catch (err) {
      console.error('Reject error:', err);
      setErrorMsg(err.message || 'Failed to reject candidate.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter candidates list
  const filteredCandidates = candidates.filter(cand => {
    // Score filter
    if (scoreFilter === '80' && (cand.compatibilityScore || 0) < 80) return false;
    if (scoreFilter === '60' && (cand.compatibilityScore || 0) < 60) return false;
    if (scoreFilter === '40' && (cand.compatibilityScore || 0) < 40) return false;

    // Eligibility filter
    if (eligibilityFilter === 'eligible' && cand.isEligible === false) return false;
    if (eligibilityFilter === 'ineligible' && cand.isEligible !== false) return false;

    // Status filter
    if (statusFilter === 'new' && cand.applicationStatus !== 'none' && cand.applicationStatus !== 'applied') return false;
    if (statusFilter === 'shortlisted' && cand.applicationStatus !== 'shortlisted') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (cand.name || '').toLowerCase().includes(q);
      const collegeMatch = (cand.college || '').toLowerCase().includes(q);
      const branchMatch = (cand.branch || '').toLowerCase().includes(q);
      const skillMatch = (cand.keySkills || []).some(s => s.toLowerCase().includes(q));
      if (!nameMatch && !collegeMatch && !branchMatch && !skillMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* ── Toast Feedback ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Recommended Candidates
            </h1>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Skill Compatibility Engine</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic, weighted candidate recommendations evaluated against structured role skills, candidate proficiency, academic eligibility, and career interest alignment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRecommendations(selectedOppId, true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{refreshing ? 'Recalculating...' : 'Refresh'}</span>
          </button>
          <Link
            to="/company/opportunities"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Manage Openings</span>
          </Link>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-rose-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Opportunity Selector & Requirement Breakdown Card ── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Active Job / Internship Role:
            </label>
            {opportunities.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-1">
                No active job or internship openings found. Please post an opportunity first.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {opportunities.map(opp => {
                  const isSelected = activeOpportunity?._id === opp._id || selectedOppId === opp._id;
                  return (
                    <button
                      key={opp._id}
                      onClick={() => setSelectedOppId(opp._id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opp.type === 'internship' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span>{opp.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                        isSelected ? 'bg-indigo-700/60 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {opp.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Role Structured Criteria */}
        {activeOpportunity && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">
                Required Skills & Weights:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeOpportunity.requiredSkills || []).map((sk, idx) => {
                  const name = typeof sk === 'object' ? sk.name : sk;
                  const importance = typeof sk === 'object' ? sk.importance : 'required';
                  const proficiency = typeof sk === 'object' ? sk.proficiency : 'intermediate';
                  const weight = typeof sk === 'object' ? sk.weight : null;

                  return (
                    <span
                      key={idx}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                        importance === 'required'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="font-bold">{name}</span>
                      <span className="opacity-75 text-[9px] uppercase">({proficiency?.slice(0, 3)})</span>
                      {weight && <span className="text-[9px] font-extrabold text-slate-400">[{weight}w]</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            {activeOpportunity.minCgpa !== null && activeOpportunity.minCgpa !== undefined && (
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Min CGPA:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeOpportunity.minCgpa}</span>
              </div>
            )}

            {activeOpportunity.eligibleBranches && activeOpportunity.eligibleBranches.length > 0 && (
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Branches:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {activeOpportunity.eligibleBranches.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, college, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Compatibility Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            <option value="all">All Match Scores</option>
            <option value="80">High Match (&gt;= 80%)</option>
            <option value="60">Medium Match (&gt;= 60%)</option>
            <option value="40">Low Match (&gt;= 40%)</option>
          </select>

          {/* Eligibility Filter */}
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            <option value="all">All Eligibility</option>
            <option value="eligible">Eligible Only</option>
            <option value="ineligible">Ineligible Flagged</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            <option value="all">All Candidates</option>
            <option value="new">New Talent Pool</option>
            <option value="shortlisted">Already Shortlisted</option>
          </select>

          {/* Toggle Include Rejected */}
          <label className="flex items-center space-x-1.5 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeRejected}
              onChange={(e) => setIncludeRejected(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Include Rejected</span>
          </label>
        </div>
      </div>

      {/* ── Candidates Results Section ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold text-slate-400">
            Skill Compatibility Engine evaluating talent cohort...
          </p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matching candidates found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || scoreFilter !== 'all' || eligibilityFilter !== 'all'
              ? 'Try adjusting your search filters or lowering the compatibility score threshold.'
              : 'No active student candidates in the database meet the current matching parameters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredCandidates.length}</strong> candidates sorted by Compatibility Score
            </span>
            <span className="text-[11px] text-slate-400">
              Deterministic Weights: 70% Skills • 20% Eligibility • 10% Interests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate, rankIdx) => {
              const score = candidate.compatibilityScore ?? 0;
              const isEligible = candidate.isEligible ?? true;
              const isShortlisted = candidate.applicationStatus === 'shortlisted';

              return (
                <div
                  key={candidate._id || rankIdx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-sm">
                        {candidate.avatarUrl ? (
                          <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          candidate.name?.charAt(0) || 'C'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {candidate.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {candidate.education || 'Engineering Student'}
                        </p>
                      </div>
                    </div>

                    {/* Compatibility Badge */}
                    <div className="text-right shrink-0">
                      <div className={`px-2.5 py-1 rounded-xl font-extrabold text-xs inline-flex items-center space-x-1 border ${
                        score >= 80
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : score >= 60
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        <Sparkles className="h-3 w-3" />
                        <span>{score}%</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Match Score</span>
                    </div>
                  </div>

                  {/* Compatibility Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : score >= 60
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                    />
                  </div>

                  {/* Academic & Eligibility Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    {candidate.cgpa !== null && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        CGPA: {candidate.cgpa}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 ${
                      isEligible
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isEligible ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Eligible</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" />
                          <span>Ineligible</span>
                        </>
                      )}
                    </span>

                    {candidate.breakdown?.careerInterestMatch && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>Interest Aligned</span>
                      </span>
                    )}
                  </div>

                  {/* Matched vs Missing Skills breakdown */}
                  <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                        Matched Required Skills ({candidate.matchedSkills?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(candidate.matchedSkills || []).length > 0 ? (
                          candidate.matchedSkills.map((sk, sidx) => (
                            <span key={sidx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                              <span>{sk}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No direct required skill matches</span>
                        )}
                      </div>
                    </div>

                    {(candidate.missingSkills || []).length > 0 && (
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                          Missing Role Skills ({candidate.missingSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {candidate.missingSkills.map((sk, sidx) => (
                            <span key={sidx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center space-x-1 font-bold">
                              <span>⚠</span>
                              <span>{sk}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Candidate Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCandidateModal(candidate)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-500" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => handleShortlist(candidate)}
                      disabled={isShortlisted || actionLoadingId === candidate._id + '_shortlist'}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                        isShortlisted
                          ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                      }`}
                    >
                      {actionLoadingId === candidate._id + '_shortlist' ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : isShortlisted ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Shortlisted</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Shortlist</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openRejectModal(candidate)}
                      disabled={candidate.applicationStatus === 'rejected'}
                      title="Reject candidate"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Candidate Profile Modal ── */}
      {selectedCandidateModal && (
        <CandidateProfileModal
          isOpen={Boolean(selectedCandidateModal)}
          onClose={() => setSelectedCandidateModal(null)}
          studentId={selectedCandidateModal._id || selectedCandidateModal.studentId}
          initialCandidate={selectedCandidateModal}
          opportunityId={selectedOppId || activeOpportunity?._id || ''}
          onShortlist={handleShortlist}
          onReject={openRejectModal}
        />
      )}

      {/* ── Rejection Reason Modal ── */}
      {rejectModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>Reject Candidate</span>
              </h3>
              <button onClick={() => setRejectModalCandidate(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to mark <strong className="text-slate-900 dark:text-white">{rejectModalCandidate.name}</strong> as rejected for <strong>{activeOpportunity?.title}</strong>?
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rejection Note / Feedback:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRejection}
                disabled={actionLoadingId === rejectModalCandidate._id + '_reject'}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-rose-600/20"
              >
                {actionLoadingId === rejectModalCandidate._id + '_reject' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
