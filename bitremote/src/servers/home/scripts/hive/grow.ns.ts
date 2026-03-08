import { daemonGetPortHandle } from "@home/lib/portdaemonlib"

export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  await ns.grow(TARGET)

  const grow_port = await daemonGetPortHandle(ns, "grow")
  while (!grow_port?.tryWrite(JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}

