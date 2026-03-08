import { daemonDeletePort, daemonGetPort } from "./lib/portdaemonlib"

export async function main(ns: NS) {
  await daemonDeletePort(ns, "hack")
  await daemonDeletePort(ns, "grow")
  await daemonGetPort(ns, "hack")
  await daemonGetPort(ns, "grow")
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

