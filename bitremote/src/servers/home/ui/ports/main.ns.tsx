import { CreateWindow } from "@home/lib/ui"
import { App } from "./App"
import { PortDaemonData } from "@home/daemons/portDaemon.ns"

export async function main(ns: NS) {
  // CreateWindow(ns, () => <App ns={ns} />, "PortViewer", 1200, 200, 0, 0)
  // while (true) await ns.asleep(500)
  ns.ui.openTail()
  ns.disableLog('ALL')
  while (true) {
    ns.clearLog()
    let str = ""
    for (const [a, b] of PortDaemonData.ports) {
      ns.print(`${a} ${b}`)
      ns.print(ns.getPortHandle(b).peek())
    }
    // for (let i = 1; i <= 50; i++) {
    //   const d = ns.getPortHandle(i).peek()
    //   if (d == 'NULL PORT DATA') continue
    //   str += `${i}\n`
    //   str += `${d}\n`
    // }
    ns.print(str)
    await ns.sleep(0)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

