import { defineFlags, getAvailableRam, getFlagAuto, getFlags, getScripts } from "@home/lib/main";

const CLOSE_AT = 10;

const FLAGS = defineFlags([
  ["loop", false]
])

export async function main(ns: NS) {
  ns.disableLog("ALL")
  ns.ui.openTail()
  ns.ui.moveTail(100, 0)
  const flags = getFlags(ns, FLAGS)
  if (flags.loop) {
    while (true) {
      await start(ns)
      ns.run("scripts/nuke.ns.js", {
        preventDuplicates: true
      })
    }
  } else {
    await start(ns)
    ns.ui.closeTail()
    ns.spawn("scripts/nuke.ns.js", {
      spawnDelay: 1000,
      preventDuplicates: true
    })
  }
}

async function movePotentialTail(ns: NS, PID: number) {
  while (ns.isRunning(PID)) {
    let current_script = ns.self()
    if (current_script.tailProperties && ns.getScriptLogs(PID).length > 0) {
      ns.ui.openTail(PID)
      ns.ui.moveTail(
        (current_script.tailProperties.x ?? 0),
        (current_script.tailProperties.y ?? 0) + current_script.tailProperties.height + 10, PID)
      ns.ui.resizeTail(current_script.tailProperties.width, current_script.tailProperties.height, PID)
    }
    await ns.asleep(0)
  }
  ns.ui.closeTail(PID)
}

async function start(ns: NS) {
  ns.clearLog()

  for (const script of getScripts(ns, "home", "./scripts")) {
    const name = script.split("/").pop()
    if (name?.startsWith("_")) continue

    const ram_cost = ns.getScriptRam(script)
    const available = getAvailableRam(ns, "home")

    if (ram_cost > available) {
      ns.print(
        `\x1b[31mCouldn't run\nSCRIPT: ${script}\nRAM: ${ns.formatNumber(available)} < ${ns.formatNumber(ram_cost)}\x1b[0m`
      )
      continue
    }

    const PID = ns.run(script, {
      preventDuplicates: true,
    })

    if (PID === 0) {
      ns.print(`\x1b[31mCouldn't run ${script} PID: ${PID}\x1b[0m`)
      continue
    }
    ns.print(`${ns.formatRam(ram_cost)} Running ${script.split("/").slice(-2).join("/")} with PID ${PID}`)

    movePotentialTail(ns, PID)
    while (ns.isRunning(PID)) {
      await ns.asleep(500)
    }
  }

  ns.print("Finished!")
  ns.print(`Closing in ${CLOSE_AT} seconds..`)

  await ns.asleep(CLOSE_AT * 1000)
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  data.flags(FLAGS)
  return getFlagAuto(args, FLAGS) ?? []
}
