import { hasAllPrograms } from "@home/lib/main";

export async function main(ns: NS) {
  const servers = ns.getPurchasedServers().sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b))
  const size = servers.length
  if (size === 25) return;
  let maxed = 0;
  if (!hasAllPrograms(ns) && servers.length >= 5) return
  while (true) {
    const server = servers.pop()
    if (!server) break;
    const current_ram = ns.getServerMaxRam(server)
    const pow = Math.log2(current_ram)
    if (pow >= 10) {
      maxed++
      continue;
    }
    const target_ram = Math.pow(2, pow + 1)
    if (ns.upgradePurchasedServer(server, target_ram)) {
      const success_string = `Upgraded server: ${server} from ${current_ram} to ${target_ram}`
      ns.toast(success_string)
      ns.tprint(success_string)
    }
    else
      ns.toast(`Can not upgrade server ${server}. Needs ${ns.formatNumber(ns.getPurchasedServerCost(target_ram))}`, "error", 5000)

    break;
  }
  if (maxed == size || size == 0) {
    const name = ns.purchaseServer("pserv", 16)

    if (!name) {
      ns.toast(`Couldn't buy private server. Needs ${ns.formatNumber(ns.getPurchasedServerCost(16))}`, "warning", 2500)
      return;
    }

    ns.toast(`Purchased server: ${name}`)
    ns.tprint(`Purchased server: ${name}`)
  }
}
