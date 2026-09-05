import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, TrendingUp, Users, AlertTriangle, CheckCircle2, 
  RefreshCw, ArrowLeft, Layers, Sparkles, BarChart3, PieChart,
  Briefcase, ArrowUpRight, ShieldCheck, Target, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanySkillInsightsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [insights, setInsights] = useState(null);

  const fetchSkillInsights = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/companies/skill-insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve skill analytics.');
      }

      setInsights(resData);
    } catch (err) {
      console.error('Error fetching skill insights:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSkillInsights();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">
        <div className="glass-card p-12 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Analyzing Skill Supply & Demand...</span>
        </div>
      </div>
    );
  }

  const hasData = insights?.hasData && (insights?.mostDemandedSkills?.length > 0 || insights?.totalOpportunities > 0);

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
            <BrainCircuit className="h-7 w-7 text-emerald-500" />
            <span>Skill Insights & Talent DNA</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time intelligence connecting your hiring requirements with available student skill profiles and competency gaps.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchSkillInsights(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <Link
            to="/company/opportunities"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-5 py-3 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Briefcase className="h-4 w-4" />
            <span>Manage Openings</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ EMPTY STATE ━━━━━━━━━━━━━━━━━━━━ */}
      {!hasData ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No Skill Data Available Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Post active job or internship openings specifying your required tech stacks. SkillNexus will automatically analyze the campus talent cohort and reveal skill availability, candidate gap frequency, and compatibility metrics.
            </p>
          </div>
          <Link
            to="/company/opportunities"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            <Briefcase className="h-4 w-4" />
            <span>Post an Opportunity</span>
          </Link>
        </div>
      ) : (
        <>
          {/* ━━━━━━━━━━━━━━━━━━━━ 1. KEY ANALYTIC METRICS ━━━━━━━━━━━━━━━━━━━━ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avg Candidate Match</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {insights.averageCandidateCompatibility}%
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Against {insights.activeOpportunities || insights.totalOpportunities} active company openings
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Demanded Skills</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {insights.mostDemandedSkills?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Unique tech stacks specified in roles
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Common Skill Gaps</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {insights.commonSkillGaps?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                High-frequency competency deficiencies
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Candidates Evaluated</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {insights.totalCandidatesEvaluated || 0}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Active student talent pool profiles
              </div>
            </div>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━ 2. SKILL DEMAND VS CANDIDATE GAPS ━━━━━━━━━━━━━━━━━━━━ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Most Demanded Skills */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>Most Demanded Skills</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest frequency competencies across your job and internship openings.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Demand Share</span>
              </div>

              <div className="space-y-3 pt-2">
                {insights.mostDemandedSkills?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills specified in openings yet.</p>
                ) : (
                  insights.mostDemandedSkills.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                            {idx + 1}
                          </span>
                          <span>{item.skill}</span>
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {item.openingsCount} {item.openingsCount === 1 ? 'opening' : 'openings'} ({item.demandPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(item.demandPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Common Candidate Skill Gaps */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Common Candidate Skill Gaps</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Required skills most frequently missing among student applicants and talent cohort.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Gap Frequency</span>
              </div>

              <div className="space-y-3 pt-2">
                {insights.commonSkillGaps?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No significant skill gaps identified.</p>
                ) : (
                  insights.commonSkillGaps.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                          <span className="text-amber-500 font-bold">⚠</span>
                          <span>{item.skill}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-normal">
                            {item.severity}
                          </span>
                        </span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">
                          {item.gapPercentage}% missing
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(item.gapPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━ 3. TALENT SUPPLY & SKILL AVAILABILITY ━━━━━━━━━━━━━━━━━━━━ */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span>Student Skill Availability</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total student population possessing each of your demanded skills.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Talent Pool: {insights.totalCandidatesEvaluated} students
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {insights.skillAvailability?.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.skill}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                      item.supplyStatus === 'High'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : item.supplyStatus === 'Moderate'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.supplyStatus} Supply
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span>{item.studentsCount} students</span>
                    <span>{item.availabilityPercentage}% availability</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        item.supplyStatus === 'High' ? 'bg-emerald-500' : item.supplyStatus === 'Moderate' ? 'bg-blue-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.availabilityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━ 4. RECRUITMENT FUNNEL & OUTCOMES ━━━━━━━━━━━━━━━━━━━━ */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <span>Recruitment Funnel & Candidate Outcomes</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lifecycle progression across all received candidate applications.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {insights.recruitmentOutcomes?.total || 0} Total Applications
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { stage: 'Applied', count: insights.recruitmentOutcomes?.applied || 0, color: 'blue' },
                { stage: 'Screening', count: insights.recruitmentOutcomes?.screening || 0, color: 'cyan' },
                { stage: 'Shortlisted', count: insights.recruitmentOutcomes?.shortlisted || 0, color: 'amber' },
                { stage: 'Interview', count: insights.recruitmentOutcomes?.interview || 0, color: 'indigo' },
                { stage: 'Selected', count: insights.recruitmentOutcomes?.selected || 0, color: 'emerald' },
                { stage: 'Rejected', count: insights.recruitmentOutcomes?.rejected || 0, color: 'rose' },
              ].map((st, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-1"
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    {st.stage}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {st.count}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {insights.recruitmentOutcomes?.total > 0 
                      ? `${Math.round((st.count / insights.recruitmentOutcomes.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
