import React, { useState } from 'react';
import { 
  Building2, Users, Briefcase, Plus, Sparkles, Search, Filter, 
  CheckCircle2, ChevronRight, Award, Target, FileText, ArrowRight
} from 'lucide-react';

export default function CompanyDashboardView({ companyName = "TechNova Solutions" }) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Internship');

  const candidates = [
    {
      id: 1,
      name: "Alex Chen",
      college: "IIT Bombay • CS 3rd Year",
      matchScore: 95,
      readiness: "Immediate Placement Ready",
      strongestSkills: ["Node.js", "Express", "React", "MongoDB"],
      matchReason: "100% stack match on backend Node.js + Express; verified Github capstone project with Redis caching.",
      github: "github.com/alexchen-dev",
      status: "Shortlisted"
    },
    {
      id: 2,
      name: "Priya Sharma",
      college: "NIT Surathkal • IT 4th Year",
      matchScore: 91,
      readiness: "Placement Ready",
      strongestSkills: ["Node.js", "Java", "Docker", "PostgreSQL"],
      matchReason: "Exceeds backend requirement; strong DSA credentials (LeetCode Top 5%).",
      github: "github.com/priyasharma",
      status: "Interview Scheduled"
    },
    {
      id: 3,
      name: "Rohan Varma",
      college: "BITS Pilani • ECE 3rd Year",
      matchScore: 88,
      readiness: "Skill Mapped",
      strongestSkills: ["Python", "FastAPI", "Docker", "AWS Basics"],
      matchReason: "High algorithmic score; completed SIH Microservices track.",
      github: "github.com/rohanv",
      status: "Under Review"
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER BAR */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center space-x-1.5">
              <Building2 className="h-3.5 w-3.5 text-purple-400" />
              <span>Corporate Talent Portal</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Find the skills you need.</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Recruit pre-assessed candidates matched against your exact tech stack specifications using SIH AI Skill Intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Opening</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Openings", val: "6 Positions", sub: "3 Internships, 2 Jobs, 1 Project" },
          { label: "Total Applicants", val: "184 Candidates", sub: "Pre-filtered by AI Score" },
          { label: "Top AI Matches", val: "24 Candidates", sub: ">85% Skill Compatibility" },
          { label: "Avg Time-to-Shortlist", val: "1.4 Days", sub: "68% faster hiring cycle" }
        ].map((st, s) => (
          <div key={s} className="glass-card p-5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">{st.label}</span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">{st.val}</div>
            <div className="text-[11px] text-slate-500 mt-1">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* AI CANDIDATE MATCHING LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>AI Candidate Matching Engine</span>
          </h3>
          <span className="text-xs text-slate-400">Ranked by Stack Fit</span>
        </div>

        <div className="space-y-4">
          {candidates.map((cand) => (
            <div key={cand.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-bold text-white">{cand.name}</h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {cand.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{cand.college} • <span className="text-emerald-400">{cand.readiness}</span></p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 block">
                      {cand.matchScore}% Match Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Rationale */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="text-indigo-400 font-semibold block">💡 Why this candidate matches your opening:</span>
                <p className="leading-relaxed">{cand.matchReason}</p>
              </div>

              {/* Skills and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 text-xs">
                  <span className="text-slate-400">Strongest Stack:</span>
                  {cand.strongestSkills.map((sk, k) => (
                    <span key={k} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition">
                    View Verified Skill DNA
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md">
                    Shortlist Candidate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE OPENING MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 bg-slate-950">
            <h3 className="text-xl font-bold text-white">Create New Opportunity</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Opportunity Title</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer Intern"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-3 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Opportunity Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-3 rounded-xl outline-none"
                >
                  <option>Internship</option>
                  <option>Job</option>
                  <option>Industry Project</option>
                  <option>Live Project</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Tech Stack Skills</label>
                <input
                  type="text"
                  placeholder="e.g. Node.js, Express, MongoDB, Docker"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-3 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Opportunity created successfully!");
                  setShowPostModal(false);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Publish Opening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
