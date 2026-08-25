import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Search, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/ApplyModal';

function StudentOpportunities() {
  const { token } = useAuth();
  
  // State variables
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter variables
  const [typeFilter, setTypeFilter] = useState(''); // '' (all), 'internship', 'job'
  const [skillSearch, setSkillSearch] = useState(''); // Comma-separated search

  const [selectedOpp, setSelectedOpp] = useState(null);
  const [appliedOpps, setAppliedOpps] = useState([]);

  const fetchStudentApplications = async () => {
    try {
      const response = await fetch('/api/applications/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.applications) {
        setAppliedOpps(data.applications.map(app => app.opportunityId?._id).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching student applications list:', err);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    setError('');
    
    // Build query params
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (skillSearch) params.append('skills', skillSearch);

    try {
      const response = await fetch(`/api/opportunities?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch opportunities');
      }
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    if (token) {
      fetchOpportunities();
      fetchStudentApplications();
    }
  }, [token, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white font-sans">Explore Corporate Openings</h2>
          <p className="text-slate-400 text-xs mt-0.5">Find internships and jobs matched with your technical skillset and preferences.</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Skill Tag Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150"
              placeholder="Search by required skills (e.g. React, Node, Python)..."
            />
          </div>

          <div className="flex gap-2">
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="internship">Internships Only</option>
              <option value="job">Full-time Jobs Only</option>
            </select>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition duration-150 cursor-pointer shadow-md"
            >
              Search
            </button>
          </div>
        </form>

        {skillSearch && (
          <p className="text-[10px] text-slate-500 italic">
            Showing postings requiring any of: {skillSearch.split(',').map((s, idx) => (
              <span key={idx} className="bg-slate-850 px-1.5 py-0.5 rounded text-slate-400 font-mono ml-1">{s.trim()}</span>
            ))}
          </p>
        )}
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-450 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-xs">Scanning available placements...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/35 p-6 rounded-2xl text-center space-y-2 max-w-lg mx-auto">
          <p className="text-red-400 font-bold text-sm">Error Loading Opportunities</p>
          <p className="text-xs text-slate-400 font-mono">{error}</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-400 font-bold text-sm">No Openings Found</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria, clearing the skills query, or checking back later as companies post new opportunities.
          </p>
          <button 
            onClick={() => { setTypeFilter(''); setSkillSearch(''); }} 
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp._id} className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-6 shadow-md transition duration-200 flex flex-col justify-between space-y-4">
              
              {/* Header: Company & Title */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${opp.type === 'job' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {opp.type}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1.5 leading-snug">{opp.title}</h3>
                  </div>
                  {opp.compatibilityScore !== null && opp.compatibilityScore !== undefined && (
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase border shrink-0 ${
                      opp.compatibilityScore >= 80 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : opp.compatibilityScore >= 50 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {opp.compatibilityScore}% Match
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-400">
                  <span className="font-extrabold text-slate-200">{opp.companyId?.companyName}</span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="text-slate-450 italic">{opp.companyId?.industry || 'General Industry'}</span>
                </div>
              </div>

              {/* Description Body */}
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {opp.description}
              </p>

              {/* Details Tags */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-450 border-t border-b border-slate-850 py-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>{opp.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-indigo-400" />
                  <span>{opp.stipend}</span>
                </div>
                {opp.type === 'internship' && opp.duration && (
                  <div className="flex items-center space-x-2 col-span-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <span>Duration: {opp.duration}</span>
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Required Skillset</span>
                <div className="flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-850 text-slate-400 border border-slate-800 rounded text-[10px] font-semibold font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-2 flex items-center justify-between gap-4">
                {opp.companyId?.website ? (
                  <a 
                    href={opp.companyId.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div />
                )}
                
                {appliedOpps.includes(opp._id) ? (
                  <button 
                    disabled
                    className="bg-slate-800 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl border border-slate-750 cursor-not-allowed shadow-inner"
                  >
                    Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedOpp(opp)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm animate-pulse"
                  >
                    Apply Now
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {selectedOpp && (
        <ApplyModal 
          opportunity={selectedOpp}
          token={token}
          onSuccess={() => {
            setSelectedOpp(null);
            fetchStudentApplications();
            fetchOpportunities();
          }}
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </div>
  );
}

export default StudentOpportunities;
