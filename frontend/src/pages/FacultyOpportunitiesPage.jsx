import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Building2, Search, Filter, MapPin, 
  Clock, DollarSign, Users, Award, ExternalLink, 
  RefreshCw, AlertCircle, ArrowLeft, ChevronRight, 
  Sparkles, CheckCircle2, Eye, X, Calendar, GraduationCap,
  Layers, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyOpportunitiesPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'job' | 'internship'
  const [skillFilter, setSkillFilter] = useState('');

  // Modal State
  const [selectedOpp, setSelectedOpp] = useState(null);

  // Fetch Opportunities from MongoDB
  const fetchOpportunities = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (skillFilter.trim()) params.append('skill', skillFilter.trim());

      const response = await fetch(`/api/faculty/opportunities?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve opportunities.');
      }

      setOpportunities(resData.opportunities || []);
    } catch (err) {
      console.error('Error fetching faculty opportunities:', err);
      setErrorMsg(err.message || 'Unable to connect to opportunities service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchOpportunities();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, skillFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSkillFilter('');
  };

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/faculty" 
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Briefcase className="h-7 w-7 text-indigo-500" />
            <span>Campus Opportunities & Drives</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor active recruiter hiring drives, required student competencies, and campus application pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOpportunities(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Opportunities"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* General Search */}
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, partner company, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Opportunity Types</option>
              <option value="job">Full-time Job Drives</option>
              <option value="internship">Internship Programs</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by skill (e.g. React, Docker)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {(searchQuery || typeFilter !== 'all' || skillFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {opportunities.length} Opportunities
            </span>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITIES GRID ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Campus Drives...</span>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No opportunities found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Try adjusting your search query or removing active skill and type filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Show All Opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map(opp => {
            const deadlineDate = opp.deadline ? new Date(opp.deadline) : null;

            return (
              <div 
                key={opp._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3.5">
                  
                  {/* Header: Company, Badge & Type */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {opp.company?.logo ? (
                          <img src={opp.company.logo} alt={opp.company.name} className="w-full h-full object-cover" />
                        ) : (
                          opp.company?.name?.charAt(0) || 'C'
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
                          {opp.company?.name}
                        </h4>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {opp.title}
                        </h3>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                      opp.type === 'job'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {opp.type}
                    </span>
                  </div>

                  {/* Location & Compensation */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{opp.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{opp.stipend}</span>
                    </span>
                  </div>

                  {/* Eligibility Preview */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Academic Eligibility</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Min CGPA {opp.eligibility?.minCgpa}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 block truncate text-[11px]">
                      {opp.eligibility?.allowedBranches?.join(', ')}
                    </span>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Required Skills ({opp.requiredSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {opp.requiredSkills.slice(0, 4).map((sk, skIdx) => (
                        <span 
                          key={skIdx} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                      {opp.requiredSkills.length > 4 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                          +{opp.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card Footer: Deadline & Action */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span><strong>{opp.applicantsCount}</strong> Applied</span>
                  </div>

                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITY DETAIL MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedOpp.company?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedOpp.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedOpp.company?.name} • {selectedOpp.company?.industry}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedOpp(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Opportunity Type</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">{selectedOpp.type}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Compensation</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedOpp.stipend}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Location</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedOpp.location}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Applications</span>
                <span className="font-extrabold text-blue-500">{selectedOpp.applicantsCount} Enrolled</span>
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="glass-card p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Eligibility Criteria</h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Cut-off CGPA</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Minimum {selectedOpp.eligibility?.minCgpa} CGPA</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Graduating Batches</span>
                  <span className="font-bold">{selectedOpp.eligibility?.passingYears?.join(', ')}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Eligible Departments</span>
                  <span className="font-bold">{selectedOpp.eligibility?.allowedBranches?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Opportunity Overview</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedOpp.description}
              </p>
            </div>

            {/* Required Skills Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills & Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedOpp.requiredSkills.map((sk, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-mono font-bold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end text-xs">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
