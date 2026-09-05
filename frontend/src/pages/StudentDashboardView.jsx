import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Briefcase, 
  Award, TrendingUp, Cpu, Compass, Play, FileText, UserCheck, Calendar,
  ExternalLink, ChevronRight, Zap, Target, Loader2, RefreshCw, HelpCircle,
  ShieldCheck, Flame, Layers, Clock, MapPin, Building2, Check, X, Code2,
  Video, HelpCircle as QuestionIcon
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

export default function StudentDashboardView() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Real MongoDB backend states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [skillGapData, setSkillGapData] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [showExplainability, setShowExplainability] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Persistent Real Prep & Mock Interview Progress
  const [prepSubmissions, setPrepSubmissions] = useState({});
  const [mockAttempts, setMockAttempts] = useState([]);

  const uid = user?.id || 'guest';

  // Fetch real database data for student dashboard
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [profRes, oppsRes, appsRes, gapRes, readyRes] = await Promise.all([
        fetch('/api/students/profile', { headers }),
        fetch('/api/opportunities', { headers }),
        fetch('/api/applications/my-applications', { headers }),
        fetch('/api/students/skill-gap', { headers }),
        fetch('/api/students/readiness-score', { headers })
      ]);

      const profData = await profRes.json();
      const oppsData = await oppsRes.json();
      const appsData = await appsRes.json();
      const gapData = await gapRes.json();
      const readyData = await readyRes.json();

      if (profData.success) setProfile(profData.profile || null);
      if (oppsData.success) setOpportunities(oppsData.opportunities || []);
      if (appsData.success) setApplications(appsData.applications || []);
      if (gapData.success) setSkillGapData(gapData);
      if (readyData.success) setReadinessData(readyData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg('Failed to load dashboard data. Please check your network connection.');
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

  // Load real preparation progress & mock interview history
  useEffect(() => {
    try {
      const savedSubs = localStorage.getItem(`zenith_prep_subs_${uid}`);
      if (savedSubs) {
        setPrepSubmissions(JSON.parse(savedSubs));
      }
      const savedAttempts = localStorage.getItem(`zenith_mock_attempts_${uid}`);
      if (savedAttempts) {
        setMockAttempts(JSON.parse(savedAttempts));
      }
    } catch (e) {
      console.error('Error loading prep progress:', e);
    }
  }, [uid]);

  // 1. Student Identity & Details
  const studentName = profile?.userId?.name || user?.name || "Student";
  const collegeName = profile?.academicInformation?.college || "Academic Institute";
  const departmentName = profile?.academicInformation?.department || profile?.academicInformation?.branch || "Engineering";
  const yearText = profile?.academicInformation?.year ? `Year ${profile.academicInformation.year}` : "Enrolled";

  // 2. Verified Profile Skills
  const rawSkillsList = profile?.skillsList || [];
  const flatSkills = profile?.skills || [];
  const structuredSkills = (rawSkillsList.length > 0 ? rawSkillsList : flatSkills).map(s => {
    if (typeof s === 'string') return { name: s, proficiency: 'Intermediate' };
    const name = typeof s?.name === 'string' ? s.name : (s?.skill || (typeof s === 'object' ? Object.values(s).filter(v => typeof v === 'string').join('') : 'Skill'));
    return {
      name: name || 'Skill',
      proficiency: s?.proficiency || s?.proficiencyLevel || 'Intermediate'
    };
  });

  const proficiencyWeights = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
  const verifiedSkills = [...structuredSkills].sort((a, b) => 
    (proficiencyWeights[b.proficiency] || 2) - (proficiencyWeights[a.proficiency] || 2)
  );

  // 3. Recommended Opportunities sorted by Match Percentage
  const recommendedOpportunities = [...opportunities].sort((a, b) => 
    (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
  );

  // 4. Upcoming Interviews (Applications in shortlisted or accepted state)
  const upcomingInterviews = applications.filter(app => 
    ['shortlisted', 'accepted'].includes((app.status || '').toLowerCase())
  );

  // 5. Recent Applications
  const recentApplications = applications.slice(0, 6);

  // 6. Solved DSA Questions Count
  const solvedProblemCount = Object.keys(prepSubmissions).length;
  const recentMockAttempt = mockAttempts.length > 0 ? mockAttempts[0] : null;

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Loading Student Dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1550px] mx-auto space-y-10 pb-24 text-left px-4 sm:px-8 font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      
      {/* ══════════════════════════════════════════════════════════════
          1. WELCOME + SHORT CAREER MESSAGE
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {collegeName} • {departmentName} ({yearText})
              </span>
              {upcomingInterviews.length > 0 && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {upcomingInterviews.length} Active Interview Pipeline
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {studentName} 👋
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              You currently have <strong className="text-slate-900 dark:text-white font-bold">{applications.length} submitted applications</strong> and <strong className="text-slate-900 dark:text-white font-bold">{opportunities.length} open opportunities</strong> matching your profile. Keep your skills updated and practice company-specific mock interviews to maximize your readiness.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/opportunities')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              <span>Discover Opportunities</span>
            </button>

            <button
              onClick={() => navigate('/company-prep')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Code2 className="h-4 w-4" />
              <span>Company Preparation</span>
            </button>
          </div>

        </div>
      </section>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. CAREER READINESS SCORE & EXPLAINABILITY
          ══════════════════════════════════════════════════════════════ */}
      {readinessData ? (
        <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Assessment Engine
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase border ${readinessData.tierColor}`}>
                  ● {readinessData.tier}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                2. Career Readiness Score
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Calculated dynamically from verified profile skills, assessments, project portfolios, academic records, and certifications.
              </p>
            </div>

            {/* Score Metric & Explainability Toggle */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {readinessData.score}
                </span>
                <span className="text-base font-bold text-slate-400">/ 100</span>
              </div>

              <button
                onClick={() => setShowExplainability(prev => !prev)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{showExplainability ? 'Hide Factor Details' : 'View Score Factors'}</span>
              </button>
            </div>
          </div>

          {/* 6 Key Pillar Progress Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Skills</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.skillStrength.score}/25
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.skillStrength.percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Assessments</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.assessmentStrength.score}/20
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.assessmentStrength.percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Projects</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.projectStrength.score}/20
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.projectStrength.percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Profile & Resume</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.profileCompleteness.score}/15
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.profileCompleteness.percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Academics</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.academicStanding.score}/10
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.academicStanding.percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Certificates</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {readinessData.breakdown.certifications.score}/10
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${readinessData.breakdown.certifications.percentage}%` }} />
              </div>
            </div>

          </div>

          {/* Explainability Breakdown */}
          {showExplainability && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Score Diagnostics & Actionable Factors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Positive Drivers */}
                <div className="space-y-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wider block">
                    Positive Factors
                  </span>
                  <div className="space-y-1.5">
                    {readinessData.explainability.positiveFactors.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="space-y-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-wider block">
                    Recommended Improvements
                  </span>
                  <div className="space-y-1.5">
                    {readinessData.explainability.improvementAreas.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      ) : (
        <section className="bg-white dark:bg-[#0E1117] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center py-12 space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Career Readiness data is currently unavailable.
          </p>
          <button
            onClick={() => fetchDashboardData(true)}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            Click to refresh readiness score
          </button>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. SKILLS & SKILL GAP
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              3. Skills & Skill Gap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Verified skills in your profile and benchmarked gaps against target industry roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/skills')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Manage Skills
            </button>
            <button
              onClick={() => navigate('/skill-gap')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              Full Skill Gap Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Verified Skills (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Profile Skills ({verifiedSkills.length})
            </h3>

            {verifiedSkills.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 font-medium">No verified skills added to your profile yet.</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer transition"
                >
                  Add Skills in Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {verifiedSkills.map((s, idx) => {
                  const skillTitle = typeof s?.name === 'string' ? s.name : (typeof s === 'string' ? s : 'Skill');
                  const lvl = typeof s?.proficiency === 'string' ? s.proficiency : 'Intermediate';
                  const lvlColor = SKILL_LEVEL_COLORS[lvl] || SKILL_LEVEL_COLORS['Beginner'];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-left"
                    >
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{skillTitle}</h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${lvlColor}`}>
                        {lvl}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Real Skill Gap Status (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Role Benchmark
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {skillGapData?.matchPercentage ?? 0}% Match
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {skillGapData?.targetRole || 'Software Engineering / Full Stack'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Skill Matching Engine compatibility score
              </p>
            </div>

            {skillGapData?.missingSkills && skillGapData.missingSkills.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  Identified Missing Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillGapData.missingSkills.map((sk, idx) => {
                    const skName = typeof sk === 'string' ? sk : (sk?.name || sk?.skill || 'Skill');
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        {skName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No major skill gaps identified for your current profile skills.
              </p>
            )}

            <button
              onClick={() => navigate('/skill-gap')}
              className="w-full py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition flex items-center justify-center gap-1"
            >
              <span>Explore Targeted Skill Roadmaps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. RECOMMENDED OPPORTUNITIES
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              4. Recommended Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Verified job and internship postings matched against your skills from the database.
            </p>
          </div>

          <button
            onClick={() => navigate('/opportunities')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All ({opportunities.length})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recommendedOpportunities.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Briefcase className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No open opportunities available right now</h4>
            <p className="text-xs text-slate-500">Newly posted opportunities from verified employers will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedOpportunities.slice(0, 3).map((opp) => {
              const matchPct = opp.matchPercentage ?? 0;
              return (
                <div
                  key={opp._id}
                  className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {opp.type || 'Full Time'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        matchPct >= 75
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : matchPct >= 50
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {matchPct}% Match
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {opp.companyId?.companyName || opp.companyName || 'Corporate Partner'} • {opp.location || 'Remote / Hybrid'}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(opp.requiredSkills || []).slice(0, 3).map((sk, sIdx) => {
                        const skName = typeof sk === 'string' ? sk : (sk?.name || sk?.skill || 'Skill');
                        return (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-mono"
                          >
                            {skName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {opp.stipend || 'Competitive Salary'}
                    </span>
                    <button
                      onClick={() => navigate('/opportunities')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition hover:opacity-90 flex items-center gap-1"
                    >
                      <span>View Role</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. COMPANY PREPARATION PROGRESS
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              5. Company Preparation Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Track your solved DSA questions, progressive curriculum mastery, and mock interview performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/company-prep')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition cursor-pointer"
            >
              Continue DSA Prep
            </button>
            <button
              onClick={() => navigate('/mock-interview')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              Take Mock Interview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* DSA Practice Card */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">DSA Learning & Practice</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {solvedProblemCount} Solved
              </h3>
              <p className="text-xs text-slate-500">
                Beginner → Intermediate → Advanced progressive curriculum
              </p>
            </div>

            <button
              onClick={() => navigate('/company-prep')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Practice DSA Questions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Latest Mock Interview Attempt */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Latest Mock Assessment</span>
              {recentMockAttempt ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      recentMockAttempt.isPassed
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                    }`}>
                      {recentMockAttempt.isPassed ? 'PASSED' : 'NEEDS WORK'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {recentMockAttempt.companyName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Score: {recentMockAttempt.score}% • {recentMockAttempt.passedCount}/{recentMockAttempt.totalCount} cleared
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No mock attempts yet</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Take your first company mock assessment to test readiness.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/mock-interview')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>{recentMockAttempt ? 'View Mock Results & History' : 'Start Mock Interview'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Total Mock Attempts Count */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Mock Assessments</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {mockAttempts.length} Completed
              </h3>
              <p className="text-xs text-slate-500">
                Proctored evaluations under active camera & countdown timer
              </p>
            </div>

            <button
              onClick={() => navigate('/mock-interview')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Manage Mock Assessments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. UPCOMING INTERVIEWS
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              6. Upcoming Interviews ({upcomingInterviews.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Active candidate shortlists and scheduled employer interview rounds.
            </p>
          </div>
        </div>

        {upcomingInterviews.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No upcoming interviews scheduled yet</h4>
            <p className="text-xs text-slate-500">When recruiters shortlist your profile, scheduled interview updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((app) => {
              const opp = app.opportunityId || {};
              const isOffer = (app.status || '').toLowerCase() === 'accepted';
              return (
                <div
                  key={app._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {opp.title || 'Technical Interview'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {opp.companyId?.companyName || 'Employer Partner'} • Updated {new Date(app.updatedAt || app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase self-start sm:self-auto border ${
                    isOffer
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  }`}>
                    {isOffer ? 'Offer Extended' : 'Shortlisted for Interview'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. RECENT APPLICATIONS
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#0E1117] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              7. Recent Applications ({applications.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Track the status of your submitted job and internship applications.
            </p>
          </div>

          <button
            onClick={() => navigate('/applications')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Applications</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <FileText className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">You haven't applied to any opportunities yet</h4>
            <p className="text-xs text-slate-500">Explore open opportunities and submit applications to start your placement journey.</p>
            <button
              onClick={() => navigate('/opportunities')}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer transition mt-2"
            >
              Browse Open Opportunities
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentApplications.map((app) => {
              const opp = app.opportunityId || {};
              const st = (app.status || 'applied').toLowerCase();
              const badgeColor = STATUS_BADGES[st] || STATUS_BADGES['applied'];

              return (
                <div
                  key={app._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {opp.title || 'Submitted Application'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {opp.companyId?.companyName || 'Corporate Partner'} • Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase border ${badgeColor} shrink-0`}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
