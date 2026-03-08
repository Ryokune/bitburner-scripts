import { CodingContractSignatures } from "@ns"
type ContractFunctions = {
  [K in keyof CodingContractSignatures]:
  (input: CodingContractSignatures[K][0], ns: NS) => [boolean, CodingContractSignatures[K][1]]
}
export default {
  "Spiralize Matrix": function(input, ns) {
    return [true, [input[0], input[1].pop(), input[2].pop(), input[2].reverse(), input[1]].flat()]
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
    let pass = false
    for (let i = 0; i < input.length - 1;) {
      i += input[i]
      pass = i == input.length - 1
    }
    return [true, pass ? 1 : 0]
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
    let min = Infinity
    let max = 0;
    for (let i = 0; i < input.length; i++) {
      if (min > input[i]) {
        min = input[i]
      } else if (input[i] - min > max) {
        max = input[i] - min
      }
    }
    return [true, max]
  }
} as ContractFunctions

function shiftChar(char: string, shift: number) {
  return String.fromCharCode((((char.charCodeAt(0) - 65 + shift) % 26 + 26) % 26) + 65)
}
