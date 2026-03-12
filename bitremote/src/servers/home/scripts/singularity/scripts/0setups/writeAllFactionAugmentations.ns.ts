import { SINGULARITY_DATA_DIRS, writeAllFactionsAugmentations } from "../../lib"

export async function main(ns: NS) {
  if (ns.fileExists(SINGULARITY_DATA_DIRS.FACTION_AUGMENTATIONS)) return
  writeAllFactionsAugmentations(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

