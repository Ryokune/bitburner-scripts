import PORTS from "@home/lib/ports"

export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  const PORT = ns.args[2] as number
  await ns.weaken(TARGET)

  const weaken_port = ns.getPortHandle(PORTS.WEAKEN_PORT)
  while (!weaken_port?.tryWrite(JSON.stringify([TARGET, ns.args[1]]))) {
    await ns.sleep(100)
  }
}
