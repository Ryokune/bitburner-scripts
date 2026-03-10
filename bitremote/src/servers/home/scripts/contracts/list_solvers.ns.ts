import { c } from "@home/lib/text.ui"
import SOLVERS from "./solvers"

export async function main(ns: NS) {
  for (const contract of ns.codingcontract.getContractTypes()) {
    ns.tprint(SOLVERS[contract] ? c.green(contract) : c.red(contract))
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

