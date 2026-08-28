import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Search, Filter, GraduationCap, Award, BookOpen, 
  MapPin, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, 
  ChevronRight, Sparkles, Eye, Check, X, FileText, 
  ExternalLink, Layers, ShieldCheck, Briefcase, Plus, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyStudentsPage() {
  const { token, user } = useAuth();

  // Data & Status State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'placed' | 'active_applicant' | 'not_applied'

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch Students Directory from MongoDB
  const fetchStudents = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (deptFilter !== 'all') params.append('department', deptFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (skillFilter.trim()) params.append('skill', skillFilter.trim());

      const response = await fetch(`/api/faculty/students?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to retrieve students roster.');
      }

      setStudents(resData.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setErrorMsg(err.message || 'Unable to connect to student directory service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token, deptFilter, yearFilter, skillFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchStudents();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side filter for placement status if applied
  const filteredStudents = students.filter(st => {
    if (statusFilter !== 'all' && st.placementStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setDeptFilter('all');
    setYearFilter('all');
    setSkillFilter('');
    setStatusFilter('all');
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
            <Users className="h-7 w-7 text-blue-500" />
            <span>Student Talent Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View student academic records, verified technical competencies, profile completion metrics, and hiring status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Student Directory"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
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
              placeholder="Search by student name, email, or skill keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Data Science">AI & Data Science Track</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Pre-final)</option>
              <option value="4">4th Year (Final Year)</option>
            </select>
          </div>

        </div>

        {/* Second Row: Specific Skill Filter, Placement Status & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Skill Filter Input */}
            <input
              type="text"
              placeholder="Filter by skill (e.g. React, Python, Java)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 w-56"
            />

            {/* Placement Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Placement Statuses</option>
              <option value="placed">Placed Candidates</option>
              <option value="active_applicant">Active Applicants</option>
              <option value="not_applied">Not Applied Yet</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {(searchQuery || deptFilter !== 'all' || yearFilter !== 'all' || skillFilter || statusFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <span className="text-xs font-mono font-bold text-slate-400">
              Found: {filteredStudents.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ STUDENT CARDS GRID ━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-blue-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading Student Directory...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No students found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Try adjusting your search criteria or clearing active department / skill filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Show All Students
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map(student => (
            <div 
              key={student._id}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-blue-400/40 dark:hover:border-blue-500/30 transition shadow-sm flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-3.5">
                
                {/* Header: Avatar, Name & CGPA */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-base shrink-0 overflow-hidden">
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
                      <p className="text-xs text-slate-400 font-mono line-clamp-1">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                    CGPA {student.cgpa}
                  </span>
                </div>

                {/* Department & Academic Year */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Department</span>
                    <span className="text-[10px] font-mono text-blue-500 font-bold">Year {student.year}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                    {student.department}
                  </span>
                </div>

                {/* Profile Completion Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Profile Completion</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {student.profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        student.profileCompletion >= 80 ? 'bg-emerald-500' : student.profileCompletion >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${student.profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* Skills DNA Badges */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Verified Skills ({student.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 4).map((sk, skIdx) => (
                      <span 
                        key={skIdx} 
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {student.skills.length > 4 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                        +{student.skills.length - 4} more
                      </span>
                    )}
                    {student.skills.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No skills listed yet</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Card Footer: Status & Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  student.placementStatus === 'placed'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : student.placementStatus === 'active_applicant'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  ● {student.placementStatus.replace('_', ' ')}
                </span>

                <button
                  onClick={() => setSelectedStudent(student)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Profile</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ STUDENT PROFILE DETAIL MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedStudent.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.department} • Year {selectedStudent.year}
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

            {/* Academic Information */}
            <div className="glass-card p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Background</h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Institution / College</span>
                  <span className="font-bold">{selectedStudent.college}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Academic CGPA</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudent.cgpa} / 10</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Department</span>
                  <span className="font-bold">{selectedStudent.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Applications Submitted</span>
                  <span className="font-bold text-blue-500">{selectedStudent.applicationsCount} openings</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedStudent.bio && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Bio</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedStudent.bio}
                </p>
              </div>
            )}

            {/* Verified Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Technical Skills</h4>
              {selectedStudent.skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills recorded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedStudent.skills.map((sk, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sk.name}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {sk.proficiencyLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center space-x-1 text-[11px]">
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
                <span className="font-bold text-slate-700 dark:text-slate-300">Resume Document</span>
                <a
                  href={selectedStudent.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View PDF Resume</span>
                </a>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end text-xs">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
