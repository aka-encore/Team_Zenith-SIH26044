import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, BookOpen, ArrowRight, Dna, Layers, Target, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="space-y-16 pb-20 text-left max-w-5xl mx-auto">
      {/* HERO */}
      <div className="text-center space-y-4 pt-6">
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-500/20 font-mono uppercase">
          Platform Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How SkillNexus AI Works
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl mx-auto">
          A closed-loop intelligence engine connecting Student Skills ↔ College Curriculum ↔ Industry Opportunities.
        </p>
      </div>

      {/* 3 ROLES PROCESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Student Workflow */}
        <div className="app-card p-6 space-y-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 w-fit">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Students</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Build your verified Skill DNA matrix, discover skill gaps against live industry job descriptions, and follow personalized learning roadmaps to land relevant internships.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Interactive Skill Assessment</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Weighted Opportunity Matching</span>
            </li>
          </ul>
        </div>

        {/* Company Workflow */}
        <div className="app-card p-6 space-y-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 w-fit">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Companies</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Post tech stack requirements, project challenges, and internship openings to recruit pre-assessed student talent with verified engineering competencies.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>AI Candidate Compatibility Scoring</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Shortlist Qualified Candidates</span>
            </li>
          </ul>
        </div>

        {/* Institution Workflow */}
        <div className="app-card p-6 space-y-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 w-fit">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Colleges & Admins</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Gain campus-wide skill intelligence, identify department gap heatmaps, and leverage the **Academia × Industry Lab** for automated curriculum upgrade recommendations.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Department Skill Intelligence</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Academia × Industry Lab Pipeline</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/register"
          className="btn-primary px-8 py-3.5 text-sm"
        >
          <span>Get Started on SkillNexus AI</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
