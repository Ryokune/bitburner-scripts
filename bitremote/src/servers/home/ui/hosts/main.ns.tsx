import { CreateWindow } from "@home/lib/ui"
import { App } from "./App"

export async function main(ns: NS) {
  CreateWindow(ns, () => <App ns={ns} />, "Hosts", 1200, 500, 0, 0)

  while (ns.getRunningScript()?.tailProperties !== null) {
    await ns.asleep(500)
  }
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

