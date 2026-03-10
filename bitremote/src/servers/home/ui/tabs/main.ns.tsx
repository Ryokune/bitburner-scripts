import { CreateWindow } from "@home/lib/ui"
import { App } from "./App"

export async function main(ns: NS) {
  CreateWindow(ns, () => <App ns={ns} />, "Tail Processes", 150, 500, 700, 0)
  while (ns.self().tailProperties) {
    await ns.asleep(1000)
  }
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

