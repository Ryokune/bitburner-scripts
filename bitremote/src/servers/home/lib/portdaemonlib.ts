import { deregisterPort, generatePortsData, getPort, getPortNumber, Ports, registerPort } from "./ports";

export const PORTD_READ_PORT = 2;
export const PORTD_WRITE_PORT = 3;

export type PortDaemonRequestType = "register" | "get" | "delete"

export interface PortDaemonRequest {
  request: PortDaemonRequestType
  pid: number
  name: string
}

interface WriteData<T> {
  pid: number,
  data: T
}

const LOCAL_PORT_DATA: Ports = generatePortsData(2, 50);
let UNSAFE_ACTION_CONFIRMED: boolean | undefined = undefined;
export function initunsafe() {
  UNSAFE_ACTION_CONFIRMED = undefined
}
async function daemonRequest<T>(ns: NS, request: PortDaemonRequest): Promise<T> {
  if (!ns.isRunning("daemons/portDaemon.ns.js", "home")) {
    if (UNSAFE_ACTION_CONFIRMED === undefined) {
      const alert = await ns.prompt("PORT DAEMON NOT RUNNING. DO YOU WANT TO CONTINUE? THIS IS UNSAFE.") as boolean
      UNSAFE_ACTION_CONFIRMED = alert
    }
    if (!UNSAFE_ACTION_CONFIRMED) return undefined as T
    let ret;
    switch (request.request) {
      case "register": {
        ret = await registerPort(ns, request.name, LOCAL_PORT_DATA)
        break
      }
      case "get": {
        ret = getPortNumber(request.name, LOCAL_PORT_DATA)
        break
      }
      case "delete": {
        ret = await deregisterPort(ns, request.name, LOCAL_PORT_DATA)
        break
      }
    }
    return ret as T
  }
  const daemon_reader = ns.getPortHandle(PORTD_READ_PORT)
  const daemon_writer = ns.getPortHandle(PORTD_WRITE_PORT)

  while (!daemon_writer.empty() || !daemon_reader.empty()) {
    await ns.asleep(0)
  }
  while (!daemon_reader.tryWrite(request)) {
    await ns.asleep(0)
  }
  let data: WriteData<T> | 'NULL PORT DATA' = 'NULL PORT DATA'
  while (data == 'NULL PORT DATA') {
    await daemon_writer.nextWrite()
    data = daemon_writer.peek()
    if ((data as WriteData<T>).pid != request.pid) {
      data = 'NULL PORT DATA'
    }
  }
  daemon_writer.read()
  return data.data as T
}

export async function daemonGetPort(ns: NS, name: string) {
  return await daemonRequest<number>(ns, { request: "get", name, pid: ns.pid })
}

export async function daemonRegisterPort(ns: NS, name: string) {
  return await daemonRequest<boolean>(ns, { request: "register", name, pid: ns.pid })
}

export async function daemonDeletePort(ns: NS, name: string) {
  return await daemonRequest<boolean>(ns, { request: "delete", name, pid: ns.pid })
}


export async function daemonGetPortHandle(ns: NS, name: string) {
  const portNumber = await daemonGetPort(ns, name)
  if (portNumber === -1) {
    return undefined
  }
  return ns.getPortHandle(portNumber)
}
