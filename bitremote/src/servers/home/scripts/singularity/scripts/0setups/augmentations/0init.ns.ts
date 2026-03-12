import { writeAugmentationData } from "@home/scripts/singularity/lib"

export async function main(ns: NS) {
  writeAugmentationData(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

