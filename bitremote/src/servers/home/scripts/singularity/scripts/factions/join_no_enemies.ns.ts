import { getFactionInvitationsData } from "../../lib"

export async function main(ns: NS) {
  const invitations = getFactionInvitationsData(ns).filter(faction => ns.singularity.getFactionEnemies(faction).length === 0)
  for (const faction of invitations) {
    if (ns.singularity.joinFaction(faction)) {
      ns.toast(`Joined faction ${faction} (no enemies)`)
      ns.tprint(`Joined faction ${faction} (no enemies)`)
    } else {
      ns.toast(`Failed to join faction ${faction} (no enemies)`, "error")
    }
  }
}

