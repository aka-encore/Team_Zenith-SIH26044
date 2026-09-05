import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Video, VideoOff, Mic, MicOff, Clock, ShieldAlert, Award,
  CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft,
  ChevronRight, ChevronLeft, BookOpen, Layers, Target, Check,
  Search, Filter, Lightbulb, AlertCircle, FileText, Sparkles,
  Play, Eye, HelpCircle, ExternalLink, Calendar, ShieldCheck,
  Volume2, VolumeX, Radio, BrainCircuit
} from 'lucide-react';

// ── 15 Verified Target Companies ──
const TARGET_COMPANIES = [
  { id: 'google', name: 'Google', industry: 'Distributed Systems, Cloud & AI', logoType: 'google' },
  { id: 'amazon', name: 'Amazon', industry: 'E-Commerce & High-Scale Cloud', logoType: 'amazon' },
  { id: 'microsoft', name: 'Microsoft', industry: 'Enterprise Platforms & Operating Systems', logoType: 'microsoft' },
  { id: 'meta', name: 'Meta', industry: 'Social Graph Architecture & Real-Time Media', logoType: 'meta' },
  { id: 'apple', name: 'Apple', industry: 'Low-Level Systems & Consumer Hardware', logoType: 'apple' },
  { id: 'netflix', name: 'Netflix', industry: 'Microservices & Streaming Infrastructure', logoType: 'netflix' },
  { id: 'flipkart', name: 'Flipkart', industry: 'Supply Chain & E-Commerce Logistics', logoType: 'flipkart' },
  { id: 'adobe', name: 'Adobe', industry: 'Media Processing & Document Cloud', logoType: 'adobe' },
  { id: 'uber', name: 'Uber', industry: 'Geospatial Routing & Real-Time Dispatch', logoType: 'uber' },
  { id: 'atlassian', name: 'Atlassian', industry: 'Developer Productivity & Agile Platforms', logoType: 'atlassian' },
  { id: 'walmart', name: 'Walmart', industry: 'Omnichannel Retail & Inventory Analytics', logoType: 'walmart' },
  { id: 'infosys', name: 'Infosys', industry: 'Enterprise Digital Transformation', logoType: 'infosys' },
  { id: 'tcs', name: 'TCS', industry: 'Global Technology Infrastructure Services', logoType: 'tcs' },
  { id: 'wipro', name: 'Wipro', industry: 'Cloud Engineering & Digital Services', logoType: 'wipro' },
  { id: 'accenture', name: 'Accenture', industry: 'Technology Consulting & Solutions', logoType: 'accenture' }
];

