export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  await ns.hack(TARGET)
  while (!ns.tryWritePort(1, JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}

