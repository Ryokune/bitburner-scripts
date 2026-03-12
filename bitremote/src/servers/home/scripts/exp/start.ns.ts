import { defineFlags, getFlagAuto, getFlags, getHosts } from "@home/lib/main"

const FLAGS = defineFlags([
  ["target", "joesguns"]
])

const farm_script = "scripts/exp/farm.ns.js"

export async function main(ns: NS) {
  const flags = getFlags(ns, FLAGS)
  const target = flags.target
  while (true) {
    for (const host_name of getHosts(ns, h => h != "home" && ns.hasRootAccess(h))) {
      const max_ram = ns.getServerMaxRam(host_name);
      const used_ram = ns.getServerUsedRam(host_name);
      const available_ram = max_ram - used_ram
      const script_ram = ns.getScriptRam(farm_script)
      const max_threads = Math.floor(available_ram / script_ram)

      const target_security_diff =
        ns.getServerSecurityLevel(target) -
        ns.getServerMinSecurityLevel(target)

      // todo: do this only once?
      ns.scp(farm_script, host_name, "home")
      if (max_threads <= 0) continue;
      ns.exec(farm_script, host_name, max_threads, target, target_security_diff)
    }
    await ns.asleep(0)

  }
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  data.flags(FLAGS)
  return getFlagAuto(args, FLAGS) ?? []
}

