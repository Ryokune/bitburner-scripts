import { getHosts } from "@home/lib/main"

export async function main(ns: NS) {
  for (const host of getHosts(ns)) {
    ns.killall(host, true)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

