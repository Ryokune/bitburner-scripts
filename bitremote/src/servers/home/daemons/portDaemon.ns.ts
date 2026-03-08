import { PortDaemonRequest, PORTD_READ_PORT, PORTD_WRITE_PORT } from "@home/lib/portdaemonlib";
import { deregisterPort, generatePortsData, getPortNumber, registerOrGetPortNumber, registerPort, type Ports } from "@home/lib/ports";

// all of this complicated mess could be simplified with just....
// a lib/ports.ts file that exports....
// PORTS = {
// HACK_PORT: 1
// WEAKEN_PORT: 2
// GROW_PORT: 3
// ...
// }
//
// but i went insane and went with doing this in 3 am. coolstuff

export let PortDaemonData: Ports;

export async function main(ns: NS) {
  if (!PortDaemonData)
    PortDaemonData = generatePortsData(3, 50)

  const read = ns.getPortHandle(PORTD_READ_PORT)
  const write = ns.getPortHandle(PORTD_WRITE_PORT)

  // Would probably wanna clear everything
  // for (const [_, portNum] of PortDaemonData.ports) {
  //   ns.getPortHandle(portNum).clear()
  // }
  //read.clear()
  //write.clear()
  //
  // ns.atExit(() => {
  //   for (const [_, portNum] of PortDaemonData.ports) {
  //     ns.getPortHandle(portNum).clear()
  //   }
  // })

  async function doWrite<T>(pid: number, data: T) {
    ns.print("Waiting for write to be empty")
    const runningScript = ns.getRunningScript(pid)
    while (!write.empty()) {
      await ns.sleep(0)
    }
    ns.print(`Writing ${data} for ${runningScript?.filename}`)

    while (!write.tryWrite({ pid, data })) {
      await ns.sleep(0)
    }
    ns.print(`Waiting for ${runningScript?.filename} to consume data: ${data}.`)
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
      if (read.empty()) await read.nextWrite()
      requestData = read.peek()
    }
    switch (requestData.request) {
      case "register": {
        ns.print(`Registering ${requestData.name}`)
        const success = await registerPort(ns, requestData.name, PortDaemonData)
        ns.print(`Registered ${requestData.name}`)
        await doWrite(requestData.pid, success)
        break;
      }
      case "get": {
        const port = getPortNumber(requestData.name, PortDaemonData)

        ns.print(`Resolving ${requestData.name} to PORT ${port}`)
        await doWrite(requestData.pid, port)
        break;
      }
      case "delete": {
        ns.print(`Deleting ${requestData.name}`)
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