// ── Real Verified Company Interview Questions & Rubrics ──
const MOCK_QUESTION_BANK = {
  google: [
    {
      id: 'g_1',
      title: 'Cycle Detection & Entry Point in Directed Graph',
      category: 'Graph Algorithms & Topology',
      difficulty: 'Hard',
      keyTerms: ['cycle', 'dfs', 'kahn', 'color', 'indegree', 'white', 'gray', 'black', 'topological', 'o(v+e)'],
      expectedConcepts: 'DFS three-color marking vs Kahn in-degree algorithm with O(V+E) time complexity analysis.',
      question: 'Explain in detail how to detect if a directed graph has a cycle and find all vertices in that cycle. Compare DFS color-marking (white/gray/black) versus Kahn\'s algorithm in terms of time, memory, and practical system constraints.'
    },
    {
      id: 'g_2',
      title: 'LRU Cache Distributed System Design',
      category: 'System Data Structures & Caching',
      difficulty: 'Medium',
      keyTerms: ['doubly linked list', 'hash map', 'o(1)', 'head', 'tail', 'eviction', 'capacity', 'node', 'pointer'],
      expectedConcepts: 'Hash map indexing doubly linked list nodes for strict O(1) eviction and updates.',
      question: 'Design an in-memory LRU Cache with strict O(1) get(key) and put(key, value) guarantees. Explain which data structures you combine, how pointers are manipulated on cache hits/evictions, and thread-safety considerations.'
    },
    {
      id: 'g_3',
      title: 'Dynamic Stream Median with Dual Heaps',
      category: 'Priority Queues & Streaming',
      difficulty: 'Hard',
      keyTerms: ['max heap', 'min heap', 'heap', 'median', 'balance', 'o(1)', 'o(log n)', 'stream'],
      expectedConcepts: 'Dual balanced heaps (Max-Heap for lower half, Min-Heap for upper half) with O(1) median retrieval.',
      question: 'Given an unbounded live data stream of numbers, design a system to maintain and calculate the median at any instant in O(1) time. Explain your heap balance invariants and re-balancing condition.'
    }
  ],
  amazon: [
    {
      id: 'amz_1',
      title: 'Top K Frequent Items in Real-Time Logs',
      category: 'Heap & Hash Maps',
      difficulty: 'Medium',
      keyTerms: ['min-heap', 'heap', 'frequency', 'hash map', 'o(n log k)', 'o(k)', 'k'],
      expectedConcepts: 'Frequency hash map paired with Min-Heap of size K for optimal O(N log K) time and O(K) space.',
      question: 'Given a continuous stream of e-commerce item clicks, describe how you would find and return the Top K most frequent items at any moment. Explain why a Min-Heap of size K is more memory-efficient than sorting.'
    },
    {
      id: 'amz_2',
      title: 'Binary Search Tree Validation Invariants',
      category: 'Trees & BST',
      difficulty: 'Medium',
      keyTerms: ['bst', 'range', 'inorder', 'lower', 'upper', 'left', 'right', 'valid', 'o(n)'],
      expectedConcepts: 'Validating whole subtree boundaries (-inf, +inf) or strictly increasing inorder traversal in O(N).',
      question: 'Explain how to determine whether a given binary tree is a strictly valid Binary Search Tree. Walk through why checking only immediate child nodes fails, and explain how range bounds (-inf, +inf) or inorder traversal enforce correctness.'
    },
    {
      id: 'amz_3',
      title: 'Package Delivery Route Subarray Optimization',
      category: 'Arrays & Dynamic Optimization',
      difficulty: 'Medium',
      keyTerms: ['kadane', 'subarray', 'max sum', 'current sum', 'o(n)', 'o(1)', 'negative', 'reset'],
      expectedConcepts: 'Kadane\'s algorithm for maximum subarray sum with running sum reset in single O(N) pass.',
      question: 'Given an array of integer shipment weight variances (both positive and negative), explain how Kadane\'s algorithm finds the contiguous subarray with maximum net sum in O(N) time with O(1) extra memory.'
    }
  ],
  microsoft: [
    {
      id: 'msft_1',
      title: 'Floyd\'s Cycle Finding Algorithm in Linked List',
      category: 'Pointers & Memory Chains',
      difficulty: 'Medium',
      keyTerms: ['floyd', 'tortoise', 'hare', 'fast', 'slow', 'cycle', 'o(1)', 'pointer', 'meeting'],
      expectedConcepts: 'Fast and slow pointer mathematical proof for cycle detection and entry point resolution in O(1) space.',
      question: 'Explain the mathematical proof behind Floyd\'s Tortoise and Hare algorithm for finding the exact starting node of a linked list cycle with O(1) memory. Walk through why the distance from head to cycle entrance equals meeting point to cycle entrance.'
    },
    {
      id: 'msft_2',
      title: 'Monotonic Stack for Daily Stock/Temperature Spikes',
      category: 'Stacks & Monotonicity',
      difficulty: 'Medium',
      keyTerms: ['monotonic stack', 'stack', 'next greater', 'linear', 'o(n)', 'push', 'pop', 'index'],
      expectedConcepts: 'Monotonic decreasing stack to resolve Next Greater Element in amortized linear O(N) time.',
      question: 'Describe the Monotonic Stack technique for finding the Next Greater Element for all elements in an array in linear O(N) time. Why does each element get pushed and popped at most once?'
    },
    {
      id: 'msft_3',
      title: 'Binary Tree Level Order Zigzag Traversal',
      category: 'Trees & BFS',
      difficulty: 'Medium',
      keyTerms: ['bfs', 'queue', 'deque', 'level order', 'zigzag', 'alternate', 'direction', 'o(n)'],
      expectedConcepts: 'Level-by-level BFS queue traversal with alternating direction collection.',
      question: 'Describe how to traverse a binary tree level by level and alternate direction (left-to-right, then right-to-left) using a Queue or Deque in O(N) time.'
    }
  ],
  meta: [
    {
      id: 'meta_1',
      title: 'Two Pointers 3Sum Convergence & De-duplication',
      category: 'Sorting & Converging Pointers',
      difficulty: 'Medium',
      keyTerms: ['two pointers', 'sort', '3sum', 'duplicate', 'o(n^2)', 'left', 'right', 'target'],
      expectedConcepts: 'Sorting followed by fixed pivot and two-pointer convergence to achieve O(N^2) time without duplicate triplets.',
      question: 'Walk through how the Two Pointers technique reduces the 3Sum problem from O(N³) brute force down to O(N²). Explain how duplicate triplets are avoided without using a slow HashSet.'
    },
    {
      id: 'meta_2',
      title: 'Shortest Degrees of Separation (Social Graph BFS)',
      category: 'Graph Algorithms & BFS',
      difficulty: 'Medium',
      keyTerms: ['bidirectional', 'bfs', 'graph', 'frontier', 'queue', 'shortest', 'visited', 'level'],
      expectedConcepts: 'Bidirectional BFS exploring from both source and target frontiers simultaneously to reduce search space.',
      question: 'Given an undirected social graph of millions of users, explain how bidirectional Breadth-First Search (BFS) finds the shortest degree of separation between two target users significantly faster than standard unidirectional BFS.'
    },
    {
      id: 'meta_3',
      title: 'Binary Search on Capacity / Answer Space',
      category: 'Logarithmic Search & Feasibility',
      difficulty: 'Hard',
      keyTerms: ['binary search', 'monotonic', 'predicate', 'low', 'high', 'capacity', 'feasible', 'mid'],
      expectedConcepts: 'Binary search over monotonic feasible solution space with a boolean helper function.',
      question: 'Explain how Binary Search on Answer Space works for problems like "Capacity to Ship Packages within D Days" or "Split Array Largest Sum". What monotonic predicate function must be satisfied?'
    }
  ],
  apple: [
    {
      id: 'aapl_1',
      title: 'Contiguous Memory Buffer vs Pointer Linked List',
      category: 'Memory Layout & Cache Locality',
      difficulty: 'Medium',
      keyTerms: ['cache', 'locality', 'spatial', 'pointer', 'contiguous', 'vector', 'array', 'linked list', 'prefetch'],
      expectedConcepts: 'CPU cache line utilization, prefetching, and memory fragmentation differences between contiguous vectors and pointer nodes.',
      question: 'In low-level systems engineering, compare the cache locality and CPU branch prediction performance of dynamic arrays (contiguous vectors) versus pointer-based linked lists during sequential and random access traversals.'
    },
    {
      id: 'aapl_2',
      title: 'Lowest Common Ancestor in Binary Trees',
      category: 'Hierarchical Structures & Recursion',
      difficulty: 'Medium',
      keyTerms: ['lca', 'lowest common ancestor', 'recursion', 'left', 'right', 'root', 'bst', 'o(n)'],
      expectedConcepts: 'Recursive bottom-up postorder subtree searching for targets p and q in O(N) time.',
      question: 'Explain the recursive bottom-up algorithm to find the Lowest Common Ancestor (LCA) of two nodes p and q in a general binary tree. How does the logic simplify when the tree is a Binary Search Tree (BST)?'
    }
  ],
  netflix: [
    {
      id: 'nflx_1',
      title: 'High-Throughput Token Bucket Rate Limiting',
      category: 'Concurrency & Algorithmic State',
      difficulty: 'Hard',
      keyTerms: ['token bucket', 'rate limit', 'timestamp', 'refill', 'capacity', 'tokens', 'o(1)', 'lock'],
      expectedConcepts: 'Lazy timestamp delta calculation for token replenishment in O(1) without background polling threads.',
      question: 'Explain the Token Bucket algorithm for API rate limiting in high-concurrency streaming microservices. How do you track token regeneration timestamp differences in O(1) without background polling threads?'
    },
    {
      id: 'nflx_2',
      title: 'Sliding Window Maximum with Monotonic Deque',
      category: 'Sliding Windows & Deque',
      difficulty: 'Hard',
      keyTerms: ['sliding window', 'deque', 'monotonic', 'maximum', 'o(n)', 'front', 'back', 'k'],
      expectedConcepts: 'Monotonic decreasing double-ended queue storing element indices to obtain window max in strict O(N).',
      question: 'Given a sliding window of size K moving across an array of length N, explain how a double-ended queue (Deque) maintains candidates to return all maximums in strict O(N) linear time.'
    }
  ],
  flipkart: [
    {
      id: 'fk_1',
      title: '2D Grid Route Optimization with Obstacles',
      category: 'Dynamic Programming & Grid Search',
      difficulty: 'Medium',
      keyTerms: ['dynamic programming', 'grid', 'dp', 'memoization', 'bottom-up', 'o(n)', 'space', 'obstacles'],
      expectedConcepts: 'State transition dp[i][j] = cost + min(dp[i-1][j], dp[i][j-1]) with 1D array space rolling optimization.',
      question: 'Explain how 2D Dynamic Programming computes the minimum cost path from the top-left to bottom-right cell in a grid with variable cost terrain and obstacles. How can memory be optimized from O(M*N) down to O(N)?'
    },
    {
      id: 'fk_2',
      title: 'Order Fulfillment Interval Scheduling',
      category: 'Greedy Algorithms & Intervals',
      difficulty: 'Medium',
      keyTerms: ['interval', 'greedy', 'min heap', 'sort', 'start time', 'end time', 'overlap', 'o(n log n)'],
      expectedConcepts: 'Sorting intervals by start time and utilizing a Min-Heap of end times to find minimum concurrent vehicles.',
      question: 'Given N warehouse delivery time slots with start and end times, explain the greedy algorithm to find the minimum number of delivery vehicles required so that no two overlapping deliveries share a vehicle.'
    }
  ],
  adobe: [
    {
      id: 'adbe_1',
      title: 'Run-Length & Dictionary String Compression',
      category: 'Strings & In-Place Encoding',
      difficulty: 'Medium',
      keyTerms: ['two pointers', 'in-place', 'count', 'write', 'read', 'o(1)', 'compress', 'characters'],
      expectedConcepts: 'Two-pointer read/write pointer invariant compressing consecutive repeating characters in O(1) auxiliary space.',
      question: 'Explain the in-place two-pointer technique to compress consecutive repeating characters in a character array with O(1) auxiliary memory.'
    },
    {
      id: 'adbe_2',
      title: 'N-Queens Backtracking with Diagonal Bitmasks',
      category: 'Backtracking & Pruning',
      difficulty: 'Hard',
      keyTerms: ['backtracking', 'bitmask', 'diagonal', 'column', 'pruning', 'conflict', 'n-queens', 'o(1)'],
      expectedConcepts: 'Recursive depth-first backtracking with bitmask state checks to validate queen placements in O(1) per row.',
      question: 'Walk through how Backtracking explores the decision tree for the N-Queens problem. Explain how column and diagonal conflict checks can be optimized to O(1) using integer bitmasks.'
    }
  ],
  uber: [
    {
      id: 'uber_1',
      title: 'Dijkstra Shortest Path on Weighted Road Networks',
      category: 'Graph Algorithms & Priority Queue',
      difficulty: 'Hard',
      keyTerms: ['dijkstra', 'min heap', 'priority queue', 'weight', 'relax', 'o((v+e) log v)', 'negative', 'greedy'],
      expectedConcepts: 'Greedy frontier exploration via Min-Heap relaxation with O((V+E) log V) complexity and negative weight limitations.',
      question: 'Explain Dijkstra\'s algorithm for finding the shortest delivery route on a weighted road network with non-negative edge costs. What is the time complexity with a Binary Min-Heap vs Fibonacci Heap, and why does Dijkstra fail on negative edge weights?'
    },
    {
      id: 'uber_2',
      title: 'Geospatial Driver Matching with K-D Trees / QuadTrees',
      category: 'Spatial Partitioning Data Structures',
      difficulty: 'Hard',
      keyTerms: ['quadtree', 'geohash', 'spatial', 'kd-tree', 'radius', 'nearest', 'partition', '2d'],
      expectedConcepts: 'Hierarchical 2D grid partitioning via QuadTrees or Geohashes for localized logarithmic radius search.',
      question: 'Describe how spatial indexing data structures like QuadTrees or Geohashes allow finding nearest available mobility drivers within a 2km radius without scanning all active drivers in the database.'
    }
  ],
  atlassian: [
    {
      id: 'atls_1',
      title: 'Task Dependency Graph & Build Cycle Detection',
      category: 'Graph Algorithms & Topological Sort',
      difficulty: 'Medium',
      keyTerms: ['kahn', 'indegree', 'topological sort', 'dependency', 'directed graph', 'cycle', 'queue', 'o(v+e)'],
      expectedConcepts: 'Kahn\'s algorithm tracking in-degrees to generate linear task order and identify circular blockers.',
      question: 'Given a project with interdependent tasks, describe how you construct a directed dependency graph and use Kahn\'s in-degree algorithm to produce a valid execution order and report circular blocker dependencies.'
    },
    {
      id: 'atls_2',
      title: 'Nested Document Undo/Redo with Double Stacks',
      category: 'Stack Buffers & Editor Architecture',
      difficulty: 'Easy',
      keyTerms: ['undo', 'redo', 'stack', 'buffer', 'clear', 'push', 'pop', 'history', 'o(1)'],
      expectedConcepts: 'Two-stack architecture where new edits push to Undo stack and invalidate/clear the Redo stack.',
      question: 'Explain how collaborative text editors implement multi-level Undo and Redo operations using two stack buffers, and what happens to the Redo stack when a new edit occurs.'
    }
  ],
  walmart: [
    {
      id: 'wmt_1',
      title: 'Inventory Stock Interval Merging',
      category: 'Intervals & Sorting',
      difficulty: 'Medium',
      keyTerms: ['intervals', 'merge', 'sort', 'start', 'end', 'overlap', 'o(n log n)', 'contiguous'],
      expectedConcepts: 'Sorting by interval start times and sequentially merging overlapping ranges in O(N log N) time.',
      question: 'Given an array of overlapping promotional discount intervals [start, end], explain the sorting and linear merge algorithm to consolidate all overlapping intervals into non-overlapping ranges in O(N log N).'
    },
    {
      id: 'wmt_2',
      title: 'Subarray Sum Divisible by K',
      category: 'Hash Map & Modular Arithmetic',
      difficulty: 'Medium',
      keyTerms: ['prefix sum', 'modulo', 'hash map', 'remainder', 'divisible', 'frequency', 'k', 'o(n)'],
      expectedConcepts: 'Prefix sums and modulo arithmetic with hash map tracking remainder frequencies in O(N) time.',
      question: 'Explain how prefix sums combined with modulo arithmetic and a frequency hash map can count the number of subarrays whose sum is divisible by integer K in single-pass O(N) time.'
    }
  ],
  infosys: [
    {
      id: 'infy_1',
      title: 'String Anagram Verification & ASCII Frequency Maps',
      category: 'Strings & Hash Tables',
      difficulty: 'Easy',
      keyTerms: ['anagram', 'frequency', 'ascii', 'array', 'count', '26', 'o(n)', 'o(1)'],
      expectedConcepts: 'Fixed 26-element integer frequency array tallying characters in O(N) time and O(1) memory.',
      question: 'Explain how to determine whether two strings are valid anagrams of each other in O(N) time and O(1) auxiliary space using a 26-character fixed frequency array instead of a dynamic hash table.'
    },
    {
      id: 'infy_2',
      title: 'First Unique Character in a Data Stream',
      category: 'Hash Maps & Queues',
      difficulty: 'Easy',
      keyTerms: ['frequency', 'queue', 'stream', 'hash map', 'first unique', 'single pass', 'o(1)'],
      expectedConcepts: 'Combining a FIFO queue with a frequency count array to pop repeated elements in amortized O(1).',
      question: 'Describe an efficient approach to return the first non-repeating character from a stream of characters in single-pass traversal.'
    }
  ],
  tcs: [
    {
      id: 'tcs_1',
      title: 'Array In-Place Rotation by K Steps',
      category: 'Arrays & Reversal Invariants',
      difficulty: 'Easy',
      keyTerms: ['reverse', 'rotate', 'in-place', 'k', 'modulo', 'three steps', 'o(1)', 'o(n)'],
      expectedConcepts: 'Three-step reversal: reverse entire array, reverse first k elements, reverse remaining elements in O(1) space.',
      question: 'Explain the three-step array reversal algorithm to rotate an array of N elements to the right by K positions in O(N) time with O(1) auxiliary space without shifting elements one by one.'
    },
    {
      id: 'tcs_2',
      title: 'Longest Palindromic Substring Expand Around Center',
      category: 'Strings & Two Pointers',
      difficulty: 'Medium',
      keyTerms: ['expand around center', 'palindrome', 'odd', 'even', 'two pointers', 'o(n^2)', 'o(1)'],
      expectedConcepts: 'Testing 2N-1 potential centers (odd length and even length) expanding outward in O(N^2) time and O(1) space.',
      question: 'Explain how the "Expand Around Center" technique identifies the longest palindromic substring in O(N²) time and O(1) space, accounting for both odd and even length palindrome centers.'
    }
  ],
  wipro: [
    {
      id: 'wipro_1',
      title: 'Missing Number in Arithmetic Sequence',
      category: 'Arrays & Math / Bit Manipulation',
      difficulty: 'Easy',
      keyTerms: ['xor', 'sum', 'gauss', 'missing', 'n*(n+1)/2', 'o(n)', 'o(1)', 'overflow'],
      expectedConcepts: 'XOR self-cancellation property (a ^ a = 0) or Gauss sum formula in O(N) time and O(1) space.',
      question: 'Given an array containing N distinct numbers taken from 0, 1, 2, ..., N, explain how XOR bitwise operations or Gauss sum formula finds the missing number in O(N) time with O(1) space and zero overflow risk.'
    },
    {
      id: 'wipro_2',
      title: 'Merge Two Sorted Arrays in O(1) Extra Space',
      category: 'Two Pointers & In-Place Merging',
      difficulty: 'Medium',
      keyTerms: ['three pointers', 'reverse', 'merge', 'in-place', 'end', 'nums1', 'nums2', 'o(m+n)'],
      expectedConcepts: 'Filling destination array starting from the back index m+n-1 to avoid overwriting unmerged elements.',
      question: 'Explain how to merge two sorted arrays nums1 (size m+n) and nums2 (size n) into nums1 in-place by filling from the back using three reverse pointers.'
    }
  ],
  accenture: [
    {
      id: 'acn_1',
      title: 'Move Zeroes to End Preserving Relative Order',
      category: 'Two Pointers & Compaction',
      difficulty: 'Easy',
      keyTerms: ['two pointers', 'slow', 'fast', 'in-place', 'zeroes', 'swap', 'o(n)', 'o(1)'],
      expectedConcepts: 'Fast pointer scans non-zero elements while slow pointer tracks insertion position in single O(N) pass.',
      question: 'Explain the fast-slow runner pointer approach to move all zero values to the end of an array in-place while preserving the relative order of non-zero elements in O(N) time.'
    },
    {
      id: 'acn_2',
      title: 'Balanced Binary Tree Height Verification',
      category: 'Trees & Postorder Traversal',
      difficulty: 'Medium',
      keyTerms: ['postorder', 'dfs', 'depth', 'height', 'balanced', 'bottom-up', 'o(n)', 'recursion'],
      expectedConcepts: 'Bottom-up postorder traversal returning -1 immediately if subtrees are unbalanced, running in strict O(N).',
      question: 'Explain how bottom-up postorder DFS validates whether a binary tree is height-balanced (depth of subtrees never differs by more than 1) in O(N) time without redundant top-down depth recalculations.'
    }
  ]
};

