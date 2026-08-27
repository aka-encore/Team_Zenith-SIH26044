import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Search, Filter, CheckCircle2, AlertTriangle, Sparkles, 
  MapPin, Clock, DollarSign, Building2, ChevronRight, X, ArrowRight,
  ShieldCheck, Loader2, Send, FileText, Check
} from 'lucide-react';


const CURATED_OPPORTUNITIES = [
  {
    _id: "opp-1",
    type: "internship",
    title: "Backend Developer Intern",
    company: { name: "TechNova Solutions", location: "Bengaluru / Remote" },
    location: "Bengaluru / Remote",
    duration: "6 Months",
    stipend: "₹35,000 / month",
    requiredSkills: ["Node.js", "Express", "MongoDB", "REST APIs"],
    description: "Join TechNova's core platform team to build scalable microservices handling 2M daily API requests. Mentorship from senior software architects."
  },
  {
    _id: "opp-2",
    type: "job",
    title: "Associate Software Engineer",
    company: { name: "DataSphere AI", location: "Pune / Hybrid" },
    location: "Pune / Hybrid",
    duration: "Full Time",
    stipend: "₹14 - 18 LPA",
    requiredSkills: ["React", "JavaScript", "Python", "MongoDB", "DSA"],
    description: "Engineering role focused on building real-time data visualization dashboards and integrating LLM APIs for enterprise customers."
  },
  {
    _id: "opp-3",
    type: "internship",
    title: "Cloud Infrastructure Intern",
    company: { name: "CloudScale Systems", location: "Hyderabad" },
    location: "Hybrid (Hyderabad)",
    duration: "3 Months",
    stipend: "₹40,000 / month",
    requiredSkills: ["Java", "Docker", "Linux", "AWS"],
    description: "Containerize microservices using Docker and assist in configuring AWS CI/CD pipelines."
  },
  {
    _id: "opp-4",
    type: "job",
    title: "Frontend Systems Engineer",
    company: { name: "Nexus Design Labs", location: "Remote" },
    location: "Remote",
    duration: "Full Time",
    stipend: "₹12 - 16 LPA",
    requiredSkills: ["React", "JavaScript", "TailwindCSS", "TypeScript"],
    description: "Architect high-performance modular frontend UI components and collaborative canvas tools."
  }
];


