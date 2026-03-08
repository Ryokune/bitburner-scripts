import { PROGRAMS } from "@home/lib/main"

export async function main(ns: NS) {
  // Probably the only two most practical ones to create. Others you can just buy.. maybe not in other bitnodes though, we will see.
  for (const program of ["BruteSSH.exe", "FTPCrack.exe"]) {
    ns.singularity.createProgram(program, true)
  }
}
