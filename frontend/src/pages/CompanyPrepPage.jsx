import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Search, Target, Code2, Layers, CheckCircle2,
  AlertTriangle, ArrowRight, BookOpen, Compass, Zap, Sparkles,
  ChevronRight, RefreshCw, Award, Clock, DollarSign, MapPin,
  FileCode, CheckSquare, Square, ShieldCheck, ExternalLink, Filter
} from 'lucide-react';

export default function CompanyPrepPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'job' | 'internship'
  const [loading, setLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState({});

  // Fetch real opportunities and student profile from MongoDB
  const fetchPrepData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [oppsRes, profRes] = await Promise.all([
        fetch('/api/opportunities', { headers }),
        fetch('/api/students/profile', { headers })
      ]);

      const oppsData = await oppsRes.json();
      const profData = await profRes.json();

      if (oppsData.success && Array.isArray(oppsData.opportunities)) {
        setOpportunities(oppsData.opportunities);
        if (oppsData.opportunities.length > 0 && !selectedOppId) {
          setSelectedOppId(oppsData.opportunities[0]._id);
        }
      }

      if (profData.success && profData.profile) {
        setStudentProfile(profData.profile);
      }
    } catch (err) {
      console.error('Error fetching company prep data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPrepData();
    }
  }, [token]);

  // Load completed DSA topics from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zenith_dsa_prep_progress');
      if (saved) {
        setCompletedTopics(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error restoring DSA progress:', e);
    }
  }, []);

  const toggleTopicCompleted = (topicId) => {
    setCompletedTopics(prev => {
      const updated = { ...prev, [topicId]: !prev[topicId] };
      try {
        localStorage.setItem('zenith_dsa_prep_progress', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Selected Opportunity
  const selectedOpportunity = opportunities.find(o => o._id === selectedOppId) || null;

  // Student's real skills in lowercase for matching
  const studentSkillSet = new Set(
    (studentProfile?.skillsList && studentProfile.skillsList.length > 0
      ? studentProfile.skillsList.map(s => s.name)
      : studentProfile?.skills || []
    ).map(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim()).filter(Boolean)
  );

  // Filtered Opportunities List
  const filteredOpportunities = opportunities.filter(opp => {
    if (typeFilter !== 'all' && opp.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const compName = (opp.companyId?.companyName || opp.companyName || '').toLowerCase();
      const title = (opp.title || '').toLowerCase();
      const skills = (opp.requiredSkills || []).map(s => s.toLowerCase());
      if (!compName.includes(q) && !title.includes(q) && !skills.some(s => s.includes(q))) {
        return false;
      }
    }
    return true;
  });

  // Real Required Skills Breakdown for Selected Opportunity
  const requiredSkills = selectedOpportunity?.requiredSkills || [];
  const matchedSkills = requiredSkills.filter(sk => studentSkillSet.has(sk.toLowerCase().trim()));
  const missingSkills = requiredSkills.filter(sk => !studentSkillSet.has(sk.toLowerCase().trim()));
  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  // DSA Topic curriculum dynamically structured for this company/role
  const dsaCurriculum = [
    {
      id: 'dsa_arrays_strings',
      category: 'Core Data Structures',
      title: 'Arrays, Strings & Two Pointers',
      difficulty: 'Easy - Medium',
      relevance: 'High',
      estimatedHours: '4-6 Hours',
      patterns: ['Two Pointers', 'Sliding Window', 'Prefix Sums', 'String Manipulation'],
      keyProblems: [
        'Two Sum / 3Sum Problems',
        'Longest Substring Without Repeating Characters',
        'Container With Most Water',
        'Valid Palindrome & Anagrams'
      ],
      description: `Essential problem-solving foundation required for ${selectedOpportunity?.companyId?.companyName || selectedOpportunity?.companyName || 'Corporate'} initial coding rounds.`
    },
    {
      id: 'dsa_hashing',
      category: 'Data Structures',
      title: 'Hash Maps, Sets & Frequency Tables',
      difficulty: 'Easy - Medium',
      relevance: 'High',
      estimatedHours: '3-4 Hours',
      patterns: ['Frequency Counter', 'Fast O(1) Lookups', 'Anagram Grouping'],
      keyProblems: [
        'Group Anagrams',
        'Subarray Sum Equals K',
        'Top K Frequent Elements',
        'Longest Consecutive Sequence'
      ],
      description: 'Critical for optimizing time complexity in technical interviews.'
    },
    {
      id: 'dsa_linked_lists_stacks',
      category: 'Linear Structures',
      title: 'Linked Lists, Stacks & Queues',
      difficulty: 'Medium',
      relevance: 'Moderate',
      estimatedHours: '4-5 Hours',
      patterns: ['Fast & Slow Pointers', 'In-Place Reversal', 'Monotonic Stack'],
      keyProblems: [
        'Reverse a Linked List & Detect Cycle',
        'Merge Two Sorted Lists',
        'Valid Parentheses & Min Stack',
        'Daily Temperatures (Monotonic Stack)'
      ],
      description: 'Tests memory pointers, recursion, and LIFO/FIFO buffer management.'
    },
    {
      id: 'dsa_trees_graphs',
      category: 'Hierarchical & Non-Linear',
      title: 'Binary Trees, BST & Graph Traversals',
      difficulty: 'Medium - Hard',
      relevance: 'High',
      estimatedHours: '6-8 Hours',
      patterns: ['DFS / BFS Traversal', 'Lowest Common Ancestor', 'Topological Sort', 'Shortest Path (Dijkstra)'],
      keyProblems: [
        'Maximum Depth & Diameter of Binary Tree',
        'Binary Tree Level Order Traversal',
        'Number of Islands & Graph Valid Tree',
        'Course Schedule (Topological Sort)'
      ],
      description: `Core algorithmic track for ${selectedOpportunity?.title || 'Software Engineer'} technical interviews.`
    },
    {
      id: 'dsa_dp_greedy',
      category: 'Advanced Algorithms',
      title: 'Dynamic Programming & Greedy Strategies',
      difficulty: 'Medium - Hard',
      relevance: 'High',
      estimatedHours: '6-8 Hours',
      patterns: ['0/1 Knapsack', 'Fibonacci Sequences', 'Longest Common Subsequence', 'Interval Scheduling'],
      keyProblems: [
        'Climbing Stairs & House Robber',
        'Coin Change & 0/1 Knapsack',
        'Longest Increasing Subsequence',
        'Non-overlapping Intervals'
      ],
      description: 'Used in final-round hiring assessments for optimal solution discovery.'
    },
    {
      id: 'dsa_system_db',
      category: 'System & Database Concepts',
      title: 'System Design & Database Indexing',
      difficulty: 'Medium',
      relevance: 'Essential for Backend / Full Stack',
      estimatedHours: '4-5 Hours',
      patterns: ['REST API Design', 'SQL vs NoSQL', 'Database Indexing', 'Caching (Redis)'],
      keyProblems: [
        'Design a Scalable URL Shortener / Rate Limiter',
        'Complex SQL Joins & Aggregations',
        'Designing Data Models for High Concurrency',
        'State Management & Microservice Communication'
      ],
      description: `Directly aligns with ${requiredSkills.slice(0, 3).join(', ')} stack deliverables.`
    }
  ];

  const totalDsaTopics = dsaCurriculum.length;
  const completedDsaCount = dsaCurriculum.filter(t => completedTopics[`${selectedOppId}_${t.id}`]).length;
  const dsaProgressPercent = totalDsaTopics > 0 ? Math.round((completedDsaCount / totalDsaTopics) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── HERO BANNER ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white via-slate-50/60 to-purple-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0f172a] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Company-Specific Preparation Track</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Company Preparation & DSA Roadmap
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
            Choose a real live opportunity from MongoDB to analyze actual required skills, role-specific DSA topics, and structured technical interview milestones.
          </p>
        </div>

        <button
          onClick={() => navigate('/skills')}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/25 transition flex items-center space-x-2 cursor-pointer relative z-10 shrink-0"
        >
          <Zap className="h-4 w-4" />
          <span>Practice Skill Assessments</span>
        </button>
      </div>

      {/* ── 1. REAL OPPORTUNITY & COMPANY SELECTOR ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <span>1. Select Real Company Opportunity ({opportunities.length} Live Openings)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any live employer opening from MongoDB to inspect actual required skills and topic requirements.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="job">Full-time Jobs</option>
              <option value="internship">Internships</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-500 mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider">Loading Live Company Opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Building2 className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
              No active corporate opportunities found in the database.
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post opportunities in the company portal or check back as new employer postings are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOppId === opp._id;
              const compName = opp.companyId?.companyName || opp.companyName || 'Enterprise Partner';
              return (
                <button
                  key={opp._id}
                  onClick={() => setSelectedOppId(opp._id)}
                  className={`p-5 rounded-3xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/10 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400/50 dark:hover:border-purple-500/30'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-mono font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">
                        {opp.type}
                      </span>
                      <span className="text-xs font-bold text-slate-500 truncate max-w-[130px]">
                        {compName}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {opp.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1 font-medium">
                      <span>{opp.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{opp.stipend || 'Competitive'}</span>
                    </div>
                  </div>

                  {/* Required Skills Badges */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-mono font-bold text-slate-400 mb-1 uppercase">Required Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {(opp.requiredSkills || []).slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                          {sk}
                        </span>
                      ))}
                      {(opp.requiredSkills || []).length > 3 && (
                        <span className="text-[9px] font-mono px-1 py-0.5 text-slate-400">
                          +{(opp.requiredSkills || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. SELECTED OPPORTUNITY PREPARATION BLUEPRINT ── */}
      {selectedOpportunity && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Target Company Overview Banner */}
          <div className="p-6 sm:p-7 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-[#0f172a] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-mono font-extrabold uppercase tracking-wider">
                  Target Company Preparation Focus
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Role: <strong className="text-slate-900 dark:text-white">{selectedOpportunity.title}</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedOpportunity.companyId?.companyName || selectedOpportunity.companyName || 'Enterprise Partner'}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {selectedOpportunity.description}
              </p>
            </div>

            {/* Match Score & DSA Progress */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Skill Match</span>
                <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {matchPercentage}%
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {matchedSkills.length}/{requiredSkills.length} Skills
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">DSA Readiness</span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {dsaProgressPercent}%
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {completedDsaCount}/{totalDsaTopics} Modules
                </span>
              </div>
            </div>
          </div>

          {/* ── 3. ACTUAL REQUIRED SKILLS BREAKDOWN ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Required Skills */}
            <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Skills You Have for This Role ({matchedSkills.length})</span>
                </h3>
              </div>

              {matchedSkills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  None of your current profile skills match this opening's requirements yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{sk}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Gaps for This Role */}
            <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>Skills to Learn / Focus On ({missingSkills.length})</span>
                </h3>
              </div>

              {missingSkills.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-2xl">
                  100% of required technical skills present in your profile!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-mono font-bold"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── 4. COMPANY-SPECIFIC DSA PREPARATION TOPICS & PATTERNS ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Role-Tailored DSA & Problem-Solving Curriculum</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Structured algorithmic modules prioritized for technical interview rounds at {selectedOpportunity.companyId?.companyName || selectedOpportunity.companyName || 'this company'}.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Progress: <strong className="text-emerald-500">{completedDsaCount}</strong> / {totalDsaTopics} Topics Completed
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dsaCurriculum.map((topic) => {
                const isChecked = Boolean(completedTopics[`${selectedOppId}_${topic.id}`]);
                return (
                  <div
                    key={topic.id}
                    className={`p-5 sm:p-6 rounded-3xl border-2 transition shadow-sm space-y-4 flex flex-col justify-between ${
                      isChecked
                        ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400/40'
                    }`}
                  >
                    <div className="space-y-2.5">
                      
                      {/* Category & Status Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md">
                          {topic.category}
                        </span>

                        <button
                          onClick={() => toggleTopicCompleted(`${selectedOppId}_${topic.id}`)}
                          className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer transition"
                        >
                          {isChecked ? (
                            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                              <CheckSquare className="h-4 w-4" />
                              <span>Prepared</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-slate-400 hover:text-purple-500">
                              <Square className="h-4 w-4" />
                              <span>Mark Prepared</span>
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Patterns */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Key Coding Patterns:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {topic.patterns.map((p, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                              • {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Standard Problems */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Benchmark Interview Questions:
                        </span>
                        <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-medium list-disc list-inside">
                          {topic.keyProblems.map((prob, idx) => (
                            <li key={idx} className="line-clamp-1">{prob}</li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Footer Info */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Est: {topic.estimatedHours}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{topic.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. COMPANY PREPARATION FLOW ROADMAP ── */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Step-by-Step Preparation Roadmap for {selectedOpportunity.companyId?.companyName || selectedOpportunity.companyName || 'Target Role'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Recommended 4-phase learning and preparation path from initial skill alignment to final interview readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Phase 1 */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-mono font-black text-xs flex items-center justify-center">
                  01
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Role & Skill Audit</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Verify current match ({matchPercentage}%) against {requiredSkills.length} required skills.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white font-mono font-black text-xs flex items-center justify-center">
                  02
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">DSA Pattern Drill</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Master Two Pointers, Trees, Graphs, and DP benchmarks listed above.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white font-mono font-black text-xs flex items-center justify-center">
                  03
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Tech Stack Alignment</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Build mini-projects or assess missing skills ({missingSkills.join(', ') || 'Fully Matched'}).
                </p>
              </div>

              {/* Phase 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white font-mono font-black text-xs flex items-center justify-center">
                  04
                </div>
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Mock Assessment</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Take verified assessments in the Skills module to earn badge credentials.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
