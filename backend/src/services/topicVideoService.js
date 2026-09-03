import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { EdgeTTS } from 'node-edge-tts';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const VIDEOS_CACHE_DIR = path.join(__dirname, '../../public/topic_videos');
const SCRATCH_DIR = path.join(__dirname, '../../uploads/video_scratch');

// Ensure directories exist
if (!fs.existsSync(VIDEOS_CACHE_DIR)) {
  fs.mkdirSync(VIDEOS_CACHE_DIR, { recursive: true });
}
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

/**
 * Structured 9-Chapter Educational Curricula for Core DSA Topics
 */
const TOPIC_CURRICULA = {
  arrays: {
    title: 'Arrays & Two Pointers',
    chapters: [
      {
        id: 'intro',
        title: 'Introduction to Arrays',
        narration: 'Welcome to this comprehensive lesson on Arrays and Two Pointer algorithms. Arrays are the most fundamental contiguous data structure in computer science.',
        bullets: ['Contiguous Memory Allocation', 'Constant Time O(1) Index Access', 'CPU Cache Locality Benefits']
      },
      {
        id: 'concept',
        title: 'Memory Concept & Addressing',
        narration: 'In an array, each element is stored at a sequential memory offset. The memory address of any element at index i is calculated directly as base address plus i multiplied by the size of the data type.',
        bullets: ['Address Formula: Base + i * SizeOf(Type)', 'Zero-Indexed Pointer Arithmetic', 'Static Sizing vs Dynamic Vectors']
      },
      {
        id: 'visual',
        title: 'Visual Memory Diagram',
        narration: 'Here is a memory layout of an integer array. Notice how index 0, 1, 2, 3, and 4 reside adjacent to one another in physical RAM.',
        code: `int arr[5] = {10, 20, 30, 40, 50};\n// RAM Address: 0x1000, 0x1004, 0x1008, 0x100C, 0x1010`
      },
      {
        id: 'algorithm',
        title: 'Two Pointer Technique',
        narration: 'The Two Pointer pattern uses two reference indices traversing the array inward or in parallel. This eliminates quadratic nested loops, reducing time complexity from O of N squared to linear O of N.',
        bullets: ['Converging Pointers: Left at start, Right at end', 'Fast and Slow Pointers for Cycle Detection', 'Sliding Window for Running Subarray Calculations']
      },
      {
        id: 'code',
        title: 'Code Implementation',
        narration: 'Let us inspect the optimal two pointer code for searching a pair sum in a sorted array. We compare the sum of left and right elements, shifting left if sum is smaller than target, or right if sum is larger.',
        code: `int left = 0, right = n - 1;\nwhile (left < right) {\n    int sum = nums[left] + nums[right];\n    if (sum == target) return {left + 1, right + 1};\n    else if (sum < target) left++;\n    else right--;\n}`
      },
      {
        id: 'complexity',
        title: 'Time & Space Complexity',
        narration: 'Evaluating complexity: Accessing by index takes O of 1 time. Linear search takes O of N. The Two Pointer convergence processes each element at most once in O of N time with O of 1 auxiliary space.',
        bullets: ['Random Access: O(1) Time', 'Two Pointer Traversal: O(N) Time', 'Auxiliary Space: O(1) In-Place']
      },
      {
        id: 'mistakes',
        title: 'Common Traps & Mistakes',
        narration: 'Watch out for three common pitfalls: off-by-one index bounds causing segfaults, assuming an array is sorted when it is unsorted, and modifying arrays during iteration.',
        bullets: ['Off-By-One Errors (Accessing arr[N])', 'Unsorted Input Assumptions', 'Re-allocation Overhead in Vectors']
      },
      {
        id: 'interview',
        title: 'Company Interview Patterns',
        narration: 'In product company interviews, array problems test your ability to avoid quadratic time using Prefix Sums, Two Pointers, and Sliding Windows.',
        bullets: ['Two Sum II & 3Sum', 'Trapping Rain Water', 'Longest Substring Without Repeating Characters']
      },
      {
        id: 'practice',
        title: 'Practice & Next Steps',
        narration: 'You are now ready to practice array problems in the coding arena. Apply the two pointer technique to solve the benchmark problems step by step.',
        bullets: ['Solve Easy & Medium Problems', 'Run Code Against Custom Test Cases', 'Complete the Timed Assessment']
      }
    ]
  },
  hashing: {
    title: 'Hash Tables & Sets',
    chapters: [
      {
        id: 'intro',
        title: 'Introduction to Hashing',
        narration: 'Welcome to this lesson on Hash Tables and Sets. Hashing provides average constant-time lookups, making it the most powerful tool for algorithm optimization.',
        bullets: ['Key-Value Associative Mappings', 'O(1) Average Search, Insert & Delete', 'Transforming O(N^2) to O(N)']
      },
      {
        id: 'concept',
        title: 'Hash Functions & Buckets',
        narration: 'A Hash Function converts an arbitrary key into an integer bucket index within a fixed-size table array.',
        bullets: ['Hash Index = HashCode(Key) % BucketCount', 'Uniform Key Distribution', 'Collision Resolution: Chaining vs Open Addressing']
      },
      {
        id: 'visual',
        title: 'Bucket & Chaining Diagram',
        narration: 'When two keys map to the same bucket index, separate chaining connects entries in a linked list or red-black tree at that bucket.',
        code: `unordered_map<string, int> freq;\nfreq["apple"] = 3;\nfreq["banana"] = 5;`
      },
      {
        id: 'algorithm',
        title: 'Complement Lookup Pattern',
        narration: 'Instead of searching nested loops for target minus x, we record visited elements in a hash table and check complement existence in O of 1 time.',
        bullets: ['Complement = Target - CurrentValue', 'Single-Pass Evaluation', 'Frequency Table Counters']
      },
      {
        id: 'code',
        title: 'Code Implementation',
        narration: 'Here is the canonical one-pass Two Sum algorithm utilizing an unordered map to look up previous elements.',
        code: `unordered_map<int, int> seen;\nfor (int i = 0; i < n; i++) {\n    int comp = target - nums[i];\n    if (seen.count(comp)) return {seen[comp], i};\n    seen[nums[i]] = i;\n}`
      },
      {
        id: 'complexity',
        title: 'Time & Space Complexity',
        narration: 'On average, hash table lookups take O of 1 time. The auxiliary space complexity is O of N to store keys and buckets.',
        bullets: ['Average Lookup: O(1)', 'Worst Case (Collisions): O(N)', 'Space Complexity: O(N)']
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        narration: 'Common mistakes include assuming keys are ordered, using unhashable data structures as keys, and failing to handle heavy hash collisions.',
        bullets: ['Assuming Sorted Order in Hash Maps', 'Overhead of High Load Factor', 'Modifying Keys While Stored']
      },
      {
        id: 'interview',
        title: 'Interview Patterns',
        narration: 'Top tech interviews frequently ask Subarray Sum Equals K and LRU Cache design combining hash maps with doubly linked lists.',
        bullets: ['Subarray Sum Equals K (Prefix Sum Map)', 'Group Anagrams', 'LRU Cache Design']
      },
      {
        id: 'practice',
        title: 'Practice Introduction',
        narration: 'Now continue to the coding arena to practice hash map algorithms and solve topic problems.',
        bullets: ['One-Pass Hash Map Algorithms', 'Frequency Counting', 'Test Case Validation']
      }
    ]
  },
  trees: {
    title: 'Trees & Binary Search Trees',
    chapters: [
      {
        id: 'intro',
        title: 'Introduction to Trees',
        narration: 'Welcome to this lesson on Trees and Binary Search Trees. Trees are hierarchical non-linear data structures consisting of connected nodes.',
        bullets: ['Root, Parent, and Child Relationships', 'Binary Tree: Max 2 Children Per Node', 'BST Invariant: Left < Root < Right']
      },
      {
        id: 'concept',
        title: 'Recursive Properties & Traversals',
        narration: 'Trees are inherently recursive. Every child node is the root of its own subtree. Traversals include Preorder, Inorder, and Postorder.',
        bullets: ['Preorder: Root -> Left -> Right', 'Inorder: Left -> Root -> Right (Sorted in BST)', 'Postorder: Left -> Right -> Root (Bottom-up)']
      },
      {
        id: 'visual',
        title: 'Node Structure & Pointer Layout',
        narration: 'Here is the standard TreeNode structure containing a value and left and right child pointers.',
        code: `struct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};`
      },
      {
        id: 'algorithm',
        title: 'Level Order & DFS Search',
        narration: 'Breadth First Search processes nodes layer by layer using a FIFO queue, while Depth First Search uses the recursion call stack.',
        bullets: ['BFS with Queue: Level by Level', 'DFS with Recursion: Subtree Reduction', 'Lowest Common Ancestor Resolution']
      },
      {
        id: 'code',
        title: 'Code Implementation',
        narration: 'Here is the recursive DFS function to calculate the maximum depth of a binary tree in linear time.',
        code: `int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}`
      },
      {
        id: 'complexity',
        title: 'Time & Space Complexity',
        narration: 'Traversal processes each node once in O of N time. Space complexity is O of H where H is the height of the tree.',
        bullets: ['Traversal Time: O(N)', 'Balanced BST Search: O(log N)', 'Auxiliary Space: O(H) Call Stack']
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        narration: 'Watch out for forgetting null base cases, or checking only direct children instead of entire subtree ranges when validating a BST.',
        bullets: ['Missing Null Root Guard', 'Invalid BST Range Bounds', 'Confusing BFS Queue with DFS Stack']
      },
      {
        id: 'interview',
        title: 'Interview Patterns',
        narration: 'Tree questions are prominent in FAANG rounds, including Lowest Common Ancestor, Path Sum, and Binary Tree Zigzag traversal.',
        bullets: ['Lowest Common Ancestor (LCA)', 'Validate Binary Search Tree', 'Binary Tree Maximum Path Sum']
      },
      {
        id: 'practice',
        title: 'Practice Introduction',
        narration: 'Proceed to the coding arena to implement recursive tree traversals and solve interview problems.',
        bullets: ['Implement Tree Traversals', 'Solve Depth & Diameter Problems', 'Verify Solution Correctness']
      }
    ]
  },
  dp: {
    title: 'Dynamic Programming',
    chapters: [
      {
        id: 'intro',
        title: 'Introduction to Dynamic Programming',
        narration: 'Welcome to this lesson on Dynamic Programming. Dynamic programming is an optimization technique that transforms exponential brute force into polynomial time.',
        bullets: ['Overlapping Subproblems', 'Optimal Substructure Property', 'Memoization vs Tabulation']
      },
      {
        id: 'concept',
        title: 'Memoization vs Tabulation',
        narration: 'Top-down memoization adds a cache array to recursive calls. Bottom-up tabulation iteratively fills a table starting from base cases.',
        bullets: ['Top-Down: Recursion + Lookup Cache', 'Bottom-Up: Iterative Table Formulation', 'State Space Optimization']
      },
      {
        id: 'visual',
        title: 'Recurrence Relation Formulation',
        narration: 'Consider climbing stairs where you can take 1 or 2 steps. The recurrence is dp of i equals dp of i minus 1 plus dp of i minus 2.',
        code: `int dp[n + 1];\ndp[1] = 1; dp[2] = 2;\nfor (int i = 3; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n}`
      },
      {
        id: 'algorithm',
        title: 'Knapsack & 2D Matrix DP',
        narration: 'In Knapsack and string alignment problems, decision states determine whether to include or exclude an item at index i.',
        bullets: ['0/1 Knapsack: Include vs Exclude Item', 'Longest Common Subsequence (LCS)', 'State Compression from 2D to 1D']
      },
      {
        id: 'code',
        title: 'Code Implementation',
        narration: 'Here is the bottom-up solution for Coin Change finding the minimum coins needed to make a specific amount.',
        code: `vector<int> dp(amount + 1, amount + 1);\ndp[0] = 0;\nfor (int i = 1; i <= amount; i++) {\n    for (int c : coins) {\n        if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);\n    }\n}\nreturn dp[amount] > amount ? -1 : dp[amount];`
      },
      {
        id: 'complexity',
        title: 'Time & Space Complexity',
        narration: 'Time complexity equals the number of distinct states multiplied by transitions per state. Space equals table size, often optimizable to O of N.',
        bullets: ['Time: O(States * Transitions)', 'Space: O(States) Table Size', 'Space Optimization: 1D Rolling Array']
      },
      {
        id: 'mistakes',
        title: 'Common Mistakes',
        narration: 'Avoid missing base cases, initializing with incorrect sentinel values, and recomputing states that should be cached.',
        bullets: ['Incorrect Base Case Assignment', 'Integer Overflow on Infinity Values', 'Overlapping State Confusion']
      },
      {
        id: 'interview',
        title: 'Interview Patterns',
        narration: 'Dynamic programming is the ultimate differentiator in product company interviews, covering House Robber, Edit Distance, and Knapsack.',
        bullets: ['Coin Change & Knapsack', 'Longest Increasing Subsequence', 'Edit Distance Matrix DP']
      },
      {
        id: 'practice',
        title: 'Practice Introduction',
        narration: 'Now practice writing clean DP recurrence relations in the coding arena and run your solutions.',
        bullets: ['Formulate State Recurrence', 'Optimize Space Complexity', 'Validate Against Edge Test Cases']
      }
    ]
  }
};

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate clean SVG slide for a video chapter
 */
