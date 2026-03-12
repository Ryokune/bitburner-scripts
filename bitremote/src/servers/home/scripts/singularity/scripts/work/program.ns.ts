import { runScript } from "@home/lib/main"
import { getCurrentWorkData } from "../../lib"

export async function main(ns: NS) {
  const work = getCurrentWorkData(ns)
  if (work && (work.type != "CLASS" && work.type != "FACTION" && work.type != "CREATE_PROGRAM")) {
    ns.toast(`Not running program task. Currently has work. ${work.type}`, "warning")
    return
  }
  if (runScript(ns, "../work/_createProgram.ns.js", {
    preventDuplicates: true
  }, work?.type !== "CREATE_PROGRAM") == 0) {
    ns.toast("Could not run create program task :(", "error")
  }
}
