import PORTS from "@home/lib/ports";

export async function main(ns: NS) {
  const TARGET = ns.args[0] as string
  const PORT = ns.args[2] as number;
  await ns.hack(TARGET)

  const hack_port = ns.getPortHandle(PORTS.HACK_PORT)
  while (!hack_port?.tryWrite([TARGET, ns.args[1]])) {
    await ns.sleep(100)
  }
}

