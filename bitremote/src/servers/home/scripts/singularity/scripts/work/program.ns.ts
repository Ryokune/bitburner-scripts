import { runScript } from "@home/lib/main"

export async function main(ns: NS) {
  const work = ns.singularity.getCurrentWork()
  if (work && (work.type != "CLASS" && work.type != "FACTION")) {
    ns.toast(`Not running program task. Currently has work. ${work.type}`, "warning")
    return
  }
  if (runScript(ns, "../work/_createProgram.ns.js") == 0) {
    ns.toast("Could not run create program task :(", "error")
  }
}
