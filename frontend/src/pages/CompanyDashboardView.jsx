import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Briefcase, Plus, Sparkles, Search, Filter, 
  CheckCircle2, ChevronRight, Award, Target, FileText, ArrowRight,
  Clock, MapPin, DollarSign, Calendar, ExternalLink, RefreshCw,
  AlertCircle, Check, X, ShieldCheck, TrendingUp, BarChart3,
  GraduationCap, Mail, Video, UserCheck, Layers, Eye, BookOpen, Star, AlertTriangle
} from 'lucide-react';
import CandidateProfileModal from '../components/CandidateProfileModal';

export default function CompanyDashboardView() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Dashboard Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Action Modal State (Post Job / Internship)
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState('job'); // 'job' | 'internship'
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postLocation, setPostLocation] = useState('Remote');
  const [postStipend, setPostStipend] = useState('Competitive');
  const [postDuration, setPostDuration] = useState('');
  const [postSkills, setPostSkills] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  // Opportunities tab filter
  const [oppFilter, setOppFilter] = useState('all'); // 'all' | 'job' | 'internship'

  // Recommended Candidates State
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [recOpportunities, setRecOpportunities] = useState([]);
  const [activeRecOpportunity, setActiveRecOpportunity] = useState(null);
  const [selectedRecOppId, setSelectedRecOppId] = useState('');
  const [recLoading, setRecLoading] = useState(true);
  const [recActionLoadingId, setRecActionLoadingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);

  // Fetch live company dashboard statistics from MongoDB
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/companies/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve company dashboard data.');
      }

      setData(resData);
    } catch (err) {
      console.error('Error loading company dashboard:', err);
      setErrorMsg(err.message || 'Unable to connect to database. Please verify your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch candidates recommended by the transparent skill matching engine
  const fetchRecommendedCandidates = async (oppId = '') => {
    setRecLoading(true);
    try {
      const queryParam = oppId ? `?opportunityId=${encodeURIComponent(oppId)}` : '';
      const response = await fetch(`/api/companies/recommended-candidates${queryParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setRecommendedCandidates(resData.candidates || []);
        setRecOpportunities(resData.opportunities || []);
        setActiveRecOpportunity(resData.activeOpportunity || null);
        if (resData.activeOpportunity && !oppId) {
          setSelectedRecOppId(resData.activeOpportunity._id);
        }
      }
    } catch (err) {
      console.error('Error fetching recommended candidates:', err);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchRecommendedCandidates();
    }
  }, [token]);

  // Handle switching target opportunity for candidate recommendations
  const handleRecOppChange = (oppId) => {
    setSelectedRecOppId(oppId);
    fetchRecommendedCandidates(oppId);
  };

  // Handle Shortlist Candidate Action
  const handleShortlistCandidate = async (candidate, targetOppId = null) => {
    const oppId = targetOppId || activeRecOpportunity?._id;
    if (!oppId) return;

    const candId = candidate.studentId || candidate._id;
    setRecActionLoadingId(candId + '_shortlist');

    try {
      const response = await fetch(`/api/companies/students/${candId}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: oppId,
          notes: 'Shortlisted from Recommended Candidates'
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setRecommendedCandidates(prev => prev.map(c => 
          (c._id === candId || c.studentId === candId)
            ? { ...c, applicationStatus: 'shortlisted' }
            : c
        ));
        if (selectedCandidateModal && (selectedCandidateModal._id === candId || selectedCandidateModal.studentId === candId)) {
          setSelectedCandidateModal(prev => ({ ...prev, applicationStatus: 'shortlisted' }));
        }
        setToastMsg(`Candidate ${candidate.name} shortlisted for ${activeRecOpportunity?.title || 'this role'}!`);
        setTimeout(() => setToastMsg(''), 3500);
        fetchDashboardData(true);
      } else {
        alert(resData.message || 'Failed to shortlist candidate.');
      }
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
    } finally {
      setRecActionLoadingId(null);
    }
  };

  // Handle Reject Candidate Action
  const handleRejectCandidate = async (candidate, targetOppId = null) => {
    const oppId = targetOppId || activeRecOpportunity?._id;
    if (!oppId) return;

    const candId = candidate.studentId || candidate._id;
    setRecActionLoadingId(candId + '_reject');

    try {
      const response = await fetch(`/api/companies/students/${candId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: oppId,
          reason: 'Candidate did not meet required skill threshold'
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setRecommendedCandidates(prev => prev.filter(c => c._id !== candId && c.studentId !== candId));
        if (selectedCandidateModal && (selectedCandidateModal._id === candId || selectedCandidateModal.studentId === candId)) {
          setSelectedCandidateModal(null);
        }
        setToastMsg(`Candidate ${candidate.name} marked as rejected.`);
        setTimeout(() => setToastMsg(''), 3500);
      } else {
        alert(resData.message || 'Failed to reject candidate.');
      }
    } catch (err) {
      console.error('Error rejecting candidate:', err);
    } finally {
      setRecActionLoadingId(null);
    }
  };

  // Handle Quick Action: Create New Opportunity
  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim() || !postSkills.trim()) {
      setPostError('Title, description, and required skills are required.');
      return;
    }

    setPosting(true);
    setPostError('');
    setPostSuccess('');

    const skillsArray = postSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: postTitle.trim(),
      type: postType,
      description: postDescription.trim(),
      location: postLocation.trim() || 'Remote',
      stipend: postStipend.trim() || 'Competitive',
      duration: postType === 'internship' ? postDuration.trim() : '',
      requiredSkills: skillsArray
    };

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create opportunity posting.');
      }

      setPostSuccess(`${postType === 'internship' ? 'Internship' : 'Job'} posted successfully!`);
      // Reset form
      setPostTitle('');
      setPostDescription('');
      setPostSkills('');
      setPostDuration('');
      
      // Refresh dashboard data
      fetchDashboardData(true);

      setTimeout(() => {
        setPostSuccess('');
        setShowPostModal(false);
      }, 1200);
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setPostError(err.message || 'Failed to post opportunity.');
    } finally {
      setPosting(false);
    }
  };

  const openPostModal = (type) => {
    setPostType(type);
    setPostError('');
    setPostSuccess('');
    setShowPostModal(true);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-8 pb-16 text-left max-w-7xl mx-auto">
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-300 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800/40 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center p-12 text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Real-Time Corporate Workspace...</span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (errorMsg && !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 glass-card border border-rose-500/30 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Failed to Load Dashboard</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{errorMsg}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const company = data?.company || {};
  const stats = data?.stats || {
    activeJobs: 0,
    activeInternships: 0,
    totalApplicants: 0,
    shortlistedCount: 0,
    interviewCount: 0
  };
  const opportunities = data?.opportunities || [];
  const recentApplicants = data?.recentApplicants || [];
  const upcomingInterviews = data?.upcomingInterviews || [];
  const insights = data?.insights || {
    commonSkills: [],
    stageBreakdown: { applied: 0, reviewed: 0, shortlisted: 0, accepted: 0, rejected: 0 },
    applicantsByOpportunity: []
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (oppFilter === 'job') return opp.type === 'job';
    if (oppFilter === 'internship') return opp.type === 'internship';
    return true;
  });

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR & COMPANY OVERVIEW ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono">
                <Building2 className="h-3.5 w-3.5" />
                <span>Corporate Talent Workspace</span>
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                company.verificationStatus === 'verified'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}>
                {company.verificationStatus === 'verified' ? '✓ Verified Partner' : '⏳ Pending Verification'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {company.companyName || user?.name || "Corporate Recruiter Portal"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {company.industry ? `${company.industry} • ` : ''}{company.location || 'Remote'} — Skill-driven recruitment, applicant screening, interview pipeline, and AI compatibility matching.
            </p>
          </div>

          {/* Top Actions: Refresh & Post */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
            <button
              onClick={() => openPostModal('job')}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold px-5 py-3 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/25"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ 1. OVERVIEW METRICS (REAL DATA) ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <span>Hiring Pipeline Overview</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Live MongoDB Synced</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Active Jobs", 
              val: stats.activeJobs, 
              sub: `${opportunities.filter(o => o.type === 'job').length} total posted`,
              icon: Briefcase,
              color: "emerald"
            },
            { 
              label: "Active Internships", 
              val: stats.activeInternships, 
              sub: `${opportunities.filter(o => o.type === 'internship').length} total posted`,
              icon: GraduationCap,
              color: "teal"
            },
            { 
              label: "Total Applicants", 
              val: stats.totalApplicants, 
              sub: "Across all active openings",
              icon: Users,
              color: "indigo"
            },
            { 
              label: "Shortlisted Students", 
              val: stats.shortlistedCount, 
              sub: `${stats.interviewCount} scheduled rounds`,
              icon: UserCheck,
              color: "purple"
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                  {card.val}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 5. QUICK ACTIONS ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center space-x-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>Quick Actions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => openPostModal('job')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition text-left space-y-1.5 cursor-pointer group shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="h-4 w-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Post Job</p>
            <p className="text-[10px] text-slate-400">Full-time hiring role</p>
          </button>

          <button
            onClick={() => openPostModal('internship')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:border-teal-300 dark:hover:border-teal-500/30 transition text-left space-y-1.5 cursor-pointer group shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">Post Internship</p>
            <p className="text-[10px] text-slate-400">Summer & winter tracks</p>
          </button>

          <button
            onClick={() => navigate('/opportunities')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition text-left space-y-1.5 cursor-pointer group shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="h-4 w-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Find Students</p>
            <p className="text-[10px] text-slate-400">Discover verified talent</p>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('recent-applicants-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition text-left space-y-1.5 cursor-pointer group shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">View Applicants</p>
            <p className="text-[10px] text-slate-400">{stats.totalApplicants} received</p>
          </button>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ RECOMMENDED CANDIDATES (SRS COMPLIANT) ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>Skill Compatibility Engine</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {recommendedCandidates.length} {recommendedCandidates.length === 1 ? 'Candidate' : 'Candidates'} Ranked
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-1">
              <Target className="h-5 w-5 text-emerald-500" />
              <span>Recommended Candidates</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Candidates matched automatically against active requirements using transparent weighted skill scoring, proficiency evaluation, academic eligibility, and career interests.
            </p>
          </div>

          {/* Role Filter / Selector */}
          {recOpportunities.length > 0 && (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Matching for:
              </span>
              <select
                value={selectedRecOppId}
                onChange={(e) => handleRecOppChange(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer shadow-xs max-w-xs truncate"
              >
                {recOpportunities.map(opp => (
                  <option key={opp._id} value={opp._id}>
                    {opp.title} ({opp.type === 'internship' ? 'Internship' : 'Job'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Target Opportunity Skills Bar */}
        {activeRecOpportunity && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Required Skills ({activeRecOpportunity.title}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeRecOpportunity.requiredSkills || []).map((sk, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {activeRecOpportunity.minCgpa && (
                <span>Min CGPA: <strong>{activeRecOpportunity.minCgpa}</strong></span>
              )}
              {activeRecOpportunity.eligibleBranches?.length > 0 && (
                <span>Branches: <strong>{activeRecOpportunity.eligibleBranches.slice(0, 2).join(', ')}</strong></span>
              )}
            </div>
          </div>
        )}

        {/* Candidates List / Grid */}
        {recLoading ? (
          <div className="p-12 glass-card rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Evaluating candidate skill DNA against active requirements...
            </p>
          </div>
        ) : !activeRecOpportunity ? (
          <div className="glass-card p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Active Job or Internship Openings
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Post your first opening to activate automatic candidate recommendations evaluated by the transparent Skill Matching Engine.
            </p>
            <button
              onClick={() => openPostModal('job')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Post Role to Get Recommendations
            </button>
          </div>
        ) : recommendedCandidates.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <Users className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              No Candidates Found Matching This Opening
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All candidates may have already been reviewed, or skill criteria can be broadened. Explore student talent directly via Student Search.
            </p>
            <button
              onClick={() => navigate('/company/students')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Browse All Students
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedCandidates.map(candidate => (
              <div
                key={candidate._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 hover:border-emerald-400/50 dark:hover:border-emerald-500/40 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar, Name, Education & Compatibility Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg shrink-0 overflow-hidden border border-emerald-500/20">
                        {candidate.avatarUrl ? (
                          <img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full object-cover" />
                        ) : (
                          candidate.name?.charAt(0) || 'C'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {candidate.name}
                          </h3>
                          {candidate.applicationStatus === 'shortlisted' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shrink-0">
                              Shortlisted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={candidate.education}>
                          {candidate.education}
                        </p>
                      </div>
                    </div>

                    {/* Compatibility Badge */}
                    <div className="text-right shrink-0">
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border inline-flex items-center space-x-1 ${
                        candidate.compatibilityPercentage >= 75
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : candidate.compatibilityPercentage >= 50
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>{candidate.compatibilityPercentage}% Match</span>
                      </div>
                      {candidate.cgpa !== null && (
                        <span className="text-[10px] text-slate-400 font-mono font-bold block mt-0.5">
                          CGPA: {candidate.cgpa}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compatibility Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        candidate.compatibilityPercentage >= 75
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : candidate.compatibilityPercentage >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${candidate.compatibilityPercentage}%` }}
                    />
                  </div>

                  {/* Matching & Missing Skills Block */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                    {/* Matching Skills */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Matching Skills ({candidate.matchedSkills?.length || 0})</span>
                        </span>
                      </div>
                      {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.matchedSkills.map((sk, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No exact matches yet</span>
                      )}
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        <span className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Missing Skills ({candidate.missingSkills?.length || 0})</span>
                        </span>
                        {candidate.isEligible !== undefined && (
                          <span className={`text-[9px] font-bold ${candidate.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                            {candidate.isEligible ? 'Eligible ✓' : 'Criteria Gap'}
                          </span>
                        )}
                      </div>
                      {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.missingSkills.map((sk, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold"
                            >
                              ⚠ {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          All required role skills satisfied!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Skills with Proficiency */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Key Candidate Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skillsList?.slice(0, 5).map((sk, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                        >
                          <span>{sk.name}</span>
                          {sk.proficiency && (
                            <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                              ({sk.proficiency.slice(0, 3)})
                            </span>
                          )}
                        </span>
                      ))}
                      {(candidate.skillsList?.length || 0) > 5 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                          +{candidate.skillsList.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Career Interests / Eligibility Alignment */}
                  {candidate.breakdown?.careerInterestMatch && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      <Target className="h-3 w-3 shrink-0" />
                      <span>Career Focus Aligned with Opening</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions: View Profile, Shortlist, Reject */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCandidateModal(candidate)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-indigo-500" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => handleShortlistCandidate(candidate)}
                    disabled={candidate.applicationStatus === 'shortlisted' || recActionLoadingId === candidate._id + '_shortlist'}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                      candidate.applicationStatus === 'shortlisted'
                        ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                    }`}
                  >
                    {recActionLoadingId === candidate._id + '_shortlist' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : candidate.applicationStatus === 'shortlisted' ? (
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
                    onClick={() => handleRejectCandidate(candidate)}
                    disabled={recActionLoadingId === candidate._id + '_reject'}
                    title="Reject candidate for this opening"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 transition cursor-pointer"
                  >
                    {recActionLoadingId === candidate._id + '_reject' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-500" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 2. MY OPPORTUNITIES ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              <span>My Opportunities</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live job and internship openings published by {company.companyName || 'your company'}.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/40 dark:border-slate-800 text-xs">
            {['all', 'job', 'internship'].map(tab => (
              <button
                key={tab}
                onClick={() => setOppFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer ${
                  oppFilter === tab
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Roles' : `${tab}s`}
              </button>
            ))}
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto">
              <Briefcase className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No opportunities found in this category.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first opening to attract candidates matched with SkillNexus AI Skill Intelligence.
            </p>
            <button
              onClick={() => openPostModal('job')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Post Opportunity Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map(opp => (
              <div 
                key={opp._id} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-400/40 dark:hover:border-emerald-500/30 transition shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                      opp.type === 'internship'
                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {opp.type}
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      opp.status === 'open' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      ● {opp.status === 'open' ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">{opp.title}</h4>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{opp.location || 'Remote'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>{opp.stipend || 'Competitive'}</span>
                    </span>
                  </div>

                  {/* Required Skills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(opp.requiredSkills || []).slice(0, 4).map((sk, sidx) => (
                      <span key={sidx} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {sk}
                      </span>
                    ))}
                    {(opp.requiredSkills || []).length > 4 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                        +{opp.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{opp.applicantCount} {opp.applicantCount === 1 ? 'Applicant' : 'Applicants'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(opp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 3. RECENT APPLICANTS ━━━━━━━━━━━━━━━━━━━━ */}
      <section id="recent-applicants-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Recent Applicants</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live candidate applications received across your openings.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{stats.totalApplicants} Total</span>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Users className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applicants yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              As students submit their applications and resumes, they will be listed here in real-time.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Candidate</th>
                    <th className="p-4">College & Degree</th>
                    <th className="p-4">Applied Role</th>
                    <th className="p-4">Skills Stack</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4 text-right">Recruitment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recentApplicants.map(app => (
                    <tr key={app._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {app.studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{app.studentName}</span>
                            <span className="text-[11px] text-slate-400">{app.studentEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-800 dark:text-slate-200 font-medium block">{app.college}</span>
                        {app.cgpa && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">CGPA: {app.cgpa}/10</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">{app.positionTitle}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{app.positionType}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.skills.map((sk, kidx) => (
                            <span key={kidx} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                          app.status === 'accepted'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : app.status === 'shortlisted'
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                            : app.status === 'reviewed'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-300'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 4. UPCOMING INTERVIEWS ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span>Upcoming Interviews</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live scheduled interview rounds for shortlisted & accepted candidates.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{upcomingInterviews.length} Scheduled</span>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Video className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No scheduled interviews yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When candidates are shortlisted or moved to the interview stage, their interview schedules and meeting links will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingInterviews.map(intv => (
              <div 
                key={intv._id} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-3 shadow-sm hover:border-purple-400/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {intv.round}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ● {intv.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{intv.studentName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{intv.positionTitle} ({intv.positionType})</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                    <span>{intv.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3.5 w-3.5 text-purple-500" />
                    <span>{intv.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-3.5 w-3.5 text-purple-500" />
                    <span>{intv.mode}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">{intv.studentEmail}</span>
                  <a
                    href={intv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>Launch Meet</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 6. HIRING INSIGHTS (REAL MONGODB METRICS) ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            <span>Hiring & Talent Insights</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real data metrics computed from applicants who applied to your corporate postings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* A. Most Common Skills among Applicants */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Top Applicant Skills
              </h3>
              <span className="text-[10px] font-mono text-emerald-500">Frequency</span>
            </div>

            {insights.commonSkills.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No applicant skill data available yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {insights.commonSkills.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{item.skill}</span>
                      <span className="font-mono text-slate-400">{item.count} {item.count === 1 ? 'student' : 'students'}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.totalApplicants)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. Applicants by Opportunity */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Applicants per Role
              </h3>
              <span className="text-[10px] font-mono text-emerald-500">{opportunities.length} Postings</span>
            </div>

            {insights.applicantsByOpportunity.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No opportunities created yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {insights.applicantsByOpportunity.map((opp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{opp.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{opp.type}</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0">
                      {opp.count} apps
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* C. Recruitment Stage Funnel */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Recruitment Funnel
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Conversion</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { stage: "Applied", count: insights.stageBreakdown.applied, color: "bg-slate-500" },
                { stage: "Reviewed", count: insights.stageBreakdown.reviewed, color: "bg-blue-500" },
                { stage: "Shortlisted", count: insights.stageBreakdown.shortlisted, color: "bg-indigo-500" },
                { stage: "Accepted / Offer", count: insights.stageBreakdown.accepted, color: "bg-emerald-500" },
                { stage: "Rejected", count: insights.stageBreakdown.rejected, color: "bg-rose-500" }
              ].map((stg, sidx) => (
                <div key={sidx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stg.color}`} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{stg.stage}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{stg.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ MODAL: CREATE OPPORTUNITY ━━━━━━━━━━━━━━━━━━━━ */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Post New {postType === 'internship' ? 'Internship' : 'Job Opening'}
                </h3>
                <p className="text-xs text-slate-400">Publish role to SkillNexus candidate talent network</p>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {postError}
              </div>
            )}
            {postSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {postSuccess}
              </div>
            )}

            <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Opportunity Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('job')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      postType === 'job'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Full-time Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('internship')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      postType === 'internship'
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Internship
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Node.js Developer"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Required Skills (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Node.js, Express, MongoDB, Docker, React"
                  value={postSkills}
                  onChange={(e) => setPostSkills(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Used by AI matching engine to rank applicant compatibility.</p>
              </div>

              {/* Location & Stipend */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Remote"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Compensation / Stipend
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 / month"
                    value={postStipend}
                    onChange={(e) => setPostStipend(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {postType === 'internship' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Internship Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={postDuration}
                    onChange={(e) => setPostDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500 transition"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Role Description *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Outline core responsibilities, key deliverables, and ideal candidate background..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  {posting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Role</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TOAST FEEDBACK NOTIFICATION ━━━━━━━━━━━━━━━━━━━━ */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/40 shadow-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ DETAILED CANDIDATE PROFILE MODAL (SRS COMPLIANT) ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedCandidateModal && (
        <CandidateProfileModal
          isOpen={Boolean(selectedCandidateModal)}
          onClose={() => setSelectedCandidateModal(null)}
          studentId={selectedCandidateModal._id || selectedCandidateModal.studentId}
          initialCandidate={selectedCandidateModal}
          opportunityId={selectedRecOppId || activeRecOpportunity?._id || ''}
          onShortlist={handleShortlistCandidate}
          onReject={handleRejectCandidate}
        />
      )}

    </div>
  );
}
