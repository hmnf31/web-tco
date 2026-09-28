export type OpeningLine = {
  moves: string[]
  name: string
  eco: string
}

export type OpeningMatch = {
  name: string
  eco: string
  matchedPlies: number
  bookPlies: number
  deviation?: { ply: number; san: string }
}

const LINES: OpeningLine[] = [
  { moves: ["e4"], name: "King's Pawn Game", eco: "C20" },
  { moves: ["e4", "e5"], name: "Open Game", eco: "C40" },
  { moves: ["e4", "e5", "Nf3"], name: "King's Knight Opening", eco: "C40" },
  { moves: ["e4", "e5", "Nf3", "Nc6"], name: "Open Game: Normal Variation", eco: "C44" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "Ruy Lopez", eco: "C60" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"], name: "Ruy Lopez: Morphy Defence", eco: "C68" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4"], name: "Ruy Lopez: Morphy Defence", eco: "C70" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"], name: "Ruy Lopez: Berlin Defence", eco: "C65" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc5"], name: "Italian Game", eco: "C50" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4"], name: "Scotch Game", eco: "C44" },
  { moves: ["e4", "e5", "Nf3", "Nf6"], name: "Petrov Defence", eco: "C42" },
  { moves: ["e4", "e5", "Nf3", "d6"], name: "Philidor Defence", eco: "C41" },
  { moves: ["e4", "e5", "Nc3"], name: "Vienna Game", eco: "C25" },
  { moves: ["e4", "e5", "Nc3", "Nf6"], name: "Vienna Game", eco: "C27" },
  { moves: ["e4", "e5", "f4"], name: "King's Gambit", eco: "C33" },
  { moves: ["e4", "e5", "f4", "exf4"], name: "King's Gambit Accepted", eco: "C33" },
  { moves: ["e4", "e5", "Bc5"], name: "Bishop's Opening", eco: "C23" },
  { moves: ["e4", "e5", "d4"], name: "Center Game", eco: "C21" },
  { moves: ["e4", "c5"], name: "Sicilian Defence", eco: "B20" },
  { moves: ["e4", "c5", "Nf3"], name: "Sicilian: Open", eco: "B27" },
  { moves: ["e4", "c5", "c3"], name: "Sicilian: Alapin", eco: "B22" },
  { moves: ["e4", "e6"], name: "French Defence", eco: "C00" },
  { moves: ["e4", "e6", "d4"], name: "French Defence", eco: "C00" },
  { moves: ["e4", "e6", "d4", "d5"], name: "French Defence: Main Line", eco: "C01" },
  { moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"], name: "French Defence: Winawer", eco: "C18" },
  { moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"], name: "French Defence: Classical", eco: "C11" },
  { moves: ["e4", "c6"], name: "Caro-Kann Defence", eco: "B10" },
  { moves: ["e4", "c6", "d4", "d5"], name: "Caro-Kann Defence", eco: "B12" },
  { moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"], name: "Caro-Kann: Classical", eco: "B18" },
  { moves: ["e4", "c6", "d4", "d5", "e5"], name: "Caro-Kann: Advance", eco: "B12" },
  { moves: ["e4", "d6"], name: "Pirc Defence", eco: "B07" },
  { moves: ["e4", "d6", "d4", "Nf6"], name: "Pirc Defence", eco: "B07" },
  { moves: ["e4", "Nf6"], name: "Alekhine Defence", eco: "B02" },
  { moves: ["e4", "g6"], name: "Modern Defence", eco: "B06" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"], name: "Ruy Lopez: Closed", eco: "C84" },
  { moves: ["d4"], name: "Queen's Pawn Game", eco: "D00" },
  { moves: ["d4", "d5"], name: "Closed Game", eco: "D00" },
  { moves: ["d4", "d5", "c4"], name: "Queen's Gambit", eco: "D06" },
  { moves: ["d4", "d5", "c4", "e6"], name: "Queen's Gambit Declined", eco: "D30" },
  { moves: ["d4", "d5", "c4", "c6"], name: "Slav Defence", eco: "D20" },
  { moves: ["d4", "d5", "c4", "dxc4"], name: "Queen's Gambit Accepted", eco: "D20" },
  { moves: ["d4", "d5", "Nf3"], name: "Queen's Pawn: Torre Attack", eco: "D02" },
  { moves: ["d4", "Nf6"], name: "Indian Game", eco: "A45" },
  { moves: ["d4", "Nf6", "c4"], name: "Indian Game", eco: "A50" },
  { moves: ["d4", "Nf6", "c4", "g6"], name: "King's Indian Defence", eco: "E60" },
  { moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"], name: "Grunfeld Defence", eco: "D80" },
  { moves: ["d4", "Nf6", "c4", "e6"], name: "Indian Game: Queen's Pawn", eco: "E00" },
  { moves: ["d4", "Nf6", "c4", "e6", "Nf3"], name: "Queen's Pawn Game", eco: "E00" },
  { moves: ["d4", "f5"], name: "Dutch Defence", eco: "A80" },
  { moves: ["d4", "Nf6", "Nf3"], name: "Indian Game: Kings Knight", eco: "A49" },
  { moves: ["c4"], name: "English Opening", eco: "A10" },
  { moves: ["c4", "e5"], name: "English: Reversed Sicilian", eco: "A20" },
  { moves: ["c4", "c5"], name: "English: Symmetrical", eco: "A10" },
  { moves: ["c4", "e6"], name: "English: Agincourt", eco: "A10" },
  { moves: ["Nf3"], name: "Reti Opening", eco: "A04" },
  { moves: ["Nf3", "d5"], name: "Reti Opening", eco: "A09" },
  { moves: ["Nf3", "Nf6"], name: "Indian Game: Kings Knight", eco: "A04" },
  { moves: ["Nf3", "c5"], name: "Sicilian Invitation", eco: "A04" },
  { moves: ["b3"], name: "Larsen's Opening", eco: "A01" },
  { moves: ["f4"], name: "Bird's Opening", eco: "A02" },
  { moves: ["g3"], name: "Benko Opening", eco: "A00" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc5", "c3"], name: "Italian: Giuoco Piano", eco: "C50" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc5", "Nf6"], name: "Two Knights Defence", eco: "C55" },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc5", "Nf6", "Ng5"], name: "Two Knights: Fried Liver", eco: "C57" },
]

const SORTED = [...LINES].sort((a, b) => b.moves.length - a.moves.length)

export function detectOpening(sans: string[]): OpeningMatch | null {
  if (sans.length === 0) return null
  for (const line of SORTED) {
    if (line.moves.length > sans.length) continue
    const matched = line.moves.every((m, i) => m === sans[i])
    if (matched) {
      const nextSan = sans[line.moves.length]
      return {
        name: line.name,
        eco: line.eco,
        matchedPlies: line.moves.length,
        bookPlies: line.moves.length,
        deviation: nextSan ? { ply: line.moves.length + 1, san: nextSan } : undefined,
      }
    }
  }
  return { name: "Opening tidak dikenal", eco: "", matchedPlies: 0, bookPlies: 0, deviation: { ply: 1, san: sans[0] } }
}
