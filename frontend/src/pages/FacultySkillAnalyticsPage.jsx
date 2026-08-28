import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, Cpu, Users, Award, TrendingUp, AlertTriangle, 
  Layers, RefreshCw, AlertCircle, ArrowLeft, ChevronRight, 
  Sparkles, CheckCircle2, PieChart, Target, Zap, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultySkillAnalyticsPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Skill Search filter
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Fetch Skills Analytics from MongoDB
  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/faculty/skills-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve skill analytics.');
      }

      setData(resData);
    } catch (err) {
      console.error('Error loading skills analytics:', err);
      setErrorMsg(err.message || 'Unable to connect to analytics service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4 text-left">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Computing Cohort Skill Analytics & Market Vectors...
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
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Analytics Unavailable</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => fetchAnalytics(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const mostCommonSkills = data?.mostCommonSkills || [];
  const departmentDistribution = data?.departmentDistribution || [];
  const proficiencyDistribution = data?.proficiencyDistribution?.counts || {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0
  };
  const totalProficiencyCount = data?.proficiencyDistribution?.total || 0;
  const skillGaps = data?.skillGaps || [];
  const totalStudents = data?.totalStudents || 0;
  const totalSkillsRecorded = data?.totalSkillsRecorded || 0;

  // Filter skills by search query
  const filteredSkills = mostCommonSkills.filter(sk =>
    sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/faculty" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <BarChart3 className="h-7 w-7 text-purple-500" />
            <span>Institutional Skill Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cohort technical competency breakdown, proficiency distributions, and live market deficit analysis.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
          </button>

          <Link
            to="/skill-gap"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-purple-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>View Syllabus Recommendations</span>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SUMMARY METRIC CARDS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students Analyzed</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalStudents}
          </div>
          <div className="text-[10px] text-slate-400">Active cohort profiles</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unique Technologies</span>
            <Cpu className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {totalSkillsRecorded}
          </div>
          <div className="text-[10px] text-slate-400">Total skills tagged</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Market Deficits</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {skillGaps.length}
          </div>
          <div className="text-[10px] text-slate-400">Required corporate gaps</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Departments Mapped</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {departmentDistribution.length}
          </div>
          <div className="text-[10px] text-slate-400">Academic branches</div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ PROFICIENCY LEVEL DISTRIBUTION BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              <span>Skill Proficiency Level Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated proficiency tiers across all verified student competencies
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total {totalProficiencyCount} Tags
          </span>
        </div>

        {totalProficiencyCount === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No proficiency records found across student profiles.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Strip */}
            <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner bg-slate-200 dark:bg-slate-800">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${(proficiencyDistribution.Beginner / totalProficiencyCount) * 100}%` }}
                title={`Beginner: ${proficiencyDistribution.Beginner}`}
              />
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${(proficiencyDistribution.Intermediate / totalProficiencyCount) * 100}%` }}
                title={`Intermediate: ${proficiencyDistribution.Intermediate}`}
              />
              <div 
                className="bg-purple-500 h-full transition-all duration-500" 
                style={{ width: `${(proficiencyDistribution.Advanced / totalProficiencyCount) * 100}%` }}
                title={`Advanced: ${proficiencyDistribution.Advanced}`}
              />
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${(proficiencyDistribution.Expert / totalProficiencyCount) * 100}%` }}
                title={`Expert: ${proficiencyDistribution.Expert}`}
              />
            </div>

            {/* Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Beginner</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                  {proficiencyDistribution.Beginner}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((proficiencyDistribution.Beginner / totalProficiencyCount) * 100)}% of total
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Intermediate</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                  {proficiencyDistribution.Intermediate}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((proficiencyDistribution.Intermediate / totalProficiencyCount) * 100)}% of total
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Advanced</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                  {proficiencyDistribution.Advanced}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((proficiencyDistribution.Advanced / totalProficiencyCount) * 100)}% of total
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Expert</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                  {proficiencyDistribution.Expert}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((proficiencyDistribution.Expert / totalProficiencyCount) * 100)}% of total
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ MOST COMMON SKILLS & SKILL-WISE STUDENT COUNT ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SKILLS TABLE / LIST (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span>Skill-Wise Student Count & Prevalence</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ranked by student adoption rate across the institution
              </p>
            </div>

            <input
              type="text"
              placeholder="Search skill (e.g. React)..."
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 w-48"
            />
          </div>

          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No skills found matching "{skillSearchQuery}".
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSkills.map((sk, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-black flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {sk.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-xs">
                        {sk.count} Students ({sk.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, sk.percentage || 10)}%` }}
                    />
                  </div>

                  {/* Proficiency Breakdown Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                    {sk.levels.Beginner > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                        {sk.levels.Beginner} Beginner
                      </span>
                    )}
                    {sk.levels.Intermediate > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                        {sk.levels.Intermediate} Intermediate
                      </span>
                    )}
                    {sk.levels.Advanced > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                        {sk.levels.Advanced} Advanced
                      </span>
                    )}
                    {sk.levels.Expert > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        {sk.levels.Expert} Expert
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP SKILL GAPS IN MARKET (1 Col) */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-amber-500" />
                <span>Market Demand vs Skill Deficits</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Skills required by recruiters with low student mastery
              </p>
            </div>

            {skillGaps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No market deficit gaps identified.
              </div>
            ) : (
              <div className="space-y-3">
                {skillGaps.map((gap, gIdx) => (
                  <div 
                    key={gIdx}
                    className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {gap.skill}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        gap.priority === 'Critical Deficit'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {gap.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{gap.demandCount} Active Openings</span>
                      <span className="font-bold text-rose-500">{gap.deficitPercentage}% Deficit</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full" 
                        style={{ width: `${gap.deficitPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/skill-gap"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Curriculum Upgrade Plan</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ DEPARTMENT-WISE SKILL DISTRIBUTION ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            <span>Department-Wise Skill Distribution</span>
          </h3>
          <p className="text-xs text-slate-400">
            Technical specialization across academic departments and tracks
          </p>
        </div>

        {departmentDistribution.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No departmental data recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentDistribution.map((dept, dIdx) => (
              <div 
                key={dIdx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {dept.department}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                    {dept.studentCount} Students
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Core Technical Stack:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.topSkills.map((sk, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center space-x-1"
                      >
                        <span>{sk.name}</span>
                        <strong className="text-indigo-500">({sk.count})</strong>
                      </span>
                    ))}
                    {dept.topSkills.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No skills listed yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
