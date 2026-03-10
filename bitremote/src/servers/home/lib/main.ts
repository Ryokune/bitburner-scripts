import { RunOptions } from "@ns";

export const PROGRAMS: Record<string, (ns: NS, host: string) => void> = {
  "brutessh.exe": (ns, h) => ns.brutessh(h),
  "ftpcrack.exe": (ns, h) => ns.ftpcrack(h),
  "relaysmtp.exe": (ns, h) => ns.relaysmtp(h),
  "httpworm.exe": (ns, h) => ns.httpworm(h),
  "sqlinject.exe": (ns, h) => ns.sqlinject(h)
};

export interface Host {
  parent?: string;
  children: string[];
}


export function getFlagAuto(args: ScriptArg[], schema: Flags): any[] | null {
  if (args.length === 0) return null;
  let flagName = "";
  let flagX = 0;

  // Backtrack the current args and determine the current latest flag.
  // Of course, this has the limitation of the autocomplete not being correct if you do
  // myScript --myFlag 1 --otherFlag "..."
  // And put your cursor to --myFlag, it will still autocomplete what `otherFlag` has as its options. You could potentially get the current cursor position using `document`, but thats your homework if you want that functionality. 
  for (let i = args.length - 1; i >= 0; i--) {
    const arg = String(args[i]);
    if (arg.startsWith("--")) {
      flagName = arg;
      flagX = i
      break;
    }
  }

  // This is a little hacky way to see if we've completed a stringed option.
  // Since we return array options as arr[v] => `"v"`
  // args[flagX+1] will return [`"MyValue`, `SpacedThing`] if the string isnt completed yet.
  // and will be [`MyValue`, `SpacedThing`] once we complete the string.
  // --flag "MyValue SpacedThing" will make flagName be ""
  // --flag "MyValue NotComple
  // ^ this will keep the flagName until you add the final "
  if (args[flagX + 1]) {
    flagName = String(args[flagX + 1]).startsWith(`"`) ? flagName : ""
  }
  if (!flagName) return null;

  // Finally, return the values. booleans will be "true/false".
  // Keep in mind that this part is only here incase you just pass in the whole FLAGS array instead of a separate one.
  // In theory, you can have FLAGS and FLAGS_COMPLETION as two separate things!
  for (const [name, options] of schema) {
    if (flagName === `--${name}`) {
      if (Array.isArray(options)) return options.map(v => `"${v}"`);
      if (typeof options === 'boolean') return ["true", "false"];
      return [`${options}`];
    }
  }

  return null;
}


export type Flags = [string, string | number | boolean | string[]][]

// is there a better way to do this wth.
type MapFlags<T extends Flags> = {
  [K in T[number]as K[0]]:
  K[1] extends number ? number :
  K[1] extends boolean ? boolean :
  K[1] extends string[] ? string[] :
  K[1] extends string ? string :
  K[1]
} & {
  _: ScriptArg[];
};;

export const getFlags = <T extends Flags>(ns: NS, flags: T) => ns.flags(flags) as MapFlags<T>
export const defineFlags = <const T extends Flags>(f: T) => f satisfies T;

export function getContracts(ns: NS, host: string) {
  return ns.ls(host).filter(v => v.split(".")[0] === "cct")
}

export function hasAllPrograms(ns: NS): boolean {
  const files = new Set(ns.ls("home").filter(f => f.split(".").pop() == "exe").map(f => f.toLowerCase()))
  const programs = Object.keys(PROGRAMS)
  for (const program of programs) {
    if (!files.has(program)) {
      return false
    }
  }

  return true
}

export function resolvePath(base: string, relative: string): string {
  if (relative.startsWith("/")) return relative.slice(1, relative.length);

  const baseParts = base.split("/").slice(0, -1);
  const relParts = relative.split("/");

  for (const part of relParts) {
    if (part === "." || part === "") continue;
    if (part === "..") baseParts.pop();
    else baseParts.push(part);
  }
  return baseParts.join("/");
}

export function runScript(
  ns: NS,
  script: string,
  threadsOrOptions: number | RunOptions = 1,
  ...args: (string | number | boolean)[]
) {
  const caller = ns.getScriptName();
  const resolved = resolvePath(caller, script);
  return ns.run(resolved, threadsOrOptions, ...args);
}


export function printTree(ns: NS, tree: Map<string, Host>, additional: (hostname: string) => string = () => "", root = "home") {
  type StackItem = { node: string; prefix: string; isLast: boolean; };
  const stack: StackItem[] = [{ node: root, prefix: "", isLast: true }];
  while (stack.length) {
    const { node, prefix, isLast } = stack.pop()!;
    const host = tree.get(node);
    if (!host) continue;
    const connector = isLast ? "└─" : "├─";
    const children = host.children;
    const newPrefix = prefix + ((isLast ? "  " : " │ "));

    // Push children in reverse so they print in correct order
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({
        node: children[i],
        prefix: newPrefix,
        isLast: i === children.length - 1
      });
    }
    ns.tprint(`${prefix} ${connector} ${node}: ${additional(node)}`);
  }
}
export function getAvailableRam(ns: NS, hostname: string) {
  return ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
}
export function getScripts(ns: NS, hostname: string, path?: string) {
  const caller = ns.getScriptName()
  return ns.ls(hostname).filter(f =>
    (!path || f.startsWith(resolvePath(caller, path))) &&
    (f.endsWith('.js') ||
      f.endsWith('.ts') ||
      f.endsWith('.tsx') ||
      f.endsWith('.jsx'))
  );
}

