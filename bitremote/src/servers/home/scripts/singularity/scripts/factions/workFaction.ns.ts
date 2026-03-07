import type { FactionWorkTask } from "@ns"

export async function main(ns: NS) {
  const factions = ns.getPlayer().factions
  const owned = ns.singularity.getOwnedAugmentations(true)

  const work = ns.singularity.getCurrentWork()
  if (work && work.type != "CLASS" && work.type != "FACTION") {
    ns.toast(`Not running faction task. Currently has work. ${work.type}`, "warning")
    return
  }

  let cheapest_faction = ""
  let lowest_reputation_req = Infinity
  let lowest_cost = Infinity

  for (const faction of factions) {
    for (const augmentation of ns.singularity.getAugmentationsFromFaction(faction)) {

      if (augmentation === "NeuroFlux Governor") continue
      if (owned.includes(augmentation)) continue

      const augmentation_rep = ns.singularity.getAugmentationRepReq(augmentation) -
        ns.singularity.getFactionRep(faction)
      const augmentation_cost = ns.singularity.getAugmentationPrice(augmentation)

      if (
        augmentation_rep < lowest_reputation_req ||
        (augmentation_rep === lowest_reputation_req && augmentation_cost < lowest_cost)
      ) {
        lowest_reputation_req = augmentation_rep
        lowest_cost = augmentation_cost
        cheapest_faction = faction
      }
    }
  }

  if (!cheapest_faction) return

  if (work?.type === "FACTION" && work.factionName === cheapest_faction) return

  if (ns.singularity.workForFaction(cheapest_faction, "hacking")) {
    ns.toast(`Doing work for ${cheapest_faction}`)
  }
}
