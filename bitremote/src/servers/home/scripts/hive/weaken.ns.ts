export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  await ns.weaken(TARGET)
  while (!ns.tryWritePort(2, JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}
