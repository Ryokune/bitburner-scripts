import { daemonGetPortHandle } from "@home/lib/portdaemonlib"

export async function main(ns: NS) {
  const hack_port = await daemonGetPortHandle(ns, "hack")
  const TARGET = ns.args[0] as string
  await ns.hack(TARGET)
  while (!hack_port?.tryWrite(JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}

