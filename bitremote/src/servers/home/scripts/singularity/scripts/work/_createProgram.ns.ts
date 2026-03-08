import { PROGRAMS } from "@home/lib/main"

export async function main(ns: NS) {
  for (const program of Object.keys(PROGRAMS)) {
    ns.singularity.createProgram(program, true)
  }
}
