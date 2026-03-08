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

async function daemonRequest<T>(ns: NS, request: PortDaemonRequest): Promise<T> {
  const daemon_reader = ns.getPortHandle(PORTD_READ_PORT)
  const daemon_writer = ns.getPortHandle(PORTD_WRITE_PORT)

  while (!daemon_writer.empty() || !daemon_reader.empty()) {
    ns.tprint("not empty")
    await ns.asleep(0)
  }
  while (!daemon_reader.tryWrite(request)) {
    await ns.asleep(0)
  }
  ns.tprint(`try to send now. ${request.name} ${request.request}`)
  let data: WriteData<T> | 'NULL PORT DATA' = 'NULL PORT DATA'
  while (data == 'NULL PORT DATA') {
    await daemon_writer.nextWrite()
    data = daemon_writer.peek()
    if ((data as WriteData<T>).pid != request.pid) {
      data = 'NULL PORT DATA'
    }
  }
  ns.tprint(`SENDING!!!!!!!!!!! ${data.data} to ${request.name} ${request.request}`)
  daemon_writer.read()
  return data.data as T
}

export async function daemonGetPort(ns: NS, name: string) {
  return daemonRequest<number>(ns, { request: "get", name, pid: ns.pid })
}

export async function daemonRegisterPort(ns: NS, name: string) {
  return daemonRequest<boolean>(ns, { request: "register", name, pid: ns.pid })
}

export async function daemonDeletePort(ns: NS, name: string) {
  return daemonRequest<boolean>(ns, { request: "delete", name, pid: ns.pid })
}


export async function daemonGetPortHandle(ns: NS, name: string) {
  const portNumber = await daemonGetPort(ns, name)
  if (portNumber === -1) {
    return undefined
  }
  return ns.getPortHandle(portNumber)
}
