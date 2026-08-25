import React from 'react';
import { 
  Building2, Users, GraduationCap, Briefcase, Sparkles, BarChart3, 
  Layers, ArrowUpRight, CheckCircle2, AlertTriangle, BookOpen, ChevronRight
} from 'lucide-react';

export default function CollegeDashboardView({ collegeName = "IIT Bombay / Zenith Institute" }) {
  const stats = [
    { label: "Total Mapped Students", val: "2,450", icon: Users, sub: "Across 6 Departments" },
    { label: "Industry Partners", val: "68 Enterprise", icon: Building2, sub: "Active Recruiter Access" },
    { label: "Active Internships", val: "410 Students", icon: Briefcase, sub: "Current Semester Placements" },
    { label: "Placement Ready Students", val: "74%", icon: GraduationCap, sub: "Targeting 85% Target" }
  ];

  const heatmaps = [
    { area: "Cloud Computing & AWS", gap: 61, totalStudents: 640, status: "Critical Training Need" },
    { area: "AI / Machine Learning", gap: 48, totalStudents: 520, status: "High Deficit" },
    { area: "DevOps & CI/CD Pipelines", gap: 42, totalStudents: 480, status: "High Deficit" },
    { area: "Cybersecurity & Security Protocols", gap: 34, totalStudents: 310, status: "Moderate Deficit" }
  ];

  const deptReadiness = [
    { dept: "Computer Science & Eng", readiness: "84%", activePlaced: "92%", topGap: "Cloud Infrastructure" },
    { dept: "Information Technology", readiness: "76%", activePlaced: "85%", topGap: "DevOps & Docker" },
    { dept: "Electronics & Comm", readiness: "64%", activePlaced: "71%", topGap: "Fullstack Web" },
    { dept: "Data Science & AI Track", readiness: "78%", activePlaced: "88%", topGap: "LLM Fine-tuning" }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-center space-x-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Institutional Intelligence Command Center</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Institution Skill Intelligence</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            {collegeName} dashboard for student skill readiness, industry gap analytics, and automated curriculum upgrade recommendations.
          </p>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">{st.label}</span>
              <st.icon className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{st.val}</div>
            <div className="text-[11px] text-slate-500">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* AI RECOMMENDATION CARD & HEATMAP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI ACTION RECOMMENDATION (1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase">
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
              <span>Recommended Action</span>
            </div>

            <h3 className="text-xl font-bold text-white leading-tight">
              Launch a Cloud + DevOps training program for 3rd-year IT students.
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              SkillBridge Intelligence identified that 18 partner companies have active openings requiring AWS + Docker, while 61% of 3rd-year IT students lack containerization credentials.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20">
              Generate Syllabus Advisory
            </button>
          </div>
        </div>

        {/* SKILL GAP HEATMAP (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <span>Institution Skill Gap Heatmap</span>
            </h3>
            <span className="text-xs text-slate-400">SkillBridge Diagnostic Vector</span>
          </div>

          <div className="space-y-3">
            {heatmaps.map((hm, h) => (
              <div key={h} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white">{hm.area}</h4>
                    <p className="text-xs text-slate-400">{hm.totalStudents} Enrolled Students Analyzed</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                    {hm.gap}% Identified Skill Gap
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Curriculum Mastery Level</span>
                    <span className="font-mono text-white font-bold">{100 - hm.gap}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="h-full bg-emerald-500" style={{ width: `${100 - hm.gap}%` }} />
                    <div className="h-full bg-rose-500 opacity-80" style={{ width: `${hm.gap}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEPARTMENT-WISE SKILLS & READINESS TABLE */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="h-5 w-5 text-purple-400" />
          <span>Department-Wise Readiness Matrix</span>
        </h3>

        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Department Track</th>
                  <th className="p-4">Placement Readiness</th>
                  <th className="p-4">Active Placement Rate</th>
                  <th className="p-4">Top Identified Skill Deficit</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {deptReadiness.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 font-bold text-white">{d.dept}</td>
                    <td className="p-4 font-mono text-indigo-400 font-bold">{d.readiness}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{d.activePlaced}</td>
                    <td className="p-4 font-mono text-rose-400">{d.topGap}</td>
                    <td className="p-4 text-right">
                      <button className="text-xs text-indigo-400 font-semibold hover:underline">
                        View Department Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