export function getAllRunningProccesses(ns: NS) {
  const proccesses = []
  for (const host of getHosts(ns, h => h != "home")) {
    proccesses.push(...ns.ps(host))
  }
  proccesses.sort((a, b) => a.pid - b.pid)
  proccesses.push(...ns.ps("home"))
  return proccesses
}

export function calculateFitness(ns: NS, HOST: string) {
  const maxMoney = ns.getServerMaxMoney(HOST)

  if (maxMoney <= 0) return -Infinity
  //const minSec = ns.getServerMinSecurityLevel(HOST)
  //const hackChance = Math.max(0.1, ns.hackAnalyzeChance(HOST))
  const growth = ns.getServerGrowth(HOST)
  // const fitness =
  //   ((maxMoney / 1e10) *
  //     hackChance *
  //     (growth))
  //   / (((ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST)) / 3)
  //     * minSec)
  const AVAIL_MONEY = ns.getServerMoneyAvailable(HOST)
  //const TARGETS_MONEY_FITNESS = (AVAIL_MONEY / maxMoney)
  //const TARGETS_SECURITY_FITNESS = (minSec / ns.getServerSecurityLevel(HOST))

  // const fitness = (
  //   (((TARGETS_MONEY_FITNESS * 2) + TARGETS_SECURITY_FITNESS) / 3)
  //   * (growth / ((maxMoney - AVAIL_MONEY) / maxMoney))
  //   * hackChance
  //   * (minSec)
  // )
  //   / ((ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST)) / 3)
  //
  const fitness = (maxMoney * (ns.getPlayer().skills.hacking - ns.getServerRequiredHackingLevel(HOST) * 1.5) * (growth / ((maxMoney - AVAIL_MONEY) / maxMoney))) / (ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST))

  //const fitness = (((TARGETS_MONEY_FITNESS + TARGETS_SECURITY_FITNESS) / 2)
  //  / ((ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST)) / 3))
  //   * (growth / (maxMoney - ns.getServerMoneyAvailable(HOST)))

  // const fitness = (
  //   (((TARGETS_MONEY_FITNESS*2)+TARGETS_SECURITY_FITNESS)/3) 
  //   * (growth / ((maxMoney - AVAIL_MONEY)/maxMoney))
  //   * hackChance
  // )
  // / ((ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST)) / 3)

  // const canHack = (ns.getServerRequiredHackingLevel(HOST) - ns.getHackingLevel()) == 0 ? 1 : 0



  // const moneyRatio = ns.getServerMoneyAvailable(HOST) / ns.getServerMaxMoney(HOST)
  // const moneyGapRatio = Math.max(0.1,1 - moneyRatio) // normalized 0 → 1
  // const securityRatio = ns.getServerMinSecurityLevel(HOST) / ns.getServerSecurityLevel(HOST)
  // const timeFactor = (ns.getGrowTime(HOST) + ns.getHackTime(HOST) + ns.getWeakenTime(HOST)) / 3
  // // soften gap influence (sqrt prevents domination)
  // //const softenedGap = Math.sqrt(moneyGapRatio)
  // const fitness =
  //   ((((moneyRatio + securityRatio) / 2)
  //   * (growth*Math.sqrt(moneyGapRatio)))
  //   / moneyGapRatio)
  //   / timeFactor

  // const moneyAvailable = ns.getServerMoneyAvailable(HOST)
  // const moneyFitness = moneyAvailable / maxMoney  // 0 → 1
  //
  // const securityFitness =
  //   ns.getServerMinSecurityLevel(HOST) /
  //   ns.getServerSecurityLevel(HOST)   // 0 → 1
  //
  // const avgTime =
  //   (ns.getHackTime(HOST) +
  //     ns.getGrowTime(HOST) +
  //     ns.getWeakenTime(HOST)) / 3
  //
  // // readiness matters most
  // const readiness = (moneyFitness * 2 + securityFitness) / 3
  //
  // // future earning potential
  // const earningPotential =
  //   growth *
  //   Math.log10(moneyAvailable + 1)
  //
  // const fitness =
  //   (readiness *
  //     earningPotential) /
  //   avgTime

  return fitness
}

export function getHosts(ns: NS, filter: (hostname: string) => boolean = () => true) {
  const hostnames = new Set<string>(["home"])
  hostnames.forEach(hostname => ns.scan(hostname).forEach(adj => hostnames.add(adj)))
  return [...hostnames].sort().filter(filter)
}

export function getTree(ns: NS): Map<string, Host> {
  const tree = new Map<string, Host>();
  const queue: string[] = ["home"];

  tree.set("home", { children: [] });

  while (queue.length) {
    const host = queue.shift()!;
    const current = tree.get(host)!;

    for (const neighbor of ns.scan(host)) {
      if (neighbor === current.parent) continue;
      if (!tree.has(neighbor)) {
        tree.set(neighbor, {
          parent: host,
          children: []
        });
        queue.push(neighbor);
      }

      current.children.push(neighbor);
    }
  }

  return tree;
}
