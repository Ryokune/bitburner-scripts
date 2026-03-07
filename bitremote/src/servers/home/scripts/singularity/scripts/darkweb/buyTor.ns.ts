export async function main(ns: NS) {
  if (ns.hasTorRouter()) return;
  if (ns.singularity.purchaseTor()) {
    ns.toast("Bought TOR!")
  } else {
    ns.toast(`Couldn't buy TOR router. Need ${ns.formatNumber(200_000 - ns.getServerMoneyAvailable("home"))} more.`, "error")
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

