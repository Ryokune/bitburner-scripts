
import { calculateFitness, getHosts } from "@home/lib/main"
import PORTS from "@home/lib/ports"
import { c, table } from "@home/lib/text.ui"
import { NetscriptPort } from "@ns"
interface Server {
  hack: number,
  weaken: number,
  grow: number
}

const SCRIPTS = [
  "/scripts/hive/hack.ns.js",
  "/scripts/hive/weaken.ns.js",
  "/scripts/hive/grow.ns.js",
]

//??
// TODO: Allow for hot reloads.
// Killing the entire process tree is inefficient.
// Currently if you kill swarm but not all the proccesses, drainPort WILL be desynced and can go down to negatives and also have unexpected outcomes.
//
//
// TODO: Create UI for this.
export async function main(ns: NS) {
  // Clear any excess data in the HACK/GROW/WEAKEN ports.
  ns.clearPort(PORTS.HACK_PORT);
  ns.clearPort(PORTS.WEAKEN_PORT)
  ns.clearPort(PORTS.GROW_PORT);

  ns.disableLog("ALL")
  ns.ramOverride(7.75)
  ns.ui.openTail()

  ns.atExit(() => {
    ns.ui.closeTail()
  })

  const H = new Map<string, Server>()

  function getAvailableRam(host: string) {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
  }

  function drainPortHandle(port: NetscriptPort, field: "hack" | "grow" | "weaken") {
    while (port.peek() !== "NULL PORT DATA") {
      const [target, threads] = port.read()
      if (H.has(target)) {
        H.get(target)![field] -= threads
      }
    }
  }

  const hack_port = ns.getPortHandle(PORTS.HACK_PORT)
  const weaken_port = ns.getPortHandle(PORTS.WEAKEN_PORT)
  const grow_port = ns.getPortHandle(PORTS.GROW_PORT)

  while (true) {
    ns.clearLog()

    if (!hack_port || !weaken_port || !grow_port) {
      ns.print(`COULD NOT GET PORTS!`)
      ns.tprint(`COULD NOT GET PORTS!`)
      await ns.sleep(5000)
      continue
    }

    drainPortHandle(hack_port, "hack")
    drainPortHandle(weaken_port, "weaken")
    drainPortHandle(grow_port, "grow")

    let T = 0
    let R = 0

    const rows = [
      [
        c.cyan.bold("Server"),
        c.green.bold("Hack"),
        c.yellow.bold("Grow"),
        c.blue.bold("Weaken"),
        c.magenta.bold("Total")
      ]
    ]

    for (const [name, s] of Array.from(H)
      .sort((a, b) =>
        (a[1].hack + a[1].grow + a[1].weaken) -
        (b[1].hack + b[1].grow + b[1].weaken)
      )) {
      T += s.hack + s.grow + s.weaken
      R += s.hack * ns.getScriptRam(SCRIPTS[0])
      R += s.weaken * ns.getScriptRam(SCRIPTS[1])
      R += s.grow * ns.getScriptRam(SCRIPTS[2])
      rows.push([
        name,
        `${s.hack}`,
        `${s.grow}`,
        `${s.weaken}`,
        `${s.hack + s.grow + s.weaken}`
      ])
    }
    ns.print(table(rows))
    ns.print(`ALL THREADS: ${ns.formatNumber(T)}`)
    ns.print(`TOTAL RAM: ${ns.formatRam(R)}`)
    const HOSTS = getHosts(ns, h => h != "home" && ns.hasRootAccess(h)).sort((a, b) => getAvailableRam(b) - (getAvailableRam(a)))
    const DATA = []
    for (const HOST of HOSTS) {
      const fitness = calculateFitness(ns, HOST)
      if (fitness == -Infinity) continue
      if (!H.has(HOST)) {
        H.set(HOST, {
          hack: 0,
          grow: 0,
          weaken: 0,
        })
      }
      DATA.push({ host: HOST, fitness: fitness })
    }
    const SORTED_DATA = DATA.sort((a, b) => b.fitness - a.fitness)
    for (const { host: target } of SORTED_DATA) {

      const CURRENT_SECURITY = ns.getServerSecurityLevel(target)
      const LOWEST_SECURITY = ns.getServerMinSecurityLevel(target)
      const MAX_MONEY = ns.getServerMaxMoney(target)
      const CURRENT_MONEY = ns.getServerMoneyAvailable(target)

      let should_overflow = false
      let script = ""
      let targetThreads = 0
      let port = 0;
      const state = H.get(target)!

      const predicted_security = CURRENT_SECURITY - (state.weaken * 0.05)
      const needed_security = Math.ceil(
        (predicted_security - LOWEST_SECURITY) / 0.05
      )

      const growPercentNeeded = MAX_MONEY / Math.max(1, CURRENT_MONEY)
      const needed_grow = Math.ceil(ns.growthAnalyze(target, growPercentNeeded))


      const hackFraction = 0.15
      const needed_hack = Math.ceil(
        ns.hackAnalyzeThreads(target, MAX_MONEY * hackFraction)
      )
      if (predicted_security > LOWEST_SECURITY && state.weaken != needed_security) {
        script = SCRIPTS[1]
        port =
          targetThreads = needed_security
        should_overflow = true
      } else if (CURRENT_MONEY < MAX_MONEY && needed_grow != state.grow) {
        script = SCRIPTS[2]

        targetThreads = needed_grow - state.grow

      } else if (needed_hack != state.hack) {
        script = SCRIPTS[0]

        targetThreads = needed_hack - state.hack
      } else {
        script = SCRIPTS[Math.floor(Math.random() * SCRIPTS.length)]
        targetThreads = Math.floor(Math.random() * 256) + 1
        ns.toast(`fk it. r_tthreads: ${targetThreads}`)
      }

      targetThreads = Math.max(0, targetThreads)
      if (targetThreads === 0) continue

      for (const swarmHost of HOSTS) {
        ns.scp(SCRIPTS, swarmHost, "home")
        //ns.tprint(`${script} ${targetThreads} ${target}`)
        if (targetThreads <= 0) break

        const AVAIL_RAM = getAvailableRam(swarmHost)
        const scriptRam = ns.getScriptRam(script)

        const possibleThreads = Math.floor(AVAIL_RAM / scriptRam)

        if (possibleThreads <= 0) continue
        const threadsToRun = Math.min(possibleThreads, targetThreads)
        const PID = ns.exec(script, swarmHost, {
          threads: threadsToRun,
          temporary: true
        }, target, threadsToRun)
        if (PID == 0) continue;
        targetThreads -= threadsToRun
        switch (script) {
          case "/scripts/hive/hack.ns.js": {
            H.get(target)!.hack += threadsToRun
            break;
          }
          case "/scripts/hive/weaken.ns.js": {
            H.get(target)!.weaken += threadsToRun
            break;
          }
          case "/scripts/hive/grow.ns.js": {
            H.get(target)!.grow += threadsToRun
            break;
          }
          default:
            break;
        }

        if (!should_overflow) {
          targetThreads = 0
          continue
        }
      }
    }
    await ns.sleep(5 * 1000)
    ns.toast(`RUN`)
  }
}
