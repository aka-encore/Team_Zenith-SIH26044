import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Target, BookOpen, Briefcase,
  CheckCircle2, Building2, ChevronRight,
  BadgeCheck, Leaf, Handshake, FileSearch,
  Sparkles, GraduationCap, Microscope, Zap,
  BrainCircuit, Globe, Lock
} from 'lucide-react';


export default function HomePage() {
  const navigate = useNavigate();


  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.style.opacity = '1';
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);


  return (
    <div className="space-y-0 pb-0">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO — Full viewport immersive hero
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#060a13] dark:via-[#090d16] dark:to-[#0a1628]">

        {/* Animated background glow layers */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-400/10 dark:bg-emerald-600/10 blur-[160px] pointer-events-none rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-teal-300/8 dark:bg-teal-500/8 blur-[120px] pointer-events-none rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-amber-300/6 dark:bg-amber-500/6 blur-[100px] pointer-events-none rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-blue-300/5 dark:bg-blue-500/5 blur-[80px] pointer-events-none rounded-full" />

        {/* Floating grid lines */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-6xl mx-auto text-center space-y-10 px-4 sm:px-6">

          {/* Animated top badge */}
          <div className="inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-300/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>SIH 2024 — Problem Statement SIH26044</span>
            <span className="text-emerald-400/40 dark:text-emerald-500/40">|</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Team Zenith</span>
          </div>


          {/* Hero headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            <span className="block text-slate-900 dark:text-white">SkillNexus AI</span>
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent">
              Competency Intelligence
            </span>
            <span className="block mt-2 sm:mt-3 text-slate-600 dark:text-slate-200 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold">
              for the Future of Work
            </span>
          </h1>


          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            An AI-powered platform connecting students, academic institutions, and healthcare industries through
            verified competency mapping, skill gap analysis, and intelligent opportunity matching.
          </p>


          {/* CTAs — Login / Register */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-10 py-4.5 rounded-2xl text-base transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 flex items-center justify-center space-x-3 group cursor-pointer hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold px-10 py-4.5 rounded-2xl text-base border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 backdrop-blur-md flex items-center justify-center space-x-2.5 cursor-pointer hover:-translate-y-0.5 shadow-sm"
            >
              <Lock className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sign In</span>
            </button>
          </div>


          {/* Hero Image */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-2xl shadow-slate-300/30 dark:shadow-emerald-950/30">
              <img
                src="/images/hero_illustration.jpg"
                alt="SkillNexus AI — Academia-Industry Collaboration Ecosystem"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#090d16] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/15 rounded-lg backdrop-blur-sm border border-emerald-300/30 dark:border-emerald-500/20">
                    <BrainCircuit className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">AI-Powered Competency Mapping</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bridging education, skills, and industry demand</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-50 animate-bounce" style={{ animationDuration: '2s' }}>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Explore</span>
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 rotate-90" />
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: WHAT IS SKILLNEXUS — Platform overview
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-slate-50 dark:bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#090d16] dark:via-[#0b1120] dark:to-[#090d16]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 dark:via-emerald-500/20 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Image */}
            <div className="scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <img
                  src="/images/skill_passport.jpg"
                  alt="AI-Powered Skill Assessment and Verification"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 dark:from-emerald-900/20 via-transparent to-transparent" />
              </div>
            </div>


            {/* Right — Text */}
            <div className="space-y-6 scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-300/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Leaf className="h-3.5 w-3.5" />
                <span>About the Platform</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                What is{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  SkillNexus AI
                </span>?
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
                SkillNexus AI is a competency-driven intelligence ecosystem designed for
                <strong className="text-slate-800 dark:text-slate-200"> SIH Problem Statement 26044</strong> —
                an Academia-Industry Collaboration Portal that connects students,
                academic institutions, and healthcare industries.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { icon: Target, text: "AI-powered competency matching with explainable scores" },
                  { icon: BadgeCheck, text: "Verified Skill Passport replacing traditional resumes" },
                  { icon: FileSearch, text: "Personalized skill gap analysis with learning roadmaps" },
                  { icon: Handshake, text: "Direct academia-industry collaboration pipelines" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="mt-4 inline-flex items-center space-x-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition group cursor-pointer"
              >
                <span>Sign in to explore the platform</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: CORE CAPABILITIES — 4 Feature Pillars
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#090d16] dark:via-[#0c1322] dark:to-[#090d16]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-emerald-300/8 dark:bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-1/3 right-0 w-[350px] h-[350px] bg-teal-300/8 dark:bg-teal-600/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease' }}>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-300/30 dark:border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold mb-5">
              <Zap className="h-3.5 w-3.5" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Four Pillars of the{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-amber-500 dark:from-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                SkillNexus AI
              </span>{' '}
              Ecosystem
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-4 leading-relaxed max-w-2xl mx-auto">
              A closed-loop intelligence engine connecting academic curriculum, verified student competencies, and real industry demand.
            </p>
          </div>


          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Competency-Driven Matching",
                desc: "Explainable match scores based on real skill verification — not simple resume keyword matching. Transparent compatibility powered by assessment results, mentor evaluations, and project outcomes.",
                icon: Target,
                badge: "Explainable AI",
                accent: "emerald"
              },
              {
                num: "02",
                title: "Skill Gap Engine",
                desc: "Identifies precise competency deficits between a student's verified profile and target career roles. Generates actionable course and certification recommendations to bridge each gap.",
                icon: FileSearch,
                badge: "Actionable Insights",
                accent: "teal"
              },
              {
                num: "03",
                title: "Verified Skill Passport",
                desc: "A dynamic, tamper-evident competency portfolio built from assessment scores, mentor evaluations, project artifacts, and institutional certifications. A living skills document.",
                icon: BadgeCheck,
                badge: "Verified Portfolio",
                accent: "amber"
              },
              {
                num: "04",
                title: "Academia-Industry Synergy",
                desc: "Dedicated pipelines for Faculty Internships, Faculty Development Programs, Consultancy engagements, and Collaborative Research — bridging curriculum with live industry challenges.",
                icon: Handshake,
                badge: "Collaboration",
                accent: "blue"
              }
            ].map((card, i) => {
              const accentMap = {
                emerald: {
                  bg: "bg-emerald-500/10",
                  text: "text-emerald-600 dark:text-emerald-400",
                  border: "border-emerald-300/30 dark:border-emerald-500/20",
                  hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500/40",
                  glow: "group-hover:shadow-emerald-200/30 dark:group-hover:shadow-emerald-500/10"
                },
                teal: {
                  bg: "bg-teal-500/10",
                  text: "text-teal-600 dark:text-teal-400",
                  border: "border-teal-300/30 dark:border-teal-500/20",
                  hoverBorder: "hover:border-teal-400 dark:hover:border-teal-500/40",
                  glow: "group-hover:shadow-teal-200/30 dark:group-hover:shadow-teal-500/10"
                },
                amber: {
                  bg: "bg-amber-500/10",
                  text: "text-amber-600 dark:text-amber-400",
                  border: "border-amber-300/30 dark:border-amber-500/20",
                  hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500/40",
                  glow: "group-hover:shadow-amber-200/30 dark:group-hover:shadow-amber-500/10"
                },
                blue: {
                  bg: "bg-blue-500/10",
                  text: "text-blue-600 dark:text-blue-400",
                  border: "border-blue-300/30 dark:border-blue-500/20",
                  hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500/40",
                  glow: "group-hover:shadow-blue-200/30 dark:group-hover:shadow-blue-500/10"
                }
              };
              const a = accentMap[card.accent];

              return (
                <div
                  key={i}
                  className={`group sb-glass-card p-7 sm:p-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between ${a.hoverBorder} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${a.glow} scroll-animate`}
                  style={{ opacity: 0, transition: 'opacity 0.6s ease, transform 0.6s ease', transitionDelay: `${i * 100}ms` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-3xl font-extrabold font-mono text-slate-300 dark:text-slate-700">{card.num}</span>
                      <span className={`text-xs px-3 py-1 rounded-lg ${a.bg} ${a.text} border ${a.border} font-bold`}>{card.badge}</span>
                    </div>
                    <div className={`p-3.5 ${a.bg} w-fit rounded-xl ${a.text} mb-5`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{card.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: WHO IS IT FOR — Stakeholder overview
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#090d16] dark:via-[#0b1120] dark:to-[#090d16]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease' }}>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-300/30 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold mb-5">
              <Globe className="h-3.5 w-3.5" />
              <span>Built for Every Stakeholder</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Who is SkillNexus AI For?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-4 leading-relaxed">
              Whether you're a student, industry partner, or academic institution — the platform adapts to your role.
            </p>
          </div>


          {/* Stakeholder cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Students & Graduates",
                desc: "Build a verified competency profile, identify skill gaps against real industry requirements, and get matched with opportunities aligned to your strengths.",
                features: ["AI skill assessment", "Personalized learning paths", "Verified Skill Passport"],
                accent: "emerald",
                cta: "Register as Student"
              },
              {
                icon: Building2,
                title: "Industry Partners",
                desc: "Access a pipeline of pre-assessed, competency-verified talent. Reduce hiring risk with explainable match scores backed by real skill verification.",
                features: ["Competency-ranked candidates", "Live project collaboration", "Faculty development pipelines"],
                accent: "blue",
                cta: "Register as Industry"
              },
              {
                icon: BookOpen,
                title: "Academic Institutions",
                desc: "Align curriculum with real industry demands. Access faculty internships, FDPs, and collaborative research pipelines to strengthen institutional outcomes.",
                features: ["Curriculum gap heatmaps", "Student cohort analytics", "Research collaboration"],
                accent: "amber",
                cta: "Register as Institution"
              }
            ].map((card, i) => {
              const colors = {
                emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", check: "text-emerald-500" },
                blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", check: "text-blue-500" },
                amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", check: "text-amber-500" }
              };
              const c = colors[card.accent];

              return (
                <div
                  key={i}
                  className="group sb-glass-card p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-200/20 dark:hover:shadow-emerald-950/20 flex flex-col justify-between scroll-animate"
                  style={{ opacity: 0, transition: 'opacity 0.6s ease, transform 0.6s ease', transitionDelay: `${i * 120}ms` }}
                >
                  <div className="space-y-5">
                    <div className={`p-3 ${c.bg} w-fit rounded-xl ${c.text}`}>
                      <card.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>

                    <ul className="space-y-2.5 pt-2">
                      {card.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className={`h-4 w-4 ${c.check} shrink-0`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate(`/register?role=${card.accent === 'emerald' ? 'student' : card.accent === 'blue' ? 'industry' : 'faculty'}`)}
                    className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: COLLABORATION VISUAL — Full-width image band
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 overflow-hidden bg-white dark:bg-[#090d16]">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease' }}>
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-2xl shadow-slate-200/40 dark:shadow-none">
            <img
              src="/images/collaboration_network.jpg"
              alt="SkillNexus AI — Education and Industry Collaboration Network"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[#090d16]/80 via-transparent to-white/30 dark:to-[#090d16]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 dark:from-emerald-950/20 via-transparent to-teal-50/20 dark:to-teal-950/20" />

            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                  The Ecosystem That Connects All Stakeholders
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  SkillNexus AI creates a closed-loop intelligence pipeline — from academic curriculum
                  design to verified student competencies to real-time industry demand signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: CTA BANNER — Get started
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#090d16] dark:via-[#0c1622] dark:to-[#090d16]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-300/10 dark:bg-emerald-600/8 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 scroll-animate" style={{ opacity: 0, transition: 'opacity 0.6s ease' }}>
          <div className="sb-glass-card p-10 sm:p-16 rounded-3xl border border-emerald-300/30 dark:border-emerald-500/20 text-center relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-teal-950/30">

            <div className="relative z-10 space-y-6">
              <div className="inline-flex p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-300/30 dark:border-emerald-500/20">
                <Shield className="h-8 w-8" />
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Ready to Transform Your Career Journey?
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Join the SkillNexus AI ecosystem and bridge the gap between academic learning
                and industry-ready competencies. Create your free account today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 flex items-center justify-center space-x-2.5 cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold px-10 py-4 rounded-2xl text-base border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer hover:-translate-y-0.5 shadow-sm"
                >
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a13]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">

            {/* Brand column */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white block tracking-tight">SkillNexus AI</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">Competency Intelligence Platform</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                An AI-powered competency-driven intelligence ecosystem designed for
                SIH Problem Statement 26044, connecting students, institutions, and industry.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60">Built by Team Zenith</span>
              </div>
            </div>


            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center space-x-1.5">
                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                    <span>Sign In</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center space-x-1.5">
                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                    <span>Create Account</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center space-x-1.5">
                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                    <span>About</span>
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center space-x-1.5">
                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                    <span>How It Works</span>
                  </Link>
                </li>
              </ul>
            </div>


            {/* SIH Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Project Details</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li className="flex items-center space-x-2">
                  <Microscope className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-500/50" />
                  <span>SIH 2024 — PS Code: SIH26044</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-500/50" />
                  <span>Academia-Industry Collaboration Portal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-500/50" />
                  <span>Team Zenith</span>
                </li>
              </ul>
            </div>
          </div>


          {/* Bottom bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-600">
            <span>© 2026 SkillNexus AI — All rights reserved.</span>
            <span>Connecting student potential with industry demand.</span>
          </div>
        </div>
      </footer>


      {/* ═══════════════════════════════════════════════════════════
          INLINE CSS ANIMATIONS
          ═══════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease forwards;
        }
      `}</style>

    </div>
  );
}