function generateSlideSvg(topicTitle, chapter, index, totalChapters) {
  const chapterNumber = `CHAPTER ${index + 1} OF ${totalChapters}`;
  const title = escapeXml(chapter.title);
  const topicUpper = escapeXml(topicTitle.toUpperCase());

  let contentSvg = '';
  if (chapter.code) {
    const escapedCode = chapter.code
      .split('\n')
      .map((line, li) => `<tspan x="100" dy="${li === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`)
      .join('');

    contentSvg = `
      <rect x="70" y="280" width="1780" height="660" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2" />
      <text x="100" y="360" font-family="monospace" font-size="28" fill="#38bdf8" font-weight="600">
        ${escapedCode}
      </text>
    `;
  } else if (chapter.bullets) {
    const bulletItems = chapter.bullets
      .map((b, bi) => {
        const esc = escapeXml(b);
        const yPos = 340 + bi * 110;
        return `
          <g transform="translate(80, ${yPos})">
            <rect x="0" y="0" width="1760" height="85" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
            <circle cx="45" cy="42" r="10" fill="#7c3aed" />
            <text x="80" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" fill="#f8fafc" font-weight="600">
              ${esc}
            </text>
          </g>
        `;
      })
      .join('');

    contentSvg = bulletItems;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1920" height="1080" fill="url(#bg)" />
      
      <!-- Top Banner -->
      <rect x="0" y="0" width="1920" height="14" fill="#7c3aed" />
      
      <!-- Header -->
      <g transform="translate(80, 100)">
        <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" fill="#94a3b8" font-weight="700" letter-spacing="3">
          ${topicUpper} • ${chapterNumber}
        </text>
        <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" fill="#ffffff" font-weight="800">
          ${title}
        </text>
      </g>

      <!-- Main Visual / Code Content -->
      ${contentSvg}

      <!-- Footer Bar -->
      <g transform="translate(80, 1000)">
        <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" fill="#64748b" font-weight="600">
          Course Topic Video • Technical Interview Preparation
        </text>
      </g>
    </svg>
  `;
}

/**
 * Generate audio narration for a text using Microsoft Edge TTS
 */
async function generateAudio(text, outputPath) {
  try {
    const tts = new EdgeTTS({
      voice: 'en-US-ChristopherNeural',
      lang: 'en-US',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });
    await tts.ttsPromise(text, outputPath);
    return true;
  } catch (err) {
    console.error('Edge TTS Error:', err.message);
    return false;
  }
}

/**
 * Renders an educational video for a DSA topic and caches the MP4
 */
export async function getOrGenerateTopicVideo(topicId) {
  const normId = (topicId || 'arrays').toLowerCase();
  const curriculum = TOPIC_CURRICULA[normId] || TOPIC_CURRICULA.arrays;
  const cachedVideoPath = path.join(VIDEOS_CACHE_DIR, `topic_${normId}.mp4`);
  const publicVideoUrl = `/topic_videos/topic_${normId}.mp4`;

  // 1. If already cached and valid, return immediately
  if (fs.existsSync(cachedVideoPath)) {
    const stats = fs.statSync(cachedVideoPath);
    if (stats.size > 10000) {
      return {
        success: true,
        cached: true,
        videoUrl: publicVideoUrl,
        curriculum
      };
    }
  }

  // 2. Build video components in scratch dir
  const topicScratchDir = path.join(SCRATCH_DIR, `build_${normId}_${Date.now()}`);
  fs.mkdirSync(topicScratchDir, { recursive: true });

  try {
    const chapters = curriculum.chapters;
    const segmentList = [];

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const slideSvg = generateSlideSvg(curriculum.title, ch, i, chapters.length);
      const pngPath = path.join(topicScratchDir, `slide_${i}.png`);
      const audioPath = path.join(topicScratchDir, `audio_${i}.mp3`);
      const segmentMp4Path = path.join(topicScratchDir, `segment_${i}.mp4`);

      // Render crisp 1920x1080 PNG slide
      const resvg = new Resvg(slideSvg, {
        fitTo: { mode: 'width', value: 1920 }
      });
      const pngData = resvg.render();
      fs.writeFileSync(pngPath, pngData.asPng());

      // Generate TTS narration
      const ttsSuccess = await generateAudio(ch.narration, audioPath);
      if (!ttsSuccess || !fs.existsSync(audioPath)) {
        throw new Error(`Failed to generate narration audio for chapter ${i}`);
      }

      // Render chapter segment MP4 using FFmpeg (combining PNG slide with audio narration)
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(pngPath)
          .inputOptions(['-loop 1'])
          .input(audioPath)
          .outputOptions([
            '-c:v libx264',
            '-tune stillimage',
            '-c:a aac',
            '-b:a 128k',
            '-pix_fmt yuv420p',
            '-shortest'
          ])
          .output(segmentMp4Path)
          .on('end', resolve)
          .on('error', (err) => {
            console.error(`FFmpeg Segment ${i} Error:`, err.message);
            reject(err);
          })
          .run();
      });

      segmentList.push(segmentMp4Path);
    }

    // 3. Concatenate all chapter segments into final MP4
    const concatTxtPath = path.join(topicScratchDir, 'concat.txt');
    const concatContent = segmentList.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatTxtPath, concatContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatTxtPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .output(cachedVideoPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg Concat Error:', err.message);
          reject(err);
        })
        .run();
    });

    // Cleanup scratch dir
    try {
      fs.rmSync(topicScratchDir, { recursive: true, force: true });
    } catch (e) {
      // ignore scratch cleanup
    }

    return {
      success: true,
      cached: false,
      videoUrl: publicVideoUrl,
      curriculum
    };
  } catch (error) {
    console.error(`Generate Topic Video Error for ${normId}:`, error.message);
    try {
      fs.rmSync(topicScratchDir, { recursive: true, force: true });
    } catch (e) {}

    return {
      success: false,
      message: 'Video lesson is currently unavailable.',
      curriculum
    };
  }
}
