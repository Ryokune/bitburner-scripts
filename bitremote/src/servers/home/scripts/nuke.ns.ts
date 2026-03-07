import { getHosts, PROGRAMS } from "@home/lib/main";

export async function main(ns: NS) {
  const MyPrograms = Object.entries(PROGRAMS)
    .filter(([prog]) => ns.fileExists(prog, "home"))
    .map(([, fn]) => fn);

  const Capabilities = MyPrograms.length;
  function filter(host: string): boolean {
    return (
      ns.getServerNumPortsRequired(host) <= Capabilities
      && !ns.hasRootAccess(host))
  }
  const hosts = getHosts(ns, filter)
  for (const host of hosts) {
    for (const Program of MyPrograms) {
      Program(ns, host);
    }

    ns.nuke(host);
    ns.toast(`Nuked: ${host}`, "success");
  }
}

