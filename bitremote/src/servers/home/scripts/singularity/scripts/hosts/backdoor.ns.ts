import { getHosts } from "@home/lib/main"


export async function main(ns: NS) {
  ns.disableLog("ALL")
  ns.enableLog("singularity.installBackdoor")
  function filter(host: string) {
    const server = ns.getServer(host)
    return host != "home" && server.hasAdminRights && !server.backdoorInstalled && (server.requiredHackingSkill ?? 0) <= ns.getHackingLevel() && !server.purchasedByPlayer
  }
  const HOSTS = getHosts(ns, filter)
  if (HOSTS.length === 0) {
    ns.toast("No new servers to backdoor", "error")
  }
  for (const target of getHosts(ns, filter)) {
    let currentHost = target;
    const tree = new Set<string>()
    while (currentHost != "home") {
      tree.add(currentHost)
      currentHost = ns.scan(currentHost)[0]
    }
    ns.singularity.connect("home")
    for (const c of [...tree].reverse()) {
      ns.singularity.connect(c)
    }
    if (tree.size === 0) {
      ns.toast("No new servers to backdoor", "error")
      return
    }
    await ns.singularity.installBackdoor()
    ns.print(`Successfully backdoored ${target}`)
    ns.singularity.connect("home")
  }
  ns.ui.closeTail()
}
