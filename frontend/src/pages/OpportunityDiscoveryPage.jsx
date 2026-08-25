import React, { useState } from 'react';
import { 
  Briefcase, Search, Filter, CheckCircle2, AlertTriangle, Sparkles, 
  MapPin, Clock, DollarSign, Building2, ChevronRight, X, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function OpportunityDiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(null);

  const opportunities = [
    {
      id: 1,
      category: "Internships",
      role: "Backend Developer Intern",
      company: "TechNova Solutions",
      logo: "TN",
      location: "Bengaluru / Remote",
      duration: "6 Months",
      stipend: "₹35,000 / month",
      matchScore: 91,
      matchReason: "High compatibility with your mapped Node.js, Express, and MongoDB skills. Missing 2 cloud competencies which can be learned on-the-job.",
      matchedSkills: ["Node.js", "Express", "MongoDB", "REST APIs"],
      missingSkills: ["Docker", "AWS"],
      description: "Join TechNova's core platform team to build scalable microservices handling 2M daily API requests. Excellent learning opportunity with mentorship from senior engineers."
    },
    {
      id: 2,
      category: "Industry Projects",
      role: "Cloud Microservices Migration",
      company: "CloudScale Systems",
      logo: "CS",
      location: "Hybrid (Hyderabad)",
      duration: "3 Months",
      stipend: "₹45,000 Project Grant",
      matchScore: 84,
      matchReason: "Strong fit based on your Java and Linux background. Project includes guided Docker containerization training.",
      matchedSkills: ["Java", "Linux", "Git"],
      missingSkills: ["Kubernetes", "AWS EKS"],
      description: "Migrate legacy enterprise monoliths into modular containerized services using Kubernetes and Docker."
    },
    {
      id: 3,
      category: "Jobs",
      role: "Associate Software Engineer",
      company: "DataSphere AI",
      logo: "DS",
      location: "Pune / Full-time",
      duration: "Full Time",
      stipend: "₹14 - 18 LPA",
      matchScore: 88,
      matchReason: "Matched via your high DSA score and React expertise. Perfect entry-level role for CS graduates.",
      matchedSkills: ["React", "JavaScript", "DSA", "SQL"],
      missingSkills: ["PyTorch", "Vector DB"],
      description: "Engineering role focused on building real-time data visualization dashboards and integrating LLM APIs."
    },
    {
      id: 4,
      category: "Live Projects",
      role: "AI Knowledge Base RAG Tool",
      company: "CyberShield Security",
      logo: "CS",
      location: "Remote",
      duration: "2 Months",
      stipend: "₹25,000 Stipend",
      matchScore: 78,
      matchReason: "Your Python & MongoDB skills qualify you for this live research project sponsored by CyberShield.",
      matchedSkills: ["Python", "MongoDB", "FastAPI"],
      missingSkills: ["LangChain", "Vector Indexing"],
      description: "Build an automated threat-intelligence RAG search tool over security whitepapers."
    }
  ];

  const categories = ["All", "Internships", "Jobs", "Industry Projects", "Live Projects"];

  const filteredOpps = opportunities.filter(opp => {
    const matchesCategory = activeCategory === 'All' || opp.category === activeCategory;
    const matchesSearch = opp.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center space-x-1.5">
              <Briefcase className="h-3.5 w-3.5 text-purple-400" />
              <span>Weighted Matching Engine</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Opportunity Discovery Hub</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Explore verified internships, jobs, and live industry projects ranked specifically by your AI Skill DNA compatibility score.
          </p>
        </div>
      </div>

      {/* SEARCH & CATEGORY BAR */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company, or tech stack (e.g. Node.js, AWS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OPPORTUNITY CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpps.map((opp) => (
          <div key={opp.id} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    {opp.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{opp.role}</h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center space-x-2">
                      <span>{opp.company}</span>
                      <span>•</span>
                      <span className="text-slate-300">{opp.category}</span>
                    </p>
                  </div>
                </div>

                {/* Match Badge */}
                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 inline-block">
                    {opp.matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Details pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{opp.location}</span>
                </span>
                <span className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  <span>{opp.duration}</span>
                </span>
                <span className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 text-emerald-400 font-semibold">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{opp.stipend}</span>
                </span>
              </div>

              {/* SKILLS BREAKDOWN (✓ vs ⚠) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Skill Compatibility Breakdown:</div>
                <div className="flex flex-wrap gap-1.5">
                  {opp.matchedSkills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono flex items-center space-x-1">
                      <span>✓</span>
                      <span>{sk}</span>
                    </span>
                  ))}
                  {opp.missingSkills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 font-mono flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{sk}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD BOTTOM ACTION */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedOpp(opp)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Why this matches you</span>
              </button>

              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* "WHY THIS MATCHES YOU" AI MODAL DRAWER */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-6 relative bg-slate-950">
            <button
              onClick={() => setSelectedOpp(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-mono font-bold block">AI Skill Match Rationale</span>
                <h3 className="text-xl font-bold text-white">{selectedOpp.role} @ {selectedOpp.company}</h3>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Computed Compatibility Score:</span>
                <span className="text-emerald-400 font-bold font-mono text-base">{selectedOpp.matchScore}% Match</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                {selectedOpp.matchReason}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-slate-400">Detailed Requirements:</h4>
              <p className="text-slate-300 leading-relaxed">{selectedOpp.description}</p>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Application submitted for ${selectedOpp.role}!`);
                  setSelectedOpp(null);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
