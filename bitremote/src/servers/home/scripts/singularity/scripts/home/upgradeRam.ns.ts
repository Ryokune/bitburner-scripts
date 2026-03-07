export async function main(ns: NS) {
  const current_ram = ns.getServerMaxRam("home")
  if (current_ram < 32) {

    const requirement = ns.singularity.getUpgradeHomeRamCost() - ns.getServerMaxMoney("home");
    if (ns.singularity.upgradeHomeRam())
      ns.toast(`Upgraded Home ram from: ${current_ram} to ${ns.getServerMaxRam("home")}`)
    else
      ns.toast(`Couldn't upgrade home ram. Need ${ns.formatNumber(requirement)} more.`, "error", 5000)
  }
}
