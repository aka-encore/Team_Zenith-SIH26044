import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Users, GraduationCap, Award, BookOpen, 
  MapPin, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ChevronRight, Star, Sparkles, Eye, Check, X, FileText, 
  ExternalLink, Layers, ShieldCheck, Briefcase, Plus, Target,
  SlidersHorizontal, Globe, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CandidateProfileModal from '../components/CandidateProfileModal';
import UserAvatar from '../components/UserAvatar';

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
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [careerInterestFilter, setCareerInterestFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('best_match'); // best_match | cgpa | experience

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
      if (targetOppId && targetOppId !== 'all') params.append('opportunityId', targetOppId);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (skillFilter.trim()) params.append('skills', skillFilter.trim());
      if (skillLevelFilter !== 'all') params.append('skillProficiency', skillLevelFilter);
      if (deptFilter !== 'all') params.append('branch', deptFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (minCgpaFilter !== 'all') params.append('minCgpa', minCgpaFilter);
      if (locationFilter !== 'all') params.append('location', locationFilter);
      if (careerInterestFilter !== 'all') params.append('careerInterests', careerInterestFilter);
      if (certFilter !== 'all') params.append('certifications', certFilter);
      if (experienceFilter !== 'all') params.append('experience', experienceFilter);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/company/students?${params.toString()}`, {
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
  }, [token, sortBy]);

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
    setSkillLevelFilter('all');
    setDeptFilter('all');
    setYearFilter('all');
    setMinCgpaFilter('all');
    setLocationFilter('all');
    setCareerInterestFilter('all');
    setCertFilter('all');
    setExperienceFilter('all');
    setSortBy('best_match');
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
      const response = await fetch(`/api/company/students/${shortlistModalStudent.studentId || shortlistModalStudent._id}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: selectedOppForShortlist,
          notes: shortlistNotes || 'Direct shortlist from Student Talent Search'
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to shortlist student.');
      }

      setStudents(prev => prev.map(s => 
        s._id === shortlistModalStudent._id ? { ...s, applicationStatus: 'shortlisted' } : s
      ));

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
    <div className="space-y-6 pb-20 text-left max-w-7xl mx-auto">
      {/* ━━━━━━━━━━━━━━━━━━━━ SUCCESS TOAST ━━━━━━━━━━━━━━━━━━━━ */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Search className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>Student Talent Search</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find and filter eligible student profiles across skills, proficiency levels, departments, CGPA, certifications, and career interests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchStudents(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{refreshing ? 'Searching...' : 'Refresh'}</span>
          </button>
          <Link
            to="/company/recommended-candidates"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recommended Candidates</span>
          </Link>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-rose-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ OPPORTUNITY MATCHING SELECTOR ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/50 dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-slate-950 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Evaluate Candidates Against Active Opportunity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  Skill Compatibility Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an opening to calculate transparent compatibility percentage and matched/missing skills for each student.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <select
              value={selectedOpportunityId}
              onChange={(e) => handleOpportunityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="">-- All Candidates (No Role Comparison) --</option>
              {opportunities.map(opp => (
                <option key={opp._id} value={opp._id}>
                  {opp.title} ({opp.type === 'internship' ? 'Internship' : 'Job'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opportunity Required Skills Bar */}
        {currentOpportunity && (
          <div className="pt-3 border-t border-indigo-100 dark:border-indigo-950/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Role Requirements ({currentOpportunity.title}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(currentOpportunity.requiredSkills || []).map((sk, idx) => {
                const name = typeof sk === 'object' ? sk.name : sk;
                const proficiency = typeof sk === 'object' ? sk.proficiency : 'intermediate';
                return (
                  <span 
                    key={idx} 
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                  >
                    {name} ({proficiency?.slice(0, 3)})
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ SEARCH & MULTI-DIMENSIONAL FILTERS ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top Search Line */}
        <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, college, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="relative flex-1 w-full">
            <Sparkles className="h-4 w-4 absolute left-3.5 top-3 text-indigo-500" />
            <input
              type="text"
              placeholder="Filter by skill(s) (e.g. React, Node.js, Python)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center space-x-2 shrink-0"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Talent</span>
          </button>
        </form>

        {/* Multi-Filter Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Skill Proficiency Level */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Skill Proficiency
            </label>
            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Department / Branch */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Branch / Discipline
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Data Science">AI & Data Science</option>
              <option value="Mechanical">Mechanical Eng</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Academic Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="all">All Cohorts</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year (Pre-final)</option>
              <option value="4th">4th Year (Final)</option>
              <option value="2025">Graduating 2025</option>
              <option value="2026">Graduating 2026</option>
            </select>
          </div>

          {/* Minimum CGPA */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Minimum CGPA
            </label>
            <select
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="all">Any Grade</option>
              <option value="7.0">CGPA 7.0+</option>
              <option value="7.5">CGPA 7.5+</option>
              <option value="8.0">CGPA 8.0+</option>
              <option value="8.5">CGPA 8.5+</option>
              <option value="9.0">CGPA 9.0+</option>
            </select>
          </div>

          {/* Career Interests */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Career Interests
            </label>
            <select
              value={careerInterestFilter}
              onChange={(e) => setCareerInterestFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
            >
              <option value="all">All Domains</option>
              <option value="Frontend">Frontend Development</option>
              <option value="Backend">Backend / Systems</option>
              <option value="Fullstack">Fullstack Engineering</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="Data">Data Science & AI</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-hidden cursor-pointer"
            >
              <option value="best_match">Best Match Score</option>
              <option value="cgpa">Highest CGPA</option>
              <option value="experience">Experience & Projects</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchQuery || skillFilter || deptFilter !== 'all' || yearFilter !== 'all' || minCgpaFilter !== 'all' || skillLevelFilter !== 'all' || careerInterestFilter !== 'all' || selectedOpportunityId || sortBy !== 'best_match') && (
          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 font-medium">
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

      {/* ━━━━━━━━━━━━━━━━━━━━ CANDIDATE TALENT CARDS ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Searching MongoDB Student Cohort...
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <Users className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No student candidates match your filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, lowering the minimum CGPA, or resetting branch filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Clear Filters & View All Candidates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => {
            const hasMatch = student.compatibilityScore !== null;
            const score = student.compatibilityScore ?? 0;
            const isEligible = student.isEligible ?? true;

            return (
              <div 
                key={student._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition shadow-sm flex flex-col justify-between space-y-3.5 text-left"
              >
                <div className="space-y-3">
                  {/* Top Bar: Avatar, Name & CGPA */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <UserAvatar
                        src={student.avatarUrl}
                        name={student.name}
                        size={40}
                        role="student"
                        fallbackLetter="S"
                        style={{ borderRadius: '12px' }}
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {student.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {student.education || 'Engineering Student'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {hasMatch ? (
                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold inline-flex items-center space-x-1 border ${
                          score >= 80
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : score >= 60
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>{score}% Match</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {student.overallScore}% Assessment
                        </span>
                      )}
                      {student.cgpa !== null && (
                        <span className="text-[10px] text-slate-400 font-mono font-bold block mt-0.5">
                          CGPA: {student.cgpa}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges Row: Year, Eligibility, Projects Count */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {student.year}
                    </span>
                    {hasMatch && (
                      <span className={`px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 ${
                        isEligible
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isEligible ? <span>✓ Eligible</span> : <span>✕ Ineligible</span>}
                      </span>
                    )}
                    {student.projects?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                        {student.projects.length} {student.projects.length === 1 ? 'Project' : 'Projects'}
                      </span>
                    )}
                    {student.certifications?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                        {student.certifications.length} Certs
                      </span>
                    )}
                  </div>

                  {/* Skills Pills */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {student.skills?.slice(0, 5).map((sk, idx) => {
                        const skName = typeof sk === 'object' ? sk.name : sk;
                        const skProf = typeof sk === 'object' ? sk.proficiency : '';
                        return (
                          <span 
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {skName} {skProf && `(${skProf.slice(0, 3)})`}
                          </span>
                        );
                      })}
                      {(student.skills?.length || 0) > 5 && (
                        <span className="text-[10px] font-mono px-1 py-0.5 text-slate-400">
                          +{student.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Matched vs Missing (when opportunity selected) */}
                  {hasMatch && selectedOpportunityId && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-[10px] space-y-1">
                      <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>✓ Matched:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                          {student.matchedSkills?.join(', ') || 'None'}
                        </span>
                      </div>
                      {student.missingSkills?.length > 0 && (
                        <div className="flex items-center space-x-1 text-rose-500 font-bold">
                          <span>✕ Missing:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                            {student.missingSkills.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-indigo-500" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShortlistModalStudent(student);
                      setShortlistError('');
                    }}
                    disabled={student.applicationStatus === 'shortlisted'}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                      student.applicationStatus === 'shortlisted'
                        ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                    }`}
                  >
                    {student.applicationStatus === 'shortlisted' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Shortlisted</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Shortlist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ CANDIDATE PROFILE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedStudent && (
        <CandidateProfileModal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent._id || selectedStudent.studentId}
          initialCandidate={selectedStudent}
          opportunityId={selectedOpportunityId || ''}
          onShortlist={(cand) => {
            setShortlistModalStudent(cand);
            setSelectedStudent(null);
            setShortlistError('');
          }}
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ SHORTLIST CANDIDATE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {shortlistModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-indigo-500/30 bg-white dark:bg-slate-950 space-y-4 shadow-2xl text-left">
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
                  {shortlistModalStudent.name} ({shortlistModalStudent.department || shortlistModalStudent.branch})
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-hidden focus:border-indigo-500 cursor-pointer font-bold"
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
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl outline-hidden focus:border-indigo-500"
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
