export async function main(ns: NS) {
  const script = ns.getRunningScript()!
  ns.disableLog("ALL")

  ns.ui.openTail()
  ns.ui.setTailTitle("Contracts")
  ns.ui.moveTail(0, 0)

  ns.printRaw("")

  ns.atExit(() => ns.ui.closeTail());
  while (ns.getRunningScript()?.tailProperties !== null) {
    await ns.asleep(500);
  }

  ns.toast(`Closing: ${script.filename}`)
}



export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

