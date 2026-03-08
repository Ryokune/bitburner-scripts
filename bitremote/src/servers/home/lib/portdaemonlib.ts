export const PORTD_READ_PORT = 2;
export const PORTD_WRITE_PORT = 3;

export type PortDaemonRequestType = "get" | "delete"

export interface PortDaemonRequest {
  request: PortDaemonRequestType
  name: string
}

async function daemonRequest<T>(ns: NS, request: PortDaemonRequest): Promise<T> {
  const daemon_reader = ns.getPortHandle(PORTD_READ_PORT)
  const daemon_writer = ns.getPortHandle(PORTD_WRITE_PORT)

  while (!daemon_writer.empty() || !daemon_reader.empty()) {
    await ns.asleep(0)
  }
  while (!daemon_reader.tryWrite(request)) {
    await ns.asleep(0)
  }

  await daemon_writer.nextWrite()
  return daemon_writer.read()
}

export async function daemonGetPort(ns: NS, name: string) {
  return daemonRequest<number>(ns, { request: "get", name })
}

export async function daemonGetPortHandle(ns: NS, name: string) {
  const portNumber = await daemonRequest<number>(ns, { request: "get", name })
  if (portNumber === -1) {
    return undefined
  }
  return ns.getPortHandle(portNumber)
}

export async function daemonDeletePort(ns: NS, name: string) {
  return daemonRequest<boolean>(ns, { request: "delete", name })
}
