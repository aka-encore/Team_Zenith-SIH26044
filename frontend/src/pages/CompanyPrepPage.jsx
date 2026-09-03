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

  // ── Step 2: Language Selection State ('cpp' | 'java' | 'python') ──
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  // Comprehensive 16-Topic Core DSA Roadmap (Beginner -> Intermediate -> Advanced)
  const dsaCurriculum = [
    {
      id: 'dsa_arrays',
      category: 'Linear Structures',
      title: 'Arrays',
      level: 'Beginner to Advanced',
      difficulty: 'Easy - Medium',
      estimatedHours: '4-6 Hours',
      patterns: ['Traversal', 'Searching', 'Sorting', 'Two Pointer', 'Sliding Window'],
      keyProblems: ['Two Sum II (Sorted)', 'Container With Most Water', 'Trapping Rain Water'],
      description: 'Contiguous memory, index access, prefix sums, and two-pointer search.'
    },
    {
      id: 'dsa_strings',
      category: 'Linear Structures',
      title: 'Strings',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-5 Hours',
      patterns: ['ASCII/Unicode', 'Palindromes', 'Anagrams', 'String Matching (KMP)'],
      keyProblems: ['Valid Palindrome', 'Longest Substring Without Repeating Characters', 'Group Anagrams'],
      description: 'Character manipulation, string builder, and substring windows.'
    },
    {
      id: 'dsa_linked_lists',
      category: 'Linear Structures',
      title: 'Linked List',
      level: 'Beginner to Intermediate',
      difficulty: 'Medium',
      estimatedHours: '4-6 Hours',
      patterns: ['Singly/Doubly Linked', 'Fast & Slow Pointers', 'Reversal', 'Merge K Lists'],
      keyProblems: ['Reverse Linked List', 'Detect Cycle (Floyd)', 'Merge Two Sorted Lists'],
      description: 'Dynamic pointer chaining, cycle detection, and memory nodes.'
    },
    {
      id: 'dsa_stack',
      category: 'Linear Structures',
      title: 'Stack',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-4 Hours',
      patterns: ['LIFO Operations', 'Monotonic Stack', 'Parentheses Validation', 'Min Stack'],
      keyProblems: ['Valid Parentheses', 'Daily Temperatures', 'Largest Rectangle in Histogram'],
      description: 'LIFO buffer, expression evaluation, and next greater element.'
    },
    {
      id: 'dsa_queue',
      category: 'Linear Structures',
      title: 'Queue',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-4 Hours',
      patterns: ['FIFO Operations', 'Circular Queue', 'Deque', 'Sliding Window Maximum'],
      keyProblems: ['Implement Queue using Stacks', 'Sliding Window Maximum', 'Rotting Oranges (BFS)'],
      description: 'FIFO buffers, breadth-first traversal, and streaming window max.'
    },
    {
      id: 'dsa_hashing',
      category: 'Data Structures',
      title: 'Hashing',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-5 Hours',
      patterns: ['Hash Maps', 'Hash Sets', 'Collision Resolution', 'Frequency Tables'],
      keyProblems: ['Two Sum', 'Subarray Sum Equals K', 'LRU Cache'],
      description: 'O(1) average lookups, frequency counting, and complement pairing.'
    },
    {
      id: 'dsa_recursion',
      category: 'Algorithmic Fundamentals',
      title: 'Recursion',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-5 Hours',
      patterns: ['Base Case / Inductive Step', 'Call Stack Frames', 'Divide & Conquer'],
      keyProblems: ['Fibonacci & Power(x, n)', 'Tower of Hanoi', 'Generate Parentheses'],
      description: 'Self-referential execution frames, call stack depth, and recurrence relations.'
    },
    {
      id: 'dsa_binary_search',
      category: 'Search Algorithms',
      title: 'Binary Search',
      level: 'Beginner to Advanced',
      difficulty: 'Easy - Hard',
      estimatedHours: '4-6 Hours',
      patterns: ['Sorted Arrays', 'Search on Answer', 'Rotated Array', 'Peak Finding'],
      keyProblems: ['Binary Search', 'Search in Rotated Sorted Array', 'Koko Eating Bananas'],
      description: 'O(log N) divide-and-conquer search on monotonic search spaces.'
    },
    {
      id: 'dsa_sorting',
      category: 'Algorithms',
      title: 'Sorting',
      level: 'Beginner to Intermediate',
      difficulty: 'Easy - Medium',
      estimatedHours: '3-4 Hours',
      patterns: ['QuickSort', 'MergeSort', 'Counting Sort', 'Custom Comparators'],
      keyProblems: ['Sort Colors (Dutch National Flag)', 'Merge Intervals', 'Kth Largest Element'],
      description: 'O(N log N) divide-and-conquer sorting and stability properties.'
    },
    {
      id: 'dsa_trees',
      category: 'Hierarchical Structures',
      title: 'Trees',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium - Hard',
      estimatedHours: '6-8 Hours',
      patterns: ['Binary Trees', 'Pre/In/Postorder DFS', 'Level-order BFS', 'LCA'],
      keyProblems: ['Maximum Depth of Binary Tree', 'Invert Binary Tree', 'Binary Tree Maximum Path Sum'],
      description: 'Acyclic graphs, hierarchical node traversals, and subtree recursions.'
    },
    {
      id: 'dsa_bst',
      category: 'Hierarchical Structures',
      title: 'BST (Binary Search Tree)',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium',
      estimatedHours: '4-5 Hours',
      patterns: ['BST Invariants', 'Inorder Sorting', 'Insertion/Deletion', 'Validation'],
      keyProblems: ['Validate BST', 'Lowest Common Ancestor in BST', 'Kth Smallest in BST'],
      description: 'Ordered hierarchical lookup, balanced trees, and range queries.'
    },
    {
      id: 'dsa_heap',
      category: 'Priority Structures',
      title: 'Heap (Priority Queue)',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium - Hard',
      estimatedHours: '4-6 Hours',
      patterns: ['Min/Max Heap', 'Top K Elements', 'Median Stream', 'K-way Merge'],
      keyProblems: ['Top K Frequent Elements', 'Find Median from Data Stream', 'Merge K Sorted Lists'],
      description: 'O(log N) priority extractions, complete binary tree array representations.'
    },
    {
      id: 'dsa_graphs',
      category: 'Non-Linear Structures',
      title: 'Graphs',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium - Hard',
      estimatedHours: '6-8 Hours',
      patterns: ['Adjacency Lists', 'BFS / DFS', 'Dijkstra', 'Topological Sort'],
      keyProblems: ['Number of Islands', 'Course Schedule', 'Network Delay Time (Dijkstra)'],
      description: 'Networks of vertices & edges, cycle detection, and shortest paths.'
    },
    {
      id: 'dsa_greedy',
      category: 'Algorithmic Paradigms',
      title: 'Greedy',
      level: 'Intermediate',
      difficulty: 'Medium',
      estimatedHours: '3-5 Hours',
      patterns: ['Locally Optimal Choices', 'Interval Scheduling', 'Huffman Coding'],
      keyProblems: ['Jump Game', 'Gas Station', 'Non-overlapping Intervals'],
      description: 'Making optimal local decisions without backtracking.'
    },
    {
      id: 'dsa_backtracking',
      category: 'Advanced Paradigms',
      title: 'Backtracking',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium - Hard',
      estimatedHours: '5-7 Hours',
      patterns: ['N-Queens', 'Sudoku Solver', 'Subsets / Permutations', 'State Pruning'],
      keyProblems: ['Subsets', 'Permutations', 'N-Queens'],
      description: 'Exhaustive state-space search with recursive trial and rollbacks.'
    },
    {
      id: 'dsa_dp',
      category: 'Advanced Algorithms',
      title: 'Dynamic Programming',
      level: 'Intermediate to Advanced',
      difficulty: 'Medium - Hard',
      estimatedHours: '8-10 Hours',
      patterns: ['Memoization (Top-Down)', 'Tabulation (Bottom-Up)', '0/1 Knapsack', 'LCS'],
      keyProblems: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence'],
      description: 'Optimal substructure and overlapping subproblems optimization.'
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

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => navigate(`/company-prep/topics?oppId=${selectedOppId}`)}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/25 transition flex items-center space-x-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Open Topic Learning Studio</span>
          </button>

          <button
            onClick={() => navigate('/skills')}
            className="px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs border border-slate-200 dark:border-slate-800 shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <Zap className="h-4 w-4 text-purple-500" />
            <span>Skill Assessments</span>
          </button>
        </div>
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
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">DSA Roadmap</span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {dsaProgressPercent}%
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {completedDsaCount}/{totalDsaTopics} Topics
                </span>
              </div>
            </div>
          </div>

          {/* ── STEP 2: PROGRAMMING LANGUAGE SELECTION (C++, Java, Python) ── */}
          <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                  <Code2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>2. Select Your DSA Programming Language</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Choose your preferred language for concept examples, coding editor, and timed assessments.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {[
                  { id: 'cpp', label: 'C++', subtitle: 'C++17 / STL' },
                  { id: 'java', label: 'Java', subtitle: 'Java 17 / Collections' },
                  { id: 'python', label: 'Python', subtitle: 'Python 3.11' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-4 py-2.5 rounded-2xl border-2 text-xs font-mono font-black transition cursor-pointer flex flex-col items-center ${
                      selectedLanguage === lang.id
                        ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-purple-400/40'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className={`text-[9px] font-normal ${selectedLanguage === lang.id ? 'text-purple-100' : 'text-slate-400'}`}>
                      {lang.subtitle}
                    </span>
                  </button>
                ))}
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
                          {(topic?.patterns || []).map((p, i) => (
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
                          {(topic?.keyProblems || []).map((prob, idx) => (
                            <li key={idx} className="line-clamp-1">{prob}</li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Footer Info & Topic Learning Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span>Est: {topic?.estimatedHours || '3-5 Hours'}</span>
                        <span>•</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{topic?.difficulty || 'Medium'}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/company-prep/topics?oppId=${selectedOppId}&topicId=${topic.id.includes('array') ? 'arrays' : topic.id.includes('hash') ? 'hashing' : topic.id.includes('tree') ? 'trees' : topic.id.includes('dp') ? 'dp' : 'arrays'}`)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold font-sans transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <span>Start 5-Stage Flow</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
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

          {/* ── STEP 8: TIMED COMPANY-SPECIFIC MOCK ASSESSMENT ── */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-purple-500/40 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  Step 8: Final Milestone
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Target Company: <strong className="text-slate-900 dark:text-white">{selectedOpportunity.companyId?.companyName || selectedOpportunity.companyName || 'Target Enterprise'}</strong>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Timed Company-Specific Mock Coding Test
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Experience a simulated 45-minute technical hiring assessment with mixed DSA challenges (Easy → Medium → Company Level) tested in {selectedLanguage.toUpperCase()}. Real scores and execution verification recorded on your verified profile.
              </p>
            </div>

            <button
              onClick={() => navigate(`/company-prep/mock-test?oppId=${selectedOppId}&lang=${selectedLanguage}`)}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl text-xs shadow-xl shadow-purple-600/30 transition flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <Clock className="h-4 w-4" />
              <span>Launch 45-Min Mock Test ({selectedLanguage.toUpperCase()})</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
