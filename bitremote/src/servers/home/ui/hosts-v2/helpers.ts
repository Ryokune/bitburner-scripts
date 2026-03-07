import { interpolateColor } from "@home/lib/ui"

export function getMoneyColor(ratio: number) {
  if (ratio <= 0.5) return "#ff4d4d"
  if (ratio <= 0.75) return interpolateColor("#ff4d4d", "#ffff66", (ratio - 0.5) / 0.25)
  return interpolateColor("#ffff66", "#66ff88", (ratio - 0.75) / 0.25)
}

export function getSecurityColor(ratio: number) {
  ratio = Math.max(1, Math.min(4, ratio))
  if (ratio <= 1.5) return interpolateColor("#66ff88", "#ffff66", (ratio - 1) / 0.5)
  if (ratio <= 2) return interpolateColor("#ffff66", "#ff9900", (ratio - 1.5) / 0.5)
  return interpolateColor("#ff9900", "#ff4d4d", (ratio - 2) / 2)
}

export function getRamColor(ratio: number) {
  if (ratio <= 0.5) return "#ff4d4d"
  if (ratio <= 0.75) return interpolateColor("#ff4d4d", "#ffff66", (ratio - 0.5) / 0.25)
  return interpolateColor("#ffff66", "#66ff88", (ratio - 0.75) / 0.25)
}
