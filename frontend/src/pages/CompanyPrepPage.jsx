import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Code2, BookOpen, Layers, Target, Terminal, Play, Pause,
  Send, Clock, CheckCircle2, Circle, AlertCircle, RefreshCw,
  ArrowLeft, ArrowRight, ShieldCheck, Award, Sparkles, CheckSquare,
  Square, ChevronRight, HelpCircle, Lightbulb, Search, Filter,
  Globe, Briefcase, Type, ZoomIn, ZoomOut, Layout, LayoutGrid,
  Columns, Rows, RotateCcw, Check, XCircle, FastForward, Rewind,
  Maximize, Minimize, Volume2, VolumeX, Sparkle, Compass, Cpu,
  Database, Activity, CheckCheck
} from 'lucide-react';

export default function CompanyPrepPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Preparation Flow: 1: Company | 2: Language | 3: Roadmap & Topics | 4: Topic Studio (AI Video) | 5: Problem Arena | 6: Mock Assessment ──
  const [currentFlowStep, setCurrentFlowStep] = useState(1);

  // ── Step 1: Real Database Companies ──
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ── Step 2: DSA Language Selection (C++, Java, Python) ──
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  // ── Step 3 & 4: Topics & AI Video Player State ──
  const [selectedTopicId, setSelectedTopicId] = useState('arrays');
  
  // AI Topic Video Player Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const playerContainerRef = useRef(null);

  // ── Step 5: LeetCode-Style Coding Area Controls ──
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'output'

  // Accessibility and layout settings
  const [problemFontSize, setProblemFontSize] = useState(16); // 14, 16, 18, 20
  const [editorFontSize, setEditorFontSize] = useState(14); // 12, 14, 16, 18
  const [editorLayout, setEditorLayout] = useState('split'); // 'split' | 'stacked'

  // ── Real Progress & Unsolved Tracking ──
  const [completedTopics, setCompletedTopics] = useState({});
  const [problemSubmissions, setProblemSubmissions] = useState({});

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

  // ── Verified Public Interview Patterns for Target Companies ──
  const companyInterviewProfiles = {
    google: {
      focusTopics: ['Trees & BST', 'Graphs', 'Dynamic Programming', 'Recursion & Backtracking'],
      roundBreakdown: 'Round 1: Screening (Arrays/Strings) → Rounds 2-4: Deep Problem Solving (Trees, Graphs, DP) → Round 5: Googleyness & Architecture.',
      difficultyPattern: 'High algorithmic rigor. Heavy emphasis on optimal O(N) or O(log N) time with sub-quadratic space and complete handling of extreme constraints.',
      tips: 'State time & space complexity upfront. Test edge cases (null, negative indices, overflow).'
    },
    amazon: {
      focusTopics: ['Arrays', 'Hash Maps', 'Trees & BST', 'Heap & Priority Queue', 'Sliding Window'],
      roundBreakdown: 'Online Assessment: 2 Coding Problems → 3-4 Technical Rounds focusing on Trees, Heaps, and Leadership Principles.',
      difficultyPattern: 'Medium to Hard problems. Strong focus on clean modular code, fast lookups, and heap data structures.',
      tips: 'Explain data structure choice clearly and relate problem solving to scalability.'
    },
    microsoft: {
      focusTopics: ['Strings', 'Linked List', 'Trees & Graph Traversal', 'Two Pointers'],
      roundBreakdown: 'Round 1: Online Assessment → Rounds 2-4: In-depth Technical interviews with focus on memory pointers, recursion, and data structures.',
      difficultyPattern: 'Medium difficulty with deep questions on recursion call stacks, string parsing, and pointer management.',
      tips: 'Write bug-free code on the first attempt and dry-run with custom test cases.'
    },
    flipkart: {
      focusTopics: ['Dynamic Programming', 'Binary Search on Answer', 'Greedy Algorithms', 'Graphs'],
      roundBreakdown: 'Machine Coding Round → 2-3 Advanced DSA Rounds (DP & Graphs) → Hiring Manager Round.',
      difficultyPattern: 'Heavy focus on Binary Search variants (search on answer) and 2D dynamic programming.',
      tips: 'Clearly formulate DP recurrence relations and state transitions.'
    },
    tcs: {
      focusTopics: ['Arrays', 'Strings', 'Sorting', 'Binary Search', 'Hashing Basics'],
      roundBreakdown: 'National Qualifier Test (NQT Coding) → Technical & Managerial Interview.',
      difficultyPattern: 'Easy to Medium difficulty. Tests foundational logic, string manipulation, and standard sorting.',
      tips: 'Ensure correct output formatting and pass all sample input/output constraints.'
    },
    infosys: {
      focusTopics: ['Arrays', 'Strings', 'Recursion', 'Basic Dynamic Programming'],
      roundBreakdown: 'HackWithInfy / InfyTQ Online Rounds → Technical Coding Assessment.',
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

  // ── Structured 16 Core DSA Topics with Full AI Video Lecture Curriculum ──
  const dsaTopics = [
    {
      id: 'arrays',
      title: 'Arrays & Two Pointers',
      category: 'Linear Structures',
      description: 'Contiguous memory indexing, dynamic vectors, prefix sums, two pointers, and sliding window optimization.',
      aiVideoLessons: [
        {
          chapter: '1. What It Is',
          title: 'Definition & Memory Layout',
          duration: 20,
          concept: 'An Array is a contiguous block of memory where each element is stored sequentially and accessed via zero-based index in O(1) time.',
          points: [
            'Contiguous Memory: Address of element at index i is Base_Address + i * sizeof(Type).',
            'Index Lookup: Direct arithmetic jump with O(1) time.',
            'Static vs Dynamic: Fixed capacity in C/C++ arrays vs 2x amortized geometric doubling in std::vector / ArrayList.'
          ],
          codeSnippet: `// Memory layout formula: addr(i) = base + i * size\nint arr[5] = {10, 20, 30, 40, 50};\nint val = arr[2]; // O(1) memory offset jump to 30`
        },
        {
          chapter: '2. Why It Is Used',
          title: 'When to Choose Arrays',
          duration: 20,
          concept: 'Arrays provide maximum cache locality and predictable constant-time element retrieval.',
          points: [
            'CPU Cache Friendly: Adjacent elements are fetched into CPU L1/L2 cache lines simultaneously.',
            'Constant-Time Access: Ideal when frequent random reads by index are required.',
            'Trade-off: Insertion/deletion at beginning or middle requires shifting elements in O(N).'
          ],
          codeSnippet: `// Fast random reads vs Shifting on insert\nvector<int> v = {1, 2, 4, 5};\nv.insert(v.begin() + 2, 3); // O(N) because elements 4,5 must shift right`
        },
        {
          chapter: '3. Core Concepts',
          title: 'Traversal, Mutation & Boundaries',
          duration: 25,
          concept: 'Basic operations include single-pass traversal, in-place swapping, and index boundary checks.',
          points: [
            'Traversal: Linear scan in O(N) time and O(1) auxiliary space.',
            'In-Place Swap: Swapping elements without auxiliary arrays using temporary variables.',
            'Boundary Guards: Always check 0 <= index < size to prevent buffer overflow vulnerabilities.'
          ],
          codeSnippet: `for (int i = 0; i < n; i++) {\n    if (arr[i] < 0) arr[i] = 0; // In-place mutation guard\n}`
        },
        {
          chapter: '4. Visual Examples',
          title: 'Two-Pointer Search Walkthrough',
          duration: 30,
          concept: 'Two Pointer Technique eliminates nested quadratic loops by moving left and right pointers toward each other on sorted collections.',
          points: [
            'Left pointer starts at 0, Right pointer starts at N-1.',
            'If sum == target: return indices.',
            'If sum < target: increment left to increase total.',
            'If sum > target: decrement right to decrease total.'
          ],
          codeSnippet: `int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = nums[left] + nums[right];\n    if (sum == target) return {left + 1, right + 1};\n    else if (sum < target) left++;\n    else right--;\n}`
        },
        {
          chapter: '5. Time & Space Complexity',
          title: 'Complexity Benchmark Matrix',
          duration: 20,
          concept: 'Time & Space complexity summary for core array operations.',
          points: [
            'Access / Read: O(1) Time, O(1) Space.',
            'Linear Search: O(N) Time, O(1) Space.',
            'Binary Search (Sorted): O(log N) Time, O(1) Space.',
            'Insertion / Deletion: O(1) at end amortized, O(N) at start/middle.'
          ],
          codeSnippet: `// Amortized doubling formula for dynamic vectors\n// Resizing occurs at 1, 2, 4, 8, 16... Total copies = 2N - 1 => O(1) amortized`
        },
        {
          chapter: '6. Common Patterns',
          title: 'High-Frequency Algorithmic Patterns',
          duration: 25,
          concept: 'Master these 4 canonical patterns to solve 80%+ of array interview questions.',
          points: [
            '1. Two Pointers (Converging & Fast/Slow)',
            '2. Sliding Window (Fixed & Variable Length)',
            '3. Prefix Sums (O(1) Range Queries)',
            '4. Dutch National Flag (3-Way Partitioning)'
          ],
          codeSnippet: `// Prefix sum array: prefix[i] = prefix[i-1] + arr[i]\n// Range sum (L, R) = prefix[R] - prefix[L-1] in O(1) time`
        },
        {
          chapter: '7. Beginner → Advanced',
          title: 'Skill Progression Roadmap',
          duration: 20,
          concept: 'Progress systematically from basic element access to optimal boundary elevation trapping.',
          points: [
            'Beginner: Two Sum, Find Maximum, Reverse Array.',
            'Intermediate: 3Sum, Container With Most Water, Subarray Sum Equals K.',
            'Advanced: Trapping Rain Water, Sliding Window Maximum with Deque.'
          ],
          codeSnippet: `// Advanced: Trapping Rain Water LeftMax/RightMax\nwater += max(0, min(leftMax, rightMax) - height[i]);`
        },
        {
          chapter: '8. Real-World Use Cases',
          title: 'Where Arrays Power Modern Systems',
          duration: 20,
          concept: 'Arrays are the foundation of low-level high-performance engineering.',
          points: [
            'GPU Video Buffers: Framebuffers and texture pixels stored contiguously.',
            'Database Tables: Columnar databases (Apache Arrow) store columnar arrays for vectorized SIMD operations.',
            'Operating System Kernels: Process tables, file descriptors, and interrupt vectors.'
          ],
          codeSnippet: `// GPU SIMD: 8 floats processed in a single CPU clock cycle\n__m256 a = _mm256_load_ps(&arr[0]);\n__m256 b = _mm256_load_ps(&arr[8]);`
        },
        {
          chapter: '9. Interview & Company Relevance',
          title: 'Corporate Hiring Alignment',
          duration: 20,
          concept: 'Why companies test Arrays extensively during technical screening.',
          points: [
            'Tests basic algorithmic hygiene: Off-by-one errors and pointer bounds.',
            'Evaluates capacity to optimize brute force O(N²) into linear O(N).',
            'Core requirement for Google, Amazon, Microsoft, and service-based screening.'
          ],
          codeSnippet: `// Interview checklist: Check empty array, size == 1, duplicate values, negative numbers`
        }
      ]
    },
    {
      id: 'hashing',
      title: 'Hash Tables & Sets',
      category: 'Data Structures',
      description: 'Hash functions, collision resolution, O(1) average lookups, frequency maps, and caching architectures.',
      aiVideoLessons: [
        {
          chapter: '1. What It Is',
          title: 'Hash Tables & Buckets',
          duration: 20,
          concept: 'A Hash Table maps keys to values by computing an integer bucket index using a Hash Function.',
          points: [
            'Hash Function: h(key) = hash(key) % Bucket_Count.',
            'Direct Indexing: Computes array index directly from key contents.',
            'Collision Resolution: Separate Chaining (Linked Lists/Red-Black Trees) vs Open Addressing (Linear Probing).'
          ],
          codeSnippet: `unordered_map<string, int> freq;\nfreq["apple"] = 5; // hash("apple") % buckets => stored in bucket in O(1)`
        },
        {
          chapter: '2. Why It Is Used',
          title: 'Instant O(1) Lookups',
          duration: 20,
          concept: 'Hash tables turn expensive O(N) linear search checks into average O(1) time.',
          points: [
            'Complement Lookups: Check if (target - x) exists instantly.',
            'Frequency Counting: Count character/word occurrences in a single pass.',
            'Deduplication: Fast O(1) uniqueness check using Hash Sets.'
          ],
          codeSnippet: `unordered_set<int> seen;\nfor (int num : nums) {\n    if (seen.count(num)) return true; // Found duplicate in O(1)\n    seen.insert(num);\n}`
        },
        {
          chapter: '3. Core Concepts',
          title: 'Load Factor & Re-hashing',
          duration: 25,
          concept: 'Managing hash collisions and maintaining constant time efficiency.',
          points: [
            'Load Factor = Elements / Buckets. Default threshold is typically 0.75.',
            'Re-hashing: When load factor exceeds threshold, bucket array doubles in size and keys are re-distributed.',
            'Worst-Case O(N): Occurs when all keys collide into the exact same bucket.'
          ],
          codeSnippet: `// Java 8+ converts bucket linked lists to balanced Red-Black Trees when chain length > 8 (O(log N) worst case)`
        },
        {
          chapter: '4. Visual Examples',
          title: 'One-Pass Two Sum Walkthrough',
          duration: 30,
          concept: 'Using a hash map to solve Two Sum in a single pass in O(N) time and O(N) space.',
          points: [
            'Iterate through array with current value x.',
            'Compute complement = target - x.',
            'If complement exists in map: return {map[complement], current_index}.',
            'Otherwise: insert map[x] = current_index.'
          ],
          codeSnippet: `unordered_map<int, int> mp;\nfor (int i = 0; i < nums.size(); i++) {\n    int comp = target - nums[i];\n    if (mp.count(comp)) return {mp[comp], i};\n    mp[nums[i]] = i;\n}`
        },
        {
          chapter: '5. Time & Space Complexity',
          title: 'Hashing Complexity Matrix',
          duration: 20,
          concept: 'Average vs Worst case complexity comparison.',
          points: [
            'Insert: O(1) Average, O(N) Worst Case.',
            'Lookup / Search: O(1) Average, O(N) Worst Case.',
            'Delete: O(1) Average, O(N) Worst Case.',
            'Space: O(N) for storing hash buckets and entries.'
          ],
          codeSnippet: `// Space-Time Tradeoff: Uses O(N) auxiliary space to achieve O(1) time operations`
        },
        {
          chapter: '6. Common Patterns',
          title: 'Key Hashing Patterns',
          duration: 25,
          concept: 'Primary techniques tested in technical rounds.',
          points: [
            '1. Frequency Mapping & Anagram Grouping',
            '2. Prefix Sum Hash Map (Subarray Sum Equals K)',
            '3. Sliding Window + Hash Map (Longest Substring Without Repeating Characters)',
            '4. LRU Cache (Hash Map + Doubly Linked List)'
          ],
          codeSnippet: `// Subarray Sum Equals K: count subarrays with sum K\nmp[0] = 1;\nfor (int x : nums) {\n    curr += x;\n    if (mp.count(curr - k)) total += mp[curr - k];\n    mp[curr]++;\n}`
        },
        {
          chapter: '7. Beginner → Advanced',
          title: 'Progression Path',
          duration: 20,
          concept: 'From single-key lookups to full caching systems.',
          points: [
            'Beginner: Two Sum, Contains Duplicate, Valid Anagram.',
            'Intermediate: Group Anagrams, Subarray Sum Equals K, Top K Frequent.',
            'Advanced: LRU Cache Implementation, LFU Cache.'
          ],
          codeSnippet: `// Advanced: LRU Cache combines O(1) map key lookup with O(1) linked list node splicing`
        },
        {
          chapter: '8. Real-World Use Cases',
          title: 'Production Applications',
          duration: 20,
          concept: 'Where hashing is used in enterprise software.',
          points: [
            'Redis In-Memory Key-Value Stores: O(1) caching layer for web applications.',
            'Database Primary Key Indexing: Hash indexes for exact key matching.',
            'Compiler Symbol Tables: Storing variable names and scopes during compilation.'
          ],
          codeSnippet: `// Redis SET user:1001 '{"name":"Alice"}' EX 3600`
        },
        {
          chapter: '9. Interview & Company Relevance',
          title: 'Interview Strategy',
          duration: 20,
          concept: 'High-frequency topic in Amazon, Google, Microsoft, and TCS/Infosys assessments.',
          points: [
            'First optimization strategy whenever nested loops appear.',
            'Demonstrates ability to make space vs time engineering tradeoffs.'
          ],
          codeSnippet: `// Question prompt: Can we solve this in O(N) time? Answer: Yes, by utilizing a Hash Map.`
        }
      ]
    },
    {
      id: 'trees',
      title: 'Trees & Binary Search Trees',
      category: 'Hierarchical Structures',
      description: 'Binary trees, BST invariants, DFS traversals (Inorder, Preorder, Postorder), BFS level order, and Lowest Common Ancestor.',
      aiVideoLessons: [
        {
          chapter: '1. What It Is',
          title: 'Hierarchical Node Structures',
          duration: 20,
          concept: 'A Tree is a connected, acyclic hierarchical data structure consisting of a root node and subtrees of children.',
          points: [
            'Binary Tree: Each node contains at most two children (left and right).',
            'Binary Search Tree (BST): Left subtree keys < Root key < Right subtree keys.',
            'Depth & Height: Max edges from node to leaf / root to node.'
          ],
          codeSnippet: `struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};`
        },
        {
          chapter: '2. Why It Is Used',
          title: 'Ordered Hierarchies & Fast Search',
          duration: 20,
          concept: 'Trees model natural hierarchies and enable O(log N) search, insertion, and deletion on balanced structures.',
          points: [
            'Logarithmic Time: Balanced BSTs guarantee O(log N) search operations.',
            'Hierarchical Modeling: File systems, DOM trees, and JSON structures.',
            'Sorted Traversal: Inorder traversal on a BST yields sorted elements in O(N).'
          ],
          codeSnippet: `// Inorder on BST: Left -> Root -> Right yields [1, 2, 3, 4, 5]`
        },
        {
          chapter: '3. Core Concepts',
          title: 'DFS vs BFS Traversals',
          duration: 25,
          concept: 'The two foundational ways to traverse trees.',
          points: [
            'DFS (Depth-First Search): Preorder (Root, L, R), Inorder (L, Root, R), Postorder (L, R, Root) using recursion call stack.',
            'BFS (Breadth-First Search): Level by level traversal using a FIFO queue.',
            'Base Condition: Always check if (root == nullptr) return 0;'
          ],
          codeSnippet: `void inorder(TreeNode* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << " ";\n    inorder(root->right);\n}`
        },
        {
          chapter: '4. Visual Examples',
          title: 'Maximum Depth Walkthrough',
          duration: 30,
          concept: 'Computing tree height with bottom-up postorder DFS in O(N) time and O(H) call stack space.',
          points: [
            'If root is null: height is 0.',
            'Recursively compute left_height = maxDepth(root->left).',
            'Recursively compute right_height = maxDepth(root->right).',
            'Return 1 + max(left_height, right_height).'
          ],
          codeSnippet: `int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}`
        },
        {
          chapter: '5. Time & Space Complexity',
          title: 'Tree Complexity Matrix',
          duration: 20,
          concept: 'Complexity breakdown for balanced vs skewed trees.',
          points: [
            'Balanced Tree Search: O(log N) Time, O(log N) Stack Space.',
            'Skewed Worst-Case: O(N) Time, O(N) Stack Space.',
            'Tree Traversals: O(N) Time visiting all nodes, O(H) auxiliary space for recursion height.'
          ],
          codeSnippet: `// Balanced: H = log2(N) | Skewed (Linked list): H = N`
        },
        {
          chapter: '6. Common Patterns',
          title: 'High-Yield Tree Patterns',
          duration: 25,
          concept: 'Core tree interview problem patterns.',
          points: [
            '1. Bottom-Up Subtree Return (Max Depth, Diameter, Max Path Sum)',
            '2. Level Order Traversal (BFS with Queue)',
            '3. BST Validation (Min/Max bound propagation)',
            '4. Lowest Common Ancestor (LCA)'
          ],
          codeSnippet: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n    if (!root || root == p || root == q) return root;\n    TreeNode* left = lowestCommonAncestor(root->left, p, q);\n    TreeNode* right = lowestCommonAncestor(root->right, p, q);\n    return (left && right) ? root : (left ? left : right);\n}`
        },
        {
          chapter: '7. Beginner → Advanced',
          title: 'Progression Roadmap',
          duration: 20,
          concept: 'Step-by-step tree mastery.',
          points: [
            'Beginner: Invert Binary Tree, Maximum Depth, Same Tree.',
            'Intermediate: Level Order Traversal, Validate BST, Lowest Common Ancestor.',
            'Advanced: Binary Tree Maximum Path Sum, Serialize & Deserialize Tree.'
          ],
          codeSnippet: `// Advanced: Global max path sum updated during bottom-up subtree traversal`
        },
        {
          chapter: '8. Real-World Use Cases',
          title: 'Production Tree Systems',
          duration: 20,
          concept: 'Where trees are deployed in industry.',
          points: [
            'Database B+ Trees: MySQL and PostgreSQL disk page indexing.',
            'DOM (Document Object Model): Web browsers rendering HTML trees.',
            'Abstract Syntax Trees (AST): Compilers (Babel, LLVM) parsing source code.'
          ],
          codeSnippet: `// B+ Tree root page with branching factor of 100+ minimizes disk I/O reads`
        },
        {
          chapter: '9. Interview & Company Relevance',
          title: 'Corporate Focus',
          duration: 20,
          concept: 'Top 3 most tested DSA topic in Google, Amazon, and Microsoft hiring rounds.',
          points: [
            'Evaluates recursive depth, base case handling, and pointer safety.',
            'Crucial benchmark for full-stack and systems engineering candidates.'
          ],
          codeSnippet: `// Common follow-up: Solve without recursion using an explicit stack (Iterative DFS)`
        }
      ]
    },
    {
      id: 'dp',
      title: 'Dynamic Programming (DP)',
      category: 'Advanced Algorithms',
      description: 'Optimal substructure, overlapping subproblems, top-down memoization, and bottom-up tabulation.',
      aiVideoLessons: [
        {
          chapter: '1. What It Is',
          title: 'Definition & Core Invariants',
          duration: 20,
          concept: 'Dynamic Programming is an optimization technique that solves complex problems by breaking them down into overlapping subproblems and caching their solutions.',
          points: [
            'Overlapping Subproblems: The same subproblems are solved repeatedly.',
            'Optimal Substructure: Optimal solution to the problem can be constructed from optimal solutions to subproblems.',
            'State: A minimal set of parameters that uniquely describes a subproblem.'
          ],
          codeSnippet: `// Fibonacci without DP: O(2^N) exponential time\n// Fibonacci with DP memoization: O(N) linear time`
        },
        {
          chapter: '2. Why It Is Used',
          title: 'Taming Exponential Complexity',
          duration: 20,
          concept: 'Converts brute-force O(2^N) or O(N!) exponential algorithms into polynomial O(N) or O(N^2) solutions.',
          points: [
            'Eliminates Redundant Calculations: Computes each subproblem state once and stores in a DP table.',
            'Guaranteed Global Optimum: Examines all valid decision paths systematically.'
          ],
          codeSnippet: `int memo[1000] = {0};\nint fib(int n) {\n    if (n <= 1) return n;\n    if (memo[n] != 0) return memo[n];\n    return memo[n] = fib(n-1) + fib(n-2);\n}`
        },
        {
          chapter: '3. Core Concepts',
          title: 'Memoization vs Tabulation',
          duration: 25,
          concept: 'The two canonical implementations of Dynamic Programming.',
          points: [
            'Top-Down (Memoization): Recursive approach starting from target and caching results (easy to write).',
            'Bottom-Up (Tabulation): Iterative approach starting from base cases and filling an array (avoids stack overflow).',
            'Space Optimization: Often only the previous 1 or 2 states are needed, reducing space from O(N) to O(1).'
          ],
          codeSnippet: `// Bottom-Up Tabulation for Climbing Stairs\nint dp[n+1];\ndp[1] = 1; dp[2] = 2;\nfor (int i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];`
        },
        {
          chapter: '4. Visual Examples',
          title: 'Coin Change Walkthrough',
          duration: 30,
          concept: 'Finding minimum coins to make amount using bottom-up 1D DP table in O(amount * coins) time.',
          points: [
            'Initialize dp array of size amount + 1 filled with Infinity, dp[0] = 0.',
            'For each amount i from 1 to target:',
            'For each coin c: if i - c >= 0: dp[i] = min(dp[i], dp[i-c] + 1).',
            'Return dp[amount] == Infinity ? -1 : dp[amount].'
          ],
          codeSnippet: `vector<int> dp(amount + 1, amount + 1);\ndp[0] = 0;\nfor (int i = 1; i <= amount; i++) {\n    for (int c : coins) {\n        if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n    }\n}\nreturn dp[amount] > amount ? -1 : dp[amount];`
        },
        {
          chapter: '5. Time & Space Complexity',
          title: 'DP Complexity Formula',
          duration: 20,
          concept: 'Calculating time and space complexity for any DP solution.',
          points: [
            'Time Complexity = Number of States * Transitions per State.',
            'Space Complexity = Number of States (Table size) + Recursion Call Stack.',
            'Example (Coin Change): States = amount, Transitions = coins.size() => O(amount * C).'
          ],
          codeSnippet: `// 2D DP (LCS): States = M * N, Transition = O(1) => O(M * N) Time & Space`
        },
        {
          chapter: '6. Common Patterns',
          title: 'Canonical DP Patterns',
          duration: 25,
          concept: 'The 5 major DP categories in technical interviews.',
          points: [
            '1. 1D Linear DP (Climbing Stairs, House Robber)',
            '2. 0/1 Knapsack & Unbounded Knapsack (Coin Change)',
            '3. 2D Grid DP (Unique Paths, Minimum Path Sum)',
            '4. String DP (Longest Common Subsequence, Edit Distance)',
            '5. State Machine DP (Stock Buy & Sell with Cooldown)'
          ],
          codeSnippet: `// 0/1 Knapsack: pick or leave\ndp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]);`
        },
        {
          chapter: '7. Beginner → Advanced',
          title: 'Progression Roadmap',
          duration: 20,
          concept: 'Systematic climb from Fibonacci to 2D state transitions.',
          points: [
            'Beginner: Climbing Stairs, House Robber, Min Cost Climbing Stairs.',
            'Intermediate: Coin Change, Longest Increasing Subsequence (LIS), Unique Paths.',
            'Advanced: Edit Distance, Longest Common Subsequence, Burst Balloons.'
          ],
          codeSnippet: `// Advanced: LIS in O(N log N) using Patience Sorting / Binary Search`
        },
        {
          chapter: '8. Real-World Use Cases',
          title: 'Production DP Systems',
          duration: 20,
          concept: 'Where Dynamic Programming powers enterprise technology.',
          points: [
            'DNA Sequence Alignment: Needleman-Wunsch algorithm for genomics.',
            'Git Diff / Text Comparison: Longest Common Subsequence algorithm computing line differences.',
            'Routing & GPS: Bellman-Ford shortest path algorithm with negative edge detection.'
          ],
          codeSnippet: `// Git diff uses Myers diff algorithm (based on LCS 2D Dynamic Programming)`
        },
        {
          chapter: '9. Interview & Company Relevance',
          title: 'Corporate Focus',
          duration: 20,
          concept: 'Bar raiser topic for Google, Flipkart, Uber, and Amazon final rounds.',
          points: [
            'Distinguishes top-tier candidates who can formulate recurrence relations.',
            'Interview strategy: Start by writing recursive solution, identify overlapping calls, then add memoization array.'
          ],
          codeSnippet: `// Golden Rule: State definition -> Base cases -> Transition equation -> Space optimization`
        }
      ]
    }
  ];

  const currentTopic = dsaTopics.find(t => t.id === selectedTopicId) || dsaTopics[0];
  const activeLessons = currentTopic.aiVideoLessons || [];
  const currentLessonChapter = activeLessons[activeChapterIdx] || activeLessons[0];
  const totalVideoDuration = activeLessons.reduce((acc, l) => acc + l.duration, 0);

  // ── AI Video Player Timeline & Auto-chapter Advancement ──
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
          // Calculate chapter based on cumulative duration
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

  // Jump to specific chapter
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
            {currentFlowStep === 4 && `AI Topic Video Lesson: ${currentTopic.title}`}
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
            { num: 4, label: '4. AI Video Lesson' },
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
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setCurrentFlowStep(4);
                          setCurrentTime(0);
                          setIsPlaying(false);
                          setActiveChapterIdx(0);
                        }}
                        className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                        <span>AI Video Lesson</span>
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

      {/* ── STEP 4: AI TOPIC VIDEO LESSON STUDIO (NATIVE INTERACTIVE PLAYER) ── */}
      {currentFlowStep === 4 && selectedCompany && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Topic Masterclass Engine</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Target: {selectedCompany.companyName}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {currentTopic.title} • Video Explanation
              </h2>
            </div>

            <button
              onClick={() => setCurrentFlowStep(5)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Terminal className="h-4 w-4" />
              <span>Proceed to Coding Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── AI INTERACTIVE VIDEO PLAYER (FULL FEATURED) ── */}
          <div
            ref={playerContainerRef}
            className={`rounded-3xl border-2 border-purple-500/30 bg-[#080d19] text-white shadow-2xl overflow-hidden flex flex-col justify-between ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[500px]'
            }`}
          >
            
            {/* Top Player Bar */}
            <div className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-200">AI Educational Video Stream</span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-400">{currentLessonChapter.chapter}</span>
              </div>

              <div className="flex items-center space-x-3 text-slate-400">
                <span className="hidden sm:inline">Speed: <strong>{playbackSpeed}x</strong></span>
                <span className="text-slate-200 font-bold">{formatTimer(currentTime)} / {formatTimer(totalVideoDuration)}</span>
              </div>
            </div>

            {/* Main Stage Display (Animated Slide & Code Visualizer) */}
            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center space-y-6">
              
              <div className="space-y-2 text-left">
                <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 inline-block border border-purple-500/30">
                  {currentLessonChapter.chapter}: {currentLessonChapter.title}
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {currentLessonChapter.concept}
                </h3>
              </div>

              {/* Key Concept Bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {currentLessonChapter.points.map((pt, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">#0{idx + 1}</span>
                    <p className="leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>

              {/* Code Visualizer Box */}
              {currentLessonChapter.codeSnippet && (
                <div className="rounded-2xl border border-slate-800 bg-[#050811] p-4 text-left font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                  <div className="text-[10px] text-slate-500 pb-2 border-b border-slate-800/80 flex justify-between">
                    <span>Algorithm Blueprint ({selectedLanguage.toUpperCase()})</span>
                    <span className="text-purple-400">Topic: {currentTopic.title}</span>
                  </div>
                  <pre className="pt-2 leading-relaxed whitespace-pre font-mono">
                    <code>{currentLessonChapter.codeSnippet}</code>
                  </pre>
                </div>
              )}

            </div>

            {/* Video Player Controls & Progress Scrubber */}
            <div className="p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 space-y-3">
              
              {/* Scrubber Timeline */}
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                <div
                  style={{ width: `${(currentTime / totalVideoDuration) * 100}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
                />
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                
                {/* Play, Pause, Rewind, Fast Forward */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSeek(-10)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    title="Rewind 10s"
                  >
                    <Rewind className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
                  </button>

                  <button
                    onClick={() => handleSeek(10)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    title="Forward 10s"
                  >
                    <FastForward className="h-4 w-4" />
                  </button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl">
                  {[0.75, 1, 1.25, 1.5, 2].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        playbackSpeed === spd ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Fullscreen Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Chapter Quick Selector Grid */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block text-left">
              Video Lesson Chapters (Click to Seek):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              {activeLessons.map((l, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJumpToChapter(idx)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    activeChapterIdx === idx
                      ? 'border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-purple-400/40'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase text-slate-400">{l.chapter}</div>
                  <div className="text-xs line-clamp-1">{l.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation to Arena */}
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
              <span>Practice Problems in Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 5: LEETCODE-STYLE PROBLEM SOLVING ARENA ── */}
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
              <div className={`${editorLayout === 'split' ? 'lg:col-span-5' : 'w-full'} p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6 max-h-[800px] overflow-y-auto text-left`}>
                
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
              <div className={`${editorLayout === 'split' ? 'lg:col-span-7' : 'w-full'} rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col justify-between text-left`}>
                
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
