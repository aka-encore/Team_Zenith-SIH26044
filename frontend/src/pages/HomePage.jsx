import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Target, Cpu, Briefcase, Award,
  GraduationCap, Building2, School, CheckCircle2,
  Users, BarChart3, Search, Calendar, ShieldCheck, FileText, ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* ══════════════════════════════════════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-slate-800/80">
        
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* SIH Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-mono shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Smart India Hackathon • SIH26044</span>
            <span className="text-indigo-500/40">|</span>
            <span className="text-slate-300">Team Zenith</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            Portal for <span className="text-indigo-400">Academia–Industry Collaboration</span> for Skill Mapping, Internships & Placement
          </h1>

          {/* Short Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An integrated platform bridging academic curricula and corporate hiring needs through dynamic competency mapping, skill gap analysis, and verified campus placement drives.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to Portal</span>
            </button>
          </div>

          {/* Professional Context Image */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
              <img
                src="/images/hero_illustration.jpg"
                alt="Academia Industry Collaboration for Skill Mapping"
                className="w-full h-auto object-cover filter brightness-[0.9] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-left flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">SkillNexus AI Enterprise Platform</p>
                    <p className="text-[11px] text-slate-400">Verified student skill benchmarking & recruitment pipeline</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 font-bold">
                  ● Multi-Tenant Active
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════════
          2. HOW IT WORKS SECTION (Student → Skills → Skill Gap → Opportunities → Placement)
          ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              A continuous 5-stage progression from skill evaluation to campus placement.
            </p>
          </div>

          {/* 5-Step Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 relative space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">01</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">1. Student</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Student registers and establishes their academic profile.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 relative space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">02</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">2. Skills</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Complete skill assessments to measure domain proficiency.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 relative space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">03</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">3. Skill Gap</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Analyze deficiencies against live industry job requirements.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 relative space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">04</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">4. Opportunities</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Apply for verified job and internship hiring drives.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 relative space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">05</span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">5. Placement</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Attend scheduled interviews and secure placement offers.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════════
          3. FOR STUDENTS SECTION
          ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold">
                <GraduationCap className="h-4 w-4" />
                <span>Student Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Features for Students
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Tools to assess competence, bridge skill gaps, and apply for verified corporate openings.
              </p>
            </div>
            <Link 
              to="/login"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
            >
              <span>Access Student Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Skill Assessment</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Take standardized interactive tests across technical domains to benchmark your competencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Skill Gap Analysis</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Compare individual skill proficiency with live employer job requisites to focus study efforts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Jobs & Internships</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Explore approved full-time and internship openings with clear role descriptions and eligibility.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Application Tracking</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Monitor status updates from submission, shortlisting, and interviews to final selection.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════════
          4. FOR COMPANIES SECTION
          ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold">
                <Building2 className="h-4 w-4" />
                <span>Employer Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Features for Companies
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Recruitment solutions to source verified talent, post openings, and manage hiring pipelines.
              </p>
            </div>
            <Link 
              to="/login"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition"
            >
              <span>Access Company Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Find Skilled Students</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Filter and discover candidates based on verified skills, test scores, and academic branch.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Post Jobs / Internships</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Publish targeted hiring drives with specific skill prerequisites, stipend, and deadlines.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Shortlist Candidates</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Review structured applicant profiles and move qualified candidates to the shortlist stage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Interview Management</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Schedule and update interview details with real-time notifications sent to applicants.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════════
          5. FOR FACULTY SECTION
          ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold">
                <School className="h-4 w-4" />
                <span>Academic Institution Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Features for Faculty
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Departmental supervision tools to monitor student competencies, curriculum alignment, and placement performance.
              </p>
            </div>
            <Link 
              to="/login"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
            >
              <span>Access Faculty Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Student Skill Analytics</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Track departmental assessment metrics, individual test completion, and skill level distributions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Skill Gap Insights</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gain insights into technical areas where student cohorts require additional training to match industry demand.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-left hover:border-slate-700 transition">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Placement Tracking</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Oversee active placement drives, student applications, shortlisted candidates, and selection milestones.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════════
          6. SIMPLE FOOTER
          ══════════════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-8">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">
                Skill<span className="text-indigo-400">Nexus</span> AI
              </span>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link>
              <Link to="/register" className="hover:text-indigo-400 transition">Register</Link>
              <Link to="/how-it-works" className="hover:text-indigo-400 transition">How It Works</Link>
              <Link to="/about" className="hover:text-indigo-400 transition">About</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© 2026 Team Zenith • SIH Problem Statement SIH26044. All rights reserved.</p>
            <p>Portal for Academia–Industry Collaboration</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
