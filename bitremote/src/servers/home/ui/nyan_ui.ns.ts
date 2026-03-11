import { NS, UserInterfaceTheme } from "@ns";

function normalizeHex(hex: string): string {
  hex = hex.replace("#", "").toLowerCase();
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  return hex;
}

function hexToHsl(hex: string): [number, number, number] {
  hex = normalizeHex(hex);

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h *= 60;
  }

  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) =>
    Math.round(x * 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export async function main(ns: NS) {
  const original = ns.ui.getTheme();
  let frameID: number;

  ns.atExit(() => ns.ui.setTheme(original));

  const keys = Object.keys(original) as (keyof UserInterfaceTheme)[];

  const hsl = keys.map(k => hexToHsl(original[k]));

  let hueShift = 0;

  while (true) {
    hueShift = (hueShift + 1) % 360;

    const newTheme: Partial<UserInterfaceTheme> = {};

    for (let i = 0; i < keys.length; i++) {
      const [h, s, l] = hsl[i];
      newTheme[keys[i]] = hslToHex((h + hueShift) % 360, s, l);
    }

    ns.ui.setTheme(newTheme as UserInterfaceTheme);

    await ns.sleep(10000);
  }
}

export function autocomplete(): string[] { return []; }
