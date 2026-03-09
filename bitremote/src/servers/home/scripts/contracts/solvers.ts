import { CodingContractSignatures } from "@ns"
type ContractFunctions = {
  [K in keyof CodingContractSignatures]:
  (input: CodingContractSignatures[K][0], ns: NS) => [boolean, CodingContractSignatures[K][1]]
}
export default {
  "Spiralize Matrix": function(input, ns) {
    // https://www.geeksforgeeks.org/dsa/print-a-given-matrix-in-spiral-form/
    const m = input.length;
    const n = input[0].length;

    const res = [];

    let top = 0, bottom = m - 1, left = 0, right = n - 1;

    while (top <= bottom && left <= right) {

      // Print top row from left to right
      for (let i = left; i <= right; ++i) {
        res.push(input[top][i]);
      }
      top++;

      // Print right column from top to bottom
      for (let i = top; i <= bottom; ++i) {
        res.push(input[i][right]);
      }
      right--;

      // Print bottom row from right to left (if exists)
      if (top <= bottom) {
        for (let i = right; i >= left; --i) {
          res.push(input[bottom][i]);
        }
        bottom--;
      }

      // Print left column from bottom to top (if exists)
      if (left <= right) {
        for (let i = bottom; i >= top; --i) {
          res.push(input[i][left]);
        }
        left++;
      }
    }
    return [true, res]

    //lmao.
    //return [true, [input[0], input[1].pop(), input[2].pop(), input[2].reverse(), input[1]].flat()]
  },
  "Find Largest Prime Factor": function(input, ns) {
    let largestPrime = -1;
    while (input % 2 === 0) {
      largestPrime = 2;
      input /= 2;
    }
    for (let i = 3; i * i <= input; i += 2) {
      while (input % i === 0) {
        largestPrime = i;
        input /= i;
      }
    }
    if (input > 2) {
      largestPrime = input;
    }
    return [true, largestPrime]
  },
  "Array Jumping Game": function(input, ns) {
    return [true, getMinJumps(input) > 0 ? 1 : 0]
  },
  "Array Jumping Game II": function(input, ns) {
    return [true, getMinJumps(input)]
  },
  "Minimum Path Sum in a Triangle": function(input, ns) {
    const n = input.length
    let dp = input[n - 1]

    for (let i = n - 2; i >= 0; i--) {
      const new_dp = new Array(i + 1)
      for (let j = 0; j < input[i].length; j++) {
        new_dp[j] = input[i][j] + Math.min(dp[j], dp[j + 1])
      }
      dp = new_dp
    }
    return [true, dp[0]]
  },
  "Encryption I: Caesar Cipher": function([input, shift], ns) {
    return [true, [...input].map(char => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) {
        return shiftChar(char, -shift)
      }
      return char
    }).join('')]
  },
  "Encryption II: Vigenère Cipher": function([input, keyword], ns) {
    const KEYSTREAM = keyword.repeat(Math.ceil(input.length / keyword.length)).substring(0, input.length)
    return [true, [...input].map((char, index) => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) {
        return shiftChar(char, KEYSTREAM.charCodeAt(index) - 65)
      }
      return char
    }).join('')]
  },
  "Algorithmic Stock Trader I": function(input, ns) {
    return [true, calculateMaxProfits(input, 1)]
  },
  "Algorithmic Stock Trader II": function(input, ns) {
    return [true, calculateMaxProfits(input, 100)]
  },
  "Algorithmic Stock Trader III": function(input, ns) {
    return [true, calculateMaxProfits(input, 2)]
  },
  "Algorithmic Stock Trader IV": function([transactions, input], ns) {
    return [true, calculateMaxProfits(input, transactions)]
  },
  "Sanitize Parentheses in Expression": function(expression, ns) {
    if (expression.length === 0) return [true, [""]]
    const queue = [expression];
    const tested = new Set();
    tested.add(expression);
    let found = false;
    const solution = [];
    while (queue.length > 0) {
      expression = queue.shift()!;
      if (sanitary(expression)) {
        solution.push(expression);
        found = true;
      }
      if (found) continue;
      for (let i = 0; i < expression.length; i++) {
        if (expression.charAt(i) !== '(' && expression.charAt(i) !== ')')
          continue;
        const stripped = expression.slice(0, i) + expression.slice(i + 1);
        if (!tested.has(stripped)) {
          queue.push(stripped);
          tested.add(stripped);
        }
      }
    }
    return [true, solution]
  },
  "HammingCodes: Encoded Binary to Integer": function(input, ns) {
    const bits = input.split('').map(Number);
    const n = bits.length;
    let errorIdx = 0;

    for (let p = 1; p < n; p <<= 1) {
      let parity = 0;
      for (let i = p; i < n; i += 2 * p) {
        for (let k = 0; k < p && i + k < n; k++) {
          parity ^= bits[i + k];
        }
      }

      if (parity !== 0) errorIdx += p;
    }

    if (errorIdx > 0 && errorIdx < n) {
      bits[errorIdx] ^= 1;
    }

    const dataBits = [];
    for (let i = 1; i < n; i++) {
      if ((i & (i - 1)) !== 0) {
        dataBits.push(bits[i]);
      }
    }

    return [true, parseInt(dataBits.join(''), 2)];
  },
  "HammingCodes: Integer to Encoded Binary": function(input, ns) {
    const binary = input.toString(2)
    const m = binary.length
    let r = 0;
    while ((1 << r) < m + r + 1) r++;

    const totalLength = m + r + 1;
    const dataBits = new Array(totalLength).fill(0);
    let j = 0;
    for (let i = 1; i < totalLength; i++) {
      if ((i & (i - 1)) !== 0) {
        dataBits[i] = Number(binary[j++]);
      }
    }
    for (let p = 1; p < totalLength; p <<= 1) {
      let parity = 0
      for (let i = p; i < totalLength; i += 2 * p) {
        for (let k = 0; k < p && i + k < totalLength; k++) {
          parity ^= dataBits[i + k];
        }
      }

      dataBits[p] = parity;
    }

    dataBits[0] = dataBits.reduce((a, b) => a ^ b, 0);
    return [true, dataBits.join("")]
  },
  "Unique Paths in a Grid I": function([rows, columns], ns) {
    return [true, getUniquePathsOfGrid(Array.from({ length: rows }, () => Array(columns).fill(0)))]
  },
  "Unique Paths in a Grid II": function(grid, ns) {
    return [true, getUniquePathsOfGrid(grid)]
  },
  "Generate IP Addresses": function(input, ns) {
    const n = input.length
    const result = []
    const isValid = (seg: string) => {
      if (seg.length > 1 && seg[0] === '0') return false;
      const num = Number(seg);
      return num >= 0 && num <= 255;
    };

    for (let i = 1; i <= 3 && i < n - 2; i++) {
      for (let j = i + 1; j <= i + 3 && j < n - 1; j++) {
        for (let k = j + 1; k <= j + 3 && k < n; k++) {

          const a = input.slice(0, i);
          const b = input.slice(i, j);
          const c = input.slice(j, k);
          const d = input.slice(k);

          if (
            a.length <= 3 && b.length <= 3 &&
            c.length <= 3 && d.length <= 3 &&
            isValid(a) && isValid(b) && isValid(c) && isValid(d)
          ) {
            result.push(`${a}.${b}.${c}.${d}`);
          }
        }
      }
    }
    return [true, result]
  },
  "Merge Overlapping Intervals": function(input, ns) {
    const sorted = [...input].sort((a, b) => a[0] - b[0]);
    const result = [];
    result.push(sorted[0]);

    for (let i = 1; i < sorted.length; i++) {
      const last = result[result.length - 1];
      const curr = sorted[i];

      if (curr[0] <= last[1]) {
        last[1] = Math.max(last[1], curr[1]);
      } else {
        result.push(curr);
      }
    }
    return [true, result]
  },
  "Shortest Path in a Grid": function(input, ns) {
    const rows = input.length
    const cols = input[0].length

    if (input[0][0] === 1 || input[rows - 1][cols - 1] === 1) return [true, ""]

    const directions = [
      [1, 0, "D"],
      [-1, 0, "U"],
      [0, 1, "R"],
      [0, -1, "L"]
    ] as const
    const queue: [number, number, string][] = [[0, 0, ""]]
    const visited = new Set<string>()
    visited.add("0,0")
    while (queue.length) {
      const [r, c, path] = queue.shift()!

      if (r === rows - 1 && c === cols - 1) return [true, path]

      for (const [dr, dc, move] of directions) {
        const nr = r + dr
        const nc = c + dc
        const key = `${nr},${nc}`

        if (
          nr >= 0 &&
          nc >= 0 &&
          nr < rows &&
          nc < cols &&
          input[nr][nc] === 0 &&
          !visited.has(key)
        ) {
          visited.add(key)
          queue.push([nr, nc, path + move])
        }
      }
    }
    return [true, ""]
  }
} as ContractFunctions

