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

  // ── Step 6: LeetCode-Style Coding Arena ──
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
      roundBreakdown: 'Round 1: Screening (Arrays/Strings) → Rounds 2-4: Deep Problem Solving (Trees, Graphs, DP) → Round 5: System Architecture.',
      difficultyPattern: 'High algorithmic rigor. Heavy emphasis on optimal O(N) or O(log N) time with sub-quadratic space.',
      interviewQuestions: [
        'How do you validate a Binary Search Tree without modifying node values?',
        'Implement an optimal algorithm to find the Longest Path in a Directed Acyclic Graph.',
        'Given stream of numbers, how do you find the median dynamically in O(log N)?'
      ]
    },
    amazon: {
      focusTopics: ['Arrays', 'Hash Maps', 'Trees & BST', 'Heap & Priority Queue', 'Sliding Window'],
      roundBreakdown: 'Online Assessment: 2 Coding Problems → 3-4 Technical Rounds focusing on Trees, Heaps, and Leadership Principles.',
      difficultyPattern: 'Medium to Hard problems. Strong focus on clean modular code, fast lookups, and heap data structures.',
      interviewQuestions: [
        'Design an LRU Cache with O(1) get and put operations.',
        'Find the Top K Frequent items in a large transaction dataset.',
        'Implement Course Schedule prerequisite resolution using Topological Sort.'
      ]
    },
    microsoft: {
      focusTopics: ['Strings', 'Linked List', 'Trees & Graph Traversal', 'Two Pointers'],
      roundBreakdown: 'Round 1: Online Assessment → Rounds 2-4: In-depth Technical interviews with focus on memory pointers and recursion.',
      difficultyPattern: 'Medium difficulty with deep questions on recursion call stacks, string parsing, and pointer management.',
      interviewQuestions: [
        'Reverse a Linked List in groups of size K.',
        'Validate if two binary trees are identical or symmetric.',
        'Find the Lowest Common Ancestor (LCA) in a Binary Tree.'
      ]
    },
    meta: {
      focusTopics: ['Arrays', 'Binary Search', 'Trees & Graphs (BFS/DFS)', 'Two Pointers'],
      roundBreakdown: 'Screening (2 coding questions in 45 mins) → Onsite (4 rounds of algorithmic speed and optimization).',
      difficultyPattern: 'Speed and bug-free execution. Expecting optimal solution with dry run in 15-20 minutes per problem.',
      interviewQuestions: [
        'Subarray Sum Equals K using Prefix Sums and Hash Map.',
        'Binary Tree Vertical Order Traversal using BFS queue.',
        'Search in Rotated Sorted Array in O(log N) time.'
      ]
    },
    flipkart: {
      focusTopics: ['Dynamic Programming', 'Binary Search on Answer', 'Greedy Algorithms', 'Graphs'],
      roundBreakdown: 'Machine Coding Round → 2-3 Advanced DSA Rounds (DP & Graphs) → Hiring Manager Round.',
      difficultyPattern: 'Heavy focus on Binary Search variants (search on answer) and 2D dynamic programming.',
      interviewQuestions: [
        'Capacity to Ship Packages Within D Days (Binary Search on Answer).',
        '0/1 Knapsack optimization from O(N*W) space to 1D O(W).'
      ]
    },
    tcs: {
      focusTopics: ['Arrays', 'Strings', 'Sorting', 'Binary Search', 'Hashing Basics'],
      roundBreakdown: 'National Qualifier Test (NQT Coding) → Technical & Managerial Interview.',
      difficultyPattern: 'Easy to Medium difficulty. Tests foundational logic, string manipulation, and standard sorting.',
      interviewQuestions: [
        'Find non-repeating characters in a string in O(N).',
        'Sort an array containing only 0s, 1s, and 2s (Dutch National Flag).'
      ]
    },
    infosys: {
      focusTopics: ['Arrays', 'Strings', 'Recursion', 'Basic Dynamic Programming'],
      roundBreakdown: 'HackWithInfy / InfyTQ Online Rounds → Technical Coding Assessment.',
      difficultyPattern: 'Focus on recursion, greedy heuristics, and basic 1D DP.',
      interviewQuestions: [
        'Climbing Stairs and House Robber recurrence formulation.',
        'Find all permutations of a given string using backtracking.'
      ]
    },
    wipro: {
      focusTopics: ['Linear Structures', 'String Manipulation', 'Searching & Sorting'],
      roundBreakdown: 'Elite National Talent Hunt (NLTH) → Technical Interview round.',
      difficultyPattern: 'Easy to Medium foundational questions testing loop efficiency and basic structures.',
      interviewQuestions: [
        'Check if two strings are Anagrams using frequency counting.',
        'Find the second largest number in an unsorted array in O(N) single pass.'
      ]
    },
    accenture: {
      focusTopics: ['Array Manipulation', 'Bitwise & Basic Math', 'Strings', 'Hashing'],
      roundBreakdown: 'Cognitive & Technical Assessment → Coding Assessment (2 Problems) → Technical Interview.',
      difficultyPattern: 'Focused on efficient array filtering, prefix sums, and frequency tables.',
      interviewQuestions: [
        'Find maximum product subarray.',
        'Count total set bits in integer range.'
      ]
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

  // Core DSA Topics
  const dsaTopics = [
    {
      id: 'arrays',
      title: 'Arrays & Two Pointers',
      category: 'Linear Structures',
      tier: 'BEGINNER',
      description: 'Contiguous memory indexing, dynamic vectors, prefix sums, two pointers, and sliding window optimization.',
      explanation: 'An Array is a collection of items stored at contiguous memory locations. It is the most fundamental data structure, providing O(1) random access by index arithmetic.',
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
      patterns: ['Converging Two Pointers (Left & Right)', 'Fast & Slow Pointers', 'Prefix Sum Queries', 'Sliding Window Subarrays'],
      timeComplexity: 'Access: O(1) • Linear Search: O(N) • Append: O(1) amortized • Insert at Start: O(N)',
      spaceComplexity: 'O(N) for storing elements. In-place algorithms use O(1) extra space.',
      commonMistakes: [
        'Off-by-one errors (accessing arr[N] instead of arr[N-1]).',
        'Modifying an array while iterating without index adjustment.',
        'Assuming sorted order when input is unsorted.'
      ],
      realWorldUsage: 'GPU framebuffers, columnar database storage (Apache Arrow), OS process tables, and memory page tables.',
      interviewRelevance: 'Tested in 50%+ of initial technical screening rounds across all top tech companies.',
      aiVideoLessons: [
        {
          chapter: '1. What is an Array?',
          title: 'Definition & Memory Concept',
          duration: 25,
          concept: 'Contiguous memory blocks indexed by zero-based offset in constant O(1) time.',
          points: [
            'Address = Base_Address + index * size.',
            'Direct memory lookup without pointer traversal.',
            'L1/L2 CPU Cache locality optimization.'
          ],
          codeSnippet: `int arr[5] = {10, 20, 30, 40, 50};\nint val = arr[2]; // Jumps to memory offset in O(1)`
        },
        {
          chapter: '2. Memory Concept & Traversal',
          title: 'Single-Pass Iteration & Guards',
          duration: 25,
          concept: 'Visiting every element sequentially in linear O(N) time.',
          points: [
            'Loop from i = 0 to N-1.',
            'Maintain running aggregates (min, max, sum).',
            'Guard against index out of bounds.'
          ],
          codeSnippet: `int maxVal = arr[0];\nfor (int i = 1; i < n; i++) {\n    if (arr[i] > maxVal) maxVal = arr[i];\n}`
        },
        {
          chapter: '3. Searching & Sorting',
          title: 'Linear vs Binary Search',
          duration: 30,
          concept: 'O(N) linear search on unsorted arrays vs O(log N) binary search on sorted arrays.',
          points: [
            'Linear Search: Examine each element sequentially.',
            'Binary Search: Halve the search space every step on sorted data.'
          ],
          codeSnippet: `int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n}`
        },
        {
          chapter: '4. Two Pointer Technique',
          title: 'Eliminating Nested Loops',
          duration: 30,
          concept: 'Converging pointers reduce quadratic O(N²) pair search to linear O(N).',
          points: [
            'Start left = 0, right = N-1 on sorted array.',
            'Evaluate sum = arr[left] + arr[right].',
            'Increment left if sum < target; decrement right if sum > target.'
          ],
          codeSnippet: `int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = nums[left] + nums[right];\n    if (sum == target) return {left + 1, right + 1};\n    else if (sum < target) left++;\n    else right--;\n}`
        },
        {
          chapter: '5. Sliding Window Paradigm',
          title: 'Subarray Optimization',
          duration: 30,
          concept: 'Maintaining a window to compute running maximums or distinct substrings in O(N).',
          points: [
            'Fixed Window: Slide window of size K by adding right and subtracting left.',
            'Variable Window: Expand right, shrink left when condition is violated.'
          ],
          codeSnippet: `int left = 0, currSum = 0, maxSum = 0;\nfor (int right = 0; right < n; right++) {\n    currSum += arr[right];\n    while (currSum > k) { currSum -= arr[left++]; }\n    maxSum = max(maxSum, currSum);\n}`
        },
        {
          chapter: '6. Complexity & Interview Patterns',
          title: 'Summary & Corporate Questions',
          duration: 25,
          concept: 'Complexity breakdown and key questions asked by product companies.',
          points: [
            'Time: O(N) Two Pointer vs O(N log N) Sorting.',
            'Space: O(1) in-place vs O(N) Hash Table aux.',
            'Top Patterns: Two Sum II, 3Sum, Trapping Rain Water.'
          ],
          codeSnippet: `// Complexity Benchmark: O(N) Time, O(1) Space`
        }
      ]
    },
    {
      id: 'hashing',
      title: 'Hash Tables & Sets',
      category: 'Data Structures',
      tier: 'INTERMEDIATE',
      description: 'Hash functions, collision resolution, O(1) average lookups, frequency maps, and caching architectures.',
      explanation: 'A Hash Table is a data structure that implements an associative array abstract data type, mapping keys to values using a Hash Function.',
      beginnerConcepts: [
        'Hash Function: Converts arbitrary keys into integer bucket indices.',
        'Direct Addressing: Enables average constant-time O(1) lookups.',
        'Separate Chaining vs Open Addressing for collision handling.'
      ],
      stepByStepExamples: [
        'Example: Two Sum using Hash Map.',
        'Step 1: Initialize empty hash map.',
        'Step 2: For each number x, compute complement = target - x.',
        'Step 3: If complement exists in map, return indices. Otherwise store x in map.'
      ],
      patterns: ['Complement Lookup (Target - X)', 'Frequency Counting', 'Anagram Grouping', 'Prefix Sum Hash Map'],
      timeComplexity: 'Average: O(1) Insert/Search/Delete • Worst-Case: O(N) under heavy collisions',
      spaceComplexity: 'O(N) for storing hash buckets and entries.',
      commonMistakes: [
        'Using unhashable or mutable keys.',
        'Ignoring worst-case collision degradation.',
        'Modifying hash map during direct iteration.'
      ],
      realWorldUsage: 'Redis in-memory caching, database primary key indexes, and compiler symbol tables.',
      interviewRelevance: 'Primary optimization tool to transform quadratic O(N²) algorithms into linear O(N).',
      aiVideoLessons: [
        {
          chapter: '1. What is a Hash Table?',
          title: 'Buckets & Hash Functions',
          duration: 25,
          concept: 'Hash function maps keys to array index buckets for O(1) average retrieval.',
          points: [
            'h(key) = hash(key) % Bucket_Count.',
            'Uniform distribution avoids clustering.'
          ],
          codeSnippet: `unordered_map<string, int> freq;\nfreq["apple"] = 5; // O(1) hash bucket insertion`
        },
        {
          chapter: '2. Collisions & Load Factors',
          title: 'Chaining & Open Addressing',
          duration: 30,
          concept: 'Resolving index collisions using linked list chaining or linear probing.',
          points: [
            'Separate Chaining: Buckets store linked lists / red-black trees.',
            'Load Factor = N / Buckets. Re-hashing doubles bucket array when load > 0.75.'
          ],
          codeSnippet: `// Re-hashing occurs when elements exceed capacity threshold`
        },
        {
          chapter: '3. Frequency Maps & Lookups',
          title: 'One-Pass Algorithm Design',
          duration: 30,
          concept: 'Using hash tables to store past states for O(1) complement matching.',
          points: [
            'Check existence before insertion.',
            'Track frequencies for anagram and uniqueness problems.'
          ],
          codeSnippet: `unordered_map<int, int> mp;\nfor (int i = 0; i < n; i++) {\n    int comp = target - nums[i];\n    if (mp.count(comp)) return {mp[comp], i};\n    mp[nums[i]] = i;\n}`
        },
        {
          chapter: '4. Complexity & Interview Patterns',
          title: 'Subarray Sum & LRU Caches',
          duration: 25,
          concept: 'Advanced hashing patterns in enterprise interviews.',
          points: [
            'Subarray Sum Equals K: Prefix sum frequency map.',
            'LRU Cache: Hash Map + Doubly Linked List for O(1) get/put.'
          ],
          codeSnippet: `// Subarray Sum Equals K\nmp[0] = 1;\nfor (int x : nums) {\n    curr += x;\n    if (mp.count(curr - k)) total += mp[curr - k];\n    mp[curr]++;\n}`
        }
      ]
    },
    {
      id: 'trees',
      title: 'Trees & Binary Search Trees',
      category: 'Hierarchical Structures',
      tier: 'ADVANCED',
      description: 'Binary trees, BST invariants, DFS traversals (Inorder, Preorder, Postorder), BFS level order, and Lowest Common Ancestor.',
      explanation: 'A Tree is a hierarchical acyclic data structure composed of nodes. Binary Search Trees (BST) enforce that all nodes in the left subtree are smaller than the root, and right are larger.',
      beginnerConcepts: [
        'TreeNode: Pointer to left child, right child, and value.',
        'Height vs Depth: Max edges from node to leaf vs root to node.',
        'BST Invariant: Left < Root < Right.'
      ],
      stepByStepExamples: [
        'Example: Inorder traversal on BST yields sorted sequence.',
        'Step 1: Traverse left subtree recursively.',
        'Step 2: Visit current root node.',
        'Step 3: Traverse right subtree recursively.'
      ],
      patterns: ['Bottom-Up Subtree Return (Max Depth, Diameter)', 'Level Order Traversal (BFS with Queue)', 'BST Min/Max Bound Validation', 'Lowest Common Ancestor (LCA)'],
      timeComplexity: 'Balanced BST Search/Insert: O(log N) • Skewed Tree: O(N) • Traversals: O(N)',
      spaceComplexity: 'O(H) call stack auxiliary space, where H = height of tree.',
      commonMistakes: [
        'Forgetting null root base condition (`if (!root) return 0`).',
        'Validating BST by checking only immediate children instead of global min/max bounds.',
        'Confusing DFS recursion with BFS queue order.'
      ],
      realWorldUsage: 'Database B+ tree indexing (MySQL/Postgres), DOM tree rendering in browsers, and Abstract Syntax Trees in compilers.',
      interviewRelevance: 'Top 3 tested topic in Google, Amazon, and Microsoft hiring loops.',
      aiVideoLessons: [
        {
          chapter: '1. What is a Binary Tree?',
          title: 'Hierarchy & Node Pointers',
          duration: 25,
          concept: 'Acyclic connected graph with unique root and binary branch pointers.',
          points: [
            'TreeNode contains val, left, right.',
            'Leaf nodes have null children.'
          ],
          codeSnippet: `struct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};`
        },
        {
          chapter: '2. DFS Traversals (Pre, In, Post)',
          title: 'Recursive Call Stack Mechanics',
          duration: 30,
          concept: 'Order of visiting nodes: Preorder (V-L-R), Inorder (L-V-R), Postorder (L-R-V).',
          points: [
            'Inorder on BST produces sorted ascending order.',
            'Postorder computes bottom-up subtree values (height, diameter).'
          ],
          codeSnippet: `void inorder(TreeNode* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << " ";\n    inorder(root->right);\n}`
        },
        {
          chapter: '3. BFS Level Order Traversal',
          title: 'Queue-Based Layer Processing',
          duration: 30,
          concept: 'Visiting nodes level by level using a FIFO queue.',
          points: [
            'Push root to queue.',
            'While queue not empty: pop level size nodes and push children.'
          ],
          codeSnippet: `queue<TreeNode*> q;\nq.push(root);\nwhile (!q.empty()) {\n    int sz = q.size();\n    for (int i = 0; i < sz; i++) {\n        TreeNode* node = q.front(); q.pop();\n        if (node->left) q.push(node->left);\n        if (node->right) q.push(node->right);\n    }\n}`
        },
        {
          chapter: '4. Complexity & Interview Patterns',
          title: 'LCA & Path Sum Optimization',
          duration: 25,
          concept: 'Core interview patterns for Google and Microsoft.',
          points: [
            'Lowest Common Ancestor (LCA) in O(N).',
            'Binary Tree Maximum Path Sum using global update.'
          ],
          codeSnippet: `// LCA: if both subtrees return non-null, current node is the LCA`
        }
      ]
    },
    {
      id: 'dp',
      title: 'Dynamic Programming (DP)',
      category: 'Advanced Algorithms',
      tier: 'INTERVIEW LEVEL',
      description: 'Optimal substructure, overlapping subproblems, top-down memoization, and bottom-up tabulation.',
      explanation: 'Dynamic Programming solves complex optimization problems by breaking them down into overlapping subproblems, solving each once, and caching results.',
      beginnerConcepts: [
        'Overlapping Subproblems: The same subproblems evaluated repeatedly in recursion tree.',
        'Optimal Substructure: Optimal global solution built from optimal subproblem solutions.',
        'State Definition: Minimal parameters identifying a unique subproblem.'
      ],
      stepByStepExamples: [
        'Example: Climbing Stairs with DP.',
        'Step 1: dp[1] = 1, dp[2] = 2.',
        'Step 2: For i = 3 to N: dp[i] = dp[i-1] + dp[i-2].',
        'Step 3: Return dp[N]. Space can be optimized to O(1) using two variables.'
      ],
      patterns: ['1D Linear DP', '0/1 Knapsack & Unbounded Knapsack', '2D Matrix DP (LCS & Edit Distance)', 'State Machine DP'],
      timeComplexity: 'Time = Number of Subproblem States * Transitions per State.',
      spaceComplexity: 'Space = Table size + Recursion Call Stack.',
      commonMistakes: [
        'Incorrect base cases leading to index out of bounds.',
        'Overlapping state confusion.',
        'Forgetting memoization return values.'
      ],
      realWorldUsage: 'DNA sequence alignment in bioinformatics, Git diff algorithms (Myers LCS), and packet routing protocols.',
      interviewRelevance: 'The ultimate differentiator in product company bar raiser rounds.',
      aiVideoLessons: [
        {
          chapter: '1. What is Dynamic Programming?',
          title: 'Subproblems & Optimal Substructure',
          duration: 25,
          concept: 'Transforming exponential O(2^N) brute force into polynomial O(N) time.',
          points: [
            'Identify overlapping subproblems in recursion tree.',
            'Define DP state clearly.'
          ],
          codeSnippet: `// Fibonacci brute force O(2^N) -> Memoized DP O(N)`
        },
        {
          chapter: '2. Memoization vs Tabulation',
          title: 'Top-Down vs Bottom-Up',
          duration: 30,
          concept: 'Top-Down recursive caching vs Bottom-Up iterative table filling.',
          points: [
            'Top-Down: Recursion + Cache array.',
            'Bottom-Up: Iterative loop starting from base cases.'
          ],
          codeSnippet: `// Bottom-Up DP for Climbing Stairs\nint dp[n+1];\ndp[1] = 1; dp[2] = 2;\nfor (int i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];`
        },
        {
          chapter: '3. Coin Change & Knapsack',
          title: 'State Transition Equations',
          duration: 30,
          concept: 'Decision states: include vs exclude items.',
          points: [
            'dp[i] = min(dp[i], dp[i - coin] + 1).',
            'Initialize with infinity, base case dp[0] = 0.'
          ],
          codeSnippet: `vector<int> dp(amount + 1, amount + 1);\ndp[0] = 0;\nfor (int i = 1; i <= amount; i++) {\n    for (int c : coins) {\n        if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n    }\n}\nreturn dp[amount] > amount ? -1 : dp[amount];`
        },
        {
          chapter: '4. Complexity & Interview Patterns',
          title: '2D Matrix DP & LIS',
          duration: 25,
          concept: 'Longest Common Subsequence and Longest Increasing Subsequence.',
          points: [
            '2D Matrix DP: dp[i][j] = dp[i-1][j-1] + 1 if match.',
            'State compression from O(M*N) to O(N).'
          ],
          codeSnippet: `// Complexity: O(M * N) Time, O(N) Space optimized`
        }
      ]
    }
  ];

  const currentTopic = dsaTopics.find(t => t.id === selectedTopicId) || dsaTopics[0];
  const activeLessons = currentTopic.aiVideoLessons || [];
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 text-left px-2 sm:px-4">
      
      {/* ── TOP HEADER & CLEAN TAB NAVIGATION ── */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Company Interview Preparation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {currentFlowStep === 1 && 'Select Target Company'}
              {currentFlowStep === 2 && `Choose DSA Language`}
              {currentFlowStep === 3 && `${selectedCompany?.companyName || 'Target'} Interview Roadmap`}
              {currentFlowStep === 4 && `${currentTopic.title}`}
              {currentFlowStep === 5 && `${currentTopic.title} • Video Lesson`}
              {currentFlowStep === 6 && `Problem Practice Arena`}
              {currentFlowStep === 7 && `${selectedCompany?.companyName || 'Target'} Technical Assessment`}
            </h1>
            {selectedCompany && currentFlowStep > 1 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Company: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.companyName}</span> ({selectedCompany.industry}) • Language: <span className="font-mono font-semibold uppercase text-purple-600 dark:text-purple-400">{selectedLanguage}</span>
              </p>
            )}
          </div>

          {/* Clean Stepper Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { num: 1, label: '1. Company' },
              { num: 2, label: '2. Language' },
              { num: 3, label: '3. Roadmap' },
              { num: 4, label: '4. Topic' },
              { num: 5, label: '5. Video' },
              { num: 6, label: '6. Coding' },
              { num: 7, label: '7. Mock Test' }
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
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── STEP 1: CHOOSE TARGET COMPANY ── */}
      {currentFlowStep === 1 && (
        <section className="space-y-8 w-full">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-1 text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose Your Target Company
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Prepare specifically for your target company's interview pattern.
            </p>
          </div>

          {/* Search Company Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-purple-600 dark:focus:border-purple-500 shadow-xs"
              />
            </div>

            <div className="sm:w-72">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-purple-600 dark:focus:border-purple-500 cursor-pointer shadow-xs"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>
                    {ind === 'all' ? 'All Industries' : ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Grid / Loading / Empty State */}
          {loadingCompanies ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="h-7 w-7 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm font-medium text-slate-500">Loading companies from database...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-2">
              <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No companies available yet.</h3>
              <p className="text-sm text-slate-500">No matching company records found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map(comp => {
                const isSelected = selectedCompany?._id === comp._id;
                return (
                  <div
                    key={comp._id}
                    className={`p-7 rounded-2xl border text-left transition flex flex-col justify-between space-y-6 bg-white dark:bg-slate-900 ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-600/30 dark:ring-purple-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Logo Area & Header */}
                      <div className="flex items-start space-x-4">
                        {comp.logoUrl ? (
                          <img
                            src={comp.logoUrl}
                            alt={comp.companyName}
                            className="w-14 h-14 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        <div
                          style={{ display: comp.logoUrl ? 'none' : 'flex' }}
                          className="w-14 h-14 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 items-center justify-center font-bold text-xl border border-purple-100 dark:border-purple-900 shrink-0 uppercase font-mono"
                        >
                          {comp.companyName.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {comp.companyName}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {comp.industry || 'Technology & Software'}
                          </p>
                        </div>
                      </div>

                      {/* Website link if available */}
                      {comp.website && (
                        <p className="text-xs text-slate-400 flex items-center space-x-1.5 truncate pt-1">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{comp.website}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {comp.opportunityCount > 0 ? `${comp.opportunityCount} Active Roles` : 'Direct Prep'}
                      </span>

                      <button
                        onClick={() => handleSelectCompany(comp)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        <span>Prepare for {comp.companyName}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>
      )}

      {/* ── STEP 2: CHOOSE DSA LANGUAGE ── */}
      {currentFlowStep === 2 && selectedCompany && (
        <section className="max-w-2xl mx-auto space-y-6 py-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Select Coding Language
            </h2>
            <p className="text-sm text-slate-500">
              Pick your preferred language for {selectedCompany.companyName} technical rounds.
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
                    ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/20 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-bold text-lg mb-1">
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
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Change Company</span>
            </button>
            <span className="text-xs text-slate-400">
              Clicking a language continues directly to Roadmap
            </span>
          </div>
        </section>
      )}

      {/* ── STEP 3: COMPANY-SPECIFIC ROADMAP ── */}
      {currentFlowStep === 3 && selectedCompany && (
        <section className="space-y-8">
          
          {/* Company Hiring Overview */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCompany.companyName} Hiring Analysis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified publicly available interview structure & focus topics.
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">Solved: {solvedCount}</span>
                <span className="text-purple-600 dark:text-purple-400">Completed: {completedTopicsCount}/{dsaTopics.length} Topics</span>
              </div>
            </div>

            {currentCompanyProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Focus Topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCompanyProfile.focusTopics.map((ft, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium">
                        {ft}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Round Breakdown
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentCompanyProfile.roundBreakdown}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Strategy & Patterns
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentCompanyProfile.difficultyPattern}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Company-specific interview data is not available yet. Showing standardized technical curriculum.
              </p>
            )}
          </div>

          {/* Unsolved Practice Queue */}
          {unsolvedList.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Unsolved Practice Queue ({unsolvedList.length} problems)</span>
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
                    {u.problemTitle} ↳ Retry
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Progressive DSA Roadmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Curriculum Roadmap
              </h3>
              <button
                onClick={handleStartMockTest}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Launch Mock Test</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dsaTopics.map(topic => {
                const isDone = Boolean(completedTopics[`${selectedCompany._id}_${topic.id}`]);
                return (
                  <div
                    key={topic.id}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          {topic.tier} • {topic.category}
                        </span>

                        <button
                          onClick={() => toggleTopicDone(topic.id)}
                          className="text-xs font-medium flex items-center space-x-1 text-slate-500 hover:text-purple-600 cursor-pointer"
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
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
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Topic Breakdown
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
                        Coding Arena
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 4: TOPIC LEARNING ── */}
      {currentFlowStep === 4 && selectedCompany && (
        <section className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Topic Learning Module
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Watch Video Lesson
              </button>
              <button
                onClick={() => setCurrentFlowStep(6)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Solve Problems
              </button>
            </div>
          </div>

          <div className="space-y-6 leading-relaxed">
            
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Overview & Explanation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {currentTopic.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-purple-600">
                  Core Concepts
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  {currentTopic.beginnerConcepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-emerald-600">
                  Step-by-Step Example
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  {currentTopic.stepByStepExamples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">Time & Space Complexity</h4>
                <p className="text-xs text-slate-500 font-mono"><strong>Time:</strong> {currentTopic.timeComplexity}</p>
                <p className="text-xs text-slate-500 font-mono"><strong>Space:</strong> {currentTopic.spaceComplexity}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">Common Traps & Mistakes</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  {currentTopic.commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">{selectedCompany.companyName} Focus</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentTopic.interviewRelevance}
                </p>
              </div>

            </div>

          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentFlowStep(3)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              ← Back to Roadmap
            </button>
            <button
              onClick={() => setCurrentFlowStep(6)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Practice in Coding Arena →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 5: VIDEO LESSON PLAYER ── */}
      {currentFlowStep === 5 && selectedCompany && (
        <section className="space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Video Lesson
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {currentTopic.title} Masterclass
              </h2>
            </div>

            <button
              onClick={() => setCurrentFlowStep(6)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Proceed to Coding Arena →
            </button>
          </div>

          {/* Clean Player Window */}
          <div
            ref={playerContainerRef}
            className={`rounded-2xl bg-slate-950 text-white border border-slate-800 overflow-hidden flex flex-col justify-between ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[480px]'
            }`}
          >
            {/* Top Bar */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-semibold text-slate-200">{currentLessonChapter.chapter}: {currentLessonChapter.title}</span>
              <span>{formatTimer(currentTime)} / {formatTimer(totalVideoDuration)}</span>
            </div>

            {/* Stage Body */}
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

            {/* Controls Bar */}
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

          {/* Chapters List */}
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

      {/* ── STEP 6: PROFESSIONAL CODING ARENA (LEETCODE STYLE) ── */}
      {currentFlowStep === 6 && selectedCompany && (
        <section className="space-y-4">
          
          {/* Top Control Bar: Problem selector & Typography */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
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

            {/* Font & Layout Controls */}
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
              
              {/* ── QUESTION PANEL (LARGE READABLE TEXT) ── */}
              <div className={`${editorLayout === 'split' ? 'lg:col-span-5' : 'w-full'} p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 max-h-[820px] overflow-y-auto`}>
                
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold uppercase">
                        {selectedCompany.companyName}
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

                {/* Examples */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Examples</h4>
                  {selectedProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                      <div><strong className="text-purple-600 dark:text-purple-400">Input:</strong> <code>{ex.input}</code></div>
                      <div><strong className="text-emerald-600 dark:text-emerald-400">Output:</strong> <code>{ex.output}</code></div>
                      {ex.explanation && (
                        <p className="text-slate-500 font-sans pt-1 text-[11px]">{ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400">Constraints</h4>
                  <ul className="text-xs font-mono text-slate-500 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* ── CODE EDITOR & CONSOLE ── */}
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
                        <p className="text-slate-400 text-center py-3">Run code or submit to view test case execution.</p>
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

      {/* ── STEP 7: TIMED MOCK ASSESSMENT ── */}
      {currentFlowStep === 7 && selectedCompany && (
        <section className="space-y-6">
          
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

          {/* Result Card */}
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

          {/* Active Question in Test */}
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
