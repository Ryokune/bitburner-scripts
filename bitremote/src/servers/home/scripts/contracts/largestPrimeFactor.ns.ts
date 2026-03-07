export async function main(ns: NS) {
  const data = ns.args[0] as number;
  let num = 534017267;
  ns.tprint(largestPrimeFactor(ns, num))
}
function largestPrimeFactor(ns: NS, n: number) {
  let largestPrime = -1;

  // Remove all factors of 2
  while (n % 2 === 0) {
    largestPrime = 2;
    n /= 2;
  }

  for (let i = 3; i * i <= n; i += 2) {
    while (n % i === 0) {
      largestPrime = i;
      n /= i;
    }
  }

  // If n is a prime number greater than 2 (which is the remaining number after all divisions)
  if (n > 2) {
    largestPrime = n;
  }

  return largestPrime;
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

