import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Code2, BookOpen, Layers, Target, Terminal, Play,
  Send, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw,
  ArrowLeft, ArrowRight, ShieldCheck, Award, Sparkles, CheckSquare,
  Square, ChevronRight, HelpCircle, Lightbulb, Search, Filter,
  Globe, Briefcase, Type, ZoomIn, ZoomOut, Layout, LayoutGrid,
  Columns, Rows, RotateCcw, Check, XCircle
} from 'lucide-react';

export default function CompanyPrepPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Preparation Flow: 1: Company | 2: Language | 3: Roadmap & Topics | 4: Topic Studio | 5: Problem Solving | 6: Mock Test ──
  const [currentFlowStep, setCurrentFlowStep] = useState(1);

  // ── Step 1: Real Database Companies ──
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ── Step 2: DSA Language Selection (C++, Java, Python) ──
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  // ── Step 3 & 4: Topics & Progressive Progression ──
  const [selectedTopicId, setSelectedTopicId] = useState('arrays');
  const [activeTopicLevel, setActiveTopicLevel] = useState('all'); // 'all' | 'beginner' | 'intermediate' | 'advanced' | 'company'

  // ── Step 5: LeetCode-Style Coding Area Controls ──
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'output'

  // Problem solving layout & accessibility font settings
  const [problemFontSize, setProblemFontSize] = useState(16); // 14, 16, 18, 20
  const [editorFontSize, setEditorFontSize] = useState(14); // 12, 14, 16, 18
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' (horizontal) | 'stacked' (vertical)

  // ── Real Progress & Unsolved Tracking ──
  const [completedTopics, setCompletedTopics] = useState({});
  const [problemSubmissions, setProblemSubmissions] = useState({}); // { [probId]: { status: 'Accepted' | 'Failed', language, ... } }

  // ── Step 6: Timed Mock Test ──
  const [mockSession, setMockSession] = useState(null);
  const [mockTimeRemaining, setMockTimeRemaining] = useState(45 * 60);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockSubmitting, setMockSubmitting] = useState(false);
  const [mockResult, setMockResult] = useState(null);
  const [mockCompleted, setMockCompleted] = useState(false);

  // ── 1. Fetch Real Database Companies from MongoDB ──
  useEffect(() => {
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

    if (token) fetchCompanies();
  }, [token]);

  // Load real student progress from localStorage
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

  // Mock test countdown timer
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

  // ── Verified Public Interview Patterns Database for Major Companies ──
  const companyInterviewProfiles = {
    google: {
      focusTopics: ['Trees & BST', 'Graphs', 'Dynamic Programming', 'Recursion & Backtracking'],
      roundBreakdown: 'Round 1: Screening (Array/Strings & Hashing) → Rounds 2-4: Coding & Problem Solving (Trees, Graphs, DP) → Round 5: Googleyness & System Architecture.',
      difficultyPattern: 'High algorithmic rigor. Heavy emphasis on optimal O(N) or O(log N) time with sub-quadratic space and complete handling of extreme constraints.',
      tips: 'State time & space complexity before writing code. Handle null and negative integer edge cases without prompt.'
    },
    amazon: {
      focusTopics: ['Arrays', 'Hash Maps', 'Trees & BST', 'Heap & Priority Queue', 'Sliding Window'],
      roundBreakdown: 'Online Assessment: 2 Coding Problems (Arrays/Hash Maps) → Technical Rounds: 3-4 Rounds focusing on Trees, Priority Queues & 14 Leadership Principles.',
      difficultyPattern: 'Medium to Hard problems. Strong focus on clean modular code, fast lookups, and heap data structures.',
      tips: 'Explain data structure choice clearly and relate problem solving to maintainability.'
    },
    microsoft: {
      focusTopics: ['Strings', 'Linked List', 'Trees & Graph Traversal', 'Two Pointers'],
      roundBreakdown: 'Round 1: Codility OA → Rounds 2-4: In-depth Technical interviews with focus on memory pointers, recursion, and data structures.',
      difficultyPattern: 'Medium difficulty with deep questions on recursion call stacks, string parsing, and pointer management.',
      tips: 'Write bug-free code on the first attempt and dry-run with custom test cases.'
    },
    flipkart: {
      focusTopics: ['Dynamic Programming', 'Binary Search on Answer', 'Greedy Algorithms', 'Graphs'],
      roundBreakdown: 'Round 1: Machine Coding Round → Rounds 2-3: Advanced DSA & Problem Solving (DP & Graphs) → Round 4: Hiring Manager.',
      difficultyPattern: 'Heavy focus on Binary Search variants (search on answer) and 2D dynamic programming.',
      tips: 'Clearly formulate DP recurrence relations and state transitions.'
    },
    tcs: {
      focusTopics: ['Arrays', 'Strings', 'Sorting', 'Binary Search', 'Hashing Basics'],
      roundBreakdown: 'Round 1: National Qualifier Test (NQT Coding) → Round 2: Technical & Managerial Interview.',
      difficultyPattern: 'Easy to Medium difficulty. Tests core foundational logic, string manipulation, and standard sorting.',
      tips: 'Ensure correct output formatting and pass all sample input/output constraints.'
    },
    infosys: {
      focusTopics: ['Arrays', 'Strings', 'Recursion', 'Basic Dynamic Programming'],
      roundBreakdown: 'HackWithInfy / InfyTQ Online Rounds → Technical Coding Assessment & Discussion.',
      difficultyPattern: 'Focus on recursion, greedy heuristics, and basic 1D DP.',
      tips: 'Demonstrate clean variable naming and modular helper functions.'
    },
    wipro: {
      focusTopics: ['Linear Structures', 'String Manipulation', 'Searching & Sorting'],
      roundBreakdown: 'Elite National Talent Hunt (NLTH) → Technical Interview round.',
      difficultyPattern: 'Easy to Medium foundational questions testing loop efficiency and basic structures.',
      tips: 'Master two pointers and frequency counting in arrays.'
    },
    accenture: {
      focusTopics: ['Array Manipulation', 'Bitwise & Basic Math', 'Strings', 'Hashing'],
      roundBreakdown: 'Cognitive & Technical Assessment → Coding Assessment (2 Problems) → Technical Interview.',
      difficultyPattern: 'Focused on efficient array filtering, prefix sums, and frequency tables.',
      tips: 'Prioritize passing 100% of test cases within time limit.'
    }
  };

  const getCompanyProfile = () => {
    if (!selectedCompany) return null;
    const name = (selectedCompany.companyName || '').toLowerCase();
    for (const key of Object.keys(companyInterviewProfiles)) {
      if (name.includes(key)) {
        return { key, ...companyInterviewProfiles[key] };
      }
    }
    return null;
  };

  const currentCompanyProfile = getCompanyProfile();

  // ── Progressive 16 Core DSA Topics ──
  const dsaTopics = [
    {
      id: 'arrays',
      title: 'Arrays & Two Pointers',
      category: 'Linear Structures',
      description: 'Contiguous memory indexing, dynamic vectors, prefix sums, two pointers, and sliding window optimization.',
      explanation: 'Arrays store items at contiguous memory locations enabling O(1) random access by index. Two-pointer and sliding window paradigms reduce brute-force quadratic searches to optimal linear time.',
      patterns: ['Traversal & Running Aggregates', 'Converging Two Pointers (Left & Right)', 'Dynamic Sliding Window', 'Prefix Sum Queries'],
      beginnerConcepts: ['Contiguous memory allocation and zero-indexed addressing.', 'O(1) access time vs O(N) insertion/deletion at arbitrary positions.', 'Static vs Dynamic Vectors.'],
      intermediateConcepts: ['Two Pointers on sorted arrays to achieve O(N) time and O(1) space.', 'Sliding Window over contiguous subarrays for maximum sum or distinct elements.'],
      advancedConcepts: ['Two-pointer boundary tracking for Trapping Rain Water.', 'Monotonic Deque for sliding window maximums in O(N).'],
      companyRelevance: 'Tested in 40%+ of initial screening rounds across product and service companies.'
    },
    {
      id: 'strings',
      title: 'Strings & Character Arrays',
      category: 'Linear Structures',
      description: 'ASCII/UTF-8 character manipulation, palindromes, anagram frequency tables, and string searching.',
      explanation: 'Strings are immutable or mutable sequences of characters. Efficient string algorithms utilize frequency buckets, two pointers, and rolling hashes to avoid expensive concatenation.',
      patterns: ['Frequency Counter Arrays', 'Two Pointer Palindrome Validation', 'Sliding Window Substrings', 'String Matching (KMP & Rabin-Karp)'],
      beginnerConcepts: ['Character ASCII values and byte indexing.', 'String immutability and StringBuilder / string buffers.'],
      intermediateConcepts: ['Frequency tables for anagram validation in O(N).', 'Expanding around center for palindrome substrings.'],
      advancedConcepts: ['Rolling hash for substring search (Rabin-Karp).', 'Prefix function computation for KMP pattern matching.'],
      companyRelevance: 'Essential for parser logic, text processing, and initial hiring rounds.'
    },
    {
      id: 'linked_list',
      title: 'Linked List & Node Pointers',
      category: 'Linear Structures',
      description: 'Dynamic pointer allocation, singly and doubly linked nodes, cycle detection, and in-place reversal.',
      explanation: 'Linked lists provide dynamic memory allocation without requiring contiguous space. Mastering pointer manipulations (prev, curr, next) is fundamental for system memory and cache design.',
      patterns: ['Fast & Slow Pointers (Floyd\'s Cycle)', 'In-Place Pointer Reversal', 'Merge K Sorted Lists', 'Dummy Head Technique'],
      beginnerConcepts: ['Node pointer structures: val and next references.', 'Iterative traversal and inserting/deleting nodes in O(1) when reference is known.'],
      intermediateConcepts: ['Floyd\'s Tortoise and Hare algorithm for cycle detection.', 'In-place reversal without allocating auxiliary nodes.'],
      advancedConcepts: ['Merging K sorted lists using Min-Heap priority queues in O(N log K).', 'Implementing Doubly Linked List with Hash Map for LRU Cache.'],
      companyRelevance: 'Common in technical rounds to evaluate raw memory pointer discipline.'
    },
    {
      id: 'stack_queue',
      title: 'Stack & Queue (LIFO / FIFO)',
      category: 'Linear Structures',
      description: 'LIFO buffer evaluation, monotonic stacks, FIFO queues, circular buffers, and double-ended deques.',
      explanation: 'Stacks enforce Last-In-First-Out access, essential for function call frames and parentheses parsing. Queues enforce First-In-First-Out, forming the core of breadth-first graph algorithms.',
      patterns: ['Parentheses Matching', 'Monotonic Increasing/Decreasing Stack', 'Queue-based BFS Buffers', 'Circular Array Queues'],
      beginnerConcepts: ['LIFO vs FIFO access rules and stack push/pop in O(1).', 'Queue enqueue/dequeue operations.'],
      intermediateConcepts: ['Monotonic stack to find Next Greater Element in O(N) time.', 'Evaluating arithmetic expressions and infix/postfix conversions.'],
      advancedConcepts: ['Largest Rectangle in Histogram using monotonic index stack.', 'Sliding Window Maximum using Deque.'],
      companyRelevance: 'High frequency in system evaluation, expression parsing, and breadth-first search.'
    },
    {
      id: 'hashing',
      title: 'Hashing & Hash Tables',
      category: 'Data Structures',
      description: 'Hash functions, collision resolution, O(1) average key-value lookups, and frequency maps.',
      explanation: 'Hash tables map arbitrary keys to integer bucket indices. They provide average O(1) lookups and are the single most effective tool to optimize algorithm time complexities from quadratic to linear.',
      patterns: ['Direct Addressing & Buckets', 'Separate Chaining vs Open Addressing', 'Complement Lookups (Target - X)', 'Frequency Grouping'],
      beginnerConcepts: ['Hash functions, uniform distribution, and modulo arithmetic.', 'Average O(1) vs Worst Case O(N) collision lookups.'],
      intermediateConcepts: ['One-pass complement lookup for Two Sum and Pair finding.', 'Grouping anagrams using sorted string keys or character counts.'],
      advancedConcepts: ['Design of LRU Cache with O(1) get and put.', 'Subarray Sum Equals K using running prefix sum hash maps.'],
      companyRelevance: 'Foundational across all companies for fast lookups and state management.'
    },
    {
      id: 'binary_search',
      title: 'Binary Search & Search on Answer',
      category: 'Algorithms',
      description: 'O(log N) divide-and-conquer on sorted spaces, boundary invariants, and monotonic search predicates.',
      explanation: 'Binary Search repeatedly halves the monotonic search space. Beyond sorted arrays, it is applied to continuous answer ranges to optimize resource allocation and scheduling.',
      patterns: ['Classic Sorted Array Lookup', 'Rotated Sorted Array Pivots', 'Search on Answer (Monotonic Predicate)', 'First and Last Occurrence Bounds'],
      beginnerConcepts: ['Middle calculation (low + (high - low) / 2) to prevent 32-bit integer overflow.', 'Strictly monotonic search spaces and boundary updates.'],
      intermediateConcepts: ['Binary search on rotated sorted array with pivot identification.', 'Finding square roots and peak elements.'],
      advancedConcepts: ['Search on Answer: Koko Eating Bananas, Capacity to Ship Packages in D Days.', 'Median of two sorted arrays in O(log(min(M,N))).'],
      companyRelevance: 'Crucial for product engineering interviews (Flipkart, Amazon, Google).'
    },
    {
      id: 'trees',
      title: 'Trees & Binary Search Trees (BST)',
      category: 'Hierarchical Structures',
      description: 'Binary trees, BST invariants, DFS preorder/inorder/postorder traversals, and BFS level order.',
      explanation: 'Trees represent hierarchical acyclic structures. Binary Search Trees maintain sorted invariants enabling O(log N) operations. Tree traversals test recursive thinking and stack frame management.',
      patterns: ['Recursive DFS (Pre, In, Postorder)', 'Queue-based BFS Level Order', 'BST Range Queries & Inorder Invariant', 'Lowest Common Ancestor'],
      beginnerConcepts: ['TreeNode definitions with left and right children.', 'Tree height, depth, and leaf node base conditions.'],
      intermediateConcepts: ['Inorder traversal on BST yields sorted elements.', 'BFS level order traversal using queue.', 'Finding Lowest Common Ancestor (LCA).'],
      advancedConcepts: ['Binary Tree Maximum Path Sum with bottom-up DFS.', 'Serializing and deserializing binary trees to string.'],
      companyRelevance: 'Top 3 most tested DSA topic in Google, Amazon, Microsoft rounds.'
    },
    {
      id: 'heap',
      title: 'Heap & Priority Queue',
      category: 'Priority Structures',
      description: 'Min-heaps, max-heaps, complete binary tree array indexing, top K elements, and streaming medians.',
      explanation: 'Heaps are complete binary trees mapped to arrays. They enable O(1) minimum/maximum lookup and O(log N) extractions, critical for priority scheduling and K-way merging.',
      patterns: ['Array-based Binary Tree Indexing', 'Top K Frequent / Largest Elements', 'Two Heaps for Median Stream', 'K-way Merge of Sorted Lists'],
      beginnerConcepts: ['Heap property: Parent is smaller than (Min-Heap) or larger than (Max-Heap) children.', 'Parent (i-1)/2, Left 2i+1, Right 2i+2 array indexing.'],
      intermediateConcepts: ['Building heap in O(N) using sift-down.', 'Finding Kth largest element in O(N log K) using min-heap.'],
      advancedConcepts: ['Find median from continuous data stream using balanced Min & Max heaps.', 'Merge K sorted streams.'],
      companyRelevance: 'High priority in Amazon, Uber, and real-time backend engineering tests.'
    },
    {
      id: 'graphs',
      title: 'Graphs & Network Algorithms',
      category: 'Non-Linear Structures',
      description: 'Adjacency lists, Breadth-First Search, Depth-First Search, Dijkstra shortest path, and Topological Sort.',
      explanation: 'Graphs model networks of vertices and edges. Traversals (BFS for unweighted shortest paths, DFS for connectivity and cycles) form the foundation of routing and distributed systems.',
      patterns: ['Adjacency List & Matrix Representations', 'BFS Shortest Path (Unweighted)', 'DFS Cycle Detection', 'Topological Sort (Kahn\'s Algorithm)', 'Dijkstra (Weighted Shortest Path)'],
      beginnerConcepts: ['Directed vs Undirected, Weighted vs Unweighted graphs.', 'Visited set tracking to avoid infinite loops in cyclic graphs.'],
      intermediateConcepts: ['Number of Connected Components / Number of Islands using DFS/BFS.', 'Topological Sort for dependency resolution (Course Schedule).'],
      advancedConcepts: ['Dijkstra algorithm using Min-Heap Priority Queue in O((V + E) log V).', 'Disjoint Set Union (Union-Find) with path compression.'],
      companyRelevance: 'Key topic for senior engineering and competitive hiring tests (Google, Microsoft).'
    },
    {
      id: 'dp',
      title: 'Dynamic Programming (DP)',
      category: 'Advanced Algorithms',
      description: 'Optimal substructure, overlapping subproblems, top-down memoization, and bottom-up tabulation.',
      explanation: 'Dynamic Programming transforms exponential recursive time complexities into polynomial time by caching and reusing subproblem solutions.',
      patterns: ['1D Array Linear DP', '0/1 Knapsack & Unbounded Knapsack', '2D Matrix DP (LCS & Edit Distance)', 'DP on Trees & State Compression'],
      beginnerConcepts: ['Recognizing overlapping subproblems and optimal substructure.', 'Memoization (Top-Down with recursion cache) vs Tabulation (Bottom-Up iteratively).'],
      intermediateConcepts: ['Climbing Stairs, House Robber, and Coin Change state equations.', 'Longest Increasing Subsequence in O(N log N).'],
      advancedConcepts: ['2D DP: Longest Common Subsequence and Edit Distance.', '0/1 Knapsack optimization from O(N*W) space to 1D O(W).'],
      companyRelevance: 'Distinguishes elite candidates in product company bar raiser rounds.'
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

  // ── Problem Execution & Tracking (Pass Required for Completion) ──
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
      setActiveConsoleTab('output');

      const isPassed = data.success && data.status === 'Accepted';

      const updatedSubs = {
        ...problemSubmissions,
        [selectedProblem.id]: {
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          status: isPassed ? 'Accepted' : 'Failed',
          runtimeMs: data.runtimeMs,
          memoryMb: data.memoryMb,
          language: selectedLanguage,
          lastAttemptedAt: new Date().toISOString()
        }
      };
      setProblemSubmissions(updatedSubs);
      try {
        localStorage.setItem(`zenith_prep_subs_${user?.id || 'guest'}`, JSON.stringify(updatedSubs));
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
      setCodeResult({ success: false, verdict: 'Execution Error', message: 'Compilation failed' });
    } finally {
      setRunningCode(false);
      setSubmittingCode(false);
    }
  };

  // ── Launch Timed Mock Assessment ──
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

  // ── Submit Timed Mock Assessment ──
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

  // Problem counts
  const attemptedCount = Object.keys(problemSubmissions).length;
  const solvedCount = Object.values(problemSubmissions).filter(s => s.status === 'Accepted').length;
  const unsolvedList = Object.values(problemSubmissions).filter(s => s.status !== 'Accepted');

  // Step 1 Filtering
  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setCurrentFlowStep(2);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 text-left">
      
      {/* ── TOP BREADCRUMB & FLOW NAVIGATION ── */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-600 dark:text-purple-400 font-bold uppercase">
            <span>Company Preparation Hub</span>
            <span>/</span>
            <span>Step {currentFlowStep} of 6</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {currentFlowStep === 1 && 'Choose Target Company'}
            {currentFlowStep === 2 && `Select DSA Language for ${selectedCompany?.companyName || 'Target Company'}`}
            {currentFlowStep === 3 && `DSA Learning Roadmap: ${selectedCompany?.companyName || 'Target Company'}`}
            {currentFlowStep === 4 && `Topic Learning: ${currentTopic.title}`}
            {currentFlowStep === 5 && `LeetCode-Style Coding Arena`}
            {currentFlowStep === 6 && `Timed Mock Technical Assessment`}
          </h1>
          {selectedCompany && currentFlowStep > 1 && (
            <p className="text-xs text-slate-500">
              Company: <strong className="text-slate-900 dark:text-white">{selectedCompany.companyName}</strong> ({selectedCompany.industry}) • Language: <strong className="uppercase text-purple-600 font-mono">{selectedLanguage}</strong>
            </p>
          )}
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { num: 1, label: '1. Company' },
            { num: 2, label: '2. Language' },
            { num: 3, label: '3. Roadmap' },
            { num: 4, label: '4. Topic Studio' },
            { num: 5, label: '5. Coding Arena' },
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search real company or industry..."
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

                        {isSelected && <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />}
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
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

      {/* ── STEP 2: CHOOSE DSA LANGUAGE ── */}
      {currentFlowStep === 2 && selectedCompany && (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6 max-w-3xl mx-auto animate-in fade-in">
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
              Step 2 of Flow
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Choose DSA Programming Language
            </h2>
            <p className="text-xs text-slate-500">
              Selected Company: <strong className="text-slate-900 dark:text-white">{selectedCompany.companyName}</strong> ({selectedCompany.industry})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'cpp', title: 'C++', desc: 'C++17 with Standard Template Library (STL)' },
              { id: 'java', title: 'Java', desc: 'Java 17 with Collections Framework' },
              { id: 'python', title: 'Python', desc: 'Python 3.11 with Built-in Data Structures' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLanguage(lang.id);
                  try {
                    localStorage.setItem(`zenith_prep_lang_${user?.id || 'guest'}`, lang.id);
                    localStorage.setItem(`zenith_prep_comp_${user?.id || 'guest'}`, selectedCompany._id);
                  } catch (e) {
                    console.error(e);
                  }
                  setCurrentFlowStep(3);
                }}
                className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center space-y-2 cursor-pointer group hover:border-purple-500 hover:shadow-lg ${
                  selectedLanguage === lang.id
                    ? 'border-purple-600 bg-purple-500/10 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-mono font-bold text-lg border border-purple-500/20 group-hover:scale-105 transition-transform">
                  <Code2 className="h-6 w-6" />
                </div>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white group-hover:text-purple-600">
                  {lang.title}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {lang.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Change Company</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Click any language to proceed directly to DSA Topics →
            </span>
          </div>
        </div>
      )}

      {/* ── STEP 3: COMPANY-SPECIFIC DSA ROADMAP & ANALYSIS ── */}
      {currentFlowStep === 3 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Company-Specific Verified Interview Intelligence Banner */}
          <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-slate-50/50 to-indigo-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Verified Company Interview Profile
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCompany.companyName} Hiring Pattern Analysis
                </h2>
              </div>

              {/* Progress Counters */}
              <div className="flex items-center space-x-3 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px] uppercase">Solved</span>
                  <span className="font-bold text-emerald-600">{solvedCount} Problems</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block text-[9px] uppercase">Topics</span>
                  <span className="font-bold text-purple-600">{completedTopicsCount}/{dsaTopics.length}</span>
                </div>
              </div>
            </div>

            {currentCompanyProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 uppercase text-[10px]">High-Frequency Focus Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentCompanyProfile.focusTopics.map((ft, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                        {ft}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-400 uppercase text-[10px]">Round Structure:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {currentCompanyProfile.roundBreakdown}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Difficulty & Strategy:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {currentCompanyProfile.difficultyPattern}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono">
                Company-specific interview data is not available yet for this employer. Showing standard high-yield technical curriculum.
              </div>
            )}
          </div>

          {/* Unsolved / Attempted Problems Quick Retry Queue */}
          {unsolvedList.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 font-mono flex items-center space-x-1.5">
                  <RotateCcw className="h-4 w-4" />
                  <span>Unsolved Problems Queue ({unsolvedList.length} problems need retry)</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unsolvedList.map(u => (
                  <button
                    key={u.problemId}
                    onClick={() => {
                      const prob = problems.find(p => p.id === u.problemId) || problems[0];
                      if (prob) {
                        setSelectedProblem(prob);
                        setCode(prob.starterCode[selectedLanguage] || prob.starterCode.cpp || '');
                        setCurrentFlowStep(5);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold flex items-center space-x-1.5 hover:shadow-xs cursor-pointer"
                  >
                    <span>{u.problemTitle}</span>
                    <span className="text-[10px] text-amber-500">↳ Retry</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Progressive DSA Topics Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase font-mono text-slate-900 dark:text-white">
                Progressive DSA Curriculum (Beginner → Intermediate → Advanced)
              </h3>
              <button
                onClick={handleStartMockTest}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Take {selectedCompany.companyName} Mock Test</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dsaTopics.map(topic => {
                const isDone = Boolean(completedTopics[`${selectedCompany._id}_${topic.id}`]);
                return (
                  <div
                    key={topic.id}
                    className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
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
                              <span className="text-emerald-600 dark:text-emerald-400">Mastered</span>
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4 text-slate-400" />
                              <span>Mark Mastered</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{topic.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Patterns */}
                      <div className="flex flex-wrap gap-1">
                        {topic.patterns.slice(0, 3).map((pat, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            • {pat}
                          </span>
                        ))}
                      </div>
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
                        <span>Topic Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setCurrentFlowStep(5);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Practice Arena</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── STEP 4: TOPIC STUDIO (Beginner → Intermediate → Advanced Breakdown) ── */}
      {currentFlowStep === 4 && selectedCompany && (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                Topic Mastery Studio • {selectedCompany.companyName}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {currentTopic.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {currentTopic.explanation}
              </p>
            </div>

            <button
              onClick={() => setCurrentFlowStep(5)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <span>Solve Problems in Arena</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Striver-Style 3-Tier Progressive Concept Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Beginner */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 block w-fit">
                Tier 1: Beginner Fundamentals
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                {currentTopic.beginnerConcepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Intermediate */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 block w-fit">
                Tier 2: Intermediate Patterns
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                {currentTopic.intermediateConcepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Advanced */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 block w-fit">
                Tier 3: Advanced & Optimization
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                {currentTopic.advancedConcepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Important Patterns Checklist */}
          <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-300">
              Essential Problem-Solving Patterns:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {currentTopic.patterns.map((pat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>{pat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company-Specific Interview Relevance */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span>{selectedCompany.companyName} Interview Focus for {currentTopic.title}:</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {currentTopic.companyRelevance}
            </p>
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
              <span>Practice in LeetCode-Style Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: LEETCODE-STYLE PROBLEM SOLVING INTERFACE (LARGE FONT, ACCESSIBILITY CONTROLS) ── */}
      {currentFlowStep === 5 && selectedCompany && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Arena Top Toolbar: Problem selector, Language switcher, Font size & Layout controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            {/* Problem selector */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase shrink-0">Problems:</span>
              {problems.map(p => {
                const isSel = selectedProblem?.id === p.id;
                const isPassed = problemSubmissions[p.id]?.status === 'Accepted';
                const isFailed = problemSubmissions[p.id]?.status === 'Failed';
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProblem(p);
                      setCode(p.starterCode[selectedLanguage] || p.starterCode.cpp || '');
                      setCodeResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      isSel ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{p.title}</span>
                    {isPassed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {isFailed && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Accessibility & Layout Controls */}
            <div className="flex items-center space-x-3 shrink-0 text-xs font-mono">
              
              {/* Question Font Size Controls (Large Readable Font) */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] text-slate-400 px-1 font-bold">Text:</span>
                {[14, 16, 18, 20].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setProblemFontSize(sz)}
                    className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                      problemFontSize === sz ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title={`Question text ${sz}px`}
                  >
                    {sz === 14 ? 'S' : sz === 16 ? 'M' : sz === 18 ? 'L' : 'XL'}
                  </button>
                ))}
              </div>

              {/* Editor Font Size Controls */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] text-slate-400 px-1 font-bold">Code:</span>
                {[12, 14, 16, 18].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setEditorFontSize(sz)}
                    className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                      editorFontSize === sz ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title={`Code font ${sz}px`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>

              {/* Layout Switcher (Split vs Stacked) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setEditorLayout('split')}
                  className={`p-1.5 rounded cursor-pointer ${editorLayout === 'split' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  title="Horizontal Split Screen"
                >
                  <Columns className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setEditorLayout('stacked')}
                  className={`p-1.5 rounded cursor-pointer ${editorLayout === 'stacked' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  title="Vertical Stacked Layout"
                >
                  <Rows className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Language Selector */}
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
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
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
            <div className={`grid gap-6 items-start ${editorLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* ── PROBLEM STATEMENT WITH LARGE READABLE FONT ── */}
              <div className={`${editorLayout === 'split' ? 'lg:col-span-5' : 'w-full'} p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6 max-h-[800px] overflow-y-auto`}>
                
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-extrabold uppercase">
                      {selectedCompany.companyName} Question
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                      selectedProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Topic: {selectedProblem.topicLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedProblem.title}
                  </h3>
                </div>

                {/* Problem Description with Dynamic Accessible Font Size */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
                    Problem Statement:
                  </h4>
                  <p 
                    style={{ fontSize: `${problemFontSize}px`, lineHeight: 1.6 }}
                    className="text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {selectedProblem.problemStatement}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
                    Examples:
                  </h4>
                  {selectedProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-xs">
                      <div className="text-slate-400 text-[11px] font-bold">Example {idx + 1}:</div>
                      <div><strong className="text-purple-600 dark:text-purple-400">Input:</strong> <code>{ex.input}</code></div>
                      <div><strong className="text-emerald-600 dark:text-emerald-400">Output:</strong> <code>{ex.output}</code></div>
                      {ex.explanation && (
                        <div className="text-slate-500 text-[11px] pt-1 font-sans">
                          <em>Explanation:</em> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
                    Constraints:
                  </h4>
                  <ul className="text-xs font-mono text-slate-500 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* ── ONLINE COMPILER & CODE EXECUTION ARENA ── */}
              <div className={`${editorLayout === 'split' ? 'lg:col-span-7' : 'w-full'} rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col justify-between`}>
                
                {/* Editor Top Bar */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Terminal className="h-4 w-4 text-purple-600" />
                    <span>solution.{selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'py' : 'java'}</span>
                  </span>

                  <button
                    onClick={() => setCode(selectedProblem.starterCode[selectedLanguage] || '')}
                    className="hover:text-slate-200 transition cursor-pointer flex items-center space-x-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Code</span>
                  </button>
                </div>

                {/* Editor Textarea */}
                <div className="bg-[#0b101b] p-4 font-mono text-slate-100">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={editorLayout === 'split' ? 18 : 14}
                    style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.5 }}
                    spellCheck="false"
                    className="w-full bg-transparent text-slate-100 font-mono leading-relaxed outline-none resize-y"
                    placeholder="Write your solution here..."
                  />
                </div>

                {/* Action Buttons: Run Code & Submit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>Language: <strong className="uppercase text-purple-600">{selectedLanguage}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleExecuteCode(false)}
                      disabled={runningCode || submittingCode}
                      className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {runningCode ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-purple-600" />}
                      <span>Run Sample Cases</span>
                    </button>

                    <button
                      onClick={() => handleExecuteCode(true)}
                      disabled={runningCode || submittingCode}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {submittingCode ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>Submit Solution</span>
                    </button>
                  </div>
                </div>

                {/* Console Output Tabs */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 font-mono text-xs">
                  <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <button
                      onClick={() => setActiveConsoleTab('testcases')}
                      className={`font-bold transition cursor-pointer ${activeConsoleTab === 'testcases' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}`}
                    >
                      Sample Test Cases
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('output')}
                      className={`font-bold transition cursor-pointer ${activeConsoleTab === 'output' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}`}
                    >
                      Execution Console {codeResult && (codeResult.success ? '✓' : '✗')}
                    </button>
                  </div>

                  {activeConsoleTab === 'testcases' && (
                    <div className="space-y-2">
                      {selectedProblem.examples.map((tc, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between items-center">
                          <span>Case #{idx + 1}: <code>{tc.input}</code></span>
                          <span className="text-slate-400">Expected: <code>{tc.output}</code></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConsoleTab === 'output' && (
                    <div>
                      {!codeResult ? (
                        <div className="py-4 text-center text-slate-400 text-[11px]">
                          Click "Run Sample Cases" or "Submit Solution" to view execution results.
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className={`font-bold ${codeResult.status === 'Accepted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                              {codeResult.status === 'Accepted' ? '✓ ' : '✗ '} {codeResult.verdict}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Runtime: {codeResult.runtimeMs}ms • Memory: {codeResult.memoryMb}
                            </span>
                          </div>

                          {(codeResult.testResults || []).map((tr, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between items-center">
                              <span>Test #{tr.testCaseIndex}: Input <code>{tr.input}</code></span>
                              <span className={tr.passed ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                {tr.passed ? 'Passed ✓' : 'Failed ✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Navigation to Mock Test */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentFlowStep(3)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Roadmap</span>
            </button>
            <button
              onClick={handleStartMockTest}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Take {selectedCompany.companyName} Mock Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 6: TIMED COMPANY MOCK TEST & WEAK TOPICS ── */}
      {currentFlowStep === 6 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-slate-50 to-indigo-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-600">
                Official Company Technical Assessment
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {selectedCompany.companyName} Timed Assessment
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

              {/* Weak Topics Analysis */}
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
                  Review DSA Roadmap
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

          {/* Active Mock Question Workspace */}
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
