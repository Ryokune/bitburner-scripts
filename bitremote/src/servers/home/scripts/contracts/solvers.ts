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
    return [true, largestPrime];
  },
  "Array Jumping Game": function(input, ns) {
    let maxReach = 0

    for (let i = 0; i < input.length; i++) {
      if (i > maxReach) return [true, 0]
      maxReach = Math.max(maxReach, i + input[i])
      if (maxReach >= input.length - 1) return [true, 1]
    }

    return [true, 1]
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
    const arr = new Array(totalLength).fill(0);
    let j = 0;
    for (let i = 1; i < totalLength; i++) {
      if ((i & (i - 1)) !== 0) {
        arr[i] = Number(binary[j++]);
      }
    }
    for (let p = 1; p < totalLength; p <<= 1) {
      let parity = 0
      for (let i = p; i < totalLength; i += 2 * p) {
        for (let k = 0; k < p && i + k < totalLength; k++) {
          parity ^= arr[i + k];
        }
      }

      arr[p] = parity;
    }

    arr[0] = arr.reduce((a, b) => a ^ b, 0);
    return [true, arr.join("")]
  }
} as ContractFunctions

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
    for (let i = prices.length - 2; i > -1; i--) {
      let maxProfit = 0
      for (let j = i; j < prices.length; j++) {
        maxProfit = Math.max(maxProfit, prices[j] - prices[i] + maxProfitAt[j + 1])
      }
      maxProfit = Math.max(maxProfit, nextMaxProfits[i + 1])
      nextMaxProfits[i] = maxProfit
    }
    maxProfitAt = nextMaxProfits
  }
  return maxProfitAt[0]
}

function shiftChar(char: string, shift: number) {
  return String.fromCharCode((((char.charCodeAt(0) - 65 + shift) % 26 + 26) % 26) + 65)
}
