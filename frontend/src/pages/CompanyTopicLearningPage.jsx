import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle2, Circle, CheckSquare,
  Square, Code2, BookOpen, Layers, Sparkles, ChevronRight, Zap,
  Play, RefreshCw, Award, Target, HelpCircle, FileCode, Check,
  Lightbulb, Compass, Terminal, ShieldCheck, ExternalLink
} from 'lucide-react';

export default function CompanyTopicLearningPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedOppId, setSelectedOppId] = useState(searchParams.get('oppId') || '');
  const [activeTopicId, setActiveTopicId] = useState(searchParams.get('topicId') || 'arrays');
  const [activeStage, setActiveStage] = useState('basics'); // 'basics' | 'concepts' | 'examples' | 'practice' | 'interview'
  const [codeLanguage, setCodeLanguage] = useState('javascript'); // 'javascript' | 'python' | 'cpp' | 'java'
  const [loading, setLoading] = useState(true);
  const [completedStages, setCompletedStages] = useState({});

  // Fetch real opportunities and profile from MongoDB
  const fetchTopicData = async () => {
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
        if (!selectedOppId && oppsData.opportunities.length > 0) {
          const firstId = oppsData.opportunities[0]._id;
          setSelectedOppId(firstId);
        }
      }

      if (profData.success && profData.profile) {
        setStudentProfile(profData.profile);
      }
    } catch (err) {
      console.error('Error fetching topic learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTopicData();
    }
  }, [token]);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zenith_topic_flow_${user?.id || 'guest'}`);
      if (saved) {
        setCompletedStages(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading topic flow progress:', e);
    }
  }, [user?.id]);

  const toggleStageCompleted = (stageKey) => {
    setCompletedStages(prev => {
      const updated = { ...prev, [stageKey]: !prev[stageKey] };
      try {
        localStorage.setItem(`zenith_topic_flow_${user?.id || 'guest'}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const selectedOpportunity = opportunities.find(o => o._id === selectedOppId) || opportunities[0] || null;
  const companyName = selectedOpportunity?.companyId?.companyName || selectedOpportunity?.companyName || 'Enterprise Partner';
  const roleTitle = selectedOpportunity?.title || 'Software Engineer';
  const requiredSkills = selectedOpportunity?.requiredSkills || [];

  // Structured Topic Learning Content with the 5-Stage Progressive Flow:
  // Basics → Concepts → Examples → Practice → Interview Level
  const topicDataMap = {
    arrays: {
      id: 'arrays',
      title: 'Arrays & Linear Data Structures',
      subtitle: 'Contiguous memory allocation, random access, and multi-pointer search patterns',
      category: 'Data Structures',
      skillsMatched: ['Data Structures', 'C++', 'Java', 'Python', 'Algorithms', 'JavaScript'],
      stages: {
        basics: {
          title: 'Array Basics & Memory Architecture',
          summary: 'Understanding contiguous memory, indexing, and fundamental operations.',
          bullets: [
            'Fixed Contiguous Memory: Elements are stored sequentially at contiguous memory addresses with O(1) index-based access.',
            'Time Complexities: Access O(1), Search O(N) (or O(log N) if sorted), Insertion/Deletion at end O(1) amortized, at beginning/middle O(N).',
            'Space Complexity: O(N) linear space for N elements.',
            'Static vs Dynamic Arrays: Fixed arrays in C++/Java vs Dynamic Resizable Lists/Vectors with 2x capacity doubling.'
          ],
          keyNotes: 'Essential for technical coding screens because 40%+ of coding rounds begin with array/string manipulation questions.'
        },
        concepts: {
          title: 'Core Array Algorithms & Progressive Sub-patterns',
          summary: 'Mastering the 5 progressive techniques required for high-performance array manipulation.',
          subPatterns: [
            {
              name: '1. Array Traversal & Linear Scanning',
              desc: 'Single-pass traversal to compute accumulators, maximum/minimum elements, and running aggregates.'
            },
            {
              name: '2. Searching (Linear & Binary Search)',
              desc: 'Linear search on unsorted collections vs O(log N) Binary Search on sorted sequences with boundary adjustments.'
            },
            {
              name: '3. Sorting Algorithms',
              desc: 'Comparison-based sorting (QuickSort, MergeSort in O(N log N)) and non-comparison sorting (Counting/Radix Sort).'
            },
            {
              name: '4. Two Pointer Technique',
              desc: 'Converging pointers (left & right moving toward center) or same-direction fast & slow pointers to eliminate nested O(N²) loops.'
            },
            {
              name: '5. Sliding Window Pattern',
              desc: 'Maintaining a dynamic or fixed-size window over a contiguous subarray to compute subarray sums, maximums, or unique character substrings in O(N).'
            }
          ]
        },
        examples: {
          title: 'Step-by-Step Code Examples & Solutions',
          summary: 'Implementation of the Two Pointer & Sliding Window patterns across multiple programming languages.',
          codeSnippets: {
            javascript: `// Two Pointer: Two Sum II (Sorted Array) - O(N) Time, O(1) Space
function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  
  while (left < right) {
    const currentSum = numbers[left] + numbers[right];
    if (currentSum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (currentSum < target) {
      left++; // Need a larger sum
    } else {
      right--; // Need a smaller sum
    }
  }
  return [];
}

// Sliding Window: Maximum Sum Subarray of Size K
function maxSubarraySum(arr, k) {
  let maxSum = 0;
  let windowSum = 0;
  
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // Slide window
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`,
            python: `# Two Pointer: Two Sum II (Sorted Array) - O(N) Time, O(1) Space
def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [left + 1, right + 1]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []

# Sliding Window: Maximum Sum Subarray of Size K
def max_subarray_sum(arr, k):
    if len(arr) < k:
        return 0
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
            cpp: `// Two Pointer: Two Sum II (Sorted Array) in C++
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return {};
}`,
            java: `// Two Pointer: Two Sum II in Java
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{};
    }
}`
          }
        },
        practice: {
          title: 'Curated Benchmark Practice Problems',
          summary: 'Solve these 4 progressive problems to reinforce the concepts.',
          problems: [
            {
              name: 'Contains Duplicate (Easy)',
              strategy: 'Use a Hash Set to track seen numbers in O(N) time and O(N) space.',
              targetComplexity: 'O(N) Time, O(N) Space',
              platform: 'LeetCode #217'
            },
            {
              name: 'Best Time to Buy and Sell Stock (Easy)',
              strategy: 'Track minPrice so far and maxProfit in a single linear pass.',
              targetComplexity: 'O(N) Time, O(1) Space',
              platform: 'LeetCode #121'
            },
            {
              name: '3Sum (Medium)',
              strategy: 'Sort the array, fix one element, and use Two Pointers for remaining two elements.',
              targetComplexity: 'O(N²) Time, O(1) Space',
              platform: 'LeetCode #15'
            },
            {
              name: 'Longest Substring Without Repeating Characters (Medium)',
              strategy: 'Sliding window with hash map storing latest index of each character.',
              targetComplexity: 'O(N) Time, O(min(N, M)) Space',
              platform: 'LeetCode #3'
            }
          ]
        },
        interview: {
          title: 'Company Interview Level Questions & Optimization',
          summary: `High-frequency interview problems tested by companies like ${companyName}.`,
          interviewProblems: [
            {
              title: 'Trapping Rain Water (Hard)',
              pattern: 'Two Pointers with LeftMax and RightMax bounds',
              prompt: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
              optimalSolution: 'Use two pointers from left (0) and right (n-1). Maintain left_max and right_max. Accumulate water at the smaller bound and advance pointer.',
              complexity: 'O(N) Time, O(1) Space (Optimal)'
            },
            {
              title: 'Sliding Window Maximum (Hard)',
              pattern: 'Monotonic Decreasing Deque',
              prompt: 'Given an array nums and sliding window size k, return the max in each window.',
              optimalSolution: 'Use a double-ended queue storing indices in decreasing order of element values. Pop expired indices and smaller elements in O(1) amortized per step.',
              complexity: 'O(N) Time, O(K) Space'
            }
          ],
          interviewTips: [
            'Clarify if the array is sorted before choosing between Binary Search or Hash Map.',
            'Always ask if duplicate values or negative numbers are allowed in the input.',
            'Communicate the brute force O(N²) approach first, then explain how Two Pointers / Sliding Window reduces it to O(N).'
          ]
        }
      }
    },
    hashing: {
      id: 'hashing',
      title: 'Hash Tables, Sets & Maps',
      subtitle: 'O(1) average lookup, key-value hashing functions, and frequency count patterns',
      category: 'Data Structures',
      skillsMatched: ['Data Structures', 'Algorithms', 'Python', 'Java', 'Backend'],
      stages: {
        basics: {
          title: 'Hashing Basics & Collision Resolution',
          summary: 'Understanding hash functions, buckets, and load factor trade-offs.',
          bullets: [
            'Hash Function: Maps arbitrary keys to fixed integer indices in an internal bucket array.',
            'Average Time Complexities: Insert O(1), Search O(1), Delete O(1). Worst Case: O(N) when multiple collisions occur.',
            'Collision Resolution: Separate Chaining (linked lists/red-black trees per bucket) vs Open Addressing (linear/quadratic probing).',
            'Space Overhead: Requires extra memory (load factor threshold ~0.75 before resizing).'
          ],
          keyNotes: 'Crucial for reducing nested loops from O(N²) to O(N) in corporate technical interviews.'
        },
        concepts: {
          title: 'Hashing Sub-patterns & Usage Concepts',
          summary: 'Core techniques using hash tables for coding interviews.',
          subPatterns: [
            { name: '1. Frequency Counter', desc: 'Counting character/word occurrences to check anagrams, majorities, and frequency ranks.' },
            { name: '2. Complement Lookup (Two Sum)', desc: 'Storing target - x in a hash map to find pair matches in a single pass.' },
            { name: '3. Grouping & Categorization', desc: 'Using sorted strings or tuple representations as map keys to group related items.' },
            { name: '4. Prefix Sum Map', desc: 'Storing running prefix sums to find subarrays matching sum target K in O(N).' }
          ]
        },
        examples: {
          title: 'Code Example: Group Anagrams',
          summary: 'Grouping words with identical character frequencies.',
          codeSnippets: {
            javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.values());
}`,
            python: `from collections import defaultdict

def group_anagrams(strs):
    anagram_map = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        anagram_map[key].append(s)
    return list(anagram_map.values())`,
            cpp: `#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> mp;
    for (string& s : strs) {
        string t = s;
        sort(t.begin(), t.end());
        mp[t].push_back(s);
    }
    vector<vector<string>> res;
    for (auto& p : mp) res.push_back(p.second);
    return res;
}`,
            java: `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
          }
        },
        practice: {
          title: 'Benchmark Practice Problems',
          summary: 'Solve these key hashing challenges.',
          problems: [
            { name: 'Two Sum (Easy)', strategy: 'One pass hash map storing { value: index }', targetComplexity: 'O(N) Time, O(N) Space', platform: 'LeetCode #1' },
            { name: 'Valid Anagram (Easy)', strategy: 'Count array of size 26 or hash map', targetComplexity: 'O(N) Time, O(1) Space', platform: 'LeetCode #242' },
            { name: 'Subarray Sum Equals K (Medium)', strategy: 'Prefix sum hash map storing prefix sum frequencies', targetComplexity: 'O(N) Time, O(N) Space', platform: 'LeetCode #560' },
            { name: 'Longest Consecutive Sequence (Medium)', strategy: 'Hash set with sequence starter check (x - 1 not in set)', targetComplexity: 'O(N) Time, O(N) Space', platform: 'LeetCode #128' }
          ]
        },
        interview: {
          title: 'Company Interview Level Scenarios',
          summary: 'Advanced hashing and caching architectures.',
          interviewProblems: [
            {
              title: 'LRU Cache Implementation (Medium - Hard)',
              pattern: 'Hash Map + Doubly Linked List',
              prompt: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put.',
              optimalSolution: 'Combine a Hash Map (for O(1) key lookup) with a Doubly Linked List (for O(1) node removal and insertion to head).',
              complexity: 'O(1) Time for get and put, O(Capacity) Space'
            }
          ],
          interviewTips: [
            'Discuss collision handling techniques if the interviewer asks what happens under worst-case inputs.',
            'Always mention space-time tradeoffs when introducing a Hash Map.'
          ]
        }
      }
    },
    trees: {
      id: 'trees',
      title: 'Trees, Binary Search Trees & Traversals',
      subtitle: 'Hierarchical node representations, BFS/DFS traversals, and recursive invariants',
      category: 'Data Structures & Algorithms',
      skillsMatched: ['Data Structures', 'C++', 'Java', 'Algorithms'],
      stages: {
        basics: {
          title: 'Tree Basics & Node Structure',
          summary: 'Nodes with left and right child pointers forming acyclic hierarchical graphs.',
          bullets: [
            'Binary Tree: Each node has at most 2 children (left and right).',
            'Binary Search Tree (BST): For every node, all left subtree values < node value < all right subtree values.',
            'Height & Depth: Height is max edges from node to leaf; Depth is edges from root to node.',
            'Balanced BST (AVL / Red-Black): Guarantees O(log N) search, insertion, and deletion.'
          ],
          keyNotes: 'Forms the backbone of technical rounds for engineering and systems roles.'
        },
        concepts: {
          title: 'Tree Traversal Techniques & Recursion',
          summary: 'The 4 fundamental tree traversal orders.',
          subPatterns: [
            { name: '1. Inorder Traversal (Left, Root, Right)', desc: 'Produces sorted sequence on a Binary Search Tree (BST).' },
            { name: '2. Preorder Traversal (Root, Left, Right)', desc: 'Useful for cloning trees or prefix mathematical notation.' },
            { name: '3. Postorder Traversal (Left, Right, Root)', desc: 'Bottom-up computation: calculating tree height, subtree sizes, or deleting trees.' },
            { name: '4. Level Order Traversal (BFS)', desc: 'Breadth-First Search using a Queue to visit nodes level by level.' }
          ]
        },
        examples: {
          title: 'Code Example: Maximum Depth & Inorder Traversal',
          summary: 'Recursive and iterative tree processing.',
          codeSnippets: {
            javascript: `// Maximum Depth of Binary Tree (Recursive DFS)
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Level Order Traversal (BFS using Queue)
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`,
            python: `# Maximum Depth of Binary Tree
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# Level Order Traversal (BFS)
from collections import deque

def level_order(root):
    if not root:
        return []
    res, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        res.append(level)
    return res`,
            cpp: `#include <algorithm>
#include <vector>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
};

int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root.left), maxDepth(root.right));
}`,
            java: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
}

class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`
          }
        },
        practice: {
          title: 'Benchmark Tree Problems',
          summary: 'Essential tree questions for campus placement tests.',
          problems: [
            { name: 'Invert Binary Tree (Easy)', strategy: 'Recursive postorder swap left and right pointers', targetComplexity: 'O(N) Time, O(H) Space', platform: 'LeetCode #226' },
            { name: 'Same Tree (Easy)', strategy: 'Simultaneous recursion verifying root values and subtrees', targetComplexity: 'O(N) Time, O(H) Space', platform: 'LeetCode #100' },
            { name: 'Lowest Common Ancestor of a BST (Medium)', strategy: 'Compare root value with p and q to navigate left or right', targetComplexity: 'O(H) Time, O(1) Space', platform: 'LeetCode #235' },
            { name: 'Validate Binary Search Tree (Medium)', strategy: 'Inorder traversal or passing (min, max) boundary constraints', targetComplexity: 'O(N) Time, O(H) Space', platform: 'LeetCode #98' }
          ]
        },
        interview: {
          title: 'Company Interview Scenarios',
          summary: 'Advanced tree serialization and path problems.',
          interviewProblems: [
            {
              title: 'Binary Tree Maximum Path Sum (Hard)',
              pattern: 'Bottom-Up Postorder DFS',
              prompt: 'A path in a binary tree is a sequence of nodes where each pair has an edge. Return max path sum of any non-empty path.',
              optimalSolution: 'Compute max gain from left and right subtrees (clamped at 0). Update global max with root.val + leftGain + rightGain.',
              complexity: 'O(N) Time, O(H) Space'
            }
          ],
          interviewTips: [
            'State base cases explicitly (null checks) before writing recursive calls.',
            'Explain how call stack memory O(H) behaves on skewed trees vs balanced trees.'
          ]
        }
      }
    },
    dp: {
      id: 'dp',
      title: 'Dynamic Programming & Memoization',
      subtitle: 'Optimal substructure, overlapping subproblems, and state transition equations',
      category: 'Advanced Algorithms',
      skillsMatched: ['Algorithms', 'Data Structures', 'C++', 'Python'],
      stages: {
        basics: {
          title: 'DP Fundamentals: Top-Down vs Bottom-Up',
          summary: 'Converting exponential recursive algorithms into polynomial time solutions.',
          bullets: [
            'Overlapping Subproblems: The same subproblems are solved repeatedly.',
            'Optimal Substructure: An optimal solution to the problem contains optimal solutions to subproblems.',
            'Top-Down Memoization: Start at target and cache recursive return values.',
            'Bottom-Up Tabulation: Start at base cases (e.g. dp[0], dp[1]) and build iteratively.'
          ],
          keyNotes: 'Distinguishes elite tier candidates in technical rounds.'
        },
        concepts: {
          title: 'Core DP Frameworks & Patterns',
          summary: 'The 4 standard dynamic programming categories.',
          subPatterns: [
            { name: '1. 1D Array DP (Fibonacci / Climbing Stairs)', desc: 'State depends only on previous 1 or 2 steps. Space can be optimized from O(N) to O(1).' },
            { name: '2. 0/1 Knapsack & Subset Sum', desc: 'Deciding whether to include or exclude an element with weight and capacity limits.' },
            { name: '3. Longest Common Subsequence (LCS)', desc: '2D grid comparison between two strings for matching characters.' },
            { name: '4. Interval & Grid DP', desc: 'Moving from top-left to bottom-right in minimum cost grid traversals.' }
          ]
        },
        examples: {
          title: 'Code Example: Climbing Stairs & Coin Change',
          summary: 'Bottom-up DP implementations.',
          codeSnippets: {
            javascript: `// Climbing Stairs: Bottom-Up O(N) Time, O(1) Space
function climbStairs(n) {
  if (n <= 2) return n;
  let prev1 = 1, prev2 = 2;
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev1 = prev2;
    prev2 = current;
  }
  return prev2;
}

// Coin Change: Minimum coins to make amount
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (i - c >= 0) {
        dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
            python: `# Climbing Stairs
def climb_stairs(n):
    if n <= 2:
        return n
    prev1, prev2 = 1, 2
    for _ in range(3, n + 1):
        prev1, prev2 = prev2, prev1 + prev2
    return prev2

# Coin Change (Bottom-up DP)
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
            cpp: `#include <vector>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int c : coins) {
            if (i - c >= 0) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
            java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (i - c >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
          }
        },
        practice: {
          title: 'Benchmark DP Problems',
          summary: 'Key dynamic programming problems.',
          problems: [
            { name: 'House Robber (Medium)', strategy: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])', targetComplexity: 'O(N) Time, O(1) Space', platform: 'LeetCode #198' },
            { name: 'Longest Increasing Subsequence (Medium)', strategy: 'Binary search with patience sorting or O(N²) DP', targetComplexity: 'O(N log N) Time, O(N) Space', platform: 'LeetCode #300' },
            { name: 'Longest Common Subsequence (Medium)', strategy: '2D matrix comparing characters s1[i] == s2[j]', targetComplexity: 'O(M*N) Time, O(M*N) Space', platform: 'LeetCode #1143' }
          ]
        },
        interview: {
          title: 'Company Interview Level Questions',
          summary: 'Advanced DP questions in top tech interviews.',
          interviewProblems: [
            {
              title: 'Edit Distance (Hard)',
              pattern: '2D Dynamic Programming',
              prompt: 'Given two strings word1 and word2, return minimum number of operations (insert, delete, replace) to convert word1 to word2.',
              optimalSolution: 'If word1[i] == word2[j], dp[i][j] = dp[i-1][j-1]. Otherwise 1 + min(insert, delete, replace).',
              complexity: 'O(M * N) Time, O(M * N) Space'
            }
          ],
          interviewTips: [
            'Define your DP state variable explicitly: "Let dp[i] represent the minimum cost to reach step i."',
            'Always verify boundary cases: dp[0], empty inputs, or unreachable amounts.'
          ]
        }
      }
    }
  };

  const currentTopic = topicDataMap[activeTopicId] || topicDataMap.arrays;
  const stagesList = [
    { id: 'basics', label: '1. Basics', icon: BookOpen },
    { id: 'concepts', label: '2. Concepts', icon: Layers },
    { id: 'examples', label: '3. Examples', icon: FileCode },
    { id: 'practice', label: '4. Practice', icon: Target },
    { id: 'interview', label: '5. Interview Level', icon: Award }
  ];

  // Calculate overall progress across 5 stages for current topic
  const currentTopicCompletedCount = stagesList.filter(st => completedStages[`${selectedOppId}_${currentTopic.id}_${st.id}`]).length;
  const topicProgressPercent = Math.round((currentTopicCompletedCount / stagesList.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 text-left">
      
      {/* ── TOP NAVIGATION BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link 
              to="/company-prep" 
              className="text-xs font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center space-x-1 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Company Preparation Hub</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Code2 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            <span>Topic Learning: 5-Stage Progressive Flow</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Basics → Concepts → Examples → Practice → Interview Level for <strong>{companyName}</strong> ({roleTitle}).
          </p>
        </div>

        {/* Company Opportunity Quick Selector */}
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-purple-500 shrink-0" />
          <select
            value={selectedOppId}
            onChange={(e) => {
              setSelectedOppId(e.target.value);
              setSearchParams({ oppId: e.target.value, topicId: activeTopicId });
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 cursor-pointer shadow-xs max-w-[220px] truncate"
          >
            {opportunities.map(opp => (
              <option key={opp._id} value={opp._id}>
                {opp.companyId?.companyName || opp.companyName || 'Company'} — {opp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TOPIC SELECTOR TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.values(topicDataMap).map(topic => {
          const isSelected = activeTopicId === topic.id;
          const completedCount = stagesList.filter(st => completedStages[`${selectedOppId}_${topic.id}_${st.id}`]).length;
          return (
            <button
              key={topic.id}
              onClick={() => {
                setActiveTopicId(topic.id);
                setSearchParams({ oppId: selectedOppId, topicId: topic.id });
              }}
              className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/10 shadow-md shadow-purple-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400/40'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase block">
                  {topic.category}
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                  {topic.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Stages: {completedCount}/5</span>
                <span className={`font-bold ${completedCount === 5 ? 'text-emerald-500' : 'text-purple-500'}`}>
                  {completedCount === 5 ? '✓ Mastered' : `${Math.round((completedCount / 5) * 100)}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 5-STAGE PROGRESSIVE FLOW STEPPER HEADER ── */}
      <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-white dark:bg-slate-900 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold uppercase">
                Active Learning Track
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Company Target: <strong className="text-slate-800 dark:text-white">{companyName}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {currentTopic.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentTopic.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">Topic Progress</span>
              <span className="font-black text-purple-600 dark:text-purple-400 text-base">{topicProgressPercent}%</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-black text-sm border border-purple-500/20">
              {currentTopicCompletedCount}/5
            </div>
          </div>
        </div>

        {/* 5-Stage Stepper Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {stagesList.map((st) => {
            const isStageActive = activeStage === st.id;
            const isDone = Boolean(completedStages[`${selectedOppId}_${currentTopic.id}_${st.id}`]);
            return (
              <button
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isStageActive
                    ? 'border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : isDone
                      ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-purple-400/40'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <st.icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold font-mono">{st.label}</span>
                </div>
                {isDone && <CheckCircle2 className={`h-4 w-4 shrink-0 ${isStageActive ? 'text-white' : 'text-emerald-500'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STAGE CONTENT VIEWER ── */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
        
        {/* Stage 1: Basics */}
        {activeStage === 'basics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Stage 1 of 5: Fundamentals
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentTopic.stages.basics.title}
                </h3>
              </div>

              <button
                onClick={() => toggleStageCompleted(`${selectedOppId}_${currentTopic.id}_basics`)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-500/30 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
              >
                {completedStages[`${selectedOppId}_${currentTopic.id}_basics`] ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-purple-400" />
                    <span>Mark Stage Done</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {currentTopic.stages.basics.summary}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white">
                Core Architectural Principles:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTopic.stages.basics.bullets.map((b, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">#0{idx + 1}</span>
                    <p className="leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 font-medium flex items-center space-x-2.5">
              <Lightbulb className="h-5 w-5 text-purple-500 shrink-0" />
              <span>{currentTopic.stages.basics.keyNotes}</span>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveStage('concepts')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <span>Proceed to Concepts</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Concepts */}
        {activeStage === 'concepts' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Stage 2 of 5: Deep Concepts & Sub-Patterns
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentTopic.stages.concepts.title}
                </h3>
              </div>

              <button
                onClick={() => toggleStageCompleted(`${selectedOppId}_${currentTopic.id}_concepts`)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-500/30 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
              >
                {completedStages[`${selectedOppId}_${currentTopic.id}_concepts`] ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-purple-400" />
                    <span>Mark Stage Done</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {currentTopic.stages.concepts.summary}
            </p>

            <div className="space-y-3">
              {currentTopic.stages.concepts.subPatterns.map((pat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
                    {pat.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pat.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveStage('basics')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Basics</span>
              </button>
              <button
                onClick={() => setActiveStage('examples')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <span>Proceed to Examples</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Examples */}
        {activeStage === 'examples' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Stage 3 of 5: Code Walkthrough
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentTopic.stages.examples.title}
                </h3>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase text-slate-400">Language:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['javascript', 'python', 'cpp', 'java'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                        codeLanguage === lang
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => toggleStageCompleted(`${selectedOppId}_${currentTopic.id}_examples`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-500/30 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shrink-0"
                >
                  {completedStages[`${selectedOppId}_${currentTopic.id}_examples`] ? (
                    <>
                      <CheckSquare className="h-4 w-4 text-emerald-500" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4 text-purple-400" />
                      <span>Mark Done</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {currentTopic.stages.examples.summary}
            </p>

            {/* Code Block Container */}
            <div className="rounded-2xl border border-slate-800 bg-[#0b101b] p-4 sm:p-5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="h-3.5 w-3.5 text-purple-400" />
                  <span>solution.{codeLanguage === 'cpp' ? 'cpp' : codeLanguage === 'python' ? 'py' : codeLanguage === 'java' ? 'java' : 'js'}</span>
                </span>
                <span className="text-[10px] text-purple-400 font-bold uppercase">Optimal Solution</span>
              </div>
              <pre className="leading-relaxed whitespace-pre font-mono">
                <code>{currentTopic.stages.examples.codeSnippets[codeLanguage] || currentTopic.stages.examples.codeSnippets.javascript}</code>
              </pre>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveStage('concepts')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Concepts</span>
              </button>
              <button
                onClick={() => setActiveStage('practice')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <span>Proceed to Practice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Practice */}
        {activeStage === 'practice' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Stage 4 of 5: Benchmark Practice
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentTopic.stages.practice.title}
                </h3>
              </div>

              <button
                onClick={() => toggleStageCompleted(`${selectedOppId}_${currentTopic.id}_practice`)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-500/30 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
              >
                {completedStages[`${selectedOppId}_${currentTopic.id}_practice`] ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-purple-400" />
                    <span>Mark Stage Done</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {currentTopic.stages.practice.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTopic.stages.practice.problems.map((prob, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {prob.platform}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {prob.targetComplexity}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {prob.name}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-300">Strategy:</strong> {prob.strategy}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/skills')}
                    className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-between cursor-pointer"
                  >
                    <span>Test in Skills Module</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveStage('examples')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Examples</span>
              </button>
              <button
                onClick={() => setActiveStage('interview')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <span>Proceed to Interview Level</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 5: Interview Level */}
        {activeStage === 'interview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Stage 5 of 5: Company Interview Standards
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentTopic.stages.interview.title}
                </h3>
              </div>

              <button
                onClick={() => toggleStageCompleted(`${selectedOppId}_${currentTopic.id}_interview`)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-500/30 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
              >
                {completedStages[`${selectedOppId}_${currentTopic.id}_interview`] ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-purple-400" />
                    <span>Mark Stage Done</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {currentTopic.stages.interview.summary}
            </p>

            <div className="space-y-4">
              {currentTopic.stages.interview.interviewProblems.map((prob, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-purple-600 dark:text-purple-400">{prob.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-extrabold">
                      Pattern: {prob.pattern}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{prob.prompt}</p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <strong className="text-emerald-600 dark:text-emerald-400">Optimal Approach:</strong> {prob.optimalSolution}
                    <div className="text-right font-mono text-[10px] text-purple-500 font-bold pt-1">{prob.complexity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interview Communication Tips */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-xs font-black uppercase font-mono text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                <span>Interviewer Evaluation Checklist:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {currentTopic.stages.interview.interviewTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveStage('practice')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Practice</span>
              </button>
              
              <button
                onClick={() => navigate('/skills')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>Take Skills Assessment</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
