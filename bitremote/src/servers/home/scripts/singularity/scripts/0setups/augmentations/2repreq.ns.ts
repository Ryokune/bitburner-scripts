import { writeAugmentationDataRepReq } from "@home/scripts/singularity/lib"

export async function main(ns: NS) {
  writeAugmentationDataRepReq(ns)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