// ── Deterministic Evaluation Engine ──
const evaluateCandidateResponse = (questions, answers, tabSwitches) => {
  if (!questions || questions.length === 0) {
    return {
      isPassed: false,
      percentage: 0,
      passedCount: 0,
      totalCount: 0,
      questionBreakdown: [],
      improvementTopics: [],
      summaryMessage: 'No questions available for evaluation.'
    };
  }

  const breakdown = [];
  const improvementTopicsSet = new Set();
  let passedCount = 0;
  let totalScore = 0;

  questions.forEach(q => {
    const rawAnswer = (answers[q.id] || '').trim();
    const lowerAnswer = rawAnswer.toLowerCase();
    const words = rawAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const keyTerms = q.keyTerms || [];
    const matchedTerms = keyTerms.filter(term => lowerAnswer.includes(term.toLowerCase()));
    const keyTermRatio = keyTerms.length > 0 ? (matchedTerms.length / keyTerms.length) : 0;

    const hasComplexity = /o\([1nkmv\^2\s\+\*log/]+\)|time complexity|space complexity|linear|constant|logarithmic|in-place|o\(1\)|o\(n\)|quadratic|o\(v\+e\)|auxiliary/i.test(rawAnswer);
    const hasApproach = /algorithm|pointer|stack|queue|heap|tree|graph|hash|array|node|visited|dynamic|dp|recur|base case|loop|iterate|swap|index|condition|step|traversal|bfs|dfs/i.test(rawAnswer);

    const missingAreas = [];
    let qScore = 0;

    if (wordCount < 12) {
      qScore = 0;
      missingAreas.push('Answer is too brief or empty. Provide a substantive technical explanation.');
    } else {
      const depthScore = Math.min(30, Math.round((wordCount / 35) * 30));
      const termScore = Math.round(keyTermRatio * 40);
      const compScore = hasComplexity ? 15 : 0;
      if (!hasComplexity) {
        missingAreas.push('Include explicit Big-O Time & Space complexity analysis (e.g. O(N), O(1)).');
      }
      const appScore = hasApproach ? 15 : 0;
      if (!hasApproach) {
        missingAreas.push('Clarify algorithmic invariants, pointer operations, or underlying data structure mechanisms.');
      }
      qScore = depthScore + termScore + compScore + appScore;
    }

    const isQPassed = qScore >= 50 && wordCount >= 15;
    if (isQPassed) {
      passedCount++;
    } else {
      if (q.category) improvementTopicsSet.add(q.category);
      if (q.title) improvementTopicsSet.add(q.title);
    }

    totalScore += qScore;

    breakdown.push({
      id: q.id,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      score: qScore,
      isPassed: isQPassed,
      wordCount,
      matchedTerms,
      missingAreas,
      expectedConcepts: q.expectedConcepts,
      answerSnippet: rawAnswer || 'No response provided.'
    });
  });

  const avgPercentage = Math.round(totalScore / questions.length);
  const isPassed = passedCount >= Math.ceil(questions.length * 0.67) && avgPercentage >= 50 && tabSwitches < 5;

  return {
    isPassed,
    percentage: avgPercentage,
    passedCount,
    totalCount: questions.length,
    questionBreakdown: breakdown,
    improvementTopics: Array.from(improvementTopicsSet),
    tabSwitches,
    summaryMessage: isPassed
      ? `Candidate cleared ${passedCount} of ${questions.length} technical prompts with satisfactory algorithmic depth and complexity analysis.`
      : `Candidate cleared ${passedCount} of ${questions.length} technical prompts. Further preparation is required in key conceptual areas.`
  };
};

