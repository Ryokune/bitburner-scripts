import { FactionName } from "@ns"
import { getAllAugmentationsFromFaction, getFactionInvitationsData, getOwnedAugmentationsData } from "../../lib"
export async function main(ns: NS) {
  const invitations = getFactionInvitationsData(ns) as FactionName[]
  const owned = getOwnedAugmentationsData(ns, true)
  let best_augment_count = 0
  let best_faction = ""
  for (const faction of invitations) {
    const augment_count =
      getAllAugmentationsFromFaction(ns, faction)
        .filter(a => a !== "NeuroFlux Governor" && !owned.includes(a)).length
    if (best_augment_count < augment_count) {
      best_augment_count = augment_count
      best_faction = faction
    }
  }
  if (!best_faction) return
  if (ns.singularity.joinFaction(best_faction)) {
    ns.toast(`Joined faction ${best_faction}`)
    ns.tprint(`Joined faction ${best_faction}`)
  } else {
    ns.toast(`Failed to join faction ${best_faction}`, "error")
  }
}
