import React, { useState } from 'react';
import { 
  TrendingUp, Filter, Search, BarChart3, Layers, Building2, Cpu, 
  ArrowUpRight, AlertCircle, Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';

export default function IndustryDemandPage() {
  const [filterDept, setFilterDept] = useState('All Departments');
  const [filterYear, setFilterYear] = useState('All Years');
  const [filterIndustry, setFilterIndustry] = useState('All Industries');
  const [filterRole, setFilterRole] = useState('All Roles');

  const heatmaps = [
    { skill: "Cloud Computing & Kubernetes", category: "Infrastructure", demand: 84, supply: 39, gap: 45, growth: "+42%", urgency: "High Deficit" },
    { skill: "Artificial Intelligence & RAG", category: "AI / Data", demand: 92, supply: 40, gap: 52, growth: "+68%", urgency: "Critical Deficit" },
    { skill: "Data Structures & System Design", category: "Core CS", demand: 95, supply: 65, gap: 30, growth: "+15%", urgency: "High Deficit" },
    { skill: "Fullstack React & Next.js", category: "Frontend", demand: 88, supply: 72, gap: 16, growth: "+24%", urgency: "Moderate" },
    { skill: "DevOps & CI/CD Pipelines", category: "DevOps", demand: 82, supply: 44, gap: 38, growth: "+35%", urgency: "High Deficit" },
    { skill: "Cybersecurity & OAuth 2.0", category: "Security", demand: 76, supply: 34, gap: 42, growth: "+29%", urgency: "High Deficit" }
  ];

  const topDemandedRoles = [
    { role: "Senior Fullstack Engineer", openPositions: 420, avgSalary: "₹18-24 LPA", topSkills: ["React", "Node.js", "Docker"] },
    { role: "Cloud Solutions Architect", openPositions: 310, avgSalary: "₹22-30 LPA", topSkills: ["AWS", "Kubernetes", "Terraform"] },
    { role: "AI / Machine Learning Specialist", openPositions: 280, avgSalary: "₹20-28 LPA", topSkills: ["Python", "PyTorch", "LLMs"] },
    { role: "Backend Systems Developer", openPositions: 390, avgSalary: "₹16-22 LPA", topSkills: ["Java", "Go", "PostgreSQL"] }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center space-x-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>Real-Time Market Analytics</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Industry Skill Intelligence</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Live analytics comparing corporate hiring demand against student skill supply across 320+ enterprise partners.
          </p>
        </div>
      </div>

      {/* MULTI-DIMENSIONAL FILTERS */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Filter className="h-4 w-4 text-indigo-400" />
            <span>Filter Intelligence Data</span>
          </div>
          <button 
            onClick={() => {
              setFilterDept('All Departments');
              setFilterYear('All Years');
              setFilterIndustry('All Industries');
              setFilterRole('All Roles');
            }}
            className="text-xs text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dept Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Department</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500"
            >
              <option>All Departments</option>
              <option>Computer Science & Engineering</option>
              <option>Information Technology</option>
              <option>Electronics & Communication</option>
              <option>Data Science & AI</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Academic Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500"
            >
              <option>All Years</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year (Placement Ready)</option>
            </select>
          </div>

          {/* Industry Sector Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Industry Sector</label>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500"
            >
              <option>All Industries</option>
              <option>Cloud Services & Infrastructure</option>
              <option>AI & Machine Learning</option>
              <option>FinTech & Digital Banking</option>
              <option>Enterprise SaaS</option>
            </select>
          </div>

          {/* Target Role */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">Job Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500"
            >
              <option>All Roles</option>
              <option>Backend Developer</option>
              <option>Fullstack Engineer</option>
              <option>Cloud / DevOps Specialist</option>
              <option>AI Engineer</option>
            </select>
          </div>
        </div>
      </div>

      {/* SKILL GAP HEATMAP SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <span>Student Supply vs Industry Demand Heatmap</span>
          </h3>
          <span className="text-xs text-slate-400">SkillBridge Real-Time Index</span>
        </div>

        <div className="space-y-3">
          {heatmaps.map((item, index) => (
            <div key={index} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-white">{item.skill}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">{item.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Industry Demand Growth: <span className="text-emerald-400 font-semibold">{item.growth}</span></p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${
                  item.gap > 40 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.urgency} ({item.gap}% Gap)
                </span>
              </div>

              {/* Comparative Progress Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Industry Demand: <strong className="text-indigo-400 font-mono">{item.demand}%</strong></span>
                  <span>Student Supply: <strong className="text-cyan-400 font-mono">{item.supply}%</strong></span>
                  <span className="text-rose-400 font-mono font-bold">Unmet Deficit: {item.gap}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                  <div className="h-full bg-indigo-500 rounded-l-full" style={{ width: `${item.supply}%` }} />
                  <div className="h-full bg-rose-500/70 opacity-90" style={{ width: `${item.gap}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP DEMANDED ROLES & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            <span>High-Demand Job Profiles</span>
          </h3>
          <div className="space-y-3">
            {topDemandedRoles.map((role, r) => (
              <div key={r} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-bold text-white">{role.role}</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">{role.avgSalary}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Openings Across Network: <span className="text-white font-semibold">{role.openPositions} Active Posts</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-1 flex-wrap gap-y-1 text-xs">
                  <span className="text-slate-400">Core Stack Required:</span>
                  {role.topSkills.map((sk, s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI MARKET INSIGHT CARD */}
        <div className="glass-card p-8 rounded-3xl border border-indigo-500/30 flex flex-col justify-between bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-bold uppercase">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              <span>AI Market Summary</span>
            </div>
            <h3 className="text-2xl font-bold text-white">The Cloud & AI Deficit</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analysis across 320+ partner corporate job specs reveals that **Cloud Architecture (AWS/Azure)** and **Vector AI Engineering** have the highest supply deficits (45% and 52% respectively).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Colleges introducing micro-credentials in Docker + AWS CI/CD pipelines see a **3.4x higher internship placement rate** within 60 days.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-md">
              <span>Export Full Intelligence Report (PDF)</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
