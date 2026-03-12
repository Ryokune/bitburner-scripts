import { writeFactionInvitations } from "../../lib"

export async function main(ns: NS) {
  writeFactionInvitations(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

