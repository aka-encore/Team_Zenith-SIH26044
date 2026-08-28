import React from 'react';
import { Sparkles, GraduationCap, Building2, BookOpen, Leaf } from 'lucide-react';


export function OrbitingSkills({ selectedRole }) {

  // Static visual configurations per role — SkillNexus AI context
  const roleVisuals = {
    student: {
      badge: "SkillNexus AI Student Portal",
      headline: "Assess Skills. Discover Opportunities.",
      subtext: "Build a verified competency profile and get matched with the right career path.",
      nodes: [
        { name: "Ayurveda", icon: "🌿", pos: "top-2 left-6" },
        { name: "Yoga", icon: "🧘", pos: "top-4 right-4" },
        { name: "Unani", icon: "⚕️", pos: "bottom-12 left-2" },
        { name: "Siddha", icon: "🔬", pos: "bottom-4 right-8" },
        { name: "Homeo", icon: "💊", pos: "top-1/2 -left-4" },
        { name: "Research", icon: "📊", pos: "top-1/3 -right-4" }
      ],
      color: "from-slate-900 via-slate-900 to-emerald-950"
    },

    company: {
      badge: "SkillNexus AI Industry Hub",
      headline: "Find Verified Talent.",
      subtext: "Access competency-verified candidates for healthcare, manufacturing, and research roles.",
      nodes: [
        { name: "GMP", icon: "🏭", pos: "top-2 left-6" },
        { name: "QC/QA", icon: "✅", pos: "top-4 right-4" },
        { name: "Clinical", icon: "🔬", pos: "bottom-12 left-2" },
        { name: "R&D", icon: "🧪", pos: "bottom-4 right-8" },
        { name: "Pharma", icon: "💊", pos: "top-1/2 -left-4" }
      ],
      color: "from-slate-900 via-slate-900 to-teal-950"
    },

    institution: {
      badge: "SkillNexus AI Academic Intelligence",
      headline: "Build an Industry-Ready Campus.",
      subtext: "Align curriculum with real industry demands and strengthen student outcomes.",
      nodes: [
        { name: "Students", icon: "🎓", pos: "top-2 left-6" },
        { name: "Faculty", icon: "📚", pos: "top-4 right-4" },
        { name: "FDP", icon: "🎯", pos: "bottom-12 left-2" },
        { name: "Industry", icon: "🤝", pos: "bottom-4 right-8" },
        { name: "Research", icon: "📈", pos: "top-1/2 -left-4" }
      ],
      color: "from-slate-900 via-slate-900 to-emerald-950"
    }
  };


  const current = roleVisuals[selectedRole] || roleVisuals.student;


  return (
    <div className={`w-full h-full bg-gradient-to-br ${current.color} p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300 rounded-3xl lg:rounded-r-none border-b lg:border-b-0 lg:border-r border-slate-800`}>

      {/* Background Radial Grid Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />


      {/* TOP HEADER */}
      <div className="relative z-10 space-y-3 text-left">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
          <span>{current.badge}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white transition-all duration-300">
          {current.headline}
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
          {current.subtext}
        </p>
      </div>


      {/* CENTER STATIC SKILL NETWORK GRAPHIC */}
      <div className="relative z-10 my-4 flex items-center justify-center py-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">

          {/* Static SVG Connecting Network Lines */}
          <svg className="absolute inset-0 w-full h-full text-emerald-500/20" viewBox="0 0 288 288">
            <circle cx="144" cy="144" r="110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
            <circle cx="144" cy="144" r="75" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
            <line x1="144" y1="144" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <line x1="144" y1="144" x2="220" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <line x1="144" y1="144" x2="50" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <line x1="144" y1="144" x2="230" y2="210" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          </svg>


          {/* Central Role Graphic Node */}
          <div className="relative z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/95 border-2 border-emerald-500/50 shadow-2xl flex flex-col items-center justify-center p-3 text-center backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner mb-1">
              {selectedRole === 'student' ? (
                <GraduationCap className="h-7 w-7 text-emerald-300" />
              ) : selectedRole === 'company' ? (
                <Building2 className="h-7 w-7 text-teal-300" />
              ) : (
                <BookOpen className="h-7 w-7 text-emerald-300" />
              )}
            </div>
            <span className="text-[11px] font-bold text-white tracking-wide">SkillNexus AI</span>
            <span className="text-[9px] text-emerald-300 font-mono font-medium">Competency Engine</span>
          </div>


          {/* Role-Specific Static Chips */}
          {current.nodes.map((node, idx) => (
            <div
              key={idx}
              className={`absolute ${node.pos} z-30 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-xs font-semibold text-slate-100 shadow-xl backdrop-blur-md cursor-pointer`}
            >
              <span className="text-sm">{node.icon}</span>
              <span className="font-mono text-[11px]">{node.name}</span>
            </div>
          ))}

        </div>
      </div>


      {/* BOTTOM BRAND FOOTER */}
      <div className="relative z-10 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-semibold text-slate-300">SkillNexus AI Ecosystem</span>
        <span>Students ↔ Academia ↔ Industry</span>
      </div>

    </div>
  );
}
