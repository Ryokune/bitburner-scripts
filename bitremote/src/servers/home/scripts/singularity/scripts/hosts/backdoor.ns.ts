import { getHosts } from "@home/lib/main"

export async function main(ns: NS) {
  ns.disableLog("ALL")
  ns.enableLog("singularity.installBackdoor")

  function filter(host: string) {
    const server = ns.getServer(host)
    // w0rld_d43m0n so that singularity doesnt boom the current bitnode.
    return (
      host != "home" &&
      host != "w0rld_d43m0n" &&
      !server.purchasedByPlayer) &&
      server.hasAdminRights &&
      !server.backdoorInstalled &&
      (server.requiredHackingSkill ?? 0) <= ns.getHackingLevel() &&
      ((ns.getHackTime(host) / 4) <= (25 * 1000))
  }

  const HOSTS = getHosts(ns, filter)
  if (HOSTS.length === 0) {
    ns.toast("No new servers to backdoor", "error")
  }

  for (const target of HOSTS) {
    let currentHost: string | undefined = target;
    const tree = []
    while (currentHost != "home") {
      tree.push(currentHost)
      currentHost = ns.scan(currentHost)[0]
    }

    ns.singularity.connect("home")
    while (currentHost) {
      currentHost = tree.pop()
      if (!currentHost) break
      ns.singularity.connect(currentHost)
    }

    ns.tprint(`\n[${target}] Installing backdoor in ${ns.tFormat(ns.getHackTime(target) / 4)}`)
    await ns.singularity.installBackdoor()
    ns.print(`Successfully backdoored ${target}`)

    ns.singularity.connect("home")
  }
  ns.ui.closeTail()
}
