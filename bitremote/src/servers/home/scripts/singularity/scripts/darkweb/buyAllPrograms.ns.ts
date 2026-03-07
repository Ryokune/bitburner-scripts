import { PROGRAMS } from "@home/lib/main";

export async function main(ns: NS) {
  if (!ns.hasTorRouter()) return;
  for (const program of Object.keys(PROGRAMS)) {
    const cost = ns.singularity.getDarkwebProgramCost(program)
    if (!ns.fileExists(program)) {
      if (ns.singularity.purchaseProgram(program)) {
        ns.toast(`Bought: ${program}`)
      } else {
        ns.toast(`Could not buy: ${program}. Need ${ns.formatNumber(cost - ns.getServerMoneyAvailable("home"))} more`, "error")
      }
    }
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

