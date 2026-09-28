export type Division = "Chess" | "MLBB"

export type DivisionPlayer = {
  id: string
  division: Division
  username: string
  role: string
  tier: string
  sort_order: number
  is_active: boolean
}

export const DEFAULT_DIVISION_PLAYERS: DivisionPlayer[] = [
  ...["45had0w", "69hehehehehehehehehehe69", "aanmarino", "Abdi0324", "Abdul_493", "adikember", "adwar3184", "afiatul", "Ai_isdarliansyah", "Akun_Pemalu", "Akun_Pemaluu", "andre_31_1993", "arshakabumi", "asaches03", "BaldwinKingsIV", "blitzkkrieg", "Blunders69", "bobob77", "bung_iky", "carilho_pablo_eskobar199", "carilho_pablo_eskobar1993", "caturaga2018", "CH3VROLET", "chessjunior0", "Chris_Amoeba", "Depri_i", "Derpandora", "dewacucibaju", "diah89", "El_NorthDoustan", "Fans-TLID-RAFFY", "Galih_Citra", "gtempur", "Harjay_TCO", "Heex86", "indra11611", "IwanTambunan", "Iyus_515", "KingWalkVariations", "KKajow", "Kudojingkrak", "Linnxyn", "Liyaannnnnnn", "LoveAyyme", "mal_21j", "Munaa377", "Ochhi_03", "Official_TCO", "oke23q", "Pak_RT_05", "PangeranKe17", "patris01", "Pixelfern8", "PutraRian", "rais88", "rendi-Yanto", "Restu_Azikusuma", "Revelation_T", "runarunarunaruna", "Shakabumi", "StreetChess0502", "Sulfancuk", "SultanAulia", "Supri_adi_22", "szeschaa", "TCO_Constantine", "TCO_JAYA", "TeddyPlays_IG", "TheDartVine", "vozodd", "vpol3", "W-indrayana", "W_Ochhi", "XICOLAGI"].map((username, index) => ({ id: `chess-${index + 1}`, division: "Chess" as const, username, role: "", tier: "", sort_order: index + 1, is_active: true })),
  ...[
    ["MrTheodore", "Jungler", "Mythical Glory"],
    ["ManaluJr", "Mid Lane", "Mythical Honor"],
    ["Afiatul", "Roamer", "Mythic"],
    ["Munaa377", "Gold Lane", "Mythic"],
    ["RennChess", "Exp Lane", "Legend"],
  ].map(([username, role, tier], index) => ({ id: `mlbb-${index + 1}`, division: "MLBB" as const, username, role, tier, sort_order: index + 1, is_active: true })),
]
