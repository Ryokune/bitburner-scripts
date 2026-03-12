import { writeAugmentationDataPrice } from "@home/scripts/singularity/lib"

export async function main(ns: NS) {
  writeAugmentationDataPrice(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

