import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Target, Cpu, AlertTriangle, CheckCircle2, TrendingDown, 
  Sparkles, RefreshCw, AlertCircle, ArrowLeft, Filter, 
  Search, BookOpen, Layers, Zap, Building2, ChevronRight,
  ShieldCheck, XCircle, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultySkillGapPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters State
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [skillSearch, setSkillSearch] = useState('');

  // Fetch Skill Gap Analytics from MongoDB
  const fetchSkillGap = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (deptFilter !== 'all') params.append('department', deptFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (skillSearch.trim()) params.append('skill', skillSearch.trim());

      const response = await fetch(`/api/faculty/skill-gap?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to compute skill gap analytics.');
      }

      setData(resData);
    } catch (err) {
      console.error('Error fetching faculty skill gap:', err);
      setErrorMsg(err.message || 'Unable to connect to skill gap service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSkillGap();
    }
  }, [token, deptFilter, yearFilter]);

  // Debounced search for skill keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchSkillGap();
    }, 350);
    return () => clearTimeout(timer);
  }, [skillSearch]);

  const handleResetFilters = () => {
    setDeptFilter('all');
    setYearFilter('all');
    setSkillSearch('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4 text-left">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Calculating Curriculum Deficit & Placement Vectors...
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
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Analysis Unavailable</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
        </div>
        <div className="text-center pt-2">
          <button
            onClick={() => fetchSkillGap(true)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const highDemandSkills = data?.highDemandSkills || [];
  const missingSkills = data?.missingSkills || [];
  const weakSkills = data?.weakSkills || [];
  const recommendedSkills = data?.recommendedSkills || [];
  const totalStudents = data?.totalStudents || 0;
  const totalOpenings = data?.totalOpenings || 0;
  const averageCohortGap = data?.averageCohortGap || 0;

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
            <Target className="h-7 w-7 text-rose-500" />
            <span>Curriculum vs Industry Skill Gap Diagnostic</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time deficit mapping comparing active recruiter hiring requirements with student technical competencies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchSkillGap(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Skill Gap Diagnostic"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SUMMARY METRICS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cohort Gap Index</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {averageCohortGap}%
          </div>
          <div className="text-[10px] text-slate-400">Average deficit across skills</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Missing Skills</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {missingSkills.length}
          </div>
          <div className="text-[10px] text-slate-400">0% student coverage</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Weak Skills</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {weakSkills.length}
          </div>
          <div className="text-[10px] text-slate-400">Low coverage or beginner</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Openings</span>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {totalOpenings}
          </div>
          <div className="text-[10px] text-slate-400">Corporate hiring drives</div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Skill Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill (e.g. Docker, Python)..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Data Science">AI & Data Science Track</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Pre-final)</option>
              <option value="4">4th Year (Final Year)</option>
            </select>
          </div>

        </div>

        {(deptFilter !== 'all' || yearFilter !== 'all' || skillSearch) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ AI CURRICULUM UPGRADE RECOMMENDATIONS ━━━━━━━━━━━━━━━━━━━━ */}
      {recommendedSkills.length > 0 && (
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-slate-900/50 to-slate-950/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Recommended Skills & Curriculum Upgrades</span>
              </h3>
              <p className="text-xs text-slate-400">
                Actionable syllabus interventions to maximize student placement rates
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              AI Advisory Plan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedSkills.map((rec, rIdx) => (
              <div 
                key={rIdx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {rec.skill}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {rec.deficitPercentage}% Deficit
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.recommendation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{rec.demandCount} Openings</span>
                  <span className="text-emerald-500 font-bold">{rec.projectedPlacementImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ HIGH DEMAND SKILLS & DEFICIT TABLE ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="h-5 w-5 text-rose-500" />
              <span>High-Demand Skills & Student Availability Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Detailed availability rates, student mastery, and hiring partner demand
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {highDemandSkills.length} Industry Skills Tracked
          </span>
        </div>

        {highDemandSkills.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No industry demand skills matched your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Required Technology</th>
                  <th className="p-3.5">Recruiter Openings</th>
                  <th className="p-3.5">Student Availability</th>
                  <th className="p-3.5">Skill Gap %</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Proficiency Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {highDemandSkills.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    
                    {/* Technology Name */}
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                      {item.skill}
                    </td>

                    {/* Openings */}
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                      <strong>{item.demandCount}</strong> drive{item.demandCount > 1 ? 's' : ''}
                      {item.hiringPartners && item.hiringPartners.length > 0 && (
                        <span className="block text-[10px] text-slate-400 truncate max-w-xs">
                          {item.hiringPartners.join(', ')}
                        </span>
                      )}
                    </td>

                    {/* Student Availability */}
                    <td className="p-3.5 font-mono">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.studentCount} / {totalStudents}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">
                        ({item.studentCoverage}%)
                      </span>
                    </td>

                    {/* Deficit Bar & % */}
                    <td className="p-3.5 font-mono w-44">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {item.deficitPercentage}% Gap
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${item.deficitPercentage}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.status === 'Missing'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : item.status === 'Weak'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : item.status === 'Moderate Gap'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        ● {item.status}
                      </span>
                    </td>

                    {/* Proficiency Split */}
                    <td className="p-3.5 text-[10px] font-mono text-slate-400">
                      {item.studentCount > 0 ? (
                        <span>
                          {item.levels.Beginner} Beg • {item.levels.Intermediate} Int • {item.levels.Advanced} Adv
                        </span>
                      ) : (
                        <span className="italic text-slate-400">0 verified students</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
