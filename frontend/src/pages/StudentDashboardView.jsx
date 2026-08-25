import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Briefcase, 
  Award, TrendingUp, Cpu, Compass, Play, FileText, UserCheck, Calendar,
  ExternalLink, ChevronRight, Zap, Target
} from 'lucide-react';

export default function StudentDashboardView({ studentName = "Alex Chen", onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  const skills = [
    { name: "React", category: "Frontend", level: 85, demand: 90, status: "Strong", color: "bg-cyan-500" },
    { name: "Java", category: "Backend / Enterprise", level: 72, demand: 82, status: "Good", color: "bg-orange-500" },
    { name: "MongoDB", category: "Database", level: 78, demand: 80, status: "Strong", color: "bg-emerald-500" },
    { name: "DSA", category: "Computer Science Core", level: 64, demand: 94, status: "Gap Identified", color: "bg-amber-500" },
    { name: "Cloud (AWS)", category: "Infrastructure", level: 45, demand: 88, status: "Critical Gap", color: "bg-rose-500" },
    { name: "AI/ML Basics", category: "Data Science", level: 58, demand: 85, status: "Emerging", color: "bg-purple-500" }
  ];

  const roadmapSteps = [
    { step: 1, title: "AWS Fundamentals", duration: "1 Week", status: "Completed", icon: CheckCircle2, color: "text-emerald-400" },
    { step: 2, title: "Docker & Containerization", duration: "2 Weeks", status: "In Progress", icon: Play, color: "text-indigo-400" },
    { step: 3, title: "CI/CD Pipeline Setup", duration: "1 Week", status: "Next", icon: Calendar, color: "text-slate-400" },
    { step: 4, title: "Fullstack Cloud Capstone", duration: "2 Weeks", status: "Upcoming", icon: Award, color: "text-slate-400" }
  ];

  const recommendedOpportunities = [
    {
      id: 1,
      title: "Backend Developer Intern",
      company: "TechNova Solutions",
      location: "Remote / Bengaluru",
      stipend: "₹35,000 / mo",
      match: 91,
      matchedSkills: ["Node.js", "Express", "MongoDB"],
      missingSkills: ["Docker", "AWS"]
    },
    {
      id: 2,
      title: "Cloud Infrastructure Apprentice",
      company: "CloudScale Systems",
      location: "Hybrid (Hyderabad)",
      stipend: "₹40,000 / mo",
      match: 84,
      matchedSkills: ["Java", "Linux"],
      missingSkills: ["Kubernetes", "AWS"]
    }
  ];

  const upcomingAssessments = [
    { title: "Advanced Data Structures & Algorithms", date: "Tomorrow, 4:00 PM", duration: "60 mins", provider: "SkillBridge Skill Diagnostic" },
    { title: "Cloud Architecture Micro-Assessment", date: "Friday, 10:00 AM", duration: "45 mins", provider: "AWS Academic" }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              Student Workspace • CS Dept (3rd Year)
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Profile</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Good morning, {studentName} 👋</h1>
          <p className="text-slate-400 text-sm">
            Your Skill DNA matrix was updated 2 hours ago based on your latest Github submissions.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('skill-dna')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Interactive Skill DNA</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('opportunities')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-2 cursor-pointer"
          >
            <Briefcase className="h-4 w-4 text-purple-400" />
            <span>Matched Internships</span>
          </button>
        </div>
      </div>

      {/* READINESS & SCORES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placement Readiness Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Placement Readiness Score</h3>
              <p className="text-xs text-slate-500">Targeting Top Enterprise Profiles</p>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Target className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between my-2">
            {/* Circular score gauge visual */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white font-mono">78%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between space-x-4">
                <span className="text-slate-400">Target Score:</span>
                <span className="text-emerald-400 font-bold font-mono">85%+</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span className="text-slate-400">Industry Avg:</span>
                <span className="text-slate-200 font-mono">65%</span>
              </div>
              <div className="text-[11px] text-indigo-300 font-medium bg-indigo-500/10 p-1.5 rounded">
                +6% increase this month
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
            <span>High compatibility with 42 companies</span>
            <ArrowRight className="h-4 w-4 text-indigo-400" />
          </div>
        </div>

        {/* Resume & Profile Completeness */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profile Diagnostics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Resume Quality Score</span>
                  <span className="text-emerald-400 font-bold font-mono">85 / 100</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Profile Completeness</span>
                  <span className="text-indigo-400 font-bold font-mono">92%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2 mt-4">
            <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Add 1 more cloud project to unlock Tier-1 company shortlist.</span>
          </div>
        </div>

        {/* AI Career Recommendation */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 flex flex-col justify-between bg-gradient-to-br from-indigo-950/30 to-slate-900">
          <div>
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-bold uppercase mb-2">
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
              <span>AI Career Recommendation</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Your biggest skill gap is Cloud + DSA</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bridging this 22% gap will increase your placement match score from 78% to 94% across enterprise openings.
            </p>
          </div>

          {/* Mini Roadmap */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium mb-2">Recommended 4-Week Roadmap:</div>
            <div className="flex items-center text-[10px] space-x-1 font-mono text-slate-300 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-indigo-300">AWS Basics</span>
              <span>→</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-purple-300">Docker</span>
              <span>→</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300">CI/CD</span>
              <span>→</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-300">Cloud Project</span>
            </div>
          </div>
        </div>
      </div>

      {/* SKILL CARDS & SKILL DNA PREVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <span>My Mapped Skill Cards</span>
          </h3>
          <button
            onClick={() => onNavigate && onNavigate('skill-dna')}
            className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View Interactive Skill DNA Matrix</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, index) => (
            <div key={index} className="glass-card glass-card-hover p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{skill.name}</h4>
                  <p className="text-[11px] text-slate-400">{skill.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  skill.status.includes('Critical') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  skill.status.includes('Gap') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {skill.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current Mastery</span>
                  <span className="font-mono text-white font-bold">{skill.level}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${skill.color}`} style={{ width: `${skill.level}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Industry Demand: {skill.demand}%</span>
                  <span className="text-slate-400">Gap: {Math.max(0, skill.demand - skill.level)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDED OPPORTUNITIES & UPCOMING ASSESSMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Internships (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-purple-400" />
              <span>Recommended Internships</span>
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('opportunities')}
              className="text-xs text-purple-400 font-semibold hover:underline"
            >
              See All Opportunities
            </button>
          </div>

          <div className="space-y-4">
            {recommendedOpportunities.map((opp) => (
              <div key={opp.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">{opp.title}</h4>
                    <p className="text-xs text-slate-400">{opp.company} • {opp.location} • <span className="text-emerald-400 font-semibold">{opp.stipend}</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                      {opp.match}% AI Match
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-semibold block mb-1">✓ Matched Skills:</span>
                    <span className="text-slate-300 font-mono">{opp.matchedSkills.join(', ')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-semibold block mb-1">⚠ Skill Gaps to Bridge:</span>
                    <span className="text-slate-300 font-mono">{opp.missingSkills.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Assessments & Learning Progress */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            <span>Upcoming Assessments</span>
          </h3>

          <div className="space-y-3">
            {upcomingAssessments.map((test, t) => (
              <div key={t} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-amber-400 font-semibold">{test.provider}</div>
                <h5 className="text-sm font-bold text-white">{test.title}</h5>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>📅 {test.date}</span>
                  <span>⏱️ {test.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
