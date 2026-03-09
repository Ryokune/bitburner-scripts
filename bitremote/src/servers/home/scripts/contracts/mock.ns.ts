import { color, FG } from "@home/lib/colors"
import solvers from "./solvers"
import { Flags } from "@home/lib/main"
import { c, progress } from "@home/lib/text.ui"

const FLAGS: Flags = [
  ["repeat", 1],
  ["bench", 1],
]

type SolverStats = {
  success: number
  fail: number
  duration: number
  desc?: string
  fails: {
    data: unknown
    result: unknown
  }[]
}

export async function main(ns: NS) {
  const flags = ns.flags(FLAGS)
  const bench = flags.bench as number
  const repeat = flags.repeat as number

  const stats: Record<string, SolverStats> = {}
  for (let r = 0; r < repeat; r++) {
    ns.tprint(`Generating ${progress(r + 1, repeat)}`)
    for (const [type, solver] of Object.entries(solvers)) {
      if (!stats[type]) {
        stats[type] = {
          success: 0,
          fail: 0,
          duration: 0,
          fails: [],
        }
      }
      const dummy = ns.codingcontract.createDummyContract(type)
      const data = ns.codingcontract.getData(dummy)
      const desc = ns.codingcontract.getDescription(dummy)

      const start = performance.now()

      let result
      for (let i = 0; i < bench; i++) {
        const [, r] = solver(data as never, ns)
        result = r
      }

      const duration = performance.now() - start
      const success = ns.codingcontract.attempt(result, dummy)

      const s = stats[type]
      s.duration += duration
      s.desc ??= desc

      if (success) {
        s.success++
      } else {
        s.fail++
        s.fails.push({ data, result })
      }

      ns.rm(dummy)
      await ns.asleep(0)
    }
  }

  for (const [type, s] of Object.entries(stats).sort((a, b) => a[1].duration - b[1].duration)) {
    const avgDuration = s.duration / repeat
    const failPct = (s.fail / repeat) * 100
    const successPct = (s.success / repeat) * 100

    const header = c.bold.underline(type) +
      ` (${c.green(s.success.toFixed(0))}/${c.red(s.fail.toFixed(0))})`
    const counts =
      "  fail: " +
      c.red(`${failPct.toFixed(1)}% `) +
      "success: " +
      c.green(`${successPct.toFixed(1)}% `)
    ns.tprint(header)
    ns.tprint(`  (avg ${avgDuration.toFixed(2)} ms | total ${s.duration.toFixed(2)} ms) `)
    ns.tprint(counts)

    for (const f of s.fails) {
      ns.tprint(
        color(
          `-- ${JSON.stringify(f.data)} => ${JSON.stringify(f.result)}`,
          FG.red
        )
      )
    }

    if (s.fails.length > 0 && s.desc) {
      ns.tprint(`-- ${s.desc}`)
    }
  }
}

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  data.flags(FLAGS)
  return []
}
