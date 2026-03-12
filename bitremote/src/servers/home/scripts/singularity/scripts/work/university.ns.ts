import { getCurrentWorkData } from "../../lib"

export async function main(ns: NS) {
  const work = getCurrentWorkData(ns)
  if (work) {
    ns.toast(`Not running university task. Currently has work. ${work.type}`, "warning")
    return
  }
  ns.singularity.universityCourse("Rothman University", "Computer Science")
}
