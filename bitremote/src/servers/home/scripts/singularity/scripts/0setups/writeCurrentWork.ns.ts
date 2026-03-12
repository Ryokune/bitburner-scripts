import { writeCurrentWork } from "../../lib"

export async function main(ns: NS) {
  writeCurrentWork(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

