import { PortDaemonRequest, PORTD_READ_PORT, PORTD_WRITE_PORT } from "@home/lib/portdaemonlib";
import { deregisterPort, generatePortsData, getPortNumber, registerOrGetPortNumber, registerPort, type Ports } from "@home/lib/ports";

export let PortDaemonData: Ports;

export async function main(ns: NS) {
  PortDaemonData = generatePortsData(3, 50)
  const read = ns.getPortHandle(PORTD_READ_PORT)
  const write = ns.getPortHandle(PORTD_WRITE_PORT)
  read.clear()
  write.clear()

  ns.atExit(() => {
    for (const [_, portNum] of PortDaemonData.ports) {
      ns.getPortHandle(portNum).clear()
    }
  })

  async function doWrite<T>(pid: number, data: T) {
    ns.print("Checking write is empty.")
    while (!write.empty()) {
      await ns.sleep(0)
    }
    ns.print(`Writing ${data}`)

    while (!write.tryWrite({ pid, data })) {
      await ns.sleep(0)
    }
    ns.print(`Waiting for consume for ${data}.`)
    while (!write.empty()) {
      await ns.sleep(0)
    }
    ns.print("Consumed.")
    read.read()
  }
  ns.clearLog()
  ns.print("Initialized.")
  while (true) {

    let requestData: PortDaemonRequest | 'NULL PORT DATA' = 'NULL PORT DATA'
    while (requestData == 'NULL PORT DATA') {
      await read.nextWrite()
      requestData = read.peek()
    }
    switch (requestData.request) {
      case "register": {
        ns.print(`Registering: ${requestData.name}`)
        const success = await registerPort(ns, requestData.name, PortDaemonData)
        ns.print(`Registered: ${requestData.name}`)
        await doWrite(requestData.pid, success)
        break;
      }
      case "get": {
        const port = getPortNumber(requestData.name, PortDaemonData)

        ns.print(`Written: ${port} ${requestData.name}`)
        await doWrite(requestData.pid, port)
        break;
      }
      case "delete": {
        ns.print(`Deleting: ${requestData.name}`)
        const success = await deregisterPort(ns, requestData.name, PortDaemonData)

        ns.print(`Deletion ${success} ${requestData.name}`)
        await doWrite(requestData.pid, success)
        break;
      }
      default: {
        ns.toast(`Unexpected PortDaemonRequest type ${requestData.request} for ${requestData.name}`)
        break
      }
    }
  }
}

