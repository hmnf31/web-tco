export type BotPersonality = {
  name: string
  displayName: string
  elo: number
  apiElo?: number
  avatarUrl?: string
  style: "aggressive" | "solid" | "positional" | "tactical" | "dynamic" | "defensive"
  description: string
  strengths: string[]
  weaknesses: string[]
  openingPreference: string[]
  avatarColor: string
  commentary: {
    praise: string[]
    neutral: string[]
    mistake: string[]
    blunder: string[]
    opening: string[]
    endgame: string[]
  }
}

export type TCOPlayerStats = {
  name: string
  rating: number
  avatarUrl?: string
}

const STYLES: ("aggressive" | "solid" | "positional" | "tactical" | "dynamic" | "defensive")[] = [
  "aggressive", "solid", "positional", "tactical", "dynamic", "defensive"
]

const OPENINGS = [
  ["e4"], ["d4"], ["Nf3"], ["c4"], ["e4", "Nf3"], ["d4", "c4"],
  ["Nf3", "c4"], ["e4", "d4"], ["d4", "Nf3"], ["e4", "c4"],
  ["Nf3", "g3"], ["e4", "e5", "Nf3"], ["d4", "Nf6", "c4"],
]

const PRAISE = [
  "Langkah brilian! Kamu benar-benar jago!",
  "Wow, strategi yang luar biasa!",
  "Kelas master! Aku kagum dengan kalkulasimu.",
  "Langkah yang sangat tajam!",
  "Kamu membaca posisi dengan sangat baik!",
  "Mantap! Itu langkah yang tidak terduga.",
  "Luar biasa! Kamu semakin kuat.",
  "Gila! Aku tidak melihat langkah itu.",
]

const NEUTRAL = [
  "Langkah yang solid.",
  "Cukup baik, pertahankan.",
  "Ok, posisi masih seimbang.",
  "Langkah rapi, aman.",
  "Kamu bermain dengan hati-hati.",
  "Bagus, tekanan perlahan meningkat.",
]

const MISTAKE_LINES = [
  "Kurang akurat, coba evaluasi lagi.",
  "Agak longgar, waspada ya.",
  "Coba periksa kalkulasi dengan lebih teliti.",
  "Pertimbangkan alternatif yang lebih baik.",
  "Posisi mulai meragukan.",
]

const BLUNDER_LINES = [
  "Itu blunder! Aku ambil kesempatan ini!",
  "Kesalahan fatal! Kamu kehilangan materi.",
  "Sayang sekali, kamu lengah.",
  "Kesempatan datang! Aku akan manfaatkan.",
  "Itu mahal! Coba lebih fokus.",
]

const OPENING_LINES = [
  "Ayo lihat siapa yang lebih siap di opening.",
  "Persiapan openingmu bagus.",
  "Kita masuk ke midgame setelah ini.",
  "Mari lihat book knowledge kita.",
]

const ENDGAME_LINES = [
  "Endgame dimulai, siapa yang lebih teliti?",
  "Ayo buktikan kemampuan endgamemu.",
  "Endgame! Aku masih punya banyak trik.",
]

const AVATAR_COLORS = [
  "from-cyan-500/20 to-blue-600/20",
  "from-purple-500/20 to-pink-600/20",
  "from-green-500/20 to-emerald-600/20",
  "from-orange-500/20 to-red-600/20",
  "from-yellow-500/20 to-amber-600/20",
  "from-indigo-500/20 to-violet-600/20",
  "from-rose-500/20 to-pink-600/20",
  "from-teal-500/20 to-cyan-600/20",
]

