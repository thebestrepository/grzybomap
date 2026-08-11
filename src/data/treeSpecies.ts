import type { TreeSpeciesCode } from '../types'

export const TREE_SPECIES_NAMES: Record<TreeSpeciesCode, string> = {
  SO: 'Sosna zwyczajna',
  ŚW: 'Świerk pospolity',
  JD: 'Jodła pospolita',
  MD: 'Modrzew europejski',
  DG: 'Daglezja zielona',
  BK: 'Buk zwyczajny',
  DB: 'Dąb',
  GB: 'Grab pospolity',
  BRZ: 'Brzoza',
  OL: 'Olsza',
  OS: 'Osika',
  TP: 'Topola',
  WZ: 'Wiąz',
  JS: 'Jesion wyniosły',
  JW: 'Jawor',
  KL: 'Klon pospolity',
  LP: 'Lipa drobnolistna',
  AK: 'Robinia akacjowa',
}

/** Real BDL species_cd is normalized (e.g. "DB.S" -> "DB") before this lookup, so unknown
 * codes fall back to showing the raw code rather than crashing. */
export function treeSpeciesName(code: string): string {
  return TREE_SPECIES_NAMES[code as TreeSpeciesCode] ?? code
}

export const HABITAT_TYPE_NAMES: Record<string, string> = {
  BŚW: 'Bór świeży',
  BW: 'Bór wilgotny',
  BB: 'Bór bagienny',
  BMŚW: 'Bór mieszany świeży',
  BMW: 'Bór mieszany wilgotny',
  BMB: 'Bór mieszany bagienny',
  BMWYŻ: 'Bór mieszany wyżynny',
  LŚW: 'Las świeży',
  LW: 'Las wilgotny',
  LMŚW: 'Las mieszany świeży',
  LMW: 'Las mieszany wilgotny',
  LMB: 'Las mieszany bagienny',
  LMWYŻ: 'Las mieszany wyżynny',
  LGŚW: 'Las górski świeży',
  LMGŚW: 'Las mieszany górski świeży',
  LŁ: 'Las łęgowy',
  LŁWYŻ: 'Las łęgowy wyżynny',
  LWYŻŚ: 'Las wyżynny świeży',
  LWYŻW: 'Las wyżynny wilgotny',
  OL: 'Ols',
  OLJ: 'Ols jesionowy',
  OLJWYŻ: 'Ols jesionowy wyżynny',
}

export function habitatTypeName(code: string): string {
  return HABITAT_TYPE_NAMES[code] ?? code
}

export const PROTECTION_CATEGORY_NAMES: Record<string, string> = {
  natura2000: 'Natura 2000',
  rezerwat: 'Rezerwat przyrody',
  las_ochronny: 'Las ochronny',
}
