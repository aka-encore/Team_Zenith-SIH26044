import React, { useState } from 'react';
import { 
  Sparkles, Layers, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, 
  Cpu, Building2, GraduationCap, Briefcase, ChevronRight, Zap, RefreshCw
} from 'lucide-react';

export default function AcademiaIndustryLab() {
  const [selectedCourse, setSelectedCourse] = useState('CS302: Web Development & Cloud Systems');

  const pipelineSteps = [
    { step: 1, title: "Industry Requirement", desc: "Enterprise Cloud Microservices", icon: Building2, color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
    { step: 2, title: "Required Skills", desc: "Docker, Kubernetes, AWS EKS", icon: Cpu, color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" },
    { step: 3, title: "Current Student Skills", desc: "HTML/CSS, Monolithic Express", icon: GraduationCap, color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
    { step: 4, title: "Skill Gap", desc: "45% Cloud Deficit Identified", icon: AlertTriangle, color: "border-rose-500/40 text-rose-400 bg-rose-500/10" },
    { step: 5, title: "Curriculum Update", desc: "Inject Docker & CI/CD Modules", icon: BookOpen, color: "border-purple-500/40 text-purple-400 bg-purple-500/10" },
    { step: 6, title: "Training Program", desc: "4-Week Hands-on Cloud Bootcamp", icon: Zap, color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
    { step: 7, title: "Industry Assessment", desc: "Verified Capstone Evaluation", icon: CheckCircle2, color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
    { step: 8, title: "Internship / Placement", desc: "Streamed to 18 Partner Companies", icon: Briefcase, color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" }
  ];

  const syllabusDiffs = [
    {
      course: "CS302: Web Development & Cloud Systems",
      currentSyllabus: "Module 4: Traditional PHP, Apache Server setup & MySQL relational schema design.",
      recommendedUpdate: "Module 4 (Revised): Microservices with Node.js, Docker Containerization, Redis Caching & MongoDB Atlas.",
      impactScore: "+28% Skill Match",
      status: "Upgrade Ready"
    },
    {
      course: "CS401: Advanced Software Engineering",
      currentSyllabus: "Module 2: Waterfall development models and manual manual test suite execution.",
      recommendedUpdate: "Module 2 (Revised): Agile Sprint workflows, CI/CD GitHub Actions pipelines & automated Playwright testing.",
      impactScore: "+34% Skill Match",
      status: "Upgrade Ready"
    },
    {
      course: "IT305: Database Architecture",
      currentSyllabus: "Module 3: Normalization up to 3NF and basic SQL queries.",
      recommendedUpdate: "Module 3 (Revised): SQL Optimization, NoSQL Aggregation Pipelines & Vector Databases for AI RAG.",
      impactScore: "+22% Skill Match",
      status: "In Review"
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Flagship Core Differentiator</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Academia × Industry Lab</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            The automated intelligence bridge connecting static college engineering syllabi directly to dynamic corporate tech stack demand.
          </p>
        </div>
      </div>

      {/* VISUAL PIPELINE FLOW (THE MAIN DIFFERENTIATOR VISUAL) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>End-to-End Alignment Pipeline</span>
          </h3>
          <span className="text-xs text-slate-400">Automated 8-Stage Cycle</span>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {pipelineSteps.map((p, i) => (
            <div key={i} className={`glass-card p-5 rounded-2xl border ${p.color} space-y-3 relative flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold opacity-70">STAGE 0{p.step}</span>
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <p.icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{p.desc}</p>
              </div>
              {i < 7 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIVE SYLLABUS UPGRADE RECOMMENDATION ENGINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Live Curriculum Upgrade Recommendations</h3>
            <p className="text-xs text-slate-400">AI-generated syllabus enhancements based on 320+ enterprise job specifications</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Re-sync Industry Demand</span>
          </button>
        </div>

        <div className="space-y-4">
          {syllabusDiffs.map((diff, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h4 className="text-lg font-bold text-white">{diff.course}</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    {diff.impactScore}
                  </span>
                  <span className="text-xs text-indigo-400 font-semibold px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {diff.status}
                  </span>
                </div>
              </div>

              {/* Before vs After Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/90 rounded-xl border border-rose-500/20 space-y-1">
                  <span className="text-rose-400 font-bold block uppercase tracking-wider">Current College Syllabus:</span>
                  <p className="text-slate-300 leading-relaxed">{diff.currentSyllabus}</p>
                </div>

                <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-1">
                  <span className="text-emerald-400 font-bold block uppercase tracking-wider">Recommended Industry Syllabus Upgrade:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">{diff.recommendedUpdate}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700">
                  Export Module PDF
                </button>
                <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md">
                  Apply Syllabus Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
