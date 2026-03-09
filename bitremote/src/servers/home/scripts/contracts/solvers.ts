import { CodingContractSignatures } from "@ns"
type ContractFunctions = {
  [K in keyof CodingContractSignatures]:
  (input: CodingContractSignatures[K][0], ns: NS) => [boolean, CodingContractSignatures[K][1]]
}
export default {
  "Spiralize Matrix": function(input, ns) {
    return [false, [0]]
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
    let bits = input.split('').map(Number);
    let n = bits.length;
    let parityBits = Math.ceil(Math.log2(n + 1));

    let errorIdx = 0;
    for (let i = 0; i < parityBits; i++) {
      let parityPos = Math.pow(2, i);
      let paritySum = 0;
      for (let j = parityPos; j < n; j += 2 * parityPos) {
        for (let k = 0; k < parityPos && j + k < n; k++) {
          paritySum ^= bits[j + k];
        }
      }
      if (paritySum !== 0) errorIdx += parityPos;
    }

    if (errorIdx < n) {
      bits[errorIdx] ^= 1;
    }

    let dataBits = [];
    for (let i = 1; i < n; i++) {
      if (!((i & (i - 1)) === 0)) {
        dataBits.push(bits[i]);
      }
    }

    return [true, parseInt(dataBits.join(''), 2)];
  },
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
