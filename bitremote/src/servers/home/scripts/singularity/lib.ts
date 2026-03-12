import type { FactionName, Task } from "@ns"

export const SINGULARITY_DATA_DIRS = {
  CURRENT_WORK: "data/current_work.json",
  FACTION_INVITATIONS: "data/faction_invites.json",
  OWNED_AUGMENTATIONS: "data/owned_augmentations.json",
  FACTION_ENEMIES: "data/faction_enemies.json",
  FACTION_AUGMENTATIONS: "data/faction_augmentations.json",
  AUGMENTATION_DATA: "data/augmentation_data.json"
} as const


function write<T>(ns: NS, directory: string, data?: T) {
  if (!data) {
    ns.rm(directory)
    return
  }
  ns.write(directory, JSON.stringify(data), "w")
}
function get<T>(ns: NS, directory: string) {
  const data = ns.read(directory)
  if (!data) return null
  return JSON.parse(data) as T
}


export function writeCurrentWork(ns: NS) {
  write(ns, SINGULARITY_DATA_DIRS.CURRENT_WORK, ns.singularity.getCurrentWork())
}
export function getCurrentWorkData(ns: NS): Task | null {
  return get(ns, SINGULARITY_DATA_DIRS.CURRENT_WORK)
}


export function writeFactionInvitations(ns: NS) {
  write(ns, SINGULARITY_DATA_DIRS.FACTION_INVITATIONS, ns.singularity.checkFactionInvitations())
}
export function getFactionInvitationsData(ns: NS): string[] {
  return get(ns, SINGULARITY_DATA_DIRS.FACTION_INVITATIONS) ?? []
}


type OwnedAugmentations = {
  with_purchased: string[],
  without_purchased: string[]
}
export function writeOwnedAugmentations(ns: NS) {
  const data: OwnedAugmentations = {
    with_purchased: ns.singularity.getOwnedAugmentations(true),
    without_purchased: ns.singularity.getOwnedAugmentations()
  }
  write(ns, SINGULARITY_DATA_DIRS.OWNED_AUGMENTATIONS, data)
}
export function getOwnedAugmentationsData(ns: NS, purchased = false): string[] {
  const data = get<OwnedAugmentations>(ns, SINGULARITY_DATA_DIRS.OWNED_AUGMENTATIONS)
  if (purchased) {
    return data?.with_purchased ?? []
  }
  return data?.without_purchased ?? []
}



// TODO: CACHE RESULTS.
type FactionAugmentations = Record<FactionName, string[]>
export function writeAllFactionsAugmentations(ns: NS) {
  const data = {} as FactionAugmentations
  for (const faction of Object.values(ns.enums.FactionName)) {
    data[faction] = ns.singularity.getAugmentationsFromFaction(faction)
  }
  write(ns, SINGULARITY_DATA_DIRS.FACTION_AUGMENTATIONS, data)
}
export function getAllAugmentationsFromFaction(ns: NS, faction: FactionName): string[] {
  const data = get<FactionAugmentations>(ns, SINGULARITY_DATA_DIRS.FACTION_AUGMENTATIONS)
  return data ? data[faction] : []
}
export function getAllFactionsAugmentations(ns: NS) {
  return get<FactionAugmentations>(ns, SINGULARITY_DATA_DIRS.FACTION_AUGMENTATIONS)
}


type AugmentationData = {
  name: string,
  faction?: FactionName,
  reputation_requirement?: number,
  pre_requisites?: string[],
  price?: number
}
export function getAllAugmentations(ns: NS) {
  const data = getAllFactionsAugmentations(ns)
  if (!data) return null
  return Array(new Set(Object.values(data).flat()))
}
export function writeAugmentationData(ns: NS) {
  const all_factions_augs = getAllFactionsAugmentations(ns)
  if (!all_factions_augs) {
    return
  }
  const data = {} as Record<string, AugmentationData>
  for (const [faction_name, augs] of Object.entries(all_factions_augs)) {
    for (const aug_name of augs) {
      if (data[aug_name]) {
        data[aug_name].faction = undefined
      } else {
        data[aug_name] = {
          name: aug_name,
          faction: faction_name as FactionName,
        }
      }
    }
  }
  write(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA, data)
}
export function getAllAugmentationData(ns: NS): Record<string, AugmentationData> | null {
  return get(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA)
}
export function getAugmentationData(ns: NS, augmentation: string) {
  const data = get<Record<string, AugmentationData>>(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA)
  if (!data) return null
  return data[augmentation]
}
export function writeAugmentationDataPrice(ns: NS) {
  const data = getAllAugmentationData(ns)
  let new_data: Record<string, AugmentationData> = {}
  if (!data) return
  for (const augmentation_data of Object.values(data)) {
    augmentation_data.price = ns.singularity.getAugmentationPrice(augmentation_data.name)
    new_data[augmentation_data.name] = augmentation_data
  }
  write(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA, new_data)
}
export function writeAugmentationDataPreReqs(ns: NS) {
  const data = getAllAugmentationData(ns)
  let new_data: Record<string, AugmentationData> = {}
  if (!data) return
  for (const augmentation_data of Object.values(data)) {
    augmentation_data.pre_requisites = ns.singularity.getAugmentationPrereq(augmentation_data.name)
    new_data[augmentation_data.name] = augmentation_data
  }
  write(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA, new_data)
}
export function writeAugmentationDataRepReq(ns: NS) {
  const data = getAllAugmentationData(ns)
  let new_data: Record<string, AugmentationData> = {}
  if (!data) return
  for (const augmentation_data of Object.values(data)) {
    augmentation_data.reputation_requirement = ns.singularity.getAugmentationRepReq(augmentation_data.name)
    new_data[augmentation_data.name] = augmentation_data
  }
  write(ns, SINGULARITY_DATA_DIRS.AUGMENTATION_DATA, new_data)
}
