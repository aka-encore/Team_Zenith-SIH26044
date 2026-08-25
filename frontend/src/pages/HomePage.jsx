import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Target, BookOpen, Briefcase, Award,
  CheckCircle2, TrendingUp, Building2, Users, ChevronRight,
  BarChart3, ShieldCheck, Star, Layers, BrainCircuit, Rocket,
  GraduationCap, Beaker, HeartPulse, Leaf, ScrollText, Handshake,
  FlaskConical, Microscope, ClipboardCheck, BadgeCheck, Sparkles,
  FileSearch, Lightbulb, UserCheck, Network
} from 'lucide-react';


export default function HomePage({ onSelectTab }) {
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState('student');


  // Navigate to a specific page/tab
  const handleCTA = (view) => {
    if (onSelectTab) {
      onSelectTab(view);
    } else {
      navigate(`/${view}`);
    }
  };


  // ─── ROLE TAB DATA ───────────────────────────────────────────
  const roleTabData = {
    student: {
      title: "For AYUSH Students & Graduates",
      description: "Build a verified competency profile, identify skill gaps against real industry requirements, and get matched with opportunities that align with your strengths.",
      features: [
        "AI-powered skill assessment across 60+ AYUSH competency domains",
        "Personalized learning roadmaps to bridge career-role mismatches",
        "Verified Skill Passport with mentor-backed evaluations",
        "Smart matching with internships, live projects, and placements"
      ],
      cta: { label: "Start Skill Assessment", action: "skill-dna" },
      icon: GraduationCap,
      accent: "emerald"
    },

    industry: {
      title: "For AYUSH Healthcare Industries",
      description: "Access a pipeline of pre-assessed, competency-verified talent. Reduce hiring risk with explainable match scores backed by real skill verification.",
      features: [
        "Post opportunities with granular competency requirements",
        "Receive candidates ranked by verified skill match — not just resumes",
        "Collaborate with academia on live industry projects and R&D",
        "Access Faculty Development & Consultancy pipelines"
      ],
      cta: { label: "Post an Opportunity", action: "opportunities" },
      icon: Building2,
      accent: "blue"
    },

    faculty: {
      title: "For Faculty & Academic Institutions",
      description: "Align curriculum with real industry demands. Access faculty internships, FDPs, and collaborative research pipelines to strengthen institutional outcomes.",
      features: [
        "Curriculum-to-industry gap heatmaps for syllabus optimization",
        "Faculty Development Programs (FDPs) with industry partners",
        "Student competency tracking and cohort analytics dashboards",
        "Collaborative research and consultancy opportunity pipelines"
      ],
      cta: { label: "Explore Collaborations", action: "academia-lab" },
      icon: BookOpen,
      accent: "amber"
    }
  };


  // ─── SAMPLE OPPORTUNITY CARDS ────────────────────────────────
  const sampleOpportunities = [
    {
      title: "Clinical Research Intern — Ayurveda Pharmacology",
      sector: "Ayurveda Clinical Research",
      company: "Himalaya Wellness",
      matchScore: 86,
      competencies: ["Dravyaguna", "Clinical Trials", "GCP", "Pharmacovigilance"],
      type: "Internship"
    },
    {
      title: "QC Analyst — Herbal Manufacturing",
      sector: "Quality Control & GMP",
      company: "Dabur Research Labs",
      matchScore: 78,
      competencies: ["GMP Compliance", "HPLC Analysis", "Quality Assurance", "Documentation"],
      type: "Full-time"
    },
    {
      title: "Yoga Therapy Researcher — Integrative Medicine",
      sector: "Yoga & Naturopathy",
      company: "AIIMS Integrative Wing",
      matchScore: 92,
      competencies: ["Yoga Protocol Design", "Research Methodology", "Data Analysis", "Patient Assessment"],
      type: "Research Project"
    }
  ];


  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="space-y-20 sm:space-y-28 pb-16">


      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 pb-12 overflow-hidden">

        {/* Background glow effects — AYUSH green palette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-600/8 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-teal-600/8 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/6 blur-[80px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto text-center space-y-8 px-4">

          {/* Top badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Leaf className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>SIH 2026 — Problem Statement ID: SIH26044</span>
            <span className="hidden sm:inline text-emerald-500/60">•</span>
            <span className="hidden sm:inline text-amber-400 font-semibold">Team Zenith</span>
          </div>


          {/* Hero headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Bridging AYUSH Education,{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
              Skill Competencies,
            </span>
            <br className="hidden md:block" />
            and Industry Realities.
          </h1>


          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-4xl mx-auto font-normal leading-relaxed">
            A competency-driven intelligence ecosystem connecting students, academicians, and healthcare industries for placements, live projects, research, and skill verification.
          </p>


          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleCTA('skill-dna')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <ClipboardCheck className="h-5 w-5" />
              <span>Evaluate Your Skills</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleCTA('opportunities')}
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-xl text-base border border-slate-700/80 transition-all duration-200 backdrop-blur-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <span>Explore Opportunities</span>
            </button>
          </div>


          {/* Hero Interactive Preview — AYUSH Skill Passport Score */}
          <div className="pt-8 max-w-2xl mx-auto">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 text-left relative overflow-hidden">

              {/* Card header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AYUSH Skill Passport — Preview</h3>
                    <p className="text-xs text-slate-400">Competency Profile Snapshot</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Verified</span>
                </span>
              </div>

              {/* Passport score bars */}
              <div className="space-y-3">
                {[
                  { name: "Clinical Research & Trials", score: 84, color: "bg-emerald-500" },
                  { name: "GMP & Quality Control", score: 76, color: "bg-teal-500" },
                  { name: "Dravyaguna Vigyan", score: 91, color: "bg-amber-500" },
                  { name: "Pharmacovigilance", score: 62, color: "bg-blue-500" },
                  { name: "Yoga Protocol Design", score: 88, color: "bg-purple-500" }
                ].map((skill, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-medium">{skill.name}</span>
                      <span className="font-mono font-bold text-white">{skill.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI recommendation */}
              <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>🔬 AI Recommendation: Strengthen Pharmacovigilance — enroll in CDSCO Basics module</span>
                <span className="text-amber-400 font-bold shrink-0 ml-2">+14% Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: ECOSYSTEM LIVE METRICS
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Verified Industries", value: "50+", icon: Building2, sub: "AYUSH Healthcare Partners" },
            { label: "Active Internships", value: "100+", icon: Briefcase, sub: "Live Projects & Placements" },
            { label: "Student Assessments", value: "1,200+", icon: ClipboardCheck, sub: "Skill Verifications Done" },
            { label: "Academic Institutions", value: "20+", icon: GraduationCap, sub: "Partnered Colleges & Universities" }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 rounded-xl border border-slate-800/80 text-left group hover:border-emerald-500/30 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: CORE CAPABILITIES — 4 PILLARS
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Core Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">
            Four Pillars of the AYUSH Competency Ecosystem
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            A closed-loop intelligence engine driving synergy between AYUSH academic curriculum, verified student competencies, and real healthcare industry demand.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              num: "01",
              title: "Competency-Driven Matching",
              desc: "Explainable match scores based on real skill verification — not simple resume keyword matching. Our algorithm weighs assessment results, mentor evaluations, project outcomes, and domain depth to compute transparent compatibility.",
              icon: Target,
              badge: "Explainable AI",
              accent: "emerald"
            },
            {
              num: "02",
              title: "Skill Gap Engine",
              desc: "Identifies precise competency deficits between a student's verified profile and target career roles. Generates actionable course, workshop, and certification recommendations to bridge each gap within a defined timeline.",
              icon: FileSearch,
              badge: "Actionable Insights",
              accent: "teal"
            },
            {
              num: "03",
              title: "Verified AYUSH Skill Passport",
              desc: "A dynamic, tamper-evident competency portfolio built from assessment scores, mentor evaluations, project artifacts, and institutional certifications. Replaces static resumes with a living skills document.",
              icon: BadgeCheck,
              badge: "Verified Portfolio",
              accent: "amber"
            },
            {
              num: "04",
              title: "Academia-Industry Synergy",
              desc: "Dedicated pipelines for Faculty Internships, Faculty Development Programs (FDPs), Consultancy engagements, and Collaborative Research — bridging institutional curriculum with live industry problem statements.",
              icon: Handshake,
              badge: "Collaboration",
              accent: "blue"
            }
          ].map((card, i) => {
            const accentMap = {
              emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", hoverBorder: "hover:border-emerald-500/40" },
              teal: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20", hoverBorder: "hover:border-teal-500/40" },
              amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", hoverBorder: "hover:border-amber-500/40" },
              blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", hoverBorder: "hover:border-blue-500/40" }
            };
            const a = accentMap[card.accent];

            return (
              <div key={i} className={`glass-card glass-card-hover p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-between ${a.hoverBorder} transition-all duration-200`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold font-mono text-slate-600">{card.num}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-md ${a.bg} ${a.text} border ${a.border} font-semibold`}>{card.badge}</span>
                  </div>
                  <div className={`p-3 ${a.bg} w-fit rounded-xl ${a.text} mb-4`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{card.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: ROLE-BASED EXPERIENCE TABS
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Tailored Experience</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Built for Every Stakeholder</h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Whether you're a student, industry partner, or faculty member — the platform adapts to your role.
          </p>
        </div>


        {/* Tab selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 gap-1">
            {[
              { id: 'student', label: 'Student', icon: GraduationCap },
              { id: 'industry', label: 'Industry', icon: Building2 },
              { id: 'faculty', label: 'Faculty', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRoleTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeRoleTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Tab content */}
        {(() => {
          const role = roleTabData[activeRoleTab];
          const RoleIcon = role.icon;
          const accentColors = {
            emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20" },
            blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20" },
            amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" }
          };
          const ac = accentColors[role.accent];

          return (
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                {/* Left — Text content */}
                <div className="space-y-6">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${ac.bg} border ${ac.border} ${ac.text} text-xs font-semibold`}>
                    <RoleIcon className="h-4 w-4" />
                    <span>{role.title}</span>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {role.description}
                  </p>

                  <ul className="space-y-3">
                    {role.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                        <CheckCircle2 className={`h-5 w-5 ${ac.text} shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCTA(role.cta.action)}
                    className={`${ac.btn} text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 cursor-pointer`}
                  >
                    <span>{role.cta.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>


                {/* Right — Visual graphic */}
                <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                    <span className="font-semibold text-white">
                      {activeRoleTab === 'student' ? 'Competency Radar' : activeRoleTab === 'industry' ? 'Talent Pipeline' : 'Curriculum Alignment'}
                    </span>
                    <span className={ac.text}>
                      {activeRoleTab === 'student' ? 'Riya Sharma (BAMS 4th Yr)' : activeRoleTab === 'industry' ? 'Himalaya Wellness' : 'NIA Jaipur'}
                    </span>
                  </div>

                  {activeRoleTab === 'student' && (
                    <div className="space-y-3">
                      {[
                        { name: "Dravyaguna Vigyan", level: 91, target: 95, color: "bg-emerald-500" },
                        { name: "Clinical Research", level: 78, target: 90, color: "bg-teal-500" },
                        { name: "Panchakarma Therapy", level: 85, target: 88, color: "bg-amber-500" },
                        { name: "Pharmacovigilance", level: 52, target: 80, color: "bg-rose-500" }
                      ].map((skill, i) => (
                        <div key={i} className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>{skill.name}</span>
                            <span className="font-mono">Current: {skill.level}% | Target: {skill.target}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                            <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.level}%` }} />
                            <div className="h-full bg-slate-700 opacity-40 rounded-full" style={{ width: `${skill.target - skill.level}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeRoleTab === 'industry' && (
                    <div className="space-y-3">
                      {[
                        { role: "QC Analyst — GMP", applicants: 24, avgMatch: "82%", status: "Active" },
                        { role: "Clinical Research Intern", applicants: 38, avgMatch: "76%", status: "Active" },
                        { role: "Yoga Therapist — R&D", applicants: 12, avgMatch: "89%", status: "Closing Soon" }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-white">{item.role}</div>
                            <div className="text-slate-400">{item.applicants} applicants • Avg Match: {item.avgMatch}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeRoleTab === 'faculty' && (
                    <div className="space-y-3">
                      {[
                        { module: "RS401: Rasa Shastra — Advanced", status: "Syllabus Update Needed", score: "64%", color: "text-amber-400" },
                        { module: "KC302: Kaya Chikitsa — Metabolic", status: "Industry Certified Track", score: "92%", color: "text-emerald-400" },
                        { module: "DG201: Dravyaguna — Pharmacognosy", status: "Add Analytical Chemistry", score: "73%", color: "text-blue-400" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-white">{item.module}</div>
                            <div className="text-slate-400">{item.status}</div>
                          </div>
                          <span className={`font-mono font-bold ${item.color}`}>{item.score} Match</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: FEATURED OPPORTUNITIES & SKILL GAP DEMO
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Live Opportunities</h2>
            <h3 className="text-3xl font-bold text-white">Featured AYUSH Opportunities</h3>
          </div>
          <button
            onClick={() => handleCTA('opportunities')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Opportunities</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleOpportunities.map((opp, i) => (
            <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">

                {/* Type & Match Score */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 tracking-wider">
                    {opp.type}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    opp.matchScore >= 85
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : opp.matchScore >= 70
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {opp.matchScore}% Match
                  </span>
                </div>

                {/* Title & Sector */}
                <h4 className="text-base font-bold text-white leading-snug">{opp.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{opp.company}</span>
                  <span className="text-slate-600">•</span>
                  <span>{opp.sector}</span>
                </div>

                {/* Competency tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.competencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/15"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply CTA */}
              <button
                onClick={() => handleCTA('opportunities')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: TRUST & COLLABORATION BANNER
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-card p-10 sm:p-16 rounded-3xl border border-emerald-500/20 text-center relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40">

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <Shield className="h-8 w-8" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Bridge Your AYUSH Skill Gap?
            </h3>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Join 1,200+ students, 50+ industry partners, and 20+ academic institutions building the future of competency-driven AYUSH healthcare workforce development.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => handleCTA('skill-dna')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl text-base transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Start Free Skill Assessment</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>


            {/* Trust logos */}
            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-4">Aligned With</div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {["Ministry of AYUSH", "CCIM", "CCH", "NABH", "SIH 2026"].map((partner, p) => (
                  <div key={p} className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 font-semibold text-xs flex items-center space-x-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{partner}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="max-w-7xl mx-auto px-4 pt-12 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">

          {/* Brand column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white block">AYUSH Portal</span>
                <span className="text-[10px] text-slate-400 font-semibold block">Team Zenith — SIH26044</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Competency-driven intelligence ecosystem connecting AYUSH students, academicians, and healthcare industries.
            </p>
          </div>


          {/* Navigation columns */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
              <li><Link to="/opportunities" className="hover:text-emerald-400 transition">Opportunities</Link></li>
              <li><Link to="/skill-dna" className="hover:text-emerald-400 transition">Skill Assessment</Link></li>
              <li><Link to="/academia-lab" className="hover:text-emerald-400 transition">Collaborations</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">About</Link></li>
              <li><Link to="/industry-demand" className="hover:text-emerald-400 transition">Industry Demand</Link></li>
              <li><span className="text-slate-600 cursor-default">API Documentation</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Legal & Access</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Accessibility Statement</span></li>
              <li><span className="cursor-default">Contact Support</span></li>
            </ul>
          </div>
        </div>


        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>© 2026 AYUSH Academia-Industry Collaboration Portal — Team Zenith. Built for Smart India Hackathon 2026 (SIH26044).</span>
          <span className="text-slate-600">Developed under the guidance of Ministry of AYUSH, Government of India.</span>
        </div>
      </footer>

    </div>
  );
}
