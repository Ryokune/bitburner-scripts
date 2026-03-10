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

      if (!SOLVER) {
        ns.tprint(`NO SOLVER: ${c.yellow.underline(TYPE)}${c.cyan('@')}${c.underline.green(HOST)}: ${FILE}`)
        ns.tprint(DATA)
        continue
      }

      const [USE, SOLUTION] = SOLVER(DATA as never, ns)
      if (!USE) {
        ns.tprint(`Skipped ${c.blue.underline(TYPE)}${c.cyan('@')}${c.underline.green(HOST)}: ${FILE}`)
        continue
      }

      const SUCCESS_STRING = ns.codingcontract.attempt(SOLUTION, FILE, HOST)
      if (!SUCCESS_STRING) {
        ns.tprint(c.red.bold.underline(`Failed ${FILE} on ${HOST} (${TYPE}). ${ns.codingcontract.getNumTriesRemaining(FILE, HOST)} tries remaining. ${SOLUTION}`))
        continue
      }

      ns.tprint(c.green.underline(`SUCCESS - Gained ${SUCCESS_STRING} from solving ${TYPE}@${HOST} (${FILE})`))

    }
  }
}


export function autocomplete(data: AutocompleteData, args: ScriptArg[]): string[] {
  return []
}

