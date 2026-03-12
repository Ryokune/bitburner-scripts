
export async function main(ns: NS) {
  // Probably the only two most practical ones to create. Others you can just buy.. maybe not in other bitnodes though, we will see.
  for (const program of ["FTPCrack.exe", "BruteSSH.exe"]) {
    ns.singularity.createProgram(program, ns.args[0] as boolean)
  }
}
