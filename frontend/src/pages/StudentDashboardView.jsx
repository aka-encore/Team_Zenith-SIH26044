import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Briefcase, 
  Award, TrendingUp, Cpu, Compass, Play, FileText, UserCheck, Calendar,
  ExternalLink, ChevronRight, Zap, Target, Loader2, RefreshCw, HelpCircle,
  ShieldCheck, Flame, Layers, Clock, MapPin, Building2, Check, X
} from 'lucide-react';

const SKILL_LEVEL_COLORS = {
  'Beginner': 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  'Intermediate': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Advanced': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'Expert': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
};

const STATUS_BADGES = {
  'applied': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'reviewed': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'shortlisted': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'accepted': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'rejected': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
};

export default function StudentDashboardView({ onNavigate }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // State from real MongoDB backend
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [skillGapData, setSkillGapData] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [readinessData, setReadinessData] = useState(null);
  const [showExplainability, setShowExplainability] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all real database data for student dashboard
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [profRes, oppsRes, appsRes, gapRes, assessRes, readyRes] = await Promise.all([
        fetch('/api/students/profile', { headers }),
        fetch('/api/opportunities', { headers }),
        fetch('/api/applications/my-applications', { headers }),
        fetch('/api/students/skill-gap', { headers }),
        fetch('/api/assessment/history', { headers }),
        fetch('/api/students/readiness-score', { headers })
      ]);

      const profData = await profRes.json();
      const oppsData = await oppsRes.json();
      const appsData = await appsRes.json();
      const gapData = await gapRes.json();
      const assessData = await assessRes.json();
      const readyData = await readyRes.json();

      if (profData.success) setProfile(profData.profile || null);
      if (oppsData.success) setOpportunities(oppsData.opportunities || []);
      if (appsData.success) setApplications(appsData.applications || []);
      if (gapData.success) setSkillGapData(gapData);
      if (assessData.success) setAssessmentHistory(assessData.history || []);
      if (readyData.success) setReadinessData(readyData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg('Failed to load live dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // 1. Calculate Real Profile Completion
  const computeProfileCompletion = (p) => {
    if (!p) return 0;
    let score = 0;
    const uName = p.userId?.name || user?.name;
    if (uName && uName.trim()) score += 15;
    if (p.phone && p.phone.trim()) score += 10;
    if (p.bio && p.bio.trim()) score += 10;
    if (p.academicInformation?.college && p.academicInformation?.department) score += 20;
    if (p.academicInformation?.cgpa) score += 10;
    if ((p.skillsList && p.skillsList.length > 0) || (p.skills && p.skills.length > 0)) score += 15;
    if (p.projects && p.projects.length > 0) score += 10;
    if (p.certifications && p.certifications.length > 0) score += 5;
    if (p.resumeUrl && p.resumeUrl.trim()) score += 5;
    return Math.min(100, score);
  };

  const profileCompletion = computeProfileCompletion(profile);

  // 2. Student Details
  const studentName = profile?.userId?.name || user?.name || "Student";
  const collegeName = profile?.academicInformation?.college || "SkillNexus AI Institute";
  const departmentName = profile?.academicInformation?.department || profile?.academicInformation?.branch || "Computer Science";
  const yearText = profile?.academicInformation?.year ? `${profile.academicInformation.year}` : "Enrolled";

  // 3. Top Skills
  const rawSkillsList = profile?.skillsList || [];
  const flatSkills = profile?.skills || [];
  const structuredSkills = rawSkillsList.length > 0
    ? rawSkillsList
    : flatSkills.map(s => ({ name: s, proficiency: 'Intermediate', category: 'Technical' }));

  // Sort top skills by proficiency weight (Expert > Advanced > Intermediate > Beginner)
  const proficiencyWeights = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
  const topSkills = [...structuredSkills].sort((a, b) => 
    (proficiencyWeights[b.proficiency] || 2) - (proficiencyWeights[a.proficiency] || 2)
  );

  // 4. Recommended Opportunities (sorted by Skill Matching Engine matchPercentage descending)
  const recommendedOpportunities = [...opportunities].sort((a, b) => 
    (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
  );

  // 5. Recent Applications
  const recentApplications = applications.slice(0, 5);

  // 6. Upcoming Interviews (Candidates in 'shortlisted' or 'accepted' state)
  const upcomingInterviews = applications.filter(app => 
    ['shortlisted', 'accepted'].includes((app.status || '').toLowerCase())
  );

  // 7. Placement Status
  const hasPlaced = applications.some(a => (a.status || '').toLowerCase() === 'accepted');
  const hasShortlisted = applications.some(a => (a.status || '').toLowerCase() === 'shortlisted');
  const hasApplied = applications.length > 0;

  const placementStatusText = hasPlaced
    ? 'Offer Extended / Selected'
    : hasShortlisted
    ? 'In Interview Pipeline'
    : hasApplied
    ? `Active Applicant (${applications.length} applied)`
    : 'Profile Open / Ready to Apply';

  const placementStatusColor = hasPlaced
    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
    : hasShortlisted
    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
    : hasApplied
    ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          Connecting to Real Database Data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-7xl mx-auto">
      
      {/* ── 1. MODERN HEADER BANNER WITH REAL PROFILE COMPLETION ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{collegeName} • {departmentName} ({yearText})</span>
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${placementStatusColor}`}>
              {placementStatusText}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
            Track your verified skills, job recommendations, application statuses, and interview schedules in real time.
          </p>
        </div>

        {/* Action buttons & Refresh */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/opportunities')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <Briefcase className="h-4 w-4" />
            <span>Discover Jobs</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <span>Edit Profile</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── 2. CAREER READINESS SCORE & EXPLAINABILITY ENGINE ── */}
      {readinessData && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900 dark:to-[#0c1222] shadow-xl space-y-6 text-left">
          
          {/* Header & Overall Score Gauge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>AI Career Intelligence Engine</span>
                </span>
                <span className={`text-xs px-3 py-0.5 rounded-full font-extrabold font-mono border ${readinessData.tierColor}`}>
                  ● {readinessData.tier}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Career Readiness Score
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Calculated dynamically from your verified skills, technical assessment scores, active projects, certifications, resume, and academic metrics.
              </p>
            </div>

            {/* Score Number & Quick Action */}
            <div className="flex items-center space-x-6 shrink-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl sm:text-6xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {readinessData.score}
                </span>
                <span className="text-lg font-mono text-slate-400 font-bold">/100</span>
              </div>

              <button
                onClick={() => setShowExplainability(prev => !prev)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <HelpCircle className="h-4 w-4 text-indigo-500" />
                <span>{showExplainability ? 'Hide Breakdown' : 'Why is my score this?'}</span>
              </button>
            </div>
          </div>

          {/* 6 Pillar Readiness Progress Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            {/* 1. Skill Strength */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Skill Strength</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.skillStrength.score}/25</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${readinessData.breakdown.skillStrength.percentage}%` }} />
              </div>
            </div>

            {/* 2. Assessment Strength */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Assessment</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.assessmentStrength.score}/20</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${readinessData.breakdown.assessmentStrength.percentage}%` }} />
              </div>
            </div>

            {/* 3. Project Strength */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Projects</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.projectStrength.score}/20</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readinessData.breakdown.projectStrength.percentage}%` }} />
              </div>
            </div>

            {/* 4. Profile & Resume */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Resume/Profile</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.profileCompleteness.score}/15</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readinessData.breakdown.profileCompleteness.percentage}%` }} />
              </div>
            </div>

            {/* 5. Academic Standing */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Academic CGPA</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.academicStanding.score}/10</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${readinessData.breakdown.academicStanding.percentage}%` }} />
              </div>
            </div>

            {/* 6. Certifications */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Certifications</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{readinessData.breakdown.certifications.score}/10</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${readinessData.breakdown.certifications.percentage}%` }} />
              </div>
            </div>

          </div>

          {/* ── EXPANDABLE: "WHY IS MY SCORE THIS?" ── */}
          {showExplainability && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-indigo-500/20 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Score Explainability & Diagnostic Factors
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Positive Score Drivers */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Factors Boosting Your Score</span>
                  </span>
                  <div className="space-y-1.5">
                    {readinessData.explainability.positiveFactors.map((factor, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="font-medium">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvement Areas & Missing Sections */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>How To Increase Your Score</span>
                  </span>
                  <div className="space-y-1.5">
                    {readinessData.explainability.improvementAreas.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">▲</span>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}

                    {readinessData.explainability.missingSections.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-bold">Missing Sections:</span>
                        {readinessData.explainability.missingSections.map((sec, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ── 3. METRICS OVERVIEW: PROFILE COMPLETION, PLACEMENT STATUS, APPLICATIONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Profile Completion Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Profile Completion</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">{profileCompletion}%</span>
              <span className="text-xs text-slate-400 font-medium">{profileCompletion === 100 ? 'Fully Completed' : 'In Progress'}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>{profileCompletion < 100 ? 'Complete Missing Fields' : 'Manage Profile Details'}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Placement Status Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Placement Status</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
              {hasPlaced ? 'Offer Secured 🎉' : hasShortlisted ? 'Shortlisted' : 'Active Seeker'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {placementStatusText}
            </span>
          </div>
          <div className="pt-1 text-[11px] text-slate-400 font-mono">
            {applications.length} Total Submissions
          </div>
        </div>

        {/* Active Applications Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">My Applications</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{applications.length}</span>
              <span className="text-xs text-slate-400 font-medium">applications</span>
            </div>
            <span className="text-xs text-slate-500 block mt-1">
              {upcomingInterviews.length} in interview stages
            </span>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Skill Gap Readiness Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Skill Gap Readiness</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {skillGapData?.matchPercentage ?? 0}%
              </span>
              <span className="text-xs text-slate-400 font-medium">role match</span>
            </div>
            <span className="text-xs text-slate-500 block mt-1">
              {skillGapData?.missingSkills?.length ?? 0} missing skills identified
            </span>
          </div>
          <button
            onClick={() => navigate('/skill-gap')}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>Analyze Skill Gap</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* ── 3. TOP SKILLS & SKILL MATRIX SECTION ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-indigo-500" />
              <span>Top Verified Skills ({topSkills.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Skills stored in your profile and used by the Skill Matching Engine.</p>
          </div>

          <button
            onClick={() => navigate('/skills')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Manage Skills</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {topSkills.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Layers className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No skills added yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add skills to your profile or take assessments to unlock automated job compatibility matching.
              </p>
            </div>
            <button
              onClick={() => navigate('/skills')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topSkills.slice(0, 6).map((s, idx) => {
              const level = s.proficiency || 'Intermediate';
              const levelColor = SKILL_LEVEL_COLORS[level] || SKILL_LEVEL_COLORS['Beginner'];

              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5 text-center">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{s.name}</h4>
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-mono border ${levelColor}`}>
                    {level}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. RECOMMENDED JOBS & INTERNSHIPS (MATCHING ENGINE) ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span>Recommended Opportunities For You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Matched in real time using the Skill Matching Engine based on your profile skills.
            </p>
          </div>

          <button
            onClick={() => navigate('/opportunities')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Explore All ({opportunities.length})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recommendedOpportunities.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Briefcase className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active job postings available</h4>
            <p className="text-xs text-slate-500">Check back soon for newly posted openings from verified employers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedOpportunities.slice(0, 3).map((opp) => (
              <div
                key={opp._id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:border-indigo-400/40 transition text-left"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                      {opp.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      (opp.matchPercentage ?? 0) >= 75
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : (opp.matchPercentage ?? 0) >= 50
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {opp.matchPercentage ?? 0}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{opp.title}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {opp.companyId?.companyName || opp.companyName || 'Corporate Partner'}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(opp.requiredSkills || []).slice(0, 3).map((sk, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {sk}
                      </span>
                    ))}
                    {(opp.requiredSkills || []).length > 3 && (
                      <span className="text-[9px] font-mono text-slate-400">
                        +{(opp.requiredSkills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">{opp.stipend || opp.location || 'Competitive'}</span>
                  <button
                    onClick={() => navigate('/opportunities')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Role</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. RECENT APPLICATIONS & UPCOMING INTERVIEWS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Applications Table */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span>Recent Applications ({applications.length})</span>
            </h3>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 font-medium">You haven't submitted any applications yet.</p>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Browse open jobs & internships
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentApplications.map((app) => {
                const opp = app.opportunityId || {};
                const status = (app.status || 'applied').toLowerCase();
                const badgeColor = STATUS_BADGES[status] || STATUS_BADGES['applied'];

                return (
                  <div key={app._id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{opp.title || 'Applied Role'}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {opp.companyId?.companyName || 'Corporate Partner'} • {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${badgeColor} shrink-0`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews & Next Milestones */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>Upcoming Interviews & Status ({upcomingInterviews.length})</span>
            </h3>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 font-medium">No upcoming interviews scheduled yet.</p>
              <p className="text-[11px] text-slate-400">
                When recruiters shortlist your profile, interview updates will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingInterviews.map((app) => {
                const opp = app.opportunityId || {};
                const isOffer = (app.status || '').toLowerCase() === 'accepted';

                return (
                  <div key={app._id} className="p-3.5 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white">{opp.title || 'Role Interview'}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{opp.companyId?.companyName || 'Recruiter'}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        {isOffer ? 'Offer Extended' : 'Shortlisted for Round 1'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-emerald-500/10">
                      <span>Status: {app.status}</span>
                      <span>Updated: {new Date(app.updatedAt || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
