export async function main(ns: NS) {
  const invitations = ns.singularity.checkFactionInvitations()
  const owned = ns.singularity.getOwnedAugmentations(true)
  let best_augment_count = 0
  let best_faction = ""
  for (const faction of invitations) {
    const augment_count =
      ns.singularity
        .getAugmentationsFromFaction(faction)
        .filter(a => a !== "NeuroFlux Governor" && !owned.includes(a)).length
    if (best_augment_count < augment_count) {
      best_augment_count = augment_count
      best_faction = faction
    }
  }
  if (!best_faction) return
  if (ns.singularity.joinFaction(best_faction)) {
    ns.toast(`Joining faction ${best_faction}`)
  } else {
    ns.toast(`Failed to join faction ${best_faction}`, "error")
  }
}
