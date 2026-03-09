const RESET = "\x1b[0m";

/* ------------------ */
/* Color Definitions  */
/* ------------------ */

export const FG = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
} as const;

export const BG = {
  black: 40,
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
} as const;

export const ATTR = {
  reset: 0,
  bold: 1,
  underline: 4,
} as const;

/* ------------------ */
/* Types              */
/* ------------------ */

export type Foreground = typeof FG[keyof typeof FG];
export type Background = typeof BG[keyof typeof BG];
export type Attribute = typeof ATTR[keyof typeof ATTR];

export type RGB = number; // expected 0-255
export type Color256 = number; // expected 0-255

export type StyleOptions = {
  fg?: Foreground;
  bg?: Background;
  bold?: boolean;
  underline?: boolean;
};

/* ------------------ */
/* Core ANSI builder  */
/* ------------------ */

function ansi(...codes: (number | string)[]): string {
  return `\x1b[${codes.join(";")}m`;
}

/* ------------------ */
/* Main Style Helper  */
/* ------------------ */

export function style(text: string, opts: StyleOptions = {}): string {
  const codes: (number | string)[] = [];

  if (opts.bold) codes.push(ATTR.bold);
  if (opts.underline) codes.push(ATTR.underline);
  if (opts.fg) codes.push(opts.fg);
  if (opts.bg) codes.push(opts.bg);

  return `${ansi(...codes)}${text}${RESET}`;
}

/* ------------------ */
/* Simple Helpers     */
/* ------------------ */

export function color(text: string, fg: Foreground) {
  return style(text, { fg });
}

export function bg(text: string, bg: Background) {
  return style(text, { bg });
}

export function bold(text: string) {
  return style(text, { bold: true });
}

export function underline(text: string) {
  return style(text, { underline: true });
}

/* ------------------ */
/* 256 Color Support  */
/* ------------------ */

export function color256(text: string, index: Color256) {
  return `${ansi(`38;5;${index}`)}${text}${RESET}`;
}

export function bg256(text: string, index: Color256) {
  return `${ansi(`48;5;${index}`)}${text}${RESET}`;
}

/* ------------------ */
/* 16M RGB Support    */
/* ------------------ */

export function rgb(text: string, r: RGB, g: RGB, b: RGB) {
  return `${ansi(`38;2;${r};${g};${b}`)}${text}${RESET}`;
}

export function bgRgb(text: string, r: RGB, g: RGB, b: RGB) {
  return `${ansi(`48;2;${r};${g};${b}`)}${text}${RESET}`;
}

/* ------------------ */
/* Logging Helpers    */
/* ------------------ */

export const log = {
  info(text: string) {
    return `INFO  ${text}`;
  },

  warn(text: string) {
    return `WARN  ${text}`;
  },

  error(text: string) {
    return `FAIL  ${text}`
  },

  success(text: string) {
    return `OKAY  ${text}`
  },
};
