import { FactionName } from "@ns"
import { getAllAugmentationsFromFaction, getAugmentationData, getCurrentWorkData, getOwnedAugmentationsData } from "../../lib"

const types = ["hacking", "security", "field"] as const

export async function main(ns: NS) {
  const player = ns.getPlayer()
  const factions = player.factions as FactionName[]
  const owned = getOwnedAugmentationsData(ns, true)

  const work = getCurrentWorkData(ns)
  if (work && work.type != "CLASS" && work.type != "FACTION") {
    ns.toast(`Not running faction task. Currently has work. ${work.type}`, "warning")
    return
  }

  let cheapest_faction = ""
  let lowest_reputation_req = Infinity
  let lowest_cost = Infinity

  for (const faction of factions) {
    for (const augmentation of getAllAugmentationsFromFaction(ns, faction)) {
      if (augmentation === "NeuroFlux Governor") continue
      if (owned.includes(augmentation)) continue

      const augmentation_data = getAugmentationData(ns, augmentation)
      if (!augmentation_data) continue
      if (!augmentation_data.reputation_requirement || !augmentation_data.price) continue

      // player faction rep doesnt go down (i think at least)
      // but money does. remove aug - player.money if this causes any weird issues.
      const augmentation_rep = Math.max(
        0,
        augmentation_data.reputation_requirement - ns.singularity.getFactionRep(faction)
      )
      const cost_needed = augmentation_data.price - player.money
      const favor = ns.singularity.getFactionFavor(faction)
      const rep_gain_mult = 1 + favor / 100

      const score = augmentation_rep / rep_gain_mult
      if (
        score < lowest_reputation_req ||
        (score <= lowest_reputation_req && cost_needed < lowest_cost)
      ) {
        lowest_reputation_req = score
        lowest_cost = cost_needed
        cheapest_faction = faction
      }
    }
  }
  if (!cheapest_faction) {
    // fallback to the faction with the most rep.
    cheapest_faction = [...factions]
      .sort((a, b) =>
        (ns.singularity.getFactionFavor(a)) -
        (ns.singularity.getFactionFavor(b))
        // (ns.singularity.getFactionRep(a) * (1 + ns.singularity.getFactionFavor(a) / 100)) -
        // (ns.singularity.getFactionRep(b) * (1 + ns.singularity.getFactionFavor(b) / 100))
      )
      .pop()!
    if (!cheapest_faction) return
  }

  if (work?.type === "FACTION" && work.factionName === cheapest_faction) return
  for (const t of types) {
    if (ns.singularity.workForFaction(cheapest_faction, t)) {
      ns.toast(`Doing ${t} work for ${cheapest_faction}`)
      ns.tprint(`Doing ${t} work for ${cheapest_faction}`)
      break
    }
  }

}
