import { Flags, getHosts } from "@home/lib/main"
const FLAGS: Flags = [
  ["exclude", [""]]
]
export async function main(ns: NS) {
  const flags = ns.flags(FLAGS)
  const exclude = new Set(flags.exclude as string[])
  for (const host of getHosts(ns, h => !exclude.has(h))) {
    ns.killall(host, true)
    await ns.sleep(10)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  data.flags(FLAGS)
  return []
}

