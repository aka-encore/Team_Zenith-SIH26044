import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Users, GraduationCap, Award, BookOpen, 
  MapPin, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ChevronRight, Star, Sparkles, Eye, Check, X, FileText, 
  ExternalLink, Layers, ShieldCheck, Briefcase, Plus, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyStudentSearchPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shortlistModalStudent, setShortlistModalStudent] = useState(null);
  const [selectedOppForShortlist, setSelectedOppForShortlist] = useState('');
  const [shortlistNotes, setShortlistNotes] = useState('');
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlistError, setShortlistError] = useState('');

  // Fetch students from backend with active query params and selected opportunity
  const fetchStudents = async (isManual = false, targetOppId = selectedOpportunityId) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (targetOppId) params.append('opportunityId', targetOppId);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (skillFilter.trim()) params.append('skill', skillFilter.trim());
      if (deptFilter !== 'all') params.append('department', deptFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (minCgpaFilter !== 'all') params.append('minCgpa', minCgpaFilter);
      if (skillLevelFilter !== 'all') params.append('skillLevel', skillLevelFilter);

      const response = await fetch(`/api/companies/students?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve students catalog.');
      }

      setStudents(resData.students || []);
      setOpportunities(resData.opportunities || []);
      if (resData.opportunities && resData.opportunities.length > 0 && !selectedOppForShortlist) {
        setSelectedOppForShortlist(resData.opportunities[0]._id);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setErrorMsg(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Handle Opportunity Selection Change
  const handleOpportunityChange = (oppId) => {
    setSelectedOpportunityId(oppId);
    if (oppId) {
      setSelectedOppForShortlist(oppId);
    }
    fetchStudents(true, oppId);
  };

  // Trigger search on filter apply
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    fetchStudents(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSkillFilter('');
    setDeptFilter('all');
    setYearFilter('all');
    setMinCgpaFilter('all');
    setSkillLevelFilter('all');
    setSelectedOpportunityId('');
    setTimeout(() => {
      fetchStudents(true, '');
    }, 50);
  };

  // Handle Shortlist Submission
  const handleConfirmShortlist = async (e) => {
    e.preventDefault();
    if (!shortlistModalStudent) return;

    setShortlisting(true);
    setShortlistError('');

    try {
      const response = await fetch(`/api/companies/students/${shortlistModalStudent._id}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: selectedOppForShortlist,
          notes: shortlistNotes
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to shortlist student.');
      }

      setSuccessMsg(`Student ${shortlistModalStudent.name} successfully added to your shortlisted talent pool!`);
      setShortlistModalStudent(null);
      setShortlistNotes('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Shortlist error:', err);
      setShortlistError(err.message || 'Error occurred while shortlisting.');
    } finally {
      setShortlisting(false);
    }
  };

  const currentOpportunity = opportunities.find(o => o._id === selectedOpportunityId);

  return (
    <div className="space-y-8 pb-20 text-left max-w-7xl mx-auto">

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/company" 
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Search className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>Student Talent Search</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare candidate skill DNA against your active hiring drives using the real-time Skill Matching Engine.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Talent Pool"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━━━━━━━━━ */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITY MATCHING SELECTOR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/50 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-slate-950 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Compare Candidates Against Opportunity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  Skill Matching Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select one of your company's active openings to rank candidates by exact required skill compatibility.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <select
              value={selectedOpportunityId}
              onChange={(e) => handleOpportunityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="">-- Select an opportunity to compare students --</option>
              {opportunities.map(opp => (
                <option key={opp._id} value={opp._id}>
                  {opp.title} ({opp.type === 'internship' ? 'Internship' : 'Job'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opportunity Required Skills Bar (when an opportunity is selected) */}
        {currentOpportunity && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Target Requirements ({currentOpportunity.title}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(currentOpportunity.requiredSkills || []).map((sk, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & FILTERS CONTAINER ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm space-y-4">
        
        {/* Top Search Line */}
        <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, college, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="relative flex-1 w-full">
            <Sparkles className="h-4 w-4 absolute left-3.5 top-3.5 text-indigo-500" />
            <input
              type="text"
              placeholder="Filter by skill (e.g. React, Python, Docker)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center space-x-2 shrink-0"
          >
            <span>Search Talent</span>
          </button>
        </form>

        {/* Bottom Multi-Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          
          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Department / Branch
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science & Eng</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Data Science">AI & Data Science</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Year of Study
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              <option value="1st">1st Year (Freshman)</option>
              <option value="2nd">2nd Year (Sophomore)</option>
              <option value="3rd">3rd Year (Pre-final)</option>
              <option value="4th">4th Year (Graduating / Final)</option>
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Minimum CGPA
            </label>
            <select
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Any Academic Grade</option>
              <option value="7.0">CGPA 7.0+ & Above</option>
              <option value="7.5">CGPA 7.5+ & Above</option>
              <option value="8.0">CGPA 8.0+ & Above</option>
              <option value="8.5">CGPA 8.5+ & Above</option>
              <option value="9.0">CGPA 9.0+ & Above</option>
            </select>
          </div>

          {/* Skill Level Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Skill Proficiency Level
            </label>
            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Proficiency Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

        </div>

        {/* Active Filters Summary & Reset */}
        {(searchQuery || skillFilter || deptFilter !== 'all' || yearFilter !== 'all' || minCgpaFilter !== 'all' || skillLevelFilter !== 'all' || selectedOpportunityId) && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 font-medium">
              Showing filtered candidate results ({students.length})
              {currentOpportunity ? ` • Comparing against ${currentOpportunity.title}` : ''}
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ STUDENT TALENT CARDS ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Evaluating Student Skill DNA...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No students found matching your criteria
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Try adjusting your skill keywords, reducing the minimum CGPA, or resetting the department filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Clear Filters & View All Candidates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map(student => (
            <div 
              key={student._id}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-3.5">
                
                {/* Header: Avatar, Name & CGPA */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {student.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 block">
                      CGPA {student.cgpa}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      {student.year}
                    </span>
                  </div>
                </div>

                {/* Institution / College */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.college}</span>
                </div>

                {/* ── SKILL MATCHING SECTION ── */}
                {selectedOpportunityId ? (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    
                    {/* Match Percentage Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono flex items-center space-x-1 ${
                          (student.matchPercentage ?? 0) >= 75
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : (student.matchPercentage ?? 0) >= 50
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        }`}>
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>{student.matchPercentage ?? 0}% Match</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {student.matchedSkills?.length || 0} / {(student.matchedSkills?.length || 0) + (student.missingSkills?.length || 0)} skills
                      </span>
                    </div>

                    {/* Matched Skills */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Matched:
                      </span>
                      {student.matchedSkills && student.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.matchedSkills.map((sk, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">None</span>
                      )}
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                        Missing:
                      </span>
                      {student.missingSkills && student.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.missingSkills.map((sk, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">All required skills met!</span>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>Select an opportunity to compare students.</span>
                  </div>
                )}

                {/* All Verified Skills */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    All Profile Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills.slice(0, 5).map((sk, skIdx) => (
                      <span 
                        key={skIdx} 
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                      >
                        <span>{sk.name}</span>
                        <span className="text-[8px] text-indigo-500 uppercase font-extrabold">({sk.proficiencyLevel.slice(0, 3)})</span>
                      </span>
                    ))}
                    {student.skills.length > 5 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                        +{student.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5 text-indigo-500" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShortlistModalStudent(student);
                    setShortlistError('');
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Shortlist</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW STUDENT PROFILE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedStudent.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.department} • {selectedStudent.year}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Skill Match Breakdown against selected opportunity */}
            {selectedOpportunityId ? (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Skill Compatibility with: {currentOpportunity?.title || 'Selected Opening'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                    (selectedStudent.matchPercentage ?? 0) >= 75
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : (selectedStudent.matchPercentage ?? 0) >= 50
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                  }`}>
                    {selectedStudent.matchPercentage ?? 0}% Match
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Matched Required Skills:
                    </span>
                    {selectedStudent.matchedSkills && selectedStudent.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedStudent.matchedSkills.map((sk, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">None</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                      Missing Required Skills:
                    </span>
                    {selectedStudent.missingSkills && selectedStudent.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedStudent.missingSkills.map((sk, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">All required skills met!</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Select an opportunity to compare students.</span>
              </div>
            )}

            {/* Academic Information */}
            <div className="glass-card p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Credentials</h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Institution / College</span>
                  <span className="font-bold">{selectedStudent.college}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Academic CGPA</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedStudent.cgpa} / 10</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Department</span>
                  <span className="font-bold">{selectedStudent.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Skill Readiness Score</span>
                  <span className="font-bold text-indigo-500">{selectedStudent.overallScore}% Ready</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedStudent.bio && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Bio</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedStudent.bio}
                </p>
              </div>
            )}

            {/* Verified Skills Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Technical Skills</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedStudent.skills.map((sk, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sk.name}</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {sk.proficiencyLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Projects</h4>
                <div className="space-y-2">
                  {selectedStudent.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{proj.title}</span>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline flex items-center space-x-1 text-[11px]">
                            <span>Project Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Link */}
            {selectedStudent.resumeUrl && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Candidate Resume Document</span>
                <a
                  href={selectedStudent.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View PDF Resume</span>
                </a>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3 text-xs">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShortlistModalStudent(selectedStudent);
                  setSelectedStudent(null);
                  setShortlistError('');
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Shortlist Candidate</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SHORTLIST CANDIDATE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {shortlistModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-white dark:bg-slate-950 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Shortlist Student Candidate
                </h3>
              </div>
              <button 
                onClick={() => setShortlistModalStudent(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {shortlistError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {shortlistError}
              </div>
            )}

            <form onSubmit={handleConfirmShortlist} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Candidate:</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {shortlistModalStudent.name} ({shortlistModalStudent.department})
                </span>
              </div>

              {/* Opportunity Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Select Opportunity Track *
                </label>
                {opportunities.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
                    You have no active open opportunities. Please post a job or internship first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedOppForShortlist}
                    onChange={(e) => setSelectedOppForShortlist(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    {opportunities.map(opp => (
                      <option key={opp._id} value={opp._id}>
                        {opp.title} ({opp.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Recruiter Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Recruiter Screening Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Strong React and vector database foundations. Candidate scheduled for technical round 1."
                  value={shortlistNotes}
                  onChange={(e) => setShortlistNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShortlistModalStudent(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shortlisting || opportunities.length === 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer flex items-center space-x-2"
                >
                  {shortlisting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Shortlisting...</span>
                    </>
                  ) : (
                    <span>Confirm Shortlist</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
