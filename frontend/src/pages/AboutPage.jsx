import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, Shield, Award, Users, Building2, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-20 text-left max-w-4xl mx-auto">
      <div className="text-center space-y-4 pt-6">
        <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-200 dark:border-blue-500/20 font-mono uppercase">
          SkillNexus AI Platform Mission Statement
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About SkillNexus AI
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Connecting student potential with industry demand through automated skill diagnostics and weighted matching.
        </p>
      </div>

      <div className="sb-glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Objective</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional college placement platforms rely on generic resumes that hide true engineering competencies. SkillNexus AI introduces a multi-dimensional Skill DNA matrix that evaluates student codebase depth, algorithmic capability, and core domain knowledge.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          By bridging static academic syllabi with live enterprise requirements through the **Academia × Industry Lab**, SkillNexus AI helps educational institutions deliver industry-ready engineering graduates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="sb-glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <GraduationCap className="h-8 w-8 text-blue-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Students</h4>
          <p className="text-xs text-slate-500">Discover skill gaps & roadmaps</p>
        </div>
        <div className="sb-glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Building2 className="h-8 w-8 text-purple-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Industry</h4>
          <p className="text-xs text-slate-500">Recruit verified talent</p>
        </div>
        <div className="sb-glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Award className="h-8 w-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Academia</h4>
          <p className="text-xs text-slate-500">Upgrade course curriculum</p>
        </div>
      </div>
    </div>
  );
}