function getMinJumps(nums: number[]) {
  let jumps = 0
  let farthest = 0
  let currentEnd = 0

  for (let i = 0; i < nums.length - 1; i++) {
    if (i > farthest) return 0
    farthest = Math.max(farthest, i + nums[i])

    if (i === currentEnd) {
      jumps++
      currentEnd = farthest
    }
  }
  if (currentEnd < nums.length - 1) return 0;
  return jumps
}

function getUniquePathsOfGrid(grid: (0 | 1)[][]) {
  const rows = grid.length
  const cols = grid[0].length

  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) {
    return 0;
  }

  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  dp[0][0] = 1;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 1) {
        dp[i][j] = 0; // Obstacle
      } else {
        if (i > 0) dp[i][j] += dp[i - 1][j]; // Add paths from top
        if (j > 0) dp[i][j] += dp[i][j - 1]; // Add paths from left
      }
    }
  }

  return dp[rows - 1][cols - 1];
}

function sanitary(string: string) {
  let open = 0;
  for (const char of string) {
    if (char === '(') open++;
    else if (char === ')') open--;
    if (open < 0) return false;
  }
  return open === 0;
}

function calculateMaxProfits(prices: number[], transactions: number) {
  let maxProfitAt = Array(prices.length + 1).fill(0)

  for (let t = 0; t < transactions; t++) {
    let nextMaxProfits = Array(prices.length + 1).fill(0)
    let changed = false
    for (let i = prices.length - 2; i >= 0; i--) {
      let maxProfit = 0

      for (let j = i; j < prices.length; j++) {
        maxProfit = Math.max(maxProfit, prices[j] - prices[i] + maxProfitAt[j + 1])
      }
      maxProfit = Math.max(maxProfit, nextMaxProfits[i + 1])

      nextMaxProfits[i] = maxProfit
      if (maxProfit !== maxProfitAt[i]) {
        changed = true
      }
    }

    if (!changed) break;
    maxProfitAt = nextMaxProfits
  }

  return maxProfitAt[0]
}

function shiftChar(char: string, shift: number) {
  return String.fromCharCode((((char.charCodeAt(0) - 65 + shift) % 26 + 26) % 26) + 65)
}
