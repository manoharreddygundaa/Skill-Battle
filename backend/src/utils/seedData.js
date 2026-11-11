export const seedBadges = [
  {
    name: 'Welcome Adventurer',
    slug: 'welcome',
    description: 'Joined the Skill Battle arena and initialized your developer account.',
    icon: 'Sparkles',
    category: 'special',
    criteriaType: 'solved_count',
    criteriaThreshold: 0
  },
  {
    name: 'First Blood',
    slug: 'first-solve',
    description: 'Successfully passed all test cases for your very first coding problem.',
    icon: 'Award',
    category: 'problems',
    criteriaType: 'solved_count',
    criteriaThreshold: 1
  },
  {
    name: 'Problem Hunter',
    slug: 'problem-hunter-5',
    description: 'Demonstrated consistency by solving 5 different coding challenges.',
    icon: 'Target',
    category: 'problems',
    criteriaType: 'solved_count',
    criteriaThreshold: 5
  },
  {
    name: 'Coding Grandmaster',
    slug: 'coding-grandmaster-10',
    description: 'Master of algorithms: successfully conquered 10 coding challenges.',
    icon: 'Trophy',
    category: 'problems',
    criteriaType: 'solved_count',
    criteriaThreshold: 10
  },
  {
    name: 'Streak Igniter',
    slug: 'streak-igniter-3',
    description: 'Maintained a persistent 3-day active coding streak.',
    icon: 'Flame',
    category: 'streaks',
    criteriaType: 'streak_days',
    criteriaThreshold: 3
  },
  {
    name: 'Unstoppable Flame',
    slug: 'streak-unstoppable-7',
    description: 'Maintained a blazing 7-day daily problem solving streak.',
    icon: 'Zap',
    category: 'streaks',
    criteriaType: 'streak_days',
    criteriaThreshold: 7
  },
  {
    name: 'Battle Victor',
    slug: 'battle-first-win',
    description: 'Outcoded your first real-time 1v1 friend battle opponent.',
    icon: 'Swords',
    category: 'battles',
    criteriaType: 'battle_wins',
    criteriaThreshold: 1
  },
  {
    name: 'Arena Champion',
    slug: 'battle-champion-5',
    description: 'Dominated the competitive battle arena with 5 victorious battles.',
    icon: 'Crown',
    category: 'battles',
    criteriaType: 'battle_wins',
    criteriaThreshold: 5
  }
];

