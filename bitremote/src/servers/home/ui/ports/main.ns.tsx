import { PortDaemonData } from "@home/daemons/portDaemon.ns"

export async function main(ns: NS) {
  ns.ui.openTail()
  ns.disableLog('ALL')
  while (true) {
    ns.clearLog()

    let str = ""
    if (ns.isRunning("daemons/portDaemon.ns.ts")) {
      for (const [a, b] of PortDaemonData.ports) {
        str += `${a} ${b}\n`
        str += `${ns.getPortHandle(b).peek()}\n`
      }
    } else {
      for (let i = 1; i <= 50; i++) {
        const d = ns.getPortHandle(i).peek()
        if (d == 'NULL PORT DATA') continue
        str += `${i}\n`
        str += `${d}\n`
      }
    }

    ns.print(str)
    await ns.sleep(0)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

