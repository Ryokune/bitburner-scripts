import { defineFlags, getFlagAuto, getFlags, getHosts } from "@home/lib/main"
const FLAGS = defineFlags([
  ["exclude", [""]]
])
export async function main(ns: NS) {
  const flags = getFlags(ns, FLAGS)
  const exclude = new Set(flags.exclude)
  for (const host of getHosts(ns, h => !exclude.has(h))) {
    ns.killall(host, true)
    await ns.sleep(10)
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  data.flags(FLAGS)
  return getFlagAuto(args, FLAGS) ?? []
}

