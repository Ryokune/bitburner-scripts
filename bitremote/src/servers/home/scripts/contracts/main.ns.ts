import { getHosts } from "@home/lib/main"
import SOLVERS from "./solvers"
import { c } from "@home/lib/text.ui"

export async function main(ns: NS) {
  const HOSTS = getHosts(ns, h => ns.ls(h).length > 0 && h != "home")
  for (const HOST of HOSTS) {
    const FILES = ns.ls(HOST)
    for (const FILE of FILES) {
      const EXT = FILE.split(".").pop()
      if (EXT != "cct") continue
      const TYPE = ns.codingcontract.getContractType(FILE, HOST)
      const DATA = ns.codingcontract.getData(FILE, HOST)
      const SOLVER = SOLVERS[TYPE]

      ns.tprint(`${SOLVER ? c.green(TYPE) : c.yellow.underline(TYPE)}${c.cyan('@')}${c.underline.green(HOST)}: ${FILE}`)
      ns.tprint(DATA)
      if (SOLVER) {
        const [USE, SOLUTION] = SOLVER(DATA as never, ns)
        if (USE) {
          const SUCCESS_STRING = ns.codingcontract.attempt(SOLUTION, FILE, HOST)
          if (!SUCCESS_STRING) {
            ns.tprint(c.red.bold.underline(`Failed ${FILE} on ${HOST} (${TYPE}). ${ns.codingcontract.getNumTriesRemaining(FILE, HOST)} tries remaining. ${SOLUTION}`))
          } else {
            ns.tprint(c.green.underline(`SUCCESS - Gained ${SUCCESS_STRING} from ${TYPE}@${HOST} (${FILE})`))
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

