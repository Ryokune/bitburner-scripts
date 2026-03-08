import { PortDaemonRequest, PORTD_READ_PORT, PORTD_WRITE_PORT } from "@home/lib/portdaemonlib";
import { deregisterPort, generatePortsData, registerOrGetPortNumber, type Ports } from "@home/lib/ports";

let data: Ports | undefined

export async function main(ns: NS) {
  if (!data) {
    data = generatePortsData(3, 50)
  }
  const read = ns.getPortHandle(PORTD_READ_PORT)
  const write = ns.getPortHandle(PORTD_WRITE_PORT)
  read.clear()
  write.clear()
  while (true) {
    await read.nextWrite()
    const requestData: PortDaemonRequest = read.peek()
    switch (requestData.request) {
      case "get": {
        const port = await registerOrGetPortNumber(ns, requestData.name, data)

        ns.print(`Written: ${port} ${requestData.name}`)
        while (!write.tryWrite(port)) {
          await ns.asleep(0)
        }

        // Don't read other requests until this write port has been read
        // (could get stuck if a script requesting a port gets killed before it resolves the port request)
        while (!write.empty()) {
          await ns.asleep(0)
        }
        ns.print("Consumed.")
        read.read()
        break;
      }
      case "delete": {
        const success = await deregisterPort(ns, requestData.name, data)

        ns.print(`Deletion ${success} ${requestData.name}`)
        while (!write.tryWrite(success)) {
          await ns.asleep(0)
        }
        while (!write.empty()) {
          await ns.asleep(0)
        }
        ns.print("Consumed delete")
        read.read()
        break;
      }
      default: {
        ns.toast(`Unexpected PortDaemonRequest type ${requestData.request} for ${requestData.name}`)
        break
      }
    }
  }
}