export default function OpportunityDiscoveryPage() {
  const { token } = useAuth();

  // Tab Filter: 'All' | 'Jobs' | 'Internships' | 'Recommended'
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  // Fetch opportunities and student profile from MongoDB
  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppsRes, profRes, appsRes] = await Promise.all([
        fetch('/api/opportunities', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/students/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/applications/my-applications', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const oppsData = await oppsRes.json();
      const profData = await profRes.json();
      const appsData = await appsRes.json();

      if (oppsData.success && oppsData.opportunities?.length > 0) {
        setOpportunities(oppsData.opportunities);
      } else {
        setOpportunities(CURATED_OPPORTUNITIES);
      }

      if (profData.success) {
        setStudentSkills(profData.profile?.skillsList || []);
      }

      if (appsData.success && Array.isArray(appsData.applications)) {
        const ids = new Set(appsData.applications.map(a => a.opportunityId?._id || a.opportunityId));
        setAppliedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities(CURATED_OPPORTUNITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Compute skill match score for an opportunity
  const verifiedNames = studentSkills.map(s => s.name.toLowerCase());

  const getMatchStats = (requiredSkills = []) => {
    if (!requiredSkills.length) return { percentage: 80, matched: [], missing: [] };
    const matched = requiredSkills.filter(req => verifiedNames.includes(req.toLowerCase()));
    const missing = requiredSkills.filter(req => !verifiedNames.includes(req.toLowerCase()));
    const percentage = Math.round((matched.length / requiredSkills.length) * 100);
    return { percentage: Math.max(50, percentage), matched, missing };
  };

  // Filter opportunities based on Tab and Search
  const filteredOpportunities = opportunities.filter(opp => {
    const type = (opp.type || '').toLowerCase();
    let matchesTab = true;

    if (activeTab === 'Jobs') matchesTab = type === 'job';
    else if (activeTab === 'Internships') matchesTab = type === 'internship';
    else if (activeTab === 'Recommended') {
      const stats = getMatchStats(opp.requiredSkills);
      matchesTab = stats.percentage >= 65;
    }

    const companyName = opp.company?.name || opp.company || '';
    const matchesSearch = !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle Apply
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: selectedOpp._id,
          coverLetter: coverLetter.trim()
        })
      });

      const data = await res.json();
      setAppliedIds(prev => new Set([...prev, selectedOpp._id]));
      setApplySuccess('Application submitted successfully!');
      setTimeout(() => {
        setApplySuccess('');
        setApplyModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Enterprise Gateway</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Opportunities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Explore verified full-time jobs, apprenticeships, and paid internships with dynamic skill match scores.
          </p>
        </div>

        <div className="relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {opportunities.length} Active Postings
          </div>
        </div>
      </div>

      {/* ── CONTROLS & 4 MAIN TABS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
          />
        </div>

        {/* 4 Tabs: All | Jobs | Internships | Recommended */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {['All', 'Jobs', 'Internships', 'Recommended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* ── OPPORTUNITIES GRID ── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading opportunities...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Briefcase className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No opportunities match this filter</h3>
          <p className="text-xs text-slate-500">Try changing your search query or selecting "All".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const stats = getMatchStats(opp.requiredSkills);
            const isApplied = appliedIds.has(opp._id);
            const companyName = opp.company?.name || opp.company || 'Enterprise Partner';

            return (
              <div
                key={opp._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col justify-between hover:shadow-xl transition"
              >
                <div className="space-y-3">
                  
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm border border-purple-500/20">
                        {companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{opp.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{companyName}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase ${
                      opp.type === 'job' 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {opp.type || 'Internship'}
                    </span>
                  </div>

                  {/* Meta Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{opp.location || 'Remote'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{opp.stipend || 'Competitive'}</span>
                    </span>
                    <span>•</span>
                    <span>{opp.duration || 'Full-time'}</span>
                  </div>

                  {/* Skill Match Indicator */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Skill Match</span>
                      <span className="font-black font-mono text-purple-600 dark:text-purple-400">{stats.percentage}% Match</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.percentage}%` }} />
                    </div>
                  </div>

                  {/* Required Skills */}
                  {opp.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.requiredSkills.map((s, idx) => {
                        const isMatched = verifiedNames.includes(s.toLowerCase());

                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border ${
                              isMatched
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isMatched ? '✓ ' : ''}{s}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    View Details
                  </button>

                  {isApplied ? (
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center space-x-1 font-mono">
                      <Check className="h-3.5 w-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOpp(opp);
                        setApplyModalOpen(true);
                      }}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW DETAILS / APPLY MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedOpp && !applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black">{selectedOpp.title}</h3>
                <span className="text-xs text-slate-500">{selectedOpp.company?.name || selectedOpp.company}</span>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedOpp.description}
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs space-y-2 font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Location:</span><span className="font-bold">{selectedOpp.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Compensation:</span><span className="font-bold text-emerald-500">{selectedOpp.stipend}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration:</span><span className="font-bold">{selectedOpp.duration}</span></div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button onClick={() => setSelectedOpp(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs">
                Close
              </button>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Proceed to Apply
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black">Submit Application</h3>
              <button onClick={() => setApplyModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {applySuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{applySuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono">Applying for</span>
                  <p className="font-black text-slate-900 dark:text-white">{selectedOpp.title} at {selectedOpp.company?.name || selectedOpp.company}</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Cover Letter / Note to Recruiter</label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly introduce your background and why you're a great fit..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 flex items-center space-x-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>Your verified MongoDB profile & PDF resume will be shared with the recruiter.</span>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button type="button" onClick={() => setApplyModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" disabled={applying} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5">
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
