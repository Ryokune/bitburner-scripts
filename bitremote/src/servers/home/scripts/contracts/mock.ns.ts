import { color, FG, log } from "@home/lib/colors"
import solvers from "./solvers"
import { Flags } from "@home/lib/main"

const FLAGS: Flags = [
  ["repeat", 1]
]

export async function main(ns: NS) {
  const flags = ns.flags(FLAGS)
  for (const [type, solver] of Object.entries(solvers)) {
    const dummy_contract = ns.codingcontract.createDummyContract(type)
    const data = ns.codingcontract.getData(dummy_contract)
    const desc = ns.codingcontract.getDescription(dummy_contract)
    const start = performance.now();
    let [use, result] = solver(data as never, ns)
    for (let i = 0; i < (flags.repeat as number); i++) {
      [use, result] = solver(data as never, ns)
    }
    const end = performance.now();
    const durationMs = end - start;
    const success = ns.codingcontract.attempt(result, dummy_contract)
    if (success) {
      ns.tprint(
        color(
          `✔ (${durationMs} ms) ${type} solver passed with data: ${data} => ${result}`,
          FG.green
        )
      )
    } else {
      ns.tprint(
        color(
          `✖ (${durationMs} ms) ${type} solver failed with data: ${data} => ${result}`,
          FG.red
        )
      )
      ns.tprint(desc)
    }
    ns.rm(dummy_contract)
    await ns.sleep(0)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  data.flags(FLAGS)
  return []
}