function generatePersonality(name: string, elo: number, avatarUrl?: string): BotPersonality {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)]
  const opening = OPENINGS[Math.floor(Math.random() * OPENINGS.length)]
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const s = (arr: string[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

  const styleDesc: Record<string, string> = {
    aggressive: "Pemain agresif yang suka menekan sejak awal.",
    solid: "Pemain solid dengan pertahanan kokoh.",
    positional: "Pemain posisional dengan strategi jangka panjang.",
    tactical: "Master taktik dengan kalkulasi cepat.",
    dynamic: "Pemain dinamis yang adaptif.",
    defensive: "Pemain defensif yang sabar menunggu kesalahan lawan.",
  }

  return {
    name,
    displayName: `BOT:${name}`,
    elo,
    avatarUrl,
    style,
    description: `${styleDesc[style]} Terdaftar di Divisi Chess TCO dengan rating ${elo}.`,
    strengths: s(["Kalkulasi", "Posisi", "Taktik", "Strategi", "Endgame", "Opening", "Pertahanan", "Serangan"], 2),
    weaknesses: s(["Kesabaran", "Kreativitas", "Kecepatan", "Konsistensi", "Variasi opening"], 2),
    openingPreference: opening,
    avatarColor: color,
    commentary: {
      praise: s(PRAISE, 3),
      neutral: s(NEUTRAL, 3),
      mistake: s(MISTAKE_LINES, 3),
      blunder: s(BLUNDER_LINES, 3),
      opening: s(OPENING_LINES, 2),
      endgame: s(ENDGAME_LINES, 2),
    },
  }
}

const TCO_MEMBER_USERNAMES = [
  "45had0w", "69hehehehehehehehehehe69", "aanmarino", "Abdi0324", "Abdul_493",
  "adikember", "adwar3184", "afiatul", "Ai_isdarliansyah", "Akun_Pemalu",
  "Akun_Pemaluu", "andre_31_1993", "arshakabumi", "asaches03", "BaldwinKingsIV",
  "blitzkkrieg", "Blunders69", "bobob77", "bung_iky", "carilho_pablo_eskobar199",
  "carilho_pablo_eskobar1993", "caturaga2018", "CH3VROLET", "chessjunior0",
  "Chris_Amoeba", "Depri_i", "Derpandora", "dewacucibaju", "diah89",
  "El_NorthDoustan", "Fans-TLID-RAFFY", "Galih_Citra", "gtempur", "Harjay_TCO",
  "Heex86", "indra11611", "IwanTambunan", "Iyus_515", "KingWalkVariations",
  "KKajow", "Kudojingkrak", "Linnxyn", "Liyaannnnnnn", "LoveAyyme",
  "mal_21j", "Munaa377", "Ochhi_03", "Official_TCO", "oke23q",
  "Pak_RT_05", "PangeranKe17", "patris01", "Pixelfern8", "PutraRian",
  "rais88", "rendi-Yanto", "Restu_Azikusuma", "Revelation_T", "runarunarunaruna",
  "Shakabumi", "StreetChess0502", "Sulfancuk", "SultanAulia", "Supri_adi_22",
  "szeschaa", "TCO_Constantine", "TCO_JAYA", "TeddyPlays_IG", "TheDartVine",
  "vozodd", "vpol3", "W-indrayana", "W_Ochhi", "XICOLAGI",
]

const TCO_ELO_MAP: Record<string, number> = {
  "45had0w": 1800, "69hehehehehehehehehehe69": 1200, "aanmarino": 1600, "Abdi0324": 2000, "Abdul_493": 1700,
  "adikember": 1500, "adwar3184": 1100, "afiatul": 1300, "Ai_isdarliansyah": 1900, "Akun_Pemalu": 1400,
  "Akun_Pemaluu": 1400, "andre_31_1993": 1600, "arshakabumi": 1700, "asaches03": 1700, "BaldwinKingsIV": 2100,
  "blitzkkrieg": 2300, "Blunders69": 2000, "bobob77": 1900, "bung_iky": 1600, "carilho_pablo_eskobar199": 1500,
  "carilho_pablo_eskobar1993": 1500, "caturaga2018": 1800, "CH3VROLET": 1600, "chessjunior0": 1200,
  "Chris_Amoeba": 1300, "Depri_i": 1700, "Derpandora": 1200, "dewacucibaju": 1100, "diah89": 1600,
  "El_NorthDoustan": 1400, "Fans-TLID-RAFFY": 1000, "Galih_Citra": 1500, "gtempur": 1100, "Harjay_TCO": 2000,
  "Heex86": 1200, "indra11611": 1100, "IwanTambunan": 1300, "Iyus_515": 2000, "KingWalkVariations": 1800,
  "KKajow": 2000, "Kudojingkrak": 1000, "Linnxyn": 1200, "Liyaannnnnnn": 1000, "LoveAyyme": 1900,
  "mal_21j": 2100, "Munaa377": 1700, "Ochhi_03": 1200, "Official_TCO": 1800, "oke23q": 1200,
  "Pak_RT_05": 1700, "PangeranKe17": 1600, "patris01": 1300, "Pixelfern8": 900, "PutraRian": 1300,
  "rais88": 1200, "rendi-Yanto": 1500, "Restu_Azikusuma": 1600, "Revelation_T": 1600, "runarunarunaruna": 1000,
  "Shakabumi": 1700, "StreetChess0502": 1600, "Sulfancuk": 1800, "SultanAulia": 2100, "Supri_adi_22": 1800,
  "szeschaa": 700, "TCO_Constantine": 1400, "TCO_JAYA": 1800, "TeddyPlays_IG": 2000, "TheDartVine": 1600,
  "vozodd": 1500, "vpol3": 1100, "W-indrayana": 1200, "W_Ochhi": 1200, "XICOLAGI": 1000,
}

const CUSTOM_PERSONALITIES: Record<string, Partial<BotPersonality>> = {
  "BaldwinKingsIV": {
    style: "positional",
    description: "Master permainan posisional. Mengandalkan opening D4, Sicilian Defense, dan Indian Games.",
    strengths: ["Posisional solid", "Penguasaan Indian Games", "Transisi midgame kuat"],
    weaknesses: ["Kurang agresif di early game", "Kadang terlalu pasif"],
    openingPreference: ["d4", "Nf3", "c4"],
    avatarColor: "from-cyan-500/20 to-blue-600/20",
    commentary: {
      praise: ["Langkah kelas master!", "Kamu benar-benar jago! Aku kagum.", "Strategi yang luar biasa!"],
      neutral: ["Cukup solid.", "Langkah yang rapi.", "Kamu memang pantas di rating ini."],
      mistake: ["Kesalahan kecil, masih bisa diperbaiki.", "Agak longgar, waspada ya.", "Coba periksa lagi langkahmu."],
      blunder: ["Itu blunder! Aku ambil kesempatan ini.", "Kesempatan datang!", "Sayang sekali, kamu lengah."],
      opening: ["Ayo kita lihat siapa yang lebih kuasai opening.", "Persiapan openingmu bagus.", "Kita masuk ke midgame sekarang."],
      endgame: ["Endgame dimulai, siapa yang lebih teliti?", "Ayo buktikan kemampuan endgamemu!"],
    },
  },
  "TeddyPlays_IG": {
    style: "aggressive",
    description: "Spesialis Reti Opening, Catalan, King's Indian, dan Pirc Defense. Agresif sejak langkah pertama.",
    strengths: ["Opening kreatif", "Serangan langsung", "Penguasaan Catalan"],
    weaknesses: ["Over-agresif kadang bikin celah", "Kurang sabar di posisi tenang"],
    openingPreference: ["Nf3", "g3", "Bg2", "c4"],
    avatarColor: "from-purple-500/20 to-pink-600/20",
    commentary: {
      praise: ["Gila! Langkah itu sangat tajam!", "Kamu benar-benar agresif!", "Wow, aku tidak melihat itu!"],
      neutral: ["Langkah bagus, tekanan meningkat.", "Kamu mulai menekan.", "Seranganmu mulai terbangun."],
      mistake: ["Agak ragu-ragu, coba lebih tegas.", "Terlalu defensif.", "Kamu kehilangan inisiatif."],
      blunder: ["Blunder! Aku akan hukum kamu!", "Itu mahal! Aku ambil.", "Kesalahan fatal!"],
      opening: ["Mari lihat persiapan openingmu!", "Aku suka posisi ini.", "Kita akan lihat siapa yang lebih siap."],
      endgame: ["Endgame! Aku masih punya banyak trik!", "Jangan menang dulu, endgameku kuat!"],
    },
  },
  "blitzkkrieg": {
    style: "aggressive",
    description: "Pemain blitz dengan serangan kilat. Rating tertinggi di Divisi Chess TCO.",
    strengths: ["Kecepatan", "Taktik kilat", "Konversi keunggulan"],
    weaknesses: ["Kesabaran", "Endgame lambat"],
    openingPreference: ["e4", "Nf3", "Bc4"],
    avatarColor: "from-red-500/20 to-orange-600/20",
  },
  "SultanAulia": {
    style: "aggressive",
    description: "Pemain agresif top rated. Jago mengkonversi keunggulan jadi kemenangan.",
    strengths: ["Konversi", "Serangan", "Kalkulasi"],
    weaknesses: ["Kadang over-optimis"],
    openingPreference: ["e4", "d4"],
    avatarColor: "from-yellow-500/20 to-amber-600/20",
  },
  "Official_TCO": {
    style: "solid",
    description: "Akun official TCO Esports. Bermain solid dan konsisten mewakili komunitas.",
    strengths: ["Konsistensi", "Sportivitas", "Strategi tim"],
    weaknesses: ["Variasi opening terbatas"],
    openingPreference: ["d4", "c4"],
    avatarColor: "from-cyan-500/20 to-emerald-600/20",
  },
}

export function getPersonality(name: string, elo?: number, avatarUrl?: string): BotPersonality {
  const custom = CUSTOM_PERSONALITIES[name]
  const base: BotPersonality = {
    name,
    displayName: `BOT:${name}`,
    elo: elo || TCO_ELO_MAP[name] || 1500,
    avatarUrl,
    style: "solid",
    openingPreference: ["e4"],
    avatarColor: "from-cyan-500/20 to-blue-600/20",
    description: `Pemain Divisi Chess TCO dengan rating ${elo || TCO_ELO_MAP[name] || 1500}.`,
    strengths: ["Konsisten"],
    weaknesses: ["Variasi"],
    commentary: {
      praise: ["Mantap!"],
      neutral: ["Ok"],
      mistake: ["Waspada"],
      blunder: ["Aduh"],
      opening: ["Gas"],
      endgame: ["Endgame"],
    },
    ...custom,
  }
  if (avatarUrl) base.avatarUrl = avatarUrl
  return base
}

export function createTCOPlayerList() {
  return TCO_MEMBER_USERNAMES.map((name) => ({
    name,
    rating: TCO_ELO_MAP[name] || 1500,
    isEngine: false,
  }))
}

export const BOT_PERSONALITIES = Object.fromEntries(
  TCO_MEMBER_USERNAMES.map((name) => [name, getPersonality(name)])
)

export async function fetchChessComAvatar(username: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.chess.com/pub/player/${username}`)
    if (!res.ok) return undefined
    const data = await res.json()
    return data.avatar || undefined
  } catch {
    return undefined
  }
}

export async function fetchChessComRating(username: string): Promise<number | undefined> {
  try {
    const res = await fetch(`https://api.chess.com/pub/player/${username}/stats`)
    if (!res.ok) return undefined
    const data = await res.json()
    const rating = data.chess_rapid?.last?.rating || data.chess_blitz?.last?.rating || data.chess_bullet?.last?.rating
    return rating || undefined
  } catch {
    return undefined
  }
}

export async function fetchTCOPlayerStats(username: string): Promise<TCOPlayerStats> {
  const [avatarUrl, rating] = await Promise.all([
    fetchChessComAvatar(username),
    fetchChessComRating(username),
  ])
  return {
    name: username,
    rating: rating || TCO_ELO_MAP[username] || 1500,
    avatarUrl,
  }
}

export async function fetchAllTCOPlayerStats(): Promise<Record<string, TCOPlayerStats>> {
  const results = await Promise.allSettled(
    TCO_MEMBER_USERNAMES.map((name) => fetchTCOPlayerStats(name))
  )
  const map: Record<string, TCOPlayerStats> = {}
  for (const result of results) {
    if (result.status === "fulfilled") {
      map[result.value.name] = result.value
    }
  }
  return map
}

export async function fetchChessComProfile(username: string): Promise<{ rating: number; games: number } | null> {
  try {
    const res = await fetch(`https://api.chess.com/pub/player/${username}/stats`)
    if (!res.ok) return null
    const data = await res.json()
    const chessRating = data.chess_rapid?.last?.rating || data.chess_blitz?.last?.rating || data.chess_bullet?.last?.rating
    return { rating: chessRating || 1200, games: 0 }
  } catch {
    return null
  }
}
