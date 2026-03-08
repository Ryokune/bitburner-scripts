import { daemonGetPort } from "./lib/portdaemonlib"

export async function main(ns: NS) {
  const portNum = await daemonGetPort(ns, "hello")
  ns.tprint(portNum)
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

