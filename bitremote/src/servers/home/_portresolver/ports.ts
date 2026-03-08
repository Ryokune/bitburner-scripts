import { type NetscriptPort } from "@ns"

const MUTEX_PORT = 1

export interface Ports {
  ports: Map<string, number>
  available: number[]
}

export function generatePortsData(minPorts: number, maxPorts: number) {
  const data: Ports = {
    ports: new Map(),
    available: Array.from({ length: maxPorts - minPorts }, (_, i) => i + minPorts)
  }
  return data
}

async function acquireLock(ns: NS) {
  const handle = ns.getPortHandle(MUTEX_PORT)

  while (!handle.tryWrite("lock")) {
    await ns.asleep(0)
  }
}

function releaseLock(ns: NS) {
  ns.getPortHandle(MUTEX_PORT).read()
}

export function getPortNumber(name: string, data: Ports): number {
  return data.ports.get(name) ?? -1
}

export function getPort(ns: NS, name: string, data: Ports): NetscriptPort | undefined {
  const portNumber = data.ports.get(name)
  if (portNumber == undefined) return undefined

  return ns.getPortHandle(portNumber)
}

export async function registerOrGetPortHandle(ns: NS, name: string, data: Ports): Promise<NetscriptPort | undefined> {
  let port = getPort(ns, name, data)
  if (port !== undefined) return port

  await registerPort(ns, name, data)
  return getPort(ns, name, data)
}

export async function registerOrGetPortNumber(ns: NS, name: string, data: Ports): Promise<number> {
  let port = getPortNumber(name, data)
  if (port !== -1) return port

  await registerPort(ns, name, data)

  return getPortNumber(name, data)
}

export async function registerPort(ns: NS, name: string, data: Ports): Promise<boolean> {
  await acquireLock(ns)

  try {
    if (data.ports.has(name)) return false

    const port = data.available.pop()
    if (port === undefined) return false

    data.ports.set(name, port)
    return true
  } finally {
    releaseLock(ns)
  }
}

export async function deregisterPort(ns: NS, name: string, data: Ports): Promise<boolean> {
  await acquireLock(ns)
  try {
    const port = data.ports.get(name)
    if (port === undefined) return false

    const handle = ns.getPortHandle(port)
    handle.clear()
    data.available.push(port)
    data.ports.delete(name)
    return true
  } finally {
    releaseLock(ns)
  }
}
