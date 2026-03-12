import { FactionName } from "@ns";
import { getAllAugmentationsFromFaction, getAugmentationData, getCurrentWorkData, getOwnedAugmentationsData } from "../../lib";

export async function main(ns: NS) {
  // Might be a bad metric to not buy augments. Especially at the start of a new bitnode.
  // if (!hasAllPrograms(ns)) return;

  const currentWork = getCurrentWorkData(ns)
  if (currentWork?.type !== "FACTION") return;

  const faction = currentWork.factionName as FactionName;

  const owned = getOwnedAugmentationsData(ns, true)
  const augs = getAllAugmentationsFromFaction(ns, faction);

  let cheapest = "";
  let cost = Infinity;

  for (const aug of augs) {

    // Switch between these two for specific use cases.
    // CBA to find a fitness value for when to stop buying neuroflux.
    if (aug === "NeuroFlux Governor") continue;
    if (owned.includes(aug)) continue;
    const augmentation_data = getAugmentationData(
      ns, aug
    )
    if (!augmentation_data || !augmentation_data.reputation_requirement || !augmentation_data.price) continue
    // if (owned.includes(aug) && aug!=="NeuroFlux Governor") continue;


    const repReq = augmentation_data.reputation_requirement
    if (ns.singularity.getFactionRep(faction) < repReq) continue;

    const price = augmentation_data.price

    if (price < cost) {
      cost = price;
      cheapest = aug;
    }
  }

  if (!cheapest) return;

  if (ns.singularity.purchaseAugmentation(faction, cheapest)) {
    const success_string = `Bought ${cheapest} from ${faction} for ${ns.formatNumber(cost)}`
    ns.toast(success_string);
    ns.tprint(success_string)
  } else {
    const money = ns.getServerMoneyAvailable("home");
    ns.toast(
      `Couldn't buy ${cheapest}. Need ${ns.formatNumber(cost - money)} more.`,
      "error",
      5000
    );
  }
}
