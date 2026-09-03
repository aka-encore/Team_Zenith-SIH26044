import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Code2, BookOpen, Layers, Target, Terminal, Play,
  Send, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw,
  ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, Award,
  Sparkles, CheckSquare, Square, ChevronRight, HelpCircle,
  Video, Lightbulb, Search, Filter, Globe, Briefcase
} from 'lucide-react';

export default function CompanyPrepPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Flow Step: 1 ('company') | 2 ('language') | 3 ('topics') | 4 ('learning') | 5 ('practice') | 6 ('mock') ──
  const [currentFlowStep, setCurrentFlowStep] = useState(1);

  // ── Step 1: Real Database Companies ──
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ── Step 2: DSA Language Selection ──
  const [selectedLanguage, setSelectedLanguage] = useState('cpp'); // 'cpp' | 'java' | 'python'

  // ── Step 3: DSA Topic Selection ──
  const [selectedTopicId, setSelectedTopicId] = useState('arrays');
  const [completedTopics, setCompletedTopics] = useState({});

  // ── Step 5: Online Compiler & Practice State ──
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [problemSubmissions, setProblemSubmissions] = useState({});

  // ── Step 6: Timed Mock Test State ──
  const [mockSession, setMockSession] = useState(null);
  const [mockTimeRemaining, setMockTimeRemaining] = useState(45 * 60);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockSubmitting, setMockSubmitting] = useState(false);
  const [mockResult, setMockResult] = useState(null);
  const [mockCompleted, setMockCompleted] = useState(false);

  // Fetch real companies with live opportunities from MongoDB
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await fetch('/api/students/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies);
        if (data.companies.length > 0 && !selectedCompany) {
          setSelectedCompany(data.companies[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (token) fetchCompanies();
  }, [token]);

  // Load persistent progress from localStorage
  useEffect(() => {
    try {
      const savedTopics = localStorage.getItem(`zenith_prep_topics_${user?.id || 'guest'}`);
      if (savedTopics) setCompletedTopics(JSON.parse(savedTopics));
      const savedSubs = localStorage.getItem(`zenith_prep_subs_${user?.id || 'guest'}`);
      if (savedSubs) setProblemSubmissions(JSON.parse(savedSubs));
    } catch (e) {
      console.error(e);
    }
  }, [user?.id]);

  // Fetch problems when topic or company changes
  useEffect(() => {
    const fetchProblems = async () => {
      if (!selectedCompany) return;
      try {
        const firstOppId = selectedCompany.opportunities?.[0]?._id || '';
        const res = await fetch(`/api/students/dsa-problems?opportunityId=${firstOppId}&topic=${selectedTopicId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.problems)) {
          setProblems(data.problems);
          if (data.problems.length > 0) {
            setSelectedProblem(data.problems[0]);
            setCode(data.problems[0].starterCode[selectedLanguage] || data.problems[0].starterCode.cpp || '');
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (token && selectedCompany) {
      fetchProblems();
    }
  }, [token, selectedCompany, selectedTopicId, selectedLanguage]);

  // Countdown timer for Mock Test
  useEffect(() => {
    if (currentFlowStep !== 6 || mockCompleted || mockTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setMockTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalMockSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentFlowStep, mockCompleted, mockTimeRemaining]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Structured Core DSA Topics
  const dsaTopics = [
    {
      id: 'arrays',
      title: 'Arrays & Dynamic Arrays',
      category: 'Linear Structures',
      description: 'Contiguous memory indexing, traversal, dynamic vectors, two pointers, and sliding window optimization.',
      video: {
        title: 'Arrays and Dynamic Arrays - Data Structures and Algorithms',
        source: 'freeCodeCamp.org',
        url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
        embedUrl: 'https://www.youtube-nocookie.com/embed/RBSGKlAvoiM'
      },
      stages: {
        beginner: {
          title: 'Beginner: Memory Architecture & Indexing',
          points: [
            'Fixed Contiguous Memory: Elements stored sequentially with O(1) index access.',
            'Time Complexities: Access O(1), Search O(N), Insert/Delete at end O(1) amortized, Insert at start O(N).',
            'Space: O(N) linear space for N elements.'
          ]
        },
        intermediate: {
          title: 'Intermediate: Two Pointer & Sliding Window',
          points: [
            'Two Pointer Technique: Converging left & right pointers to eliminate nested O(N²) loops.',
            'Sliding Window: Maintaining fixed or dynamic subarrays to find maximum sum or unique substrings in O(N).',
            'Prefix Sums: Precomputing cumulative sums for O(1) range sum queries.'
          ]
        },
        advanced: {
          title: 'Advanced: Trapping Rain Water & Optimization',
          points: [
            'Two Pointer Boundary Tracking: LeftMax and RightMax bounds for elevation problems.',
            'Monotonic Deque: O(N) sliding window maximum.'
          ]
        }
      },
      companyQuestions: [
        'How does dynamic array 2x resizing affect amortized time complexity?',
        'When is Sliding Window preferred over Two Pointers?',
        'Solve Two Sum II and 3Sum with optimal space complexity.'
      ]
    },
    {
      id: 'hashing',
      title: 'Hash Tables, Sets & Maps',
      category: 'Data Structures',
      description: 'Hash functions, collision resolution (Chaining vs Open Addressing), frequency maps, and O(1) average lookup.',
      video: {
        title: 'Hash Tables and Hash Functions Explained',
        source: 'Computerphile',
        url: 'https://www.youtube.com/watch?v=shs0KM3wKv8',
        embedUrl: 'https://www.youtube-nocookie.com/embed/shs0KM3wKv8'
      },
      stages: {
        beginner: {
          title: 'Beginner: Hash Functions & Key-Value Storage',
          points: [
            'Hash Function: Maps arbitrary keys to array index buckets.',
            'Average Time: Insert O(1), Search O(1), Delete O(1).',
            'Load Factor & Re-hashing: Resizing buckets when elements exceed threshold.'
          ]
        },
        intermediate: {
          title: 'Intermediate: Frequency Counters & Complement Lookups',
          points: [
            'Frequency Map: Anagram detection, majority elements, and frequency sorting.',
            'Complement Lookups: Storing (target - x) in hash set for O(N) pair search.'
          ]
        },
        advanced: {
          title: 'Advanced: LRU Cache Architecture',
          points: [
            'Combining Hash Map with Doubly Linked List for O(1) get and put.',
            'Handling worst-case hash collisions in mission-critical systems.'
          ]
        }
      },
      companyQuestions: [
        'Explain how hash collisions are resolved in standard libraries (C++ unordered_map vs Java HashMap).',
        'How would you implement an LRU Cache with O(1) operations?'
      ]
    },
    {
      id: 'trees',
      title: 'Trees & Binary Search Trees (BST)',
      category: 'Hierarchical Structures',
      description: 'Acyclic graphs, hierarchical node pointers, preorder/inorder/postorder DFS, and level-order BFS.',
      video: {
        title: 'Binary Trees & Binary Search Trees - Tree Traversal',
        source: 'freeCodeCamp.org',
        url: 'https://www.youtube.com/watch?v=fAAZixBzIAI',
        embedUrl: 'https://www.youtube-nocookie.com/embed/fAAZixBzIAI'
      },
      stages: {
        beginner: {
          title: 'Beginner: Tree Terminology & Node Pointers',
          points: [
            'Binary Tree: Each node has at most left and right child pointers.',
            'BST Invariant: Left subtree values < Root value < Right subtree values.',
            'Height & Depth: O(log N) balanced vs O(N) skewed worst-case.'
          ]
        },
        intermediate: {
          title: 'Intermediate: Tree Traversals & LCA',
          points: [
            'DFS: Inorder (sorted for BST), Preorder, Postorder.',
            'BFS: Queue-based Level Order Traversal.',
            'LCA: Finding lowest common ancestor node.'
          ]
        },
        advanced: {
          title: 'Advanced: Maximum Path Sum & Tree Serialization',
          points: [
            'Bottom-Up Postorder DFS with global path maximum updating.',
            'Serialize and deserialize binary trees.'
          ]
        }
      },
      companyQuestions: [
        'How do you check if a binary tree is a valid Binary Search Tree?',
        'Compare BFS vs DFS memory consumption when traversing deep or wide trees.'
      ]
    },
    {
      id: 'dp',
      title: 'Dynamic Programming & Memoization',
      category: 'Advanced Algorithms',
      description: 'Optimal substructure, overlapping subproblems, top-down memoization, and bottom-up tabulation.',
      video: {
        title: 'Dynamic Programming - Learn to Solve Algorithmic Problems',
        source: 'freeCodeCamp.org',
        url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
        embedUrl: 'https://www.youtube-nocookie.com/embed/oBt53YbR9Kk'
      },
      stages: {
        beginner: {
          title: 'Beginner: Overlapping Subproblems & Recursion Tree',
          points: [
            'Identifying subproblems solved multiple times (e.g. Fibonacci, Climbing Stairs).',
            'Top-Down Memoization: Caching recursive results in an array or map.'
          ]
        },
        intermediate: {
          title: 'Intermediate: 1D & 2D Bottom-Up Tabulation',
          points: [
            'State Transition Equations: dp[i] = min(dp[i-c] + 1) for Coin Change.',
            '0/1 Knapsack: Decision to include or exclude item.'
          ]
        },
        advanced: {
          title: 'Advanced: Longest Common Subsequence & Edit Distance',
          points: [
            '2D Matrix DP for string comparisons and alignments.',
            'State Space Optimization: Reducing 2D DP table to 1D rolling array.'
          ]
        }
      },
      companyQuestions: [
        'How do you identify if a problem can be solved using Dynamic Programming vs Greedy?',
        'Write the recurrence relation for the Coin Change problem.'
      ]
    }
  ];

  const currentTopic = dsaTopics.find(t => t.id === selectedTopicId) || dsaTopics[0];
  const completedTopicsCount = Object.keys(completedTopics).filter(k => completedTopics[k] && k.startsWith(selectedCompany?._id || '')).length;

  const toggleTopicDone = (topicId) => {
    if (!selectedCompany) return;
    const key = `${selectedCompany._id}_${topicId}`;
    const updated = { ...completedTopics, [key]: !completedTopics[key] };
    setCompletedTopics(updated);
    try {
      localStorage.setItem(`zenith_prep_topics_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Run & Submit Code in Online Compiler
  const handleExecuteCode = async (isSubmit = false) => {
    if (!selectedProblem || !selectedCompany) return;
    if (isSubmit) setSubmittingCode(true);
    else setRunningCode(true);

    try {
      const firstOppId = selectedCompany.opportunities?.[0]?._id || '';
      const res = await fetch('/api/students/dsa-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          language: selectedLanguage,
          code,
          isSubmit,
          opportunityId: firstOppId
        })
      });
      const data = await res.json();
      setCodeResult(data);

      if (isSubmit && data.success) {
        const updatedSubs = {
          ...problemSubmissions,
          [selectedProblem.id]: {
            status: 'Accepted',
            runtimeMs: data.runtimeMs,
            memoryMb: data.memoryMb,
            language: selectedLanguage,
            submittedAt: new Date().toISOString()
          }
        };
        setProblemSubmissions(updatedSubs);
        try {
          localStorage.setItem(`zenith_prep_subs_${user?.id || 'guest'}`, JSON.stringify(updatedSubs));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
      setCodeResult({ success: false, verdict: 'Execution Error', message: 'Compilation failed' });
    } finally {
      setRunningCode(false);
      setSubmittingCode(false);
    }
  };

  // Launch Timed Mock Test
  const handleStartMockTest = async () => {
    if (!selectedCompany) return;
    setLoadingCompanies(true);
    try {
      const firstOppId = selectedCompany.opportunities?.[0]?._id || '';
      const res = await fetch(`/api/students/dsa-mock-test?opportunityId=${firstOppId}&language=${selectedLanguage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.mockSession) {
        setMockSession(data.mockSession);
        setMockTimeRemaining(data.mockSession.durationSeconds || 45 * 60);
        const initialCodes = {};
        data.mockSession.problems.forEach(p => {
          initialCodes[p.id] = p.starterCode[selectedLanguage] || p.starterCode.cpp || '';
        });
        setMockAnswers(initialCodes);
        setCurrentFlowStep(6);
        setMockCompleted(false);
        setMockResult(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Final Mock Submit
  const handleFinalMockSubmit = async () => {
    if (mockSubmitting || mockCompleted || !mockSession) return;
    setMockSubmitting(true);
    try {
      const firstOppId = selectedCompany.opportunities?.[0]?._id || '';
      const submissions = mockSession.problems.map(p => ({
        problemId: p.id,
        title: p.title,
        code: mockAnswers[p.id] || '',
        language: selectedLanguage
      }));

      const res = await fetch('/api/students/dsa-mock-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: mockSession.sessionId,
          opportunityId: firstOppId,
          companyName: selectedCompany.companyName,
          submissions,
          durationSpentSeconds: (45 * 60) - mockTimeRemaining
        })
      });

      const data = await res.json();
      if (data.success) {
        setMockResult(data);
        setMockCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMockSubmitting(false);
    }
  };

  // Filtered companies for Step 1
  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  // Handle company card click (selects and advances to Step 2)
  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setCurrentFlowStep(2); // Automatically advance to DSA Language Selection Step
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 text-left">
      
      {/* ── TOP HEADER / CURRENT STEP INDICATOR ── */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-600 dark:text-purple-400 font-bold uppercase">
            <span>Company Preparation</span>
            <span>/</span>
            <span>Step {currentFlowStep} of 6</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {currentFlowStep === 1 && 'Choose Target Company'}
            {currentFlowStep === 2 && 'Select DSA Programming Language'}
            {currentFlowStep === 3 && `DSA Learning Roadmap for ${selectedCompany?.companyName || 'Company'}`}
            {currentFlowStep === 4 && `Topic Learning: ${currentTopic.title}`}
            {currentFlowStep === 5 && `Online Compiler & Practice`}
            {currentFlowStep === 6 && `Timed Mock Assessment`}
          </h1>
          {selectedCompany && currentFlowStep > 1 && (
            <p className="text-xs text-slate-500">
              Selected Company: <strong className="text-slate-900 dark:text-white">{selectedCompany.companyName}</strong> ({selectedCompany.industry})
            </p>
          )}
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { num: 1, label: '1. Choose Company' },
            { num: 2, label: '2. Language' },
            { num: 3, label: '3. Topics' },
            { num: 4, label: '4. Learn' },
            { num: 5, label: '5. Compiler' },
            { num: 6, label: '6. Mock Test' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num > 1 && !selectedCompany) return;
                setCurrentFlowStep(s.num);
              }}
              disabled={s.num > 1 && !selectedCompany}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer disabled:opacity-40 ${
                currentFlowStep === s.num
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STEP 1: CHOOSE COMPANY (REAL DATABASE DATA ONLY) ── */}
      {currentFlowStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search company name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-purple-500 shrink-0" />
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>
                    {ind === 'all' ? 'All Industries' : ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loadingCompanies ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs font-mono font-bold text-slate-500 uppercase">
                Loading Real Companies from Database...
              </p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Building2 className="h-8 w-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching companies found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCompanies.map(comp => {
                const isSelected = selectedCompany?._id === comp._id;
                return (
                  <button
                    key={comp._id}
                    onClick={() => handleSelectCompany(comp)}
                    className={`p-6 rounded-3xl border-2 text-left transition flex flex-col justify-between space-y-4 cursor-pointer bg-white dark:bg-slate-900 group ${
                      isSelected
                        ? 'border-purple-600 shadow-lg shadow-purple-600/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-md'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/20 shrink-0">
                            {comp.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                              {comp.companyName}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">
                              {comp.industry}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Meta details: Website + Job Count */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                      
                      {/* Website */}
                      {comp.website ? (
                        <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-mono text-[11px] truncate">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{comp.website}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span>Website: Not Listed</span>
                        </div>
                      )}

                      {/* Job Count */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{comp.opportunityCount} Active {comp.opportunityCount === 1 ? 'Opening' : 'Openings'}</span>
                        </span>

                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                          <span>Select</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: CHOOSE DSA LANGUAGE (C++, Java, Python) ── */}
      {currentFlowStep === 2 && selectedCompany && (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6 max-w-3xl mx-auto animate-in fade-in">
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
              Step 2 of Flow
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Choose DSA Programming Language for {selectedCompany.companyName}
            </h2>
            <p className="text-xs text-slate-500">
              Select the language for code walkthroughs, online compiler, and final technical assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'cpp', title: 'C++', subtitle: 'C++17 / STL Vectors & Maps' },
              { id: 'java', title: 'Java', subtitle: 'Java 17 / Collections Framework' },
              { id: 'python', title: 'Python', subtitle: 'Python 3.11 / Built-in Structures' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  selectedLanguage === lang.id
                    ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-purple-400/40'
                }`}
              >
                <Code2 className="h-6 w-6" />
                <span className="text-base font-black font-mono">{lang.title}</span>
                <span className={`text-[10px] ${selectedLanguage === lang.id ? 'text-purple-100' : 'text-slate-400'}`}>
                  {lang.subtitle}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Change Company</span>
            </button>
            <button
              onClick={() => setCurrentFlowStep(3)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>View DSA Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SHOW DSA TOPICS ── */}
      {currentFlowStep === 3 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Step 3: Core DSA Learning Roadmap
              </h2>
              <p className="text-xs text-slate-500">
                Topics structured from Beginner to Advanced. Completed: <strong>{completedTopicsCount}/{dsaTopics.length}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleStartMockTest}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Launch Mock Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dsaTopics.map(topic => {
              const isDone = Boolean(completedTopics[`${selectedCompany._id}_${topic.id}`]);
              return (
                <div
                  key={topic.id}
                  className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {topic.category}
                    </span>
                    <button
                      onClick={() => toggleTopicDone(topic.id)}
                      className="text-xs font-mono font-bold flex items-center space-x-1.5 text-slate-500 hover:text-purple-600 cursor-pointer"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-slate-400" />
                          <span>Mark Done</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{topic.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setCurrentFlowStep(4);
                      }}
                      className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Learn Topic</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setCurrentFlowStep(5);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Solve Problems</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 4: LEARN TOPIC (Beginner → Intermediate → Advanced + Video) ── */}
      {currentFlowStep === 4 && selectedCompany && (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                Step 4: Topic Mastery
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {currentTopic.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentFlowStep(5)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Go to Online Compiler</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['beginner', 'intermediate', 'advanced'].map(stageKey => {
              const stage = currentTopic.stages[stageKey];
              return (
                <div key={stageKey} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-black uppercase font-mono text-purple-600 dark:text-purple-400">
                    {stage.title}
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    {stage.points.map((p, idx) => (
                      <li key={idx} className="leading-relaxed">{p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Video Lecture */}
          <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-red-600 flex items-center space-x-1">
                  <Video className="h-3.5 w-3.5" />
                  <span>Verified Educational Video Masterclass</span>
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {currentTopic.video.title}
                </h4>
                <span className="text-xs text-slate-500">Source: <strong>{currentTopic.video.source}</strong></span>
              </div>

              <a
                href={currentTopic.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-red-600/20 cursor-pointer shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Open Video on YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
              <iframe
                src={currentTopic.video.embedUrl}
                title={currentTopic.video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Company Interview Questions */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span>{selectedCompany.companyName} Interview Questions for {currentTopic.title}:</span>
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              {currentTopic.companyQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(3)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Roadmap</span>
            </button>
            <button
              onClick={() => setCurrentFlowStep(5)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Solve in Online Compiler</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: ONLINE COMPILER & PROBLEM PRACTICE ── */}
      {currentFlowStep === 5 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Topic Problems:</span>
              <div className="flex items-center space-x-2 overflow-x-auto">
                {problems.map(p => {
                  const isSel = selectedProblem?.id === p.id;
                  const isSolved = problemSubmissions[p.id]?.status === 'Accepted';
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProblem(p);
                        setCode(p.starterCode[selectedLanguage] || p.starterCode.cpp || '');
                        setCodeResult(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        isSel ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                      }`}
                    >
                      <span>{p.title}</span>
                      {isSolved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Language:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['cpp', 'java', 'python'].map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLanguage(l);
                      if (selectedProblem?.starterCode?.[l]) {
                        setCode(selectedProblem.starterCode[l]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                      selectedLanguage === l ? 'bg-purple-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    {l === 'cpp' ? 'C++' : l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedProblem && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-5 max-h-[750px] overflow-y-auto">
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-extrabold uppercase">
                      {selectedCompany.companyName} Question
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedProblem.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProblem.problemStatement}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">Examples:</h4>
                  {selectedProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                      <div><strong className="text-purple-600">Input:</strong> {ex.input}</div>
                      <div><strong className="text-emerald-600">Output:</strong> {ex.output}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">Constraints:</h4>
                  <ul className="text-xs font-mono text-slate-500 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col justify-between">
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Terminal className="h-4 w-4 text-purple-600" />
                    <span>Compiler ({selectedLanguage.toUpperCase()})</span>
                  </span>
                  <button
                    onClick={() => setCode(selectedProblem.starterCode[selectedLanguage] || '')}
                    className="hover:text-slate-200 cursor-pointer"
                  >
                    Reset Code
                  </button>
                </div>

                <div className="bg-[#0b101b] p-4 font-mono text-xs text-slate-100">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={16}
                    spellCheck="false"
                    className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y"
                    placeholder="Write your code solution..."
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleExecuteCode(false)}
                    disabled={runningCode || submittingCode}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {runningCode ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-purple-600" />}
                    <span>Run Sample Cases</span>
                  </button>

                  <button
                    onClick={() => handleExecuteCode(true)}
                    disabled={runningCode || submittingCode}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingCode ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Submit Solution</span>
                  </button>
                </div>

                {codeResult && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ {codeResult.verdict}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Runtime: {codeResult.runtimeMs}ms • Memory: {codeResult.memoryMb}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {(codeResult.testResults || []).map((tr, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between">
                          <span>Test Case #{tr.testCaseIndex}: Input <code>{tr.input}</code></span>
                          <span className="text-emerald-500 font-bold">Passed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentFlowStep(4)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Learning</span>
            </button>
            <button
              onClick={handleStartMockTest}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Take Company Mock Test</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: TIMED MOCK ASSESSMENT & RESULTS (WITH WEAK TOPICS) ── */}
      {currentFlowStep === 6 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-slate-50 to-indigo-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-600">
                Step 6: Official Assessment
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {selectedCompany.companyName} Timed Technical Coding Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Industry: <strong>{selectedCompany.industry}</strong> • Mixed DSA Difficulty (Easy → Medium → Company Level)
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className={`px-4 py-2 rounded-2xl border-2 font-mono flex items-center space-x-2 ${
                mockTimeRemaining < 300
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 animate-pulse'
                  : 'bg-white dark:bg-slate-950 border-purple-500/30 text-purple-600'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="text-lg font-black">{formatTimer(mockTimeRemaining)}</span>
              </div>

              {!mockCompleted && (
                <button
                  onClick={() => {
                    if (window.confirm('Finish and submit mock test?')) handleFinalMockSubmit();
                  }}
                  disabled={mockSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {mockSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Submit Assessment</span>
                </button>
              )}
            </div>
          </div>

          {/* Results + Weak Topics */}
          {mockCompleted && mockResult && (
            <div className="p-8 rounded-3xl border-2 border-emerald-500/40 bg-white dark:bg-slate-900 shadow-2xl space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Assessment Evaluated & Verified
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded directly to your verified MongoDB Assessment & Skill Passport records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Total Score</span>
                  <div className="text-3xl font-black font-mono text-purple-600 pt-1">
                    {mockResult.score} / 100
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Verdict</span>
                  <div className={`text-base font-black font-mono pt-2 ${mockResult.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {mockResult.verdict}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Questions Cleared</span>
                  <div className="text-3xl font-black font-mono text-emerald-600 pt-1">
                    {mockResult.correctAnswers} / {mockResult.totalQuestions}
                  </div>
                </div>
              </div>

              {/* Weak Topics */}
              <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-300">
                  Identified Weak Topics for Targeted Revision:
                </h4>
                {mockResult.weakTopics && mockResult.weakTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {mockResult.weakTopics.map((wt, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold font-mono">
                        ⚠️ {wt}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold">
                    ✓ Outstanding performance! No weak topics detected in this assessment.
                  </p>
                )}
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => setCurrentFlowStep(3)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Review DSA Topics
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>View in Skill Passport</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Mock Questions */}
          {!mockCompleted && mockSession && (
            <div className="space-y-5">
              
              <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Question Palette:</span>
                {mockSession.problems.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setMockQuestionIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                      mockQuestionIdx === idx ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Q{idx + 1} ({p.difficulty})
                  </button>
                ))}
              </div>

              {mockSession.problems[mockQuestionIdx] && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 max-h-[700px] overflow-y-auto">
                    <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-mono font-black uppercase text-purple-600">
                        {mockSession.problems[mockQuestionIdx].difficulty}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        Q{mockQuestionIdx + 1}. {mockSession.problems[mockQuestionIdx].title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {mockSession.problems[mockQuestionIdx].problemStatement}
                    </p>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">Constraints:</span>
                      <ul className="text-xs font-mono text-slate-500 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                        {mockSession.problems[mockQuestionIdx].constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col justify-between">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-400">
                      Editor ({selectedLanguage.toUpperCase()})
                    </div>
                    <div className="bg-[#0b101b] p-4 font-mono text-xs text-slate-100">
                      <textarea
                        value={mockAnswers[mockSession.problems[mockQuestionIdx].id] || ''}
                        onChange={(e) => setMockAnswers({
                          ...mockAnswers,
                          [mockSession.problems[mockQuestionIdx].id]: e.target.value
                        })}
                        rows={16}
                        spellCheck="false"
                        className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y"
                        placeholder="Write your complete solution..."
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
