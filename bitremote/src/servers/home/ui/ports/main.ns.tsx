
export async function main(ns: NS) {
  ns.ui.openTail()
  ns.disableLog('ALL')
  while (true) {
    ns.clearLog()

    let str = ""

    for (let i = 1; i <= 50; i++) {
      const d = ns.getPortHandle(i).peek()
      if (d == 'NULL PORT DATA') continue
      str += `${i}\n`
      str += `${d}\n`
    }

    ns.print(str)
    await ns.sleep(0)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

