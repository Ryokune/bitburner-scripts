export async function main(ns: NS) {
  while (true) {
    const cmd = await ns.prompt("[repl]:", { type: "text" })
    if (!cmd || cmd == "exit") break;
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