export default function MockInterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Main Page Tabs: 1: Practice | 2: Live Mock | 3: Previous Attempts ──
  const [activeTab, setActiveTab] = useState('mock'); // 'practice' | 'mock' | 'attempts'

  // ── Practice Section State ──
  const [selectedPracticeCompany, setSelectedPracticeCompany] = useState('google');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('All'); // 'All' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [practiceSearchQuery, setPracticeSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // ── Mock Interview Live State ──
  const [selectedMockCompany, setSelectedMockCompany] = useState('google');
  const [mockQuestionIndex, setMockQuestionIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimerRemaining, setMockTimerRemaining] = useState(30 * 60);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [mockResult, setMockResult] = useState(null);

  // Media (Camera & Mic) State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Anti-Cheat & Tab Switch Tracking
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // AI Voice Synthesis (TTS) State
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }
  };

  const handleSpeakQuestion = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (isSpeakingQuestion) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // ── Persistent Saved Attempts State ──
  const [savedAttempts, setSavedAttempts] = useState([]);

  const uid = user?.id || 'guest';

  // Load real persistent attempts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`zenith_mock_attempts_${uid}`);
      if (stored) {
        setSavedAttempts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading mock attempts:', e);
    }
  }, [uid]);

  // Questions for chosen mock company
  const activeCompanyQuestions = MOCK_QUESTION_BANK[selectedMockCompany] || [];
  const currentMockQuestion = activeCompanyQuestions[mockQuestionIndex] || activeCompanyQuestions[0];
  const targetCompanyObj = TARGET_COMPANIES.find(c => c.id === selectedMockCompany) || TARGET_COMPANIES[0];

  // ── Mock Interview Timer ──
  useEffect(() => {
    let timer = null;
    if (isInterviewActive && !isInterviewCompleted && mockTimerRemaining > 0) {
      timer = setInterval(() => {
        setMockTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isInterviewActive, isInterviewCompleted, mockTimerRemaining]);

  // ── Anti-Cheating: Tab / Window Switching Prevention ──
  useEffect(() => {
    if (!isInterviewActive || isInterviewCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowTabWarning(true);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      setShowTabWarning(true);
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active mock interview in progress.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInterviewActive, isInterviewCompleted]);

  // ── Attach Media Stream to Video Element on mount/update ──
  useEffect(() => {
    if (isInterviewActive && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  }, [isInterviewActive, isCameraActive, isMediaLoading]);

  // ── Cleanup Media on unmount ──
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ── Camera and Microphone Permission Request & Activation ──
  const startCameraAndMic = async () => {
    setMediaError(null);
    setIsMediaLoading(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera and microphone access.");
      }

      // Explicitly request both camera (video) and microphone (audio) permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setIsMicActive(true);
      setMediaError(null);
    } catch (err) {
      console.warn("Camera/Mic device permission error:", err);
      let message = "Camera and microphone access was denied or is unavailable.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Camera or microphone permission was denied. Please allow camera and microphone access in your browser site permissions to enable the live proctored preview.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "No camera or microphone hardware device was found. Please connect a webcam/microphone.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = "Camera or microphone is currently in use by another application.";
      } else if (err.message) {
        message = err.message;
      }
      setMediaError(message);
      setIsCameraActive(false);
      setIsMicActive(false);
    } finally {
      setIsMediaLoading(false);
    }
  };

  // ── Camera Toggle (ON / OFF) ──
  const toggleCamera = async () => {
    if (!mediaStreamRef.current) {
      await startCameraAndMic();
      return;
    }
    const videoTracks = mediaStreamRef.current.getVideoTracks();
    if (videoTracks.length === 0) {
      await startCameraAndMic();
      return;
    }
    const nextState = !isCameraActive;
    videoTracks.forEach(track => {
      track.enabled = nextState;
    });
    setIsCameraActive(nextState);
  };

  // ── Microphone Toggle (ON / OFF) ──
  const toggleMicrophone = () => {
    if (!mediaStreamRef.current) return;
    const audioTracks = mediaStreamRef.current.getAudioTracks();
    const nextState = !isMicActive;
    audioTracks.forEach(track => {
      track.enabled = nextState;
    });
    setIsMicActive(nextState);
  };

  const stopCameraAndMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsMicActive(false);
    setMediaError(null);
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    setIsSpeechRecognitionActive(false);
  };

  // ── Speech-To-Text Voice Typing ──
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type your answer.");
      return;
    }

    if (isSpeechRecognitionActive) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsSpeechRecognitionActive(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (currentMockQuestion && transcript) {
          setMockAnswers(prev => ({
            ...prev,
            [currentMockQuestion.id]: ((prev[currentMockQuestion.id] || '') + ' ' + transcript).trim()
          }));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        setIsSpeechRecognitionActive(false);
      };

      recognition.onend = () => {
        setIsSpeechRecognitionActive(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
      setIsSpeechRecognitionActive(true);
    }
  };

  // ── Launch Live Mock Interview ──
  const handleStartLiveInterview = () => {
    setMockQuestionIndex(0);
    setMockAnswers({});
    setMockTimerRemaining(30 * 60);
    setTabSwitchCount(0);
    setShowTabWarning(false);
    setIsInterviewActive(true);
    setIsInterviewCompleted(false);
    setMockResult(null);
    startCameraAndMic();
  };

  // ── Retry Mock Interview ──
  const handleRetryMockInterview = () => {
    setMockQuestionIndex(0);
    setMockAnswers({});
    setMockTimerRemaining(30 * 60);
    setTabSwitchCount(0);
    setShowTabWarning(false);
    setIsInterviewActive(true);
    setIsInterviewCompleted(false);
    setMockResult(null);
    startCameraAndMic();
  };

  // ── End & Evaluate Mock Interview ──
  const handleEndInterview = () => {
    setIsInterviewActive(false);
    setIsInterviewCompleted(true);
    stopCameraAndMic();

    const qList = activeCompanyQuestions;
    const evaluation = evaluateCandidateResponse(qList, mockAnswers, tabSwitchCount);
    setMockResult(evaluation);

    // Save real attempt to persistent storage
    const newAttempt = {
      id: Date.now().toString(),
      companyId: selectedMockCompany,
      companyName: targetCompanyObj.name,
      timestamp: new Date().toISOString(),
      score: evaluation.percentage,
      isPassed: evaluation.isPassed,
      passedCount: evaluation.passedCount,
      totalCount: evaluation.totalCount,
      tabSwitches: evaluation.tabSwitches,
      improvementTopics: evaluation.improvementTopics
    };

    const updatedAttempts = [newAttempt, ...savedAttempts];
    setSavedAttempts(updatedAttempts);
    try {
      localStorage.setItem(`zenith_mock_attempts_${uid}`, JSON.stringify(updatedAttempts));
    } catch (e) {
      console.error('Error persisting attempt:', e);
    }
  };

  // Filter practice questions
  const practiceQuestions = (MOCK_QUESTION_BANK[selectedPracticeCompany] || []).filter(q => {
    const matchesDiff = selectedDifficultyFilter === 'All' || q.difficulty.toLowerCase() === selectedDifficultyFilter.toLowerCase();
    const matchesSearch = !practiceSearchQuery || 
      q.title.toLowerCase().includes(practiceSearchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(practiceSearchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(practiceSearchQuery.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1550px] mx-auto space-y-8 pb-24 text-left px-4 sm:px-8 font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      
      {/* ── TOP HEADER ── */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Technical Assessment Engine</span>
              <span>•</span>
              <span>Live AI & Verbal Evaluation</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Mock Interview
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Practice real company-specific questions, test with full-screen camera & microphone proctoring, and review saved attempt history.
            </p>
          </div>

          {/* Main 3 Section Tabs */}
          <nav className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                if (isInterviewActive) stopCameraAndMic();
                setIsInterviewActive(false);
                setActiveTab('practice');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'practice'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>1. Interview Practice</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('mock');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'mock'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>2. Mock Interview</span>
            </button>

            <button
              onClick={() => {
                if (isInterviewActive) stopCameraAndMic();
                setIsInterviewActive(false);
                setActiveTab('attempts');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'attempts'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>3. Previous Attempts</span>
              {savedAttempts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {savedAttempts.length}
                </span>
              )}
            </button>
          </nav>

        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: INTERVIEW PRACTICE
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'practice' && (
        <section className="space-y-8">
          
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              1. Interview Practice
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse company-specific interview questions, review algorithmic expectations, and study progressive difficulties from Beginner to Advanced.
            </p>
          </div>

          {/* Company Selector & Difficulty Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0E1117] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            
            {/* Target Company Dropdown / Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Company:
              </span>
              {TARGET_COMPANIES.slice(0, 7).map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedPracticeCompany(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer border ${
                    selectedPracticeCompany === c.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {c.name}
                </button>
              ))}
              <select
                value={selectedPracticeCompany}
                onChange={(e) => setSelectedPracticeCompany(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 outline-none cursor-pointer"
              >
                {TARGET_COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter & Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      selectedDifficultyFilter === diff
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions or topics..."
                  value={practiceSearchQuery}
                  onChange={(e) => setPracticeSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none w-48 focus:border-slate-500"
                />
              </div>
            </div>

          </div>

          {/* Question List */}
          <div className="space-y-4">
            {practiceQuestions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#0E1117] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No questions match your filter.
                </p>
              </div>
            ) : (
              practiceQuestions.map((q, idx) => {
                const isExpanded = expandedQuestionId === q.id;
                return (
                  <div
                    key={q.id}
                    className="p-6 bg-white dark:bg-[#0E1117] rounded-2xl border border-slate-200 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {q.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              q.difficulty === 'Hard'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                            {q.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition hover:underline"
                        >
                          {isExpanded ? 'Hide Rubric' : 'View Practice Rubric'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMockCompany(selectedPracticeCompany);
                            setActiveTab('mock');
                          }}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Take Live Mock</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {q.question}
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong className="font-bold text-slate-900 dark:text-white">Core Algorithmic Rubric:</strong>{' '}
                          {q.expectedConcepts}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Key Invariants:</span>
                          {q.keyTerms?.map((term, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: LIVE MOCK INTERVIEW
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'mock' && (
        <section className="space-y-8">
          
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              2. Mock Interview Mode
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Company-specific live technical assessment with proctoring stream, countdown timer, anti-cheat detection, and deterministic evaluation.
            </p>
          </div>

          {/* Anti-Cheating Warning Banner */}
          {showTabWarning && isInterviewActive && (
            <div className="bg-rose-500 text-white p-4 rounded-xl flex items-center justify-between shadow-lg animate-bounce">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5" />
                <span className="text-sm font-bold">
                  Warning: Tab / Window switch detected ({tabSwitchCount} times). Stay on this window to avoid integrity flags.
                </span>
              </div>
              <button
                onClick={() => setShowTabWarning(false)}
                className="px-3 py-1 bg-white text-rose-600 rounded text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {!isInterviewActive && !isInterviewCompleted ? (
            /* Setup & Launch Card */
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#0E1117] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-left shadow-sm">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Assessment Setup
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Configure Your Mock Interview
                </h3>
                <p className="text-sm text-slate-500">
                  Select your target company to generate real, verified interview prompts.
                </p>
              </div>

              {/* Company Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Target Company:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TARGET_COMPANIES.map(comp => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedMockCompany(comp.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        selectedMockCompany === comp.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      <span className="font-bold text-sm block">{comp.name}</span>
                      <span className={`text-[10px] block truncate mt-1 ${selectedMockCompany === comp.id ? 'text-emerald-100' : 'opacity-70'}`}>
                        {comp.industry}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules & Requirements Checklist */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Interview Integrity Rules:
                </div>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>Camera and microphone permissions will be requested for live candidate feed.</li>
                  <li>Questions stay visible while formulating answers (type or use voice speech recognition).</li>
                  <li>Tab and window switches are logged in real-time.</li>
                  <li>Solutions will be evaluated deterministically for complexity analysis and algorithmic invariants.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleStartLiveInterview}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer transition shadow-md flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Full-Screen Mock Interview</span>
                </button>
              </div>
            </div>
          ) : isInterviewCompleted ? (
            /* Evaluated Result Summary Card */
            <div className="max-w-3xl mx-auto bg-white dark:bg-[#0E1117] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-left shadow-sm">
              
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    mockResult?.isPassed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {mockResult?.isPassed ? (
                      <Award className="h-7 w-7" />
                    ) : (
                      <XCircle className="h-7 w-7" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                        mockResult?.isPassed
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {mockResult?.isPassed ? 'PASSED ✓' : 'FAILED / NEEDS IMPROVEMENT ✕'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {targetCompanyObj.name} Mock Interview
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                      {mockResult?.isPassed
                        ? `${targetCompanyObj.name} Mock Interview Cleared!`
                        : `${targetCompanyObj.name} Mock Assessment Evaluation`}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {mockResult?.percentage || 0}%
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Cleared</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {mockResult?.passedCount || 0}/{mockResult?.totalCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {mockResult?.isPassed ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    <strong>Passed:</strong> Your responses demonstrated strong technical depth and algorithmic invariants for {targetCompanyObj.name}. Result saved to your interview history.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
                    <strong>Needs Improvement:</strong> You did not meet the required complexity analysis and algorithmic threshold for {targetCompanyObj.name}. Review feedback and retry.
                  </div>
                </div>
              )}

              {/* Topics Needing Improvement */}
              {mockResult?.improvementTopics && mockResult.improvementTopics.length > 0 && (
                <div className="space-y-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Topics & Concepts Needing Improvement
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {mockResult.improvementTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question Response Breakdown
                </h4>
                <div className="space-y-3">
                  {mockResult?.questionBreakdown?.map((qItem, idx) => (
                    <div
                      key={qItem.id || idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {idx + 1}. {qItem.title}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          qItem.isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}>
                          {qItem.isPassed ? 'Cleared' : 'Needs Work'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        "{qItem.answerSnippet}"
                      </p>

                      {qItem.missingAreas?.length > 0 && (
                        <div className="text-xs text-rose-600 dark:text-rose-400 space-y-0.5">
                          <span className="font-bold text-[10px] uppercase">Improvement Areas:</span>
                          <ul className="list-disc list-inside">
                            {qItem.missingAreas.map((m, mIdx) => (
                              <li key={mIdx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsInterviewCompleted(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Configure Another Interview
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!mockResult?.isPassed ? (
                    <button
                      onClick={handleRetryMockInterview}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retry Mock Interview</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('attempts')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>View In Attempts History</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Active One-Question-at-a-Time Live Interview */
            <div className="space-y-4">
              
              {/* Interview Navigation Bar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Live Technical Mock • {targetCompanyObj.name}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Question {mockQuestionIndex + 1} of {activeCompanyQuestions.length}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-amber-400">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span>
                      {Math.floor(mockTimerRemaining / 60)}:
                      {(mockTimerRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <button
                    onClick={handleEndInterview}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                  >
                    End Interview
                  </button>
                </div>
              </div>

              {/* Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 5 Cols: Visible Question & Live Camera Feed */}
                <div className="lg:col-span-5 space-y-4">
                  
                  <div className="bg-white dark:bg-[#0E1117] p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                          {currentMockQuestion?.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {currentMockQuestion?.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSpeakQuestion(`${currentMockQuestion?.title}. ${currentMockQuestion?.question}`)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                          isSpeakingQuestion
                            ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                            : 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/20'
                        }`}
                        title="AI Voice Interviewer"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isSpeakingQuestion ? 'Stop Voice' : 'AI Read Question'}</span>
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentMockQuestion?.title}
                    </h3>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {currentMockQuestion?.question}
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      * Formulate your algorithmic analysis and time/space complexity clearly.
                    </div>
                  </div>

                  {/* Live Proctoring Video & Audio Tile */}
                  <div className="bg-white dark:bg-[#0E1117] rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    
                    {/* Stream Header & Status Indicators */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Live Proctoring Stream
                        </span>
                      </div>

                      {/* Real-time Status Badges */}
                      <div className="flex items-center gap-2">
                        {/* Camera Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                          isCameraActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span>Camera: {isCameraActive ? 'ON' : 'OFF'}</span>
                        </span>

                        {/* Mic Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                          isMicActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>Mic: {isMicActive ? 'ON' : 'OFF'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Permission / Error Message if Denied */}
                    {mediaError && (
                      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg space-y-2 text-left">
                        <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed font-semibold">
                            {mediaError}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Check browser site permissions or camera lock icon.
                          </span>
                          <button
                            onClick={startCameraAndMic}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold cursor-pointer transition flex items-center gap-1 shadow-sm"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Retry Permission</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Live Video Frame with AI Proctoring HUD */}
                    <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                          isCameraActive ? 'opacity-100' : 'opacity-0 absolute'
                        }`}
                      />

                      {/* AI Proctoring HUD Overlays */}
                      {isCameraActive && (
                        <>
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none text-[10px] font-mono font-bold z-10">
                            <span className="bg-black/70 backdrop-blur-md text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1.5 shadow">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                              <span>AI PROCTOR: ACTIVE</span>
                            </span>

                            <span className={`px-2 py-0.5 rounded border backdrop-blur-md shadow ${
                              tabSwitchCount > 0
                                ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                                : 'bg-black/70 text-slate-300 border-slate-700'
                            }`}>
                              Tab Strikes: {tabSwitchCount}/3
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none text-[10px] font-mono font-bold z-10">
                            <span className="bg-black/70 backdrop-blur-md text-slate-200 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1">
                              <Eye className="h-3 w-3 text-cyan-400" />
                              <span>Gaze: Centered & Focused</span>
                            </span>

                            <span className="bg-black/70 backdrop-blur-md text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                              Integrity: {Math.max(0, 100 - tabSwitchCount * 25)}%
                            </span>
                          </div>
                        </>
                      )}

                      {/* Loading State */}
                      {isMediaLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-950">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">Requesting camera & microphone access...</span>
                        </div>
                      )}

                      {/* Camera Off State */}
                      {!isCameraActive && !isMediaLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-950/90 p-4 text-center">
                          <VideoOff className="h-7 w-7 text-slate-500" />
                          <span className="text-xs font-medium text-slate-300">Camera preview is turned off</span>
                          <button
                            onClick={toggleCamera}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold cursor-pointer transition border border-slate-700"
                          >
                            Turn Camera On
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Camera and Mic Toggle Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {/* Camera Toggle Button */}
                        <button
                          onClick={toggleCamera}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
                            isCameraActive
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                          }`}
                        >
                          {isCameraActive ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                          <span>{isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}</span>
                        </button>

                        {/* Microphone Toggle Button */}
                        <button
                          onClick={toggleMicrophone}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
                            isMicActive
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700'
                          }`}
                        >
                          {isMicActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          <span>{isMicActive ? 'Mute Mic' : 'Unmute Mic'}</span>
                        </button>
                      </div>

                      {/* Quick retry if stream lost */}
                      {!isCameraActive && !isMicActive && !mediaError && (
                        <button
                          onClick={startCameraAndMic}
                          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Restart Stream</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>

                {/* Right 7 Cols: Response Area */}
                <div className="lg:col-span-7 space-y-3 flex flex-col">
                  <div className="bg-white dark:bg-[#0E1117] rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden">
                    
                    <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Candidate Answer (Type or Speak)
                      </span>

                      <button
                        onClick={toggleSpeechRecognition}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          isSpeechRecognitionActive
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isSpeechRecognitionActive ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{isSpeechRecognitionActive ? 'Listening...' : 'Voice Input'}</span>
                      </button>
                    </div>

                    <textarea
                      placeholder="Type or speak your technical approach, data structure rationale, time and space complexity, and invariants..."
                      value={mockAnswers[currentMockQuestion?.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMockAnswers(prev => ({
                          ...prev,
                          [currentMockQuestion.id]: val
                        }));
                      }}
                      className="w-full h-[380px] p-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-sans leading-relaxed outline-none resize-none"
                    />

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setMockQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={mockQuestionIndex === 0}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </button>

                      {mockQuestionIndex < activeCompanyQuestions.length - 1 ? (
                        <button
                          onClick={() => setMockQuestionIndex(prev => prev + 1)}
                          className="px-5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Next Question</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleEndInterview}
                          className="px-5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Submit & Finish Interview</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: PREVIOUS ATTEMPTS
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'attempts' && (
        <section className="space-y-8">
          
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              3. Previous Attempts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Review your past real mock interview results, evaluation scores, and historical improvement areas.
            </p>
          </div>

          {savedAttempts.length === 0 ? (
            /* Clear Fallback State */
            <div className="text-center py-20 px-4 bg-white dark:bg-[#0E1117] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No interview attempts yet.
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take your first company mock interview in Section 2 to practice live under timer and proctoring.
              </p>
              <button
                onClick={() => setActiveTab('mock')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Take a Mock Interview</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Real Saved Attempts Table / Cards */
            <div className="space-y-4">
              {savedAttempts.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="p-6 bg-white dark:bg-[#0E1117] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                          att.isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {att.isPassed ? 'PASSED ✓' : 'FAILED ✕'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {new Date(att.timestamp).toLocaleDateString()} at {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {att.companyName} Mock Assessment
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{att.score}%</span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Cleared</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {att.passedCount}/{att.totalCount}
                        </span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Tab Switches</span>
                        <span className={`text-sm font-extrabold ${att.tabSwitches === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {att.tabSwitches}
                        </span>
                      </div>
                    </div>
                  </div>

                  {att.improvementTopics && att.improvementTopics.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Improvement Focus:</span>
                      {att.improvementTopics.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </section>
      )}

    </div>
  );
}
