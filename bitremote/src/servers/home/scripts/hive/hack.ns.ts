import { daemonGetPortHandle } from "@home/lib/portdaemonlib"

export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  await ns.hack(TARGET)

  const hack_port = await daemonGetPortHandle(ns, "hack")
  while (!hack_port?.tryWrite(JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}