export const seedProblems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'twoSum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    sampleTestCases: [
      {
        input: '[2, 7, 11, 15], 9',
        output: '[0, 1]',
        explanation: '2 + 7 equals 9'
      },
      {
        input: '[3, 2, 4], 6',
        output: '[1, 2]',
        explanation: '2 + 4 equals 6'
      }
    ],
    hiddenTestCases: [
      {
        input: '[3, 3], 6',
        output: '[0, 1]'
      },
      {
        input: '[1, 5, 8, 12, 19], 27',
        output: '[2, 4]'
      },
      {
        input: '[-3, 4, 3, 90], 0',
        output: '[0, 2]'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `class Solution:
    def twoSum(nums: list[int], target: int) -> list[int]:
        # Write your code here
        lookup = {}
        for i, num in enumerate(nums):
            comp = target - num
            if comp in lookup:
                return [lookup[comp], i]
            lookup[num] = i
        return []

def twoSum(nums, target):
    return Solution.twoSum(nums, target)
`
    }
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    functionName: 'isValid',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'Standard matching parentheses.'
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets are matched in order.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Opening round bracket closed by square bracket.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    sampleTestCases: [
      {
        input: '"()"',
        output: 'true',
        explanation: 'Simple valid parenthesis'
      },
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'Sequential valid pairs'
      },
      {
        input: '"(]"',
        output: 'false',
        explanation: 'Mismatched closing bracket'
      }
    ],
    hiddenTestCases: [
      {
        input: '"([)]"',
        output: 'false'
      },
      {
        input: '"{[]}"',
        output: 'true'
      },
      {
        input: '""',
        output: 'true'
      },
      {
        input: '"["',
        output: 'false'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    # Write your code here
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
`
    }
  },
  {
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'Easy',
    tags: ['Math'],
    functionName: 'isPalindrome',
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, \`121\` is a palindrome while \`123\` is not.`,
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      }
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    sampleTestCases: [
      {
        input: '121',
        output: 'true'
      },
      {
        input: '-121',
        output: 'false'
      },
      {
        input: '10',
        output: 'false'
      }
    ],
    hiddenTestCases: [
      {
        input: '0',
        output: 'true'
      },
      {
        input: '12321',
        output: 'true'
      },
      {
        input: '1000021',
        output: 'false'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  // Write your code here
  if (x < 0) return false;
  const s = x.toString();
  return s === s.split('').reverse().join('');
}`,
      python: `def isPalindrome(x: int) -> bool:
    # Write your code here
    if x < 0:
        return False
    s = str(x)
    return s == s[::-1]
`
    }
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'maxProfit',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    sampleTestCases: [
      {
        input: '[7, 1, 5, 3, 6, 4]',
        output: '5'
      },
      {
        input: '[7, 6, 4, 3, 1]',
        output: '0'
      }
    ],
    hiddenTestCases: [
      {
        input: '[2, 4, 1]',
        output: '2'
      },
      {
        input: '[1, 2]',
        output: '1'
      },
      {
        input: '[3, 3, 3, 3]',
        output: '0'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Write your code here
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`,
      python: `def maxProfit(prices: list[int]) -> int:
    # Write your code here
    min_price = float('inf')
    max_prof = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_prof:
            max_prof = price - min_price
    return max_prof
`
    }
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    functionName: 'lengthOfLongestSubstring',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    sampleTestCases: [
      {
        input: '"abcabcbb"',
        output: '3'
      },
      {
        input: '"bbbbb"',
        output: '1'
      },
      {
        input: '"pwwkew"',
        output: '3'
      }
    ],
    hiddenTestCases: [
      {
        input: '""',
        output: '0'
      },
      {
        input: '"au"',
        output: '2'
      },
      {
        input: '"dvdf"',
        output: '3'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  let maxLength = 0;
  let start = 0;
  const seen = new Map();
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }
    seen.set(char, i);
    maxLength = Math.max(maxLength, i - start + 1);
  }
  return maxLength;
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len
`
    }
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    functionName: 'maxArea',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.'
      },
      {
        input: 'height = [1,1]',
        output: '1',
        explanation: 'Area between height[0] and height[1] is 1.'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    sampleTestCases: [
      {
        input: '[1, 8, 6, 2, 5, 4, 8, 3, 7]',
        output: '49'
      },
      {
        input: '[1, 1]',
        output: '1'
      }
    ],
    hiddenTestCases: [
      {
        input: '[4, 3, 2, 1, 4]',
        output: '16'
      },
      {
        input: '[1, 2, 1]',
        output: '2'
      },
      {
        input: '[2, 3, 4, 5, 18, 17, 6]',
        output: '17'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your code here
  let maxWater = 0;
  let left = 0;
  let right = height.length - 1;
  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * currentHeight);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}`,
      python: `def maxArea(height: list[int]) -> int:
    # Write your code here
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        w = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, w * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water
`
    }
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    functionName: 'trap',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: '9 units of rain water trapped between bars.'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    sampleTestCases: [
      {
        input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
        output: '6'
      },
      {
        input: '[4, 2, 0, 3, 2, 5]',
        output: '9'
      }
    ],
    hiddenTestCases: [
      {
        input: '[2, 0, 2]',
        output: '2'
      },
      {
        input: '[3, 0, 2, 0, 4]',
        output: '7'
      },
      {
        input: '[5]',
        output: '0'
      }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your code here
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let totalWater = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }
  return totalWater;
}`,
      python: `def trap(height: list[int]) -> int:
    # Write your code here
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                total += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                total += right_max - height[right]
            right -= 1
    return total
`
    }
  }
];

