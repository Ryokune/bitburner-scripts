
import { calculateFitness, getHosts } from "@home/lib/main"

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
// TODO: Allow for hot reloads.
// Killing the entire process tree is inefficient.
// Currently if you kill swarm but not all the proccesses, drainPort WILL be desynced and can go down to negatives and also have unexpected outcomes.
//
//
// TODO: Create UI for this.
export async function main(ns: NS) {
  // Clear any excess data in the HACK/GROW/WEAKEN ports.
  // I should create a port lib soon for more flexibility.
  ns.clearPort(1);
  ns.clearPort(2)
  ns.clearPort(3);

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
  function drainPort(port: number, field: "hack" | "grow" | "weaken") {
    while (ns.peek(port) !== "NULL PORT DATA") {
      const [target, threads] = JSON.parse(ns.readPort(port) as string)
      if (H.has(target)) {
        H.get(target)![field] -= threads
      }
    }
  }
  while (true) {
    ns.clearLog()
    drainPort(1, "hack")
    drainPort(2, "weaken")
    drainPort(3, "grow")

    // totally readable yea
    Array.from(H).sort((a, b) => (a[1].grow + a[1].hack + a[1].weaken) - (b[1].grow + b[1].hack + b[1].weaken)).forEach((v) => ns.print(`${v[0]}: ${Object.entries(v[1])}`))

    const HOSTS = getHosts(ns, h => h != "home" && ns.hasRootAccess(h)).sort((a, b) => getAvailableRam(b) - (getAvailableRam(a)))
    const DATA = []
    for (const HOST of HOSTS) {
      const fitness = calculateFitness(ns, HOST)
      if (fitness == -1) continue
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
        ns.toast("fk it.")
      }

      targetThreads = Math.max(0, targetThreads)
      if (targetThreads === 0) continue

      // Distribute threads across swarm hosts
      for (const swarmHost of HOSTS) {
        ns.scp(SCRIPTS, swarmHost, "home")
        //ns.tprint(`${script} ${targetThreads} ${target}`)
        if (targetThreads <= 0) break

        const AVAIL_RAM = getAvailableRam(swarmHost)
        const scriptRam = ns.getScriptRam(script)

        const possibleThreads = Math.floor(AVAIL_RAM / scriptRam)

        if (possibleThreads <= 0) continue
        const threadsToRun = Math.min(possibleThreads, targetThreads)
        const PID = ns.exec(script, swarmHost, threadsToRun, target, threadsToRun)
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
