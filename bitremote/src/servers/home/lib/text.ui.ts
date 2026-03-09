
const RESET = "\x1b[0m";

function ansi(...codes: (number | string)[]) {
  return `\x1b[${codes.join(";")}m`;
}

type Formatter = {
  (text: string): string

  black: Formatter
  red: Formatter
  green: Formatter
  yellow: Formatter
  blue: Formatter
  magenta: Formatter
  cyan: Formatter
  white: Formatter

  bgBlack: Formatter
  bgRed: Formatter
  bgGreen: Formatter
  bgYellow: Formatter
  bgBlue: Formatter
  bgMagenta: Formatter
  bgCyan: Formatter
  bgWhite: Formatter

  bold: Formatter
  underline: Formatter

  rgb: (r: number, g: number, b: number) => Formatter
  bgRgb: (r: number, g: number, b: number) => Formatter

  color256: (index: number) => Formatter
  bg256: (index: number) => Formatter
}

function createFormatter(codes: (number | string)[] = []): Formatter {
  const fn = ((text: string) =>
    `${ansi(...codes)}${text}${RESET}`) as Formatter

  return new Proxy(fn, {
    get(_, prop: string) {

      const map: Record<string, number> = {
        // foreground
        black: 30,
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37,

        // background
        bgBlack: 40,
        bgRed: 41,
        bgGreen: 42,
        bgYellow: 43,
        bgBlue: 44,
        bgMagenta: 45,
        bgCyan: 46,
        bgWhite: 47,

        // attributes
        bold: 1,
        underline: 4,
      }

      if (prop in map) {
        return createFormatter([...codes, map[prop]])
      }

      if (prop === "rgb") {
        return (r: number, g: number, b: number) =>
          createFormatter([...codes, `38;2;${r};${g};${b}`])
      }

      if (prop === "bgRgb") {
        return (r: number, g: number, b: number) =>
          createFormatter([...codes, `48;2;${r};${g};${b}`])
      }

      if (prop === "color256") {
        return (index: number) =>
          createFormatter([...codes, `38;5;${index}`])
      }

      if (prop === "bg256") {
        return (index: number) =>
          createFormatter([...codes, `48;5;${index}`])
      }

      return undefined
    },
  }) as Formatter
}

export const c = createFormatter()

/* ---------------- */
/* Logging helpers  */
/* ---------------- */

export const log = {
  info(text: string) {
    return c.cyan(`INFO  ${text}`)
  },

  warn(text: string) {
    return c.yellow(`WARN  ${text}`)
  },

  error(text: string) {
    return c.red.bold(`FAIL  ${text}`)
  },

  success(text: string) {
    return c.green(`OKAY  ${text}`)
  },
}


export function progress(
  value: number,
  max: number,
  width = 30
) {
  const pct = Math.max(0, Math.min(1, value / max))

  const filled = Math.round(width * pct)
  const empty = width - filled

  const bar =
    c.green("█".repeat(filled)) +
    c.white("░".repeat(empty))

  const percent = (pct * 100).toFixed(1)

  return `[${bar}] ${percent}%`
}


const ANSI_REGEX = /\x1b\[[0-9;]*m/g

function visibleLength(str: string) {
  return str.replace(ANSI_REGEX, "").length
}

export function table(rows: string[][]) {
  const colWidths: number[] = []

  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = visibleLength(cell)
      colWidths[i] = Math.max(colWidths[i] ?? 0, len)
    })
  }

  return rows
    .map(row =>
      row
        .map((cell, i) => {
          const pad = colWidths[i] - visibleLength(cell)
          return cell + " ".repeat(pad)
        })
        .join("  ")
    )
    .join("\n")
}
