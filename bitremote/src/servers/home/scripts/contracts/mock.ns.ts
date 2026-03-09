import solvers from "./solvers"

const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const RESET = "\x1b[0m"

export async function main(ns: NS) {
  for (const [type, solver] of Object.entries(solvers)) {
    const dummy_contract = ns.codingcontract.createDummyContract(type)
    const data = ns.codingcontract.getData(dummy_contract)

    const desc = ns.codingcontract.getDescription(dummy_contract)
    const [use, result] = solver(data as never, ns)
    const success = ns.codingcontract.attempt(result, dummy_contract)
    if (success) {
      ns.tprint(`${GREEN}✔ ${type} solver passed with data: ${data} => ${result}${RESET}`)
    } else {
      ns.tprint(`${RED}✖ ${type} solver failed with data: ${data} => ${result}${RESET}`)
      ns.tprint(desc)
    }

    ns.rm(dummy_contract)
    await ns.sleep(500)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}
