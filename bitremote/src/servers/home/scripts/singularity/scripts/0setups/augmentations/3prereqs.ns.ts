import { writeAugmentationDataPreReqs } from "@home/scripts/singularity/lib"

export async function main(ns: NS) {
  writeAugmentationDataPreReqs(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

