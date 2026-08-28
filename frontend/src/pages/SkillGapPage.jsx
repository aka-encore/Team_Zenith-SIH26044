import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu, TrendingUp, Sparkles, Target, AlertTriangle, ArrowRight,
  CheckCircle2, Compass, Layers, Zap, BookOpen, Flame, ChevronRight,
  ShieldCheck, HelpCircle, BarChart3, Clock
} from 'lucide-react';


const TARGET_ROLES = [
  {
    id: 'fullstack',
    name: 'Full Stack Cloud Engineer',
    demandScore: 94,
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS', 'DSA'],
    avgPackage: '₹14-22 LPA'
  },
  {
    id: 'backend',
    name: 'Backend Systems Architect',
    demandScore: 91,
    requiredSkills: ['Java', 'Spring Boot', 'MongoDB', 'C++', 'Microservices', 'Docker'],
    avgPackage: '₹16-25 LPA'
  },
  {
    id: 'ai-engineer',
    name: 'AI / ML Solutions Developer',
    demandScore: 96,
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Docker', 'DSA'],
    avgPackage: '₹18-28 LPA'
  }
];


export default function SkillGapPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real student skills and history from MongoDB
  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [profRes, assessRes] = await Promise.all([
        fetch('/api/students/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/assessment/history', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const profData = await profRes.json();
      const assessData = await assessRes.json();

      if (profData.success) setProfileSkills(profData.profile?.skillsList || []);
      if (assessData.success) setAssessmentHistory(assessData.history || []);
    } catch (err) {
      console.error('Error loading skill gap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudentData();
    }
  }, [token]);

  // Skill classification against selected target role
  const verifiedSkillNames = profileSkills.map(s => s.name.toLowerCase());
  
  const matchedSkills = selectedRole.requiredSkills.filter(req => 
    verifiedSkillNames.includes(req.toLowerCase())
  );

  const missingSkills = selectedRole.requiredSkills.filter(req => 
    !verifiedSkillNames.includes(req.toLowerCase())
  );

  const weakSkills = profileSkills.filter(s => 
    s.proficiency === 'Beginner' && selectedRole.requiredSkills.some(req => req.toLowerCase() === s.name.toLowerCase())
  );

  const matchPercentage = Math.round((matchedSkills.length / selectedRole.requiredSkills.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Market Alignment Engine</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Skill Gap & Demand
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Compare your verified MongoDB competencies against active industry hiring requirements and target enterprise career paths.
          </p>
        </div>

        <button
          onClick={() => navigate('/skills')}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/25 transition flex items-center space-x-2 cursor-pointer relative z-10"
        >
          <Zap className="h-4 w-4" />
          <span>Bridge Skill Gaps</span>
        </button>
      </div>

      {/* ── 1. TARGET ROLE SELECTOR ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Target className="h-4 w-4 text-indigo-500" />
            <span>Select Target Career Track</span>
          </h3>
          <span className="text-xs text-slate-400">Industry Hiring Benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TARGET_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                selectedRole.id === role.id
                  ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/5'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {role.demandScore}% Demand
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{role.avgPackage}</span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{role.name}</h4>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                {role.requiredSkills.join(' • ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. SKILL GAP METRICS & DNA BREAKDOWN ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Role Match Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Current Role Match</span>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400">{matchPercentage}%</span>
              <span className="text-xs text-slate-400 font-medium">compatibility</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Target Role:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{selectedRole.name}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Matched Skills:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{matchedSkills.length} / {selectedRole.requiredSkills.length}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Missing Gaps:</span>
              <span className="font-bold text-rose-500">{missingSkills.length} Skills</span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${matchPercentage}%` }} />
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-rose-500">
            <AlertTriangle className="h-4 w-4" />
            <h4 className="text-xs font-black uppercase font-mono">Missing Critical Skills</h4>
          </div>

          {missingSkills.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All required skills present in your profile!</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-bold font-mono">
                  + {s}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Acquiring these missing skills will raise your candidate ranking by up to 28% for top enterprise listings.
          </p>
        </div>

        {/* Weak Skills (Need Proficiency Upgrade) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-500">
            <TrendingUp className="h-4 w-4" />
            <h4 className="text-xs font-black uppercase font-mono">Skills Requiring Upgrades</h4>
          </div>

          {weakSkills.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-medium">
              No weak skills identified for this track.
            </div>
          ) : (
            <div className="space-y-2">
              {weakSkills.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex justify-between items-center font-bold">
                  <span>{s.name}</span>
                  <span className="text-[10px] uppercase font-mono">Beginner → Intermediate</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Take skill assessments to prove higher proficiency and earn verified badges.
          </p>
        </div>

      </div>

      {/* ── 3. ROADMAP & RECOMMENDATIONS ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Compass className="h-4 w-4 text-indigo-500" />
              <span>Recommended Skill Acquisition Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500">AI-curated learning phases to achieve 100% role match.</p>
          </div>

          <button
            onClick={() => navigate('/skills')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Assess Now</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { phase: "Phase 1", title: "Core Fundamentals", desc: "Solidify DSA and language fundamentals", status: "Done" },
            { phase: "Phase 2", title: "Containerization", desc: "Build & ship multi-stage Docker images", status: "In Progress" },
            { phase: "Phase 3", title: "Cloud Architecture", desc: "Deploy serverless & microservice APIs on AWS", status: "Next" },
            { phase: "Phase 4", title: "Enterprise Capstone", desc: "Deploy end-to-end fullstack production app", status: "Upcoming" }
          ].map((step, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">{step.phase}</span>
                <span className="text-slate-400">{step.status}</span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
