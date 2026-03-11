import PORTS from "@home/lib/ports"
export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  const PORT = ns.args[2]
  await ns.grow(TARGET)

  const grow_port = ns.getPortHandle(ns.pid)
  while (!grow_port?.tryWrite([TARGET, "grow", ns.args[1]])) {
    await ns.sleep(100)
  }
}

