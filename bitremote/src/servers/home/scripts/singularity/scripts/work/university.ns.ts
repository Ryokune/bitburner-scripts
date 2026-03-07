export async function main(ns: NS) {
  const work = ns.singularity.getCurrentWork()
  if (work) {
    ns.toast(`Not running university task. Currently has work. ${work.type}`, "warning")
    return
  }
  ns.singularity.universityCourse("Rothman University", "Computer Science")
}
