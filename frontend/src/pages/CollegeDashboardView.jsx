import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, GraduationCap, Briefcase, Sparkles, BarChart3, 
  Layers, ArrowUpRight, CheckCircle2, AlertTriangle, BookOpen, ChevronRight,
  RefreshCw, AlertCircle, Award, Target, Clock, ExternalLink, Cpu,
  CheckCircle, UserCheck, TrendingUp, PieChart, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollegeDashboardView() {
  const { token, user } = useAuth();

  // Data & Loading State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/faculty/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve institutional analytics.');
      }

      setData(resData);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
      setErrorMsg(err.message || 'Unable to connect to database server.');
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4 text-left">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Loading Institutional Intelligence Dashboard...
        </span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-card p-10 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm text-left">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Unable to Load Dashboard</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    completedProfiles: 0,
    uniqueSkillsCount: 0,
    totalSkillInstances: 0,
    activeInternships: 0,
    activeJobs: 0,
    totalOpportunities: 0,
    placementCount: 0,
    placementRate: 0,
    activeApplicantsCount: 0,
    notAppliedCount: 0
  };

  const topSkills = data?.topSkills || [];
  const recentActivity = data?.recentActivity || [];
  const placementBreakdown = data?.placementBreakdown || {
    placed: 0,
    activeApplicants: 0,
    notApplied: 0
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BANNER ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Academic & Institutional Command Center</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Skill & Placement Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Real-time analytics on student competencies, corporate hiring readiness, and department placement performance.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Intelligence Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <Link
            to="/skill-gap"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Skill Gap Analysis</span>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ 6 CORE STATS CARDS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* 1. Total Students */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalStudents}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Enrolled in system</div>
        </div>

        {/* 2. Completed Profiles */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profiles Built</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.completedProfiles}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {stats.totalStudents > 0 ? Math.round((stats.completedProfiles / stats.totalStudents) * 100) : 0}% completion
          </div>
        </div>

        {/* 3. Total Skills Recorded */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Skills DNA</span>
            <Cpu className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {stats.uniqueSkillsCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">{stats.totalSkillInstances} total tags</div>
        </div>

        {/* 4. Active Internships */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Internships</span>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.activeInternships}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Live campus postings</div>
        </div>

        {/* 5. Active Jobs */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Openings</span>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {stats.activeJobs}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Full-time opportunities</div>
        </div>

        {/* 6. Placement Count & Rate */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Placements</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.placementCount}
          </div>
          <div className="text-[10px] text-emerald-500 font-bold font-mono">{stats.placementRate}% overall rate</div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SKILLS DISTRIBUTION & PLACEMENT STATUS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TOP SKILLS IN THE DEPARTMENT (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <span>Top Technical Skills in Department</span>
              </h3>
              <p className="text-xs text-slate-400">
                Most prevalent technologies verified across student profiles
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {topSkills.length} Core Areas
            </span>
          </div>

          {topSkills.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No technical skills recorded yet across students.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topSkills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>{skill.name}</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {skill.count} students ({skill.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, skill.percentage || 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CURRENT PLACEMENT BREAKDOWN (1 Col) */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-col justify-between space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-emerald-500" />
              <span>Current Placement Status</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of cohort placement stages
            </p>
          </div>

          <div className="space-y-3.5">
            
            {/* Placed */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="font-extrabold text-slate-900 dark:text-white">Placed Candidates</span>
              </div>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {placementBreakdown.placed}
              </span>
            </div>

            {/* Active in Pipeline */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-extrabold text-slate-900 dark:text-white">Active in Pipeline</span>
              </div>
              <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                {placementBreakdown.activeApplicants}
              </span>
            </div>

            {/* Not Yet Applied */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="font-extrabold text-slate-700 dark:text-slate-300">Not Applied Yet</span>
              </div>
              <span className="text-base font-black font-mono text-slate-600 dark:text-slate-400">
                {placementBreakdown.notApplied}
              </span>
            </div>

          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/opportunities"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <span>Explore Active Drives</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ RECENT STUDENT ACTIVITY STREAM ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Recent Student Activity & Applications</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live updates from student applications and corporate recruiter shortlists
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Stream</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No recent student activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentActivity.map((act) => {
              const actDate = act.date ? new Date(act.date) : new Date();

              return (
                <div key={act._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {act.avatarUrl ? (
                        <img src={act.avatarUrl} alt={act.studentName} className="w-full h-full object-cover" />
                      ) : (
                        act.studentName?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {act.studentName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Targeted <strong className="text-slate-700 dark:text-slate-300">{act.opportunityTitle}</strong> ({act.opportunityType})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      act.status === 'accepted'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : act.status === 'shortlisted'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}>
                      ● {act.status}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {actDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
