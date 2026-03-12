export async function main(ns: NS) {
  ns.ramOverride(1.75)
  const target = ns.args[0] as string
  const security = ns.args[1] as number

  if (security > 0)
    await ns.weaken(target)
  else
    await ns.grow(target)
}

