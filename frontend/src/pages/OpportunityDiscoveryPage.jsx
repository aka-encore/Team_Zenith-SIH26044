import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Search, Filter, CheckCircle2, AlertTriangle, Sparkles, 
  MapPin, Clock, DollarSign, Building2, ChevronRight, X, ArrowRight,
  ShieldCheck, Loader2, Send, FileText, Check, AlertCircle, Calendar
} from 'lucide-react';

export default function OpportunityDiscoveryPage() {
  const { token } = useAuth();

  // Tab Filter: 'All' | 'Jobs' | 'Internships' | 'Recommended'
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [customResumeUrl, setCustomResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  // Fetch opportunities, student profile, and applications from MongoDB
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [oppsRes, profRes, appsRes] = await Promise.all([
        fetch('/api/opportunities', { headers }),
        fetch('/api/students/profile', { headers }),
        fetch('/api/applications/my-applications', { headers })
      ]);

      const oppsData = await oppsRes.json();
      const profData = await profRes.json();
      const appsData = await appsRes.json();

      if (oppsData.success && Array.isArray(oppsData.opportunities)) {
        setOpportunities(oppsData.opportunities);
      }

      if (profData.success && profData.profile) {
        setStudentProfile(profData.profile);
        setCustomResumeUrl(profData.profile.resumeUrl || '');
      }

      if (appsData.success && Array.isArray(appsData.applications)) {
        const ids = new Set(appsData.applications.map(a => a.opportunityId?._id || a.opportunityId));
        setAppliedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Filter opportunities based on Tab and Search
  const filteredOpportunities = opportunities.filter(opp => {
    const type = (opp.type || '').toLowerCase();
    let matchesTab = true;

    if (activeTab === 'Jobs') matchesTab = type === 'job';
    else if (activeTab === 'Internships') matchesTab = type === 'internship';
    else if (activeTab === 'Recommended') {
      matchesTab = (opp.matchPercentage ?? 0) >= 50;
    }

    const companyName = opp.companyId?.companyName || opp.companyName || opp.company?.name || '';
    const matchesSearch = !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle Apply Submission
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: selectedOpp._id,
          coverLetter: coverLetter.trim(),
          resumeUrl: customResumeUrl.trim() || studentProfile?.resumeUrl
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit application.');
      }

      setAppliedIds(prev => new Set([...prev, selectedOpp._id]));
      setApplySuccess('Application submitted successfully! Track status in your Applications page.');
      setTimeout(() => {
        setApplySuccess('');
        setApplyModalOpen(false);
        setCoverLetter('');
      }, 2000);
    } catch (err) {
      console.error('Apply error:', err);
      setApplyError(err.message || 'Error occurred while submitting application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0b1120] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Enterprise Gateway</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Opportunities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Explore verified full-time jobs, apprenticeships, and paid internships with dynamic skill match scores calculated directly from your profile.
          </p>
        </div>

        <div className="relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
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
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium"
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
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
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading opportunities...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Briefcase className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No opportunities match your filter</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or switching tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const hasApplied = appliedIds.has(opp._id);
            const companyName = opp.companyId?.companyName || opp.companyName || opp.company?.name || 'Verified Employer';
            const matchScore = opp.matchPercentage ?? 0;

            return (
              <div 
                key={opp._id}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md hover:border-indigo-400/40 transition flex flex-col justify-between space-y-5 text-left"
              >
                <div className="space-y-3.5">
                  
                  {/* Top line: Type & Match Score */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {opp.type}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      matchScore >= 75
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : matchScore >= 50
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {matchScore}% Match
                    </span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{opp.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{companyName}</span>
                    </p>
                  </div>

                  {/* Location, Stipend, Duration */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono pt-1">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{opp.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate text-emerald-600 dark:text-emerald-400 font-bold">{opp.stipend || 'Competitive'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{opp.duration || 'Full Time'}</span>
                    </div>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Required Skills */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {(opp.requiredSkills || []).map((sk, idx) => {
                        const skName = typeof sk === 'string' ? sk : (sk?.name || sk?.skill || 'Skill');
                        return (
                          <span 
                            key={idx} 
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {skName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedOpp(opp);
                      setApplyModalOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    View Details
                  </button>

                  {hasApplied ? (
                    <button 
                      disabled 
                      className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center space-x-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Applied</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOpp(opp);
                        setApplyModalOpen(true);
                        setApplyError('');
                        setApplySuccess('');
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer"
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

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW DETAILS MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedOpp && !applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                  {selectedOpp.type} Opening
                </span>
                <h3 className="text-base font-black mt-1">{selectedOpp.title}</h3>
                <span className="text-xs text-slate-500">{selectedOpp.companyId?.companyName || selectedOpp.companyName || 'Corporate Partner'}</span>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Position Description</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedOpp.description}
              </p>
            </div>

            {/* Compensation & Logistics */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs space-y-2 font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Location:</span><span className="font-bold">{selectedOpp.location || 'Remote'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Stipend / Package:</span><span className="font-bold text-emerald-500">{selectedOpp.stipend || 'Competitive'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration:</span><span className="font-bold">{selectedOpp.duration || 'Full Time'}</span></div>
              {selectedOpp.deadline && (
                <div className="flex justify-between"><span className="text-slate-400">Deadline:</span><span className="font-bold text-rose-500">{new Date(selectedOpp.deadline).toLocaleDateString()}</span></div>
              )}
            </div>

            {/* Required Skills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Required Skills & Prerequisites</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedOpp.requiredSkills || []).map((sk, idx) => {
                  const skName = typeof sk === 'string' ? sk : (sk?.name || sk?.skill || 'Skill');
                  return (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-bold">
                      {skName}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button onClick={() => setSelectedOpp(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs cursor-pointer">
                Close
              </button>
              {appliedIds.has(selectedOpp._id) ? (
                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl text-xs">
                  Already Applied
                </span>
              ) : (
                <button
                  onClick={() => {
                    setApplyModalOpen(true);
                    setApplyError('');
                    setApplySuccess('');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <span>Proceed to Apply</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ APPLY CONFIRMATION MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {applyModalOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black">Confirm Application</h3>
                <p className="text-xs text-slate-500">{selectedOpp.title} • {selectedOpp.companyId?.companyName || selectedOpp.companyName || 'Employer'}</p>
              </div>
              <button onClick={() => setApplyModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            {applySuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{applySuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                
                {applyError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Verified Resume Notice */}
                <div className="space-y-1.5">
                  <label className="font-bold block uppercase text-[10px] text-slate-400 font-mono">
                    Verified Resume Document Link *
                  </label>
                  <div className="relative">
                    <FileText className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/your-resume.pdf"
                      value={customResumeUrl}
                      onChange={(e) => setCustomResumeUrl(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                  {studentProfile?.resumeUrl && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ Pre-filled with verified resume from your profile
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="space-y-1">
                  <label className="font-bold block uppercase text-[10px] text-slate-400 font-mono">
                    Cover Letter / Candidate Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Why are you a great fit for this position? Highlight key projects or skills..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span>Your verified skills, academic details, and portfolio will be submitted with status: <strong>Applied</strong>.</span>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button type="button" onClick={() => setApplyModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={applying} 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{applying ? 'Submitting Application...' : 'Confirm & Apply'}</span>
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
