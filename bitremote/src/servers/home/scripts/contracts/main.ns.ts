import { getHosts } from "@home/lib/main"
import SOLVERS from "./solvers"

export async function main(ns: NS) {
  const HOSTS = getHosts(ns, h => ns.ls(h).length > 0 && h != "home")
  for (const HOST of HOSTS) {
    const FILES = ns.ls(HOST)
    for (const FILE of FILES) {
      const EXT = FILE.split(".").pop()
      if (EXT != "cct") continue
      const TYPE = ns.codingcontract.getContractType(FILE, HOST)
      const DATA = ns.codingcontract.getData(FILE, HOST)
      ns.tprint(`${HOST}: ${FILE} ${TYPE}`)
      ns.tprint(DATA)
      if (SOLVERS[TYPE]) {
        ns.tprint('\n\n')
        const [USE, SOLUTION] = SOLVERS[TYPE](DATA as never, ns)
        if (USE) {
          const SUCCESS_STRING = ns.codingcontract.attempt(SOLUTION, FILE, HOST)
          if (!SUCCESS_STRING) {
            ns.tprint(`Failed ${FILE} on ${HOST} (${TYPE}). ${ns.codingcontract.getNumTriesRemaining(FILE, HOST)} tries remaining. ${SOLUTION}`)
          } else {
            ns.tprint(`SUCCESS! Gained ${SUCCESS_STRING} from ${HOST}:${FILE} (${TYPE})`)
          }
        } else {
          ns.tprint(SOLUTION)
        }
      }
    }
  }
}


export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  return []
}

