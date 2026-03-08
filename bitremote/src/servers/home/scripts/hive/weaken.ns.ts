import { daemonGetPortHandle } from "@home/lib/portdaemonlib"

export async function main(ns: NS) {
  const weaken_port = await daemonGetPortHandle(ns, "weaken")
  const TARGET = ns.args[0] as string
  await ns.weaken(TARGET)
  while (!weaken_port?.tryWrite(JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}
