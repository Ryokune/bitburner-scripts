import { color, FG, log } from "@home/lib/colors"
import solvers from "./solvers"
export async function main(ns: NS) {
  for (const [type, solver] of Object.entries(solvers)) {
    const dummy_contract = ns.codingcontract.createDummyContract(type)
    const data = ns.codingcontract.getData(dummy_contract)

    const desc = ns.codingcontract.getDescription(dummy_contract)
    const [use, result] = solver(data as never, ns)
    const success = ns.codingcontract.attempt(result, dummy_contract)
    if (success) {
      ns.tprint(color(`✔ ${type} solver passed with data: ${data} => ${result}`, FG.green))
    } else {
      ns.tprint(color(`✖ ${type} solver failed with data: ${data} => ${result}`, FG.red))
      ns.tprint(desc)
    }

    ns.rm(dummy_contract)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}
