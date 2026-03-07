import { hasAllPrograms } from "@home/lib/main";

export async function main(ns: NS) {
  // Might be a bad metric to not buy augments. Especially at the start of a new bitnode.
  // if (!hasAllPrograms(ns)) return;

  const currentWork = ns.singularity.getCurrentWork();
  if (currentWork?.type !== "FACTION") return;

  const faction = currentWork.factionName;

  const owned = ns.singularity.getOwnedAugmentations(true);
  const augs = ns.singularity.getAugmentationsFromFaction(faction);

  let cheapest = "";
  let cost = Infinity;

  for (const aug of augs) {
    //if (aug === "NeuroFlux Governor") continue;
    if (owned.includes(aug) && aug != "NeuroFlux Governor") continue;
    const repReq = ns.singularity.getAugmentationRepReq(aug);
    if (ns.singularity.getFactionRep(faction) < repReq) continue;

    const price = ns.singularity.getAugmentationPrice(aug);

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
