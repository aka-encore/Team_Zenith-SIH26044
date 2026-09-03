import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Code2, BookOpen, Layers, Terminal, Play, Pause,
  Send, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw,
  ArrowLeft, ArrowRight, ShieldCheck, Award,
  ChevronRight, HelpCircle, Lightbulb, Search, Filter,
  Globe, Briefcase, Type, Columns, Rows, RotateCcw, Check, XCircle,
  FastForward, Rewind, Maximize, Minimize, Bookmark, AlertTriangle
} from 'lucide-react';

export default function CompanyPrepPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Step State: 1: Company | 2: Language | 3: Roadmap | 4: Learning | 5: Video Lesson | 6: Coding Arena | 7: Mock Test ──
  const [currentFlowStep, setCurrentFlowStep] = useState(1);

  // ── Step 1: Real Database Companies ──
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ── Step 2: DSA Language (C++, Java, Python) ──
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  // ── Step 3, 4 & 5: Topics & Video Lesson ──
  const [selectedTopicId, setSelectedTopicId] = useState('arrays');
  
  // Video Lesson Player Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef(null);

  // ── Step 6: Coding Arena ──
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'output' | 'hints'
  const [showHint, setShowHint] = useState(false);

  // Typography Controls
  const [questionFontSize, setQuestionFontSize] = useState(16); // 14, 16, 20
  const [editorFontSize, setEditorFontSize] = useState(14); // 12, 14, 18
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' | 'stacked'

  // Progress & Unsolved Tracking
  const [problemSubmissions, setProblemSubmissions] = useState({});
  const [savedForLater, setSavedForLater] = useState({});
  const [completedTopics, setCompletedTopics] = useState({});

  // ── Step 7: Timed Mock Test ──
  const [mockSession, setMockSession] = useState(null);
  const [mockTimeRemaining, setMockTimeRemaining] = useState(45 * 60);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockSubmitting, setMockSubmitting] = useState(false);
  const [mockResult, setMockResult] = useState(null);
  const [mockCompleted, setMockCompleted] = useState(false);

  // Fetch real companies
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

  // Load persistent progress
  useEffect(() => {
    try {
      const uid = user?.id || 'guest';
      const savedT = localStorage.getItem(`zenith_prep_topics_${uid}`);
      if (savedT) setCompletedTopics(JSON.parse(savedT));
      const savedS = localStorage.getItem(`zenith_prep_subs_${uid}`);
      if (savedS) setProblemSubmissions(JSON.parse(savedS));
      const savedL = localStorage.getItem(`zenith_prep_saved_${uid}`);
      if (savedL) setSavedForLater(JSON.parse(savedL));
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
    if (currentFlowStep !== 7 || mockCompleted || mockTimeRemaining <= 0) return;
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

  // Company hiring profiles
  const companyInterviewProfiles = {
    google: {
      focusTopics: ['Trees & BST', 'Graphs', 'Dynamic Programming', 'Recursion'],
      roundBreakdown: 'Screening (Arrays/Strings) → 3 Technical Rounds (Trees, Graphs, DP) → System Design.',
      difficultyPattern: 'Optimal O(N) or O(log N) time with sub-quadratic auxiliary memory.'
    },
    amazon: {
      focusTopics: ['Arrays', 'Hash Maps', 'Trees & BST', 'Heap & Priority Queue'],
      roundBreakdown: 'Online Assessment (2 Problems) → Technical Rounds (Trees, Heaps, Data Structures).',
      difficultyPattern: 'Clean modular code, fast hash lookups, and heap data structures.'
    },
    microsoft: {
      focusTopics: ['Strings', 'Linked List', 'Trees & Graph Traversal', 'Two Pointers'],
      roundBreakdown: 'Online Assessment → In-depth Technical interviews on memory pointers and recursion.',
      difficultyPattern: 'Medium difficulty with focus on recursion call stacks and pointer manipulation.'
    },
    meta: {
      focusTopics: ['Arrays', 'Binary Search', 'Trees & Graphs (BFS/DFS)', 'Two Pointers'],
      roundBreakdown: 'Screening (2 questions in 45 mins) → Onsite (Algorithmic speed & optimization).',
      difficultyPattern: 'Optimal solution with dry run in 15-20 minutes per problem.'
    },
    flipkart: {
      focusTopics: ['Dynamic Programming', 'Binary Search on Answer', 'Greedy Algorithms'],
      roundBreakdown: 'Machine Coding Round → 2-3 Advanced DSA Rounds → Hiring Manager Round.',
      difficultyPattern: 'Binary Search variants and 2D dynamic programming.'
    },
    tcs: {
      focusTopics: ['Arrays', 'Strings', 'Sorting', 'Binary Search', 'Hashing Basics'],
      roundBreakdown: 'National Qualifier Test (NQT Coding) → Technical & Managerial Interview.',
      difficultyPattern: 'Foundational logic, string manipulation, and standard sorting.'
    },
    infosys: {
      focusTopics: ['Arrays', 'Strings', 'Recursion', 'Basic Dynamic Programming'],
      roundBreakdown: 'HackWithInfy / InfyTQ Online Rounds → Technical Coding Assessment.',
      difficultyPattern: 'Recursion, greedy heuristics, and basic 1D DP.'
    },
    wipro: {
      focusTopics: ['Linear Structures', 'String Manipulation', 'Searching & Sorting'],
      roundBreakdown: 'Elite National Talent Hunt (NLTH) → Technical Interview round.',
      difficultyPattern: 'Foundational questions testing loop efficiency and basic structures.'
    },
    accenture: {
      focusTopics: ['Array Manipulation', 'Bitwise & Basic Math', 'Strings', 'Hashing'],
      roundBreakdown: 'Cognitive & Technical Assessment → Coding Assessment (2 Problems).',
      difficultyPattern: 'Array filtering, prefix sums, and frequency tables.'
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

  // Core DSA Topics organized by progression tiers
  const dsaTopics = [
    {
      id: 'arrays',
      title: 'Arrays & Two Pointers',
      category: 'Linear Structures',
      tier: 'Beginner',
      description: 'Contiguous memory indexing, dynamic vectors, prefix sums, two pointers, and sliding window optimization.',
      explanation: 'An Array is a collection of items stored at contiguous memory locations. It provides constant O(1) random access time by index calculation.',
      beginnerConcepts: [
        'Contiguous Memory: Elements stored sequentially in RAM.',
        'Base Addressing: Address(i) = Base_Address + i * sizeof(Type).',
        'Static vs Dynamic: Fixed size vs Geometric amortized doubling.'
      ],
      stepByStepExamples: [
        'Example: Reversing an array in-place using two pointers.',
        'Step 1: Place left pointer at 0 and right pointer at N-1.',
        'Step 2: Swap arr[left] and arr[right].',
        'Step 3: Increment left, decrement right until left >= right.'
      ],
      patterns: ['Converging Two Pointers', 'Fast & Slow Pointers', 'Prefix Sum Queries', 'Sliding Window Subarrays'],
      timeComplexity: 'Access: O(1) • Linear Search: O(N) • Append: O(1) amortized',
      spaceComplexity: 'O(N) for storage. In-place operations require O(1) extra space.',
      commonMistakes: [
        'Off-by-one index bounds.',
        'Modifying an array while iterating without index adjustment.',
        'Assuming sorted order on unsorted input.'
      ],
      interviewRelevance: 'Appears in initial screening rounds across top software engineering roles.',
      videoLessons: [
        {
          chapter: '1. Fundamentals',
          title: 'Memory Allocation & Indexing',
          duration: 25,
          concept: 'Contiguous memory layout and constant-time random access.',
          points: [
            'Direct address arithmetic: Base + (index * element_size).',
            'L1/L2 cache locality benefits.',
            'Static array bounds vs Dynamic vector resizing.'
          ],
          codeSnippet: `int arr[5] = {10, 20, 30, 40, 50};\nint val = arr[2]; // O(1) direct offset access`
        },
        {
          chapter: '2. Two Pointers',
          title: 'Converging Pointers Paradigm',
          duration: 30,
          concept: 'Reducing O(N²) quadratic nested loops to O(N) linear time.',
          points: [
            'Start left at 0, right at N-1 on sorted data.',
            'Increment left when sum is too small; decrement right when too large.',
            'Eliminates need for auxiliary hash table storage.'
          ],
          codeSnippet: `int left = 0, right = nums.size() - 1;\nwhile (left < right) {\n    int sum = nums[left] + nums[right];\n    if (sum == target) return {left + 1, right + 1};\n    else if (sum < target) left++;\n    else right--;\n}`
        },
        {
          chapter: '3. Sliding Window',
          title: 'Subarray Search Optimization',
          duration: 30,
          concept: 'Maintaining running state over contiguous subarrays in O(N).',
          points: [
            'Expand right boundary to include new elements.',
            'Shrink left boundary when constraints are exceeded.'
          ],
          codeSnippet: `int left = 0, curr = 0, maxVal = 0;\nfor (int right = 0; right < n; right++) {\n    curr += nums[right];\n    while (curr > target) { curr -= nums[left++]; }\n    maxVal = max(maxVal, curr);\n}`
        }
      ]
    },
    {
      id: 'hashing',
      title: 'Hash Tables & Sets',
      category: 'Lookup Structures',
      tier: 'Intermediate',
      description: 'Hash functions, collision resolution, O(1) average lookups, frequency tables, and caching.',
      explanation: 'A Hash Table maps keys to values using a mathematical hash function, enabling constant-time average lookups, insertions, and deletions.',
      beginnerConcepts: [
        'Hash Function: Converts keys into integer bucket indices.',
        'Collision Resolution: Chaining via linked lists vs Open Addressing.',
        'Load Factor & Rehashing thresholds.'
      ],
      stepByStepExamples: [
        'Example: Two Sum using Hash Map in a single pass.',
        'Step 1: Iterate through each element x.',
        'Step 2: Compute complement = target - x.',
        'Step 3: Check if complement exists in map; if not, insert x.'
      ],
      patterns: ['Complement Matching', 'Frequency Counting', 'Prefix Sum Hash Map'],
      timeComplexity: 'Average: O(1) Insert/Search/Delete • Worst-case: O(N)',
      spaceComplexity: 'O(N) for hash buckets and entry storage.',
      commonMistakes: [
        'Assuming sorted ordering in unordered maps.',
        'Ignoring worst-case collision degradation on malicious inputs.'
      ],
      interviewRelevance: 'Primary pattern to optimize O(N²) search into linear O(N) runtime.',
      videoLessons: [
        {
          chapter: '1. Mechanism',
          title: 'Buckets & Hash Distribution',
          duration: 25,
          concept: 'Uniform distribution of keys into bucket arrays.',
          points: [
            'hash_code = hash(key) % capacity.',
            'O(1) average retrieval vs O(N) worst-case chain traversal.'
          ],
          codeSnippet: `unordered_map<string, int> counts;\ncounts["apple"] = 1; // O(1) bucket insertion`
        },
        {
          chapter: '2. Frequency Mapping',
          title: 'Single-Pass Complement Search',
          duration: 30,
          concept: 'Recording past occurrences for instantaneous lookups.',
          points: [
            'Check map for required complement prior to insertion.',
            'Eliminates duplicate passes.'
          ],
          codeSnippet: `unordered_map<int, int> seen;\nfor (int i = 0; i < n; i++) {\n    int complement = target - nums[i];\n    if (seen.count(complement)) return {seen[complement], i};\n    seen[nums[i]] = i;\n}`
        }
      ]
    },
    {
      id: 'trees',
      title: 'Trees & Binary Search Trees',
      category: 'Hierarchical Structures',
      tier: 'Advanced',
      description: 'Binary trees, BST invariants, DFS traversals (Inorder, Preorder, Postorder), BFS level order, and LCA.',
      explanation: 'A Tree is a hierarchical non-linear data structure. A Binary Search Tree enforces that left subtree keys are strictly smaller and right are larger.',
      beginnerConcepts: [
        'TreeNode: Pointer to left child, right child, and stored value.',
        'Tree Height vs Depth.',
        'BST Invariant: Left < Root < Right.'
      ],
      stepByStepExamples: [
        'Example: Inorder traversal on BST.',
        'Step 1: Recursively traverse left subtree.',
        'Step 2: Visit root node.',
        'Step 3: Recursively traverse right subtree.'
      ],
      patterns: ['Bottom-Up Recursion (Depth/Diameter)', 'Level Order Traversal (BFS)', 'Lowest Common Ancestor (LCA)'],
      timeComplexity: 'Balanced BST Search: O(log N) • Traversals: O(N)',
      spaceComplexity: 'O(H) recursion stack space, where H is tree height.',
      commonMistakes: [
        'Missing null root base condition.',
        'Checking only immediate children instead of global subtree bounds in BST validation.'
      ],
      interviewRelevance: 'Core structural domain tested in algorithmic interview rounds.',
      videoLessons: [
        {
          chapter: '1. Structure',
          title: 'Node Pointers & Traversal Order',
          duration: 25,
          concept: 'Recursive decomposition of binary tree nodes.',
          points: [
            'Preorder (Root-Left-Right), Inorder (Left-Root-Right), Postorder (Left-Right-Root).',
            'Inorder on BST produces sorted ascending sequence.'
          ],
          codeSnippet: `void inorder(TreeNode* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << " ";\n    inorder(root->right);\n}`
        },
        {
          chapter: '2. BFS Queue',
          title: 'Level Order Traversal',
          duration: 30,
          concept: 'Processing nodes layer by layer using a FIFO queue.',
          points: [
            'Push root to queue.',
            'Pop level size nodes and enqueue valid children.'
          ],
          codeSnippet: `queue<TreeNode*> q;\nq.push(root);\nwhile (!q.empty()) {\n    TreeNode* curr = q.front(); q.pop();\n    if (curr->left) q.push(curr->left);\n    if (curr->right) q.push(curr->right);\n}`
        }
      ]
    },
    {
      id: 'dp',
      title: 'Dynamic Programming',
      category: 'Optimization Algorithms',
      tier: 'Advanced',
      description: 'Optimal substructure, overlapping subproblems, memoization, and bottom-up tabulation.',
      explanation: 'Dynamic Programming solves complex problems by breaking them into overlapping subproblems, solving each once, and caching the results.',
      beginnerConcepts: [
        'Overlapping Subproblems: Same subproblem computed multiple times in recursion.',
        'Optimal Substructure: Optimal solution constructed from subproblem solutions.',
        'State Definition: Minimal variables that uniquely describe a subproblem.'
      ],
      stepByStepExamples: [
        'Example: Climbing Stairs with DP.',
        'Step 1: dp[1] = 1, dp[2] = 2.',
        'Step 2: For i = 3 to N: dp[i] = dp[i-1] + dp[i-2].'
      ],
      patterns: ['1D Linear DP', '0/1 Knapsack', '2D Grid DP', 'Longest Common Subsequence'],
      timeComplexity: 'Number of states * Transitions per state.',
      spaceComplexity: 'DP table size + recursion call stack.',
      commonMistakes: [
        'Incorrect base case assignment.',
        'Unbounded state memory when only previous 1-2 states are needed.'
      ],
      interviewRelevance: 'Essential differentiator for senior algorithmic problem solving.',
      videoLessons: [
        {
          chapter: '1. Formulation',
          title: 'Recurrence Relations & Memoization',
          duration: 25,
          concept: 'Transforming exponential recursion into polynomial runtime.',
          points: [
            'Identify overlapping subproblems.',
            'Cache subproblem outputs in lookup array.'
          ],
          codeSnippet: `int dp[n+1];\ndp[1] = 1; dp[2] = 2;\nfor (int i = 3; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n}`
        }
      ]
    }
  ];

  const currentTopic = dsaTopics.find(t => t.id === selectedTopicId) || dsaTopics[0];
  const activeLessons = currentTopic.videoLessons || [];
  const currentLessonChapter = activeLessons[activeChapterIdx] || activeLessons[0];
  const totalVideoDuration = activeLessons.reduce((acc, l) => acc + l.duration, 0);

  // Video playback effect
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= totalVideoDuration) {
            setIsPlaying(false);
            return totalVideoDuration;
          }
          let accum = 0;
          for (let i = 0; i < activeLessons.length; i++) {
            accum += activeLessons[i].duration;
            if (next < accum) {
              setActiveChapterIdx(i);
              break;
            }
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalVideoDuration, activeLessons]);

  const handleJumpToChapter = (idx) => {
    let accum = 0;
    for (let i = 0; i < idx; i++) {
      accum += activeLessons[i].duration;
    }
    setCurrentTime(accum);
    setActiveChapterIdx(idx);
  };

  const handleSeek = (delta) => {
    setCurrentTime(prev => {
      const updated = Math.min(totalVideoDuration, Math.max(0, prev + delta));
      let accum = 0;
      for (let i = 0; i < activeLessons.length; i++) {
        accum += activeLessons[i].duration;
        if (updated < accum) {
          setActiveChapterIdx(i);
          break;
        }
      }
      return updated;
    });
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Real Problem Execution
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

  const toggleSaveForLater = (probId) => {
    const updated = { ...savedForLater, [probId]: !savedForLater[probId] };
    setSavedForLater(updated);
    try {
      localStorage.setItem(`zenith_prep_saved_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

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

  // Mock Test
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
        setCurrentFlowStep(7);
        setMockCompleted(false);
        setMockResult(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompanies(false);
    }
  };

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

  const solvedCount = Object.values(problemSubmissions).filter(s => s.status === 'Accepted').length;
  const unsolvedList = Object.values(problemSubmissions).filter(s => s.status === 'Failed');
  const completedTopicsCount = Object.keys(completedTopics).filter(k => completedTopics[k] && k.startsWith(selectedCompany?._id || '')).length;

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

  // Group topics by Tier for clean progression
  const beginnerTopics = dsaTopics.filter(t => t.tier === 'Beginner');
  const intermediateTopics = dsaTopics.filter(t => t.tier === 'Intermediate');
  const advancedTopics = dsaTopics.filter(t => t.tier === 'Advanced');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 text-left px-3 sm:px-6">
      
      {/* ── BREADCRUMB & NAVIGATION ── */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Technical Preparation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {currentFlowStep === 1 && 'Choose Your Target Company'}
              {currentFlowStep === 2 && 'Select Coding Language'}
              {currentFlowStep === 3 && `${selectedCompany?.companyName || 'Company'} Learning Path`}
              {currentFlowStep === 4 && currentTopic.title}
              {currentFlowStep === 5 && `${currentTopic.title} • Video Lesson`}
              {currentFlowStep === 6 && 'Problem Practice Arena'}
              {currentFlowStep === 7 && `${selectedCompany?.companyName || 'Company'} Assessment`}
            </h1>
            {selectedCompany && currentFlowStep > 1 && (
              <p className="text-sm text-slate-500 mt-1">
                Target: <strong className="text-slate-800 dark:text-slate-200">{selectedCompany.companyName}</strong> ({selectedCompany.industry}) • Language: <span className="font-mono uppercase font-semibold text-purple-600 dark:text-purple-400">{selectedLanguage}</span>
              </p>
            )}
          </div>

          {/* Minimal Clean Step Bar */}
          <nav className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { num: 1, label: '1. Company' },
              { num: 2, label: '2. Language' },
              { num: 3, label: '3. Roadmap' },
              { num: 4, label: '4. Topic' },
              { num: 5, label: '5. Video' },
              { num: 6, label: '6. Coding' },
              { num: 7, label: '7. Test' }
            ].map(s => (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num > 1 && !selectedCompany) return;
                  setCurrentFlowStep(s.num);
                }}
                disabled={s.num > 1 && !selectedCompany}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer disabled:opacity-40 ${
                  currentFlowStep === s.num
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── STEP 1: COMPANY SELECTION ── */}
      {currentFlowStep === 1 && (
        <section className="space-y-8 w-full">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Choose Your Target Company
            </h2>
            <p className="text-sm text-slate-500">
              Prepare specifically for your target company's interview pattern.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-purple-600"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-purple-600 cursor-pointer"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>
                    {ind === 'all' ? 'All Industries' : ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Company Grid */}
          {loadingCompanies ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm text-slate-500">Loading companies from database...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-2">
              <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No companies available yet.</h3>
              <p className="text-sm text-slate-400">No matching company records found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map(comp => {
                const isSelected = selectedCompany?._id === comp._id;
                return (
                  <div
                    key={comp._id}
                    className={`p-6 rounded-2xl border text-left transition flex flex-col justify-between space-y-5 bg-white dark:bg-slate-900 ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        {comp.logoUrl ? (
                          <img
                            src={comp.logoUrl}
                            alt={comp.companyName}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        <div
                          style={{ display: comp.logoUrl ? 'none' : 'flex' }}
                          className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 items-center justify-center font-bold text-lg border border-purple-100 dark:border-purple-900 shrink-0 font-mono uppercase"
                        >
                          {comp.companyName.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {comp.companyName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {comp.industry || 'Technology & Software'}
                          </p>
                        </div>
                      </div>

                      {comp.website && (
                        <p className="text-xs text-slate-400 flex items-center space-x-1.5 truncate">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{comp.website}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {comp.opportunityCount > 0 ? `${comp.opportunityCount} Roles` : 'Direct Path'}
                      </span>

                      <button
                        onClick={() => handleSelectCompany(comp)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        <span>Prepare</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── STEP 2: LANGUAGE SELECTION ── */}
      {currentFlowStep === 2 && selectedCompany && (
        <section className="max-w-2xl mx-auto space-y-6 py-6 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Select DSA Language
            </h2>
            <p className="text-sm text-slate-500">
              Choose your primary coding language for {selectedCompany.companyName} interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'cpp', title: 'C++', desc: 'C++17 with STL' },
              { id: 'java', title: 'Java', desc: 'Java 17 Collections' },
              { id: 'python', title: 'Python', desc: 'Python 3.11' }
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
                className={`p-6 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-2 cursor-pointer bg-white dark:bg-slate-900 hover:border-purple-500 ${
                  selectedLanguage === lang.id
                    ? 'border-purple-600 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg mb-1">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {lang.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ← Back to Companies
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 3: STRUCTURED LEARNING PATH (ROADMAP) ── */}
      {currentFlowStep === 3 && selectedCompany && (
        <section className="space-y-8 text-left">
          
          {/* Company Target Summary */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCompany.companyName} Preparation Path
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Industry: {selectedCompany.industry || 'Technology'} • Location: {selectedCompany.location || 'Remote'}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="text-emerald-600">Solved: {solvedCount}</span>
                <span className="text-purple-600">Completed: {completedTopicsCount}/{dsaTopics.length}</span>
                <button
                  onClick={handleStartMockTest}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Timed Test
                </button>
              </div>
            </div>

            {/* Real Database Roles if available */}
            {selectedCompany.opportunities && selectedCompany.opportunities.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Roles ({selectedCompany.opportunities.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.opportunities.map((opp, idx) => (
                    <div key={opp._id || idx} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <strong className="text-slate-800 dark:text-slate-200">{opp.title}</strong>
                      <span className="text-slate-400 ml-1.5 uppercase font-mono">({opp.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unsolved Practice Queue */}
          {unsolvedList.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry Unsolved Problems ({unsolvedList.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {unsolvedList.map(u => (
                  <button
                    key={u.problemId}
                    onClick={() => {
                      const prob = problems.find(p => p.id === u.problemId) || problems[0];
                      if (prob) {
                        setSelectedProblem(prob);
                        setCode(prob.starterCode[selectedLanguage] || prob.starterCode.cpp || '');
                        setCurrentFlowStep(6);
                      }
                    }}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-lg hover:border-amber-500 cursor-pointer"
                  >
                    {u.problemTitle} ↳ Try Again
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Structured Progression: Beginner -> Intermediate -> Advanced */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Curriculum Progression
            </h3>

            {[
              { tierName: 'Beginner Foundations', list: beginnerTopics, badge: 'Phase 1' },
              { tierName: 'Intermediate Data Structures', list: intermediateTopics, badge: 'Phase 2' },
              { tierName: 'Advanced Algorithmic Mastery', list: advancedTopics, badge: 'Phase 3' }
            ].map(group => {
              if (group.list.length === 0) return null;
              return (
                <div key={group.tierName} className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <span>{group.badge}</span>
                    <span>•</span>
                    <span>{group.tierName}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.list.map(topic => {
                      const isDone = Boolean(completedTopics[`${selectedCompany._id}_${topic.id}`]);
                      return (
                        <div
                          key={topic.id}
                          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                                {topic.category}
                              </span>
                              <button
                                onClick={() => toggleTopicDone(topic.id)}
                                className="text-xs flex items-center space-x-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                              >
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-emerald-600 font-semibold">Done</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="h-4 w-4 text-slate-400" />
                                    <span>Mark Done</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                              {topic.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {topic.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedTopicId(topic.id);
                                setCurrentFlowStep(4);
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Learn Topic
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTopicId(topic.id);
                                setCurrentFlowStep(5);
                                setCurrentTime(0);
                                setIsPlaying(false);
                                setActiveChapterIdx(0);
                              }}
                              className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Video Lesson
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTopicId(topic.id);
                                setCurrentFlowStep(6);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Code & Practice
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── STEP 4: TOPIC LEARNING ── */}
      {currentFlowStep === 4 && selectedCompany && (
        <section className="space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Core Topic Concept
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {currentTopic.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentFlowStep(5);
                  setCurrentTime(0);
                  setIsPlaying(false);
                  setActiveChapterIdx(0);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Watch Video Lesson
              </button>
              <button
                onClick={() => setCurrentFlowStep(6)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Practice Problems →
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Explanation
              </h3>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentTopic.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                  Fundamental Concepts
                </h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
                  {currentTopic.beginnerConcepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                  Step-by-Step Example
                </h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
                  {currentTopic.stepByStepExamples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Time & Space Complexity</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono"><strong>Time:</strong> {currentTopic.timeComplexity}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono"><strong>Space:</strong> {currentTopic.spaceComplexity}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Common Mistakes</h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  {currentTopic.commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Interview Importance</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentTopic.interviewRelevance}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(3)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ← Back to Path
            </button>
            <button
              onClick={() => setCurrentFlowStep(6)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Practice in Coding Arena →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 5: VIDEO LESSON PLAYER ── */}
      {currentFlowStep === 5 && selectedCompany && (
        <section className="space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Video Lesson
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {currentTopic.title} Lesson
              </h2>
            </div>

            <button
              onClick={() => setCurrentFlowStep(6)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Proceed to Coding Arena →
            </button>
          </div>

          {/* Clean Player Stage */}
          <div
            ref={playerContainerRef}
            className={`rounded-2xl bg-slate-950 text-white border border-slate-800 overflow-hidden flex flex-col justify-between ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[460px]'
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-semibold text-slate-200">{currentLessonChapter.chapter}: {currentLessonChapter.title}</span>
              <span>{formatTimer(currentTime)} / {formatTimer(totalVideoDuration)}</span>
            </div>

            <div className="p-6 sm:p-10 space-y-6 text-left">
              <div>
                <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                  {currentLessonChapter.chapter}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {currentLessonChapter.concept}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentLessonChapter.points.map((pt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <p className="leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>

              {currentLessonChapter.codeSnippet && (
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                  <pre className="whitespace-pre">
                    <code>{currentLessonChapter.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
              <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                <div
                  style={{ width: `${(currentTime / totalVideoDuration) * 100}%` }}
                  className="h-full bg-purple-600 transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSeek(-10)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    <Rewind className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>

                  <button
                    onClick={() => handleSeek(10)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    <FastForward className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg">
                  {[0.75, 1, 1.25, 1.5, 2].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        playbackSpeed === spd ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
            {activeLessons.map((l, idx) => (
              <button
                key={idx}
                onClick={() => handleJumpToChapter(idx)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  activeChapterIdx === idx
                    ? 'border-purple-600 bg-purple-50/20 dark:bg-purple-950/20 font-semibold text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-mono text-slate-400">{l.chapter}</div>
                <div className="text-xs truncate">{l.title}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── STEP 6: CODING ARENA ── */}
      {currentFlowStep === 6 && selectedCompany && (
        <section className="space-y-4 text-left">
          
          {/* Top Control Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase">Problems:</span>
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
                      setShowHint(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      isSel
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{p.title}</span>
                    {isPassed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {isFailed && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <span className="text-slate-400 px-1">Text:</span>
                {[
                  { label: 'A-', sz: 14 },
                  { label: 'A', sz: 16 },
                  { label: 'A+', sz: 20 }
                ].map(f => (
                  <button
                    key={f.label}
                    onClick={() => setQuestionFontSize(f.sz)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      questionFontSize === f.sz ? 'bg-purple-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <span className="text-slate-400 px-1">Code:</span>
                {[
                  { label: 'A-', sz: 12 },
                  { label: 'A', sz: 14 },
                  { label: 'A+', sz: 18 }
                ].map(f => (
                  <button
                    key={f.label}
                    onClick={() => setEditorFontSize(f.sz)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      editorFontSize === f.sz ? 'bg-purple-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {['cpp', 'java', 'python'].map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLanguage(l);
                      if (selectedProblem?.starterCode?.[l]) {
                        setCode(selectedProblem.starterCode[l]);
                      }
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase transition cursor-pointer ${
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
            <div className={`grid gap-5 items-start ${editorLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* Problem Statement Area */}
              <div className={`${editorLayout === 'split' ? 'lg:col-span-5' : 'w-full'} p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 max-h-[820px] overflow-y-auto`}>
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold uppercase">
                        {currentTopic.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        selectedProblem.difficulty === 'Easy' ? 'text-emerald-600' :
                        selectedProblem.difficulty === 'Medium' ? 'text-amber-600' :
                        'text-purple-600'
                      }`}>
                        {selectedProblem.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSaveForLater(selectedProblem.id)}
                      className="text-xs font-medium text-slate-400 hover:text-purple-600 cursor-pointer flex items-center space-x-1"
                    >
                      <Bookmark className={`h-4 w-4 ${savedForLater[selectedProblem.id] ? 'fill-purple-600 text-purple-600' : ''}`} />
                      <span>{savedForLater[selectedProblem.id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedProblem.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Description</h4>
                  <p 
                    style={{ fontSize: `${questionFontSize}px`, lineHeight: 1.6 }}
                    className="text-slate-800 dark:text-slate-200 font-normal"
                  >
                    {selectedProblem.problemStatement}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Examples</h4>
                  {selectedProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                      <div><strong className="text-purple-600">Input:</strong> <code>{ex.input}</code></div>
                      <div><strong className="text-emerald-600">Output:</strong> <code>{ex.output}</code></div>
                      {ex.explanation && (
                        <p className="text-slate-500 font-sans pt-1 text-[11px]">{ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Constraints</h4>
                  <ul className="text-xs font-mono text-slate-500 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Editor & Console */}
              <div className={`${editorLayout === 'split' ? 'lg:col-span-7' : 'w-full'} rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between`}>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>solution.{selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'py' : 'java'}</span>
                  <button
                    onClick={() => setCode(selectedProblem.starterCode[selectedLanguage] || '')}
                    className="hover:text-slate-200 cursor-pointer"
                  >
                    Reset Starter Code
                  </button>
                </div>

                <div className="bg-[#0b101b] p-4 font-mono text-slate-100">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={editorLayout === 'split' ? 18 : 14}
                    style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.5 }}
                    spellCheck="false"
                    className="w-full bg-transparent text-slate-100 font-mono leading-relaxed outline-none resize-y"
                    placeholder="Write code..."
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Language: <strong className="uppercase text-purple-600">{selectedLanguage}</strong></span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExecuteCode(false)}
                      disabled={runningCode || submittingCode}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {runningCode ? 'Running...' : 'Run Code'}
                    </button>

                    <button
                      onClick={() => handleExecuteCode(true)}
                      disabled={runningCode || submittingCode}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingCode ? 'Submitting...' : 'Submit Solution'}
                    </button>
                  </div>
                </div>

                {/* Console Output */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 font-mono text-xs">
                  <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <button
                      onClick={() => setActiveConsoleTab('testcases')}
                      className={`font-semibold cursor-pointer ${activeConsoleTab === 'testcases' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}`}
                    >
                      Test Cases
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('output')}
                      className={`font-semibold cursor-pointer ${activeConsoleTab === 'output' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}`}
                    >
                      Output
                    </button>
                    <button
                      onClick={() => {
                        setActiveConsoleTab('hints');
                        setShowHint(true);
                      }}
                      className={`font-semibold cursor-pointer ${activeConsoleTab === 'hints' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}`}
                    >
                      Hints
                    </button>
                  </div>

                  {activeConsoleTab === 'testcases' && (
                    <div className="space-y-2">
                      {selectedProblem.examples.map((tc, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between">
                          <span>Case #{idx + 1}: <code>{tc.input}</code></span>
                          <span className="text-slate-400">Expected: <code>{tc.output}</code></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConsoleTab === 'output' && (
                    <div>
                      {!codeResult ? (
                        <p className="text-slate-400 text-center py-3">Run code or submit to view test execution results.</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className={`font-bold ${codeResult.status === 'Accepted' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {codeResult.status === 'Accepted' ? '✓ ' : '✗ '} {codeResult.verdict}
                            </span>
                            <span className="text-slate-400">Runtime: {codeResult.runtimeMs}ms</span>
                          </div>

                          {(codeResult.testResults || []).map((tr, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between">
                              <span>Test #{tr.testCaseIndex}: <code>{tr.input}</code></span>
                              <span className={tr.passed ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                {tr.passed ? 'Passed ✓' : 'Failed ✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === 'hints' && (
                    <p className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
                      Try using a two-pointer approach or hash map to avoid quadratic nested loops.
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}
        </section>
      )}

      {/* ── STEP 7: TIMED ASSESSMENT ── */}
      {currentFlowStep === 7 && selectedCompany && (
        <section className="space-y-6 text-left">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 uppercase">Assessment</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedCompany.companyName} Timed Assessment
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-lg text-purple-600">
                {formatTimer(mockTimeRemaining)}
              </div>

              {!mockCompleted && (
                <button
                  onClick={() => {
                    if (window.confirm('Finish and submit mock test?')) handleFinalMockSubmit();
                  }}
                  disabled={mockSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {mockSubmitting ? 'Evaluating...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>

          {mockCompleted && mockResult && (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 text-center">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Assessment Results
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Score</span>
                  <div className="text-3xl font-black text-purple-600 mt-1">{mockResult.score}/100</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Verdict</span>
                  <div className="text-base font-bold text-emerald-600 mt-2">{mockResult.verdict}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Passed</span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">{mockResult.correctAnswers}/{mockResult.totalQuestions}</div>
                </div>
              </div>

              {mockResult.weakTopics && mockResult.weakTopics.length > 0 && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-xs text-left max-w-xl mx-auto space-y-2">
                  <h4 className="font-bold text-purple-700 dark:text-purple-300">Weak Topics Identified:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockResult.weakTopics.map((wt, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-md font-semibold">
                        {wt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!mockCompleted && mockSession && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {mockSession.problems.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setMockQuestionIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                      mockQuestionIdx === idx ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>

              {mockSession.problems[mockQuestionIdx] && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Q{mockQuestionIdx + 1}. {mockSession.problems[mockQuestionIdx].title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {mockSession.problems[mockQuestionIdx].problemStatement}
                    </p>
                  </div>

                  <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#0b101b] p-4">
                    <textarea
                      value={mockAnswers[mockSession.problems[mockQuestionIdx].id] || ''}
                      onChange={(e) => setMockAnswers({
                        ...mockAnswers,
                        [mockSession.problems[mockQuestionIdx].id]: e.target.value
                      })}
                      rows={16}
                      className="w-full bg-transparent text-slate-100 font-mono text-xs outline-none"
                      placeholder="Write solution..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
