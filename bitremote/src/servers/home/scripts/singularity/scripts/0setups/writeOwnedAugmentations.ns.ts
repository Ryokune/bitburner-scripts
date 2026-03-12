import { writeOwnedAugmentations } from "../../lib"

export async function main(ns: NS) {
  writeOwnedAugmentations(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

