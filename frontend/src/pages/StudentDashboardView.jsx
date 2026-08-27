import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Briefcase, 
  Award, TrendingUp, Cpu, Compass, Play, FileText, UserCheck, Calendar,
  ExternalLink, ChevronRight, Zap, Target, Loader2, RefreshCw, HelpCircle,
  ShieldCheck, Flame
} from 'lucide-react';


const SKILL_LEVEL_COLORS = {
  'Beginner': 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  'Intermediate': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Advanced': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'Expert': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
};


export default function StudentDashboardView({ onNavigate }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // Fetch student profile and assessment history from MongoDB
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, assessRes] = await Promise.all([
        fetch('/api/students/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/assessment/history', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const profData = await profRes.json();
      const assessData = await assessRes.json();

      if (profData.success) setProfile(profData.profile);
      if (assessData.success) setAssessmentHistory(assessData.history || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const studentName = profile?.name || user?.name || "Student";
  const collegeName = profile?.academic?.college || "SkillNexus AI Institute";
  const departmentName = profile?.academic?.department || "Computer Science";
  const yearText = profile?.academic?.year ? `${profile.academic.year} Year` : "Enrolled";

  // Compute live placement readiness based on assessment scores and profile completeness
  const totalAssessments = assessmentHistory.length;
  const passedAssessments = assessmentHistory.filter(a => a.passed).length;
  const avgScore = totalAssessments > 0 
    ? Math.round(assessmentHistory.reduce((acc, a) => acc + (a.percentage || a.scorePercentage || 0), 0) / totalAssessments)
    : 0;

  const placementReadiness = totalAssessments > 0 
    ? Math.min(98, Math.max(50, Math.round(avgScore * 0.8 + (passedAssessments * 5))))
    : 65;

  const skillsList = profile?.skillsList || [];

  return (
    <div className="space-y-8 pb-16 text-left">
      
      {/* ── 1. MODERN HEADER BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{collegeName} • {departmentName} ({yearText})</span>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Student Profile</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Track your verified assessment scores, skill matrix, and career readiness stored directly in MongoDB.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/skills')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95"
          >
            <Target className="h-4 w-4" />
            <span>Take Skill Assessment</span>
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

      {/* ── 2. METRICS & PLACEMENT READINESS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Placement Readiness Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Placement Readiness</h3>
              <p className="text-xs text-slate-500">Calculated from Real MongoDB Scores</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Target className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between my-1">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000"
                  strokeDasharray={`${placementReadiness}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{placementReadiness}%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between space-x-4">
                <span className="text-slate-400">Target Score:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">85%+</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span className="text-slate-400">Assessments:</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">{totalAssessments} Done</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                Verified in MongoDB
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between items-center font-medium">
            <span>High match with enterprise roles</span>
            <ArrowRight className="h-4 w-4 text-emerald-500" />
          </div>
        </div>

        {/* Profile & Assessment Diagnostics */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Assessment Diagnostics</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Average Assessment Score</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{avgScore}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${avgScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Verified Proficiencies</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{passedAssessments} of {totalAssessments} Passed</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Scores automatically update your official Skill Matrix.</span>
          </div>
        </div>

        {/* Quick Skill Level Threshold Reference */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-[#090d16] shadow-xl space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold uppercase font-mono mb-2">
              <Award className="h-4 w-4 text-emerald-500" />
              <span>Skill Level System</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Standardized 4-Tier Scale</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every assessment submission computes exact score, percentage, and assigned tier:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">0 - 39%</span>
              <span className="text-slate-700 dark:text-slate-300">Beginner</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <span className="text-blue-400 block text-[10px]">40 - 59%</span>
              <span>Intermediate</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <span className="text-purple-400 block text-[10px]">60 - 79%</span>
              <span>Advanced</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <span className="text-emerald-400 block text-[10px]">80 - 100%</span>
              <span>Expert</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. REAL ASSESSMENT RESULTS TABLE / CARDS ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Skill Assessment Results
              </h2>
            </div>
            <p className="text-xs text-slate-500">Live evaluation records and score breakdowns saved in MongoDB.</p>
          </div>

          <button
            onClick={() => navigate('/skills')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20 w-fit"
          >
            <span>Take New Assessment</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-7 w-7 text-emerald-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading assessment history...</span>
          </div>
        ) : assessmentHistory.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-800 dark:text-slate-200">No assessments taken yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Test your skills in JavaScript, React, Python, Java, or MongoDB to earn verified proficiency badges on your profile.
              </p>
            </div>
            <button
              onClick={() => navigate('/skills')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-mono font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Skill</th>
                  <th className="p-3.5 text-center">Total Questions</th>
                  <th className="p-3.5 text-center">Correct Answers</th>
                  <th className="p-3.5 text-center">Wrong Answers</th>
                  <th className="p-3.5 text-center">Score</th>
                  <th className="p-3.5 text-center">Percentage</th>
                  <th className="p-3.5 text-center">Skill Level</th>
                  <th className="p-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {assessmentHistory.map((item) => {
                  const total = item.totalQuestions || 5;
                  const correct = item.correctAnswers || 0;
                  const wrong = item.wrongAnswers !== undefined ? item.wrongAnswers : Math.max(0, total - correct);
                  const scoreVal = item.score !== undefined ? item.score : correct;
                  const pctVal = item.percentage !== undefined ? item.percentage : item.scorePercentage;
                  const level = item.skillLevel || item.proficiencyEarned || 'Beginner';
                  const levelColor = SKILL_LEVEL_COLORS[level] || SKILL_LEVEL_COLORS['Beginner'];

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 dark:text-white text-sm">{item.skill}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{item.category || 'Technical'}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {total}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {correct}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-rose-500">
                        {wrong}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-indigo-500">
                        {scoreVal} / {total}
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {pctVal}%
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase font-mono border ${levelColor}`}>
                          {level}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. CURRENT SKILL PROFICIENCY MATRIX (MONGODB) ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-indigo-500" />
              <span>Current Profile Skill Proficiencies</span>
            </h3>
            <p className="text-xs text-slate-500">Updated automatically following assessment submissions in MongoDB.</p>
          </div>

          <button
            onClick={() => navigate('/skills')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Manage Skills Matrix</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {skillsList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
            No skills recorded yet. Complete an assessment or add skills from your profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillsList.map((s, idx) => {
              const levelColor = SKILL_LEVEL_COLORS[s.proficiency] || SKILL_LEVEL_COLORS['Beginner'];

              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{s.category || 'General'}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono border ${levelColor}`}>
                      {s.proficiency || 'Beginner'}
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
