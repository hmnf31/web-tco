type BookEntry = {
  moves: string[]
  responses: { move: string; weight: number }[]
}

const BOOK: BookEntry[] = [
  // e4 openings
  { moves: [], responses: [{ move: "e4", weight: 80 }, { move: "d4", weight: 15 }, { move: "Nf3", weight: 5 }] },
  { moves: ["e4"], responses: [{ move: "e5", weight: 40 }, { move: "c5", weight: 35 }, { move: "e6", weight: 12 }, { move: "c6", weight: 8 }, { move: "d6", weight: 5 }] },
  { moves: ["d4"], responses: [{ move: "d5", weight: 40 }, { move: "Nf6", weight: 35 }, { move: "f5", weight: 10 }, { move: "e6", weight: 10 }, { move: "c6", weight: 5 }] },

  // Italian Game
  { moves: ["e4", "e5", "Nf3"], responses: [{ move: "Nc6", weight: 70 }, { move: "Nf6", weight: 20 }, { move: "d6", weight: 10 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], responses: [{ move: "Bc5", weight: 50 }, { move: "Nf6", weight: 30 }, { move: "Be7", weight: 10 }, { move: "d6", weight: 10 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], responses: [{ move: "c3", weight: 40 }, { move: "O-O", weight: 25 }, { move: "d3", weight: 20 }, { move: "b4", weight: 15 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], responses: [{ move: "d3", weight: 40 }, { move: "Ng5", weight: 30 }, { move: "O-O", weight: 20 }, { move: "Nc3", weight: 10 }] },

  // Ruy Lopez
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], responses: [{ move: "a6", weight: 60 }, { move: "Nf6", weight: 20 }, { move: "d6", weight: 10 }, { move: "Bc5", weight: 10 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4"], responses: [{ move: "Nf6", weight: 50 }, { move: "b5", weight: 20 }, { move: "d6", weight: 15 }, { move: "Be7", weight: 15 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O"], responses: [{ move: "Be7", weight: 40 }, { move: "b5", weight: 20 }, { move: "Nxe4", weight: 20 }, { move: "d6", weight: 20 }] },

  // Sicilian Defense
  { moves: ["e4", "c5", "Nf3"], responses: [{ move: "d6", weight: 35 }, { move: "Nc6", weight: 30 }, { move: "e6", weight: 25 }, { move: "a6", weight: 10 }] },
  { moves: ["e4", "c5", "Nf3", "d6", "d4"], responses: [{ move: "cxd4", weight: 90 }, { move: "Nf6", weight: 10 }] },
  { moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"], responses: [{ move: "a6", weight: 40 }, { move: "g6", weight: 25 }, { move: "e6", weight: 20 }, { move: "Nc6", weight: 15 }] },
  { moves: ["e4", "c5", "Nf3", "Nc6", "d4"], responses: [{ move: "cxd4", weight: 80 }, { move: "e6", weight: 10 }, { move: "d6", weight: 10 }] },
  { moves: ["e4", "c5", "Nf3", "e6", "d4"], responses: [{ move: "cxd4", weight: 80 }, { move: "d5", weight: 20 }] },

  // French Defense
  { moves: ["e4", "e6", "d4"], responses: [{ move: "d5", weight: 90 }, { move: "c5", weight: 5 }, { move: "Nf6", weight: 5 }] },
  { moves: ["e4", "e6", "d4", "d5", "Nc3"], responses: [{ move: "Nf6", weight: 35 }, { move: "Bb4", weight: 25 }, { move: "dxe4", weight: 20 }, { move: "Be7", weight: 20 }] },
  { moves: ["e4", "e6", "d4", "d5", "Nd2"], responses: [{ move: "Nf6", weight: 40 }, { move: "c5", weight: 30 }, { move: "dxe4", weight: 15 }, { move: "Be7", weight: 15 }] },
  { moves: ["e4", "e6", "d4", "d5", "e5"], responses: [{ move: "c5", weight: 50 }, { move: "Nc6", weight: 20 }, { move: "Ne7", weight: 15 }, { move: "b6", weight: 10 }, { move: "Qd7", weight: 5 }] },

  // Caro-Kann
  { moves: ["e4", "c6", "d4"], responses: [{ move: "d5", weight: 90 }, { move: "e6", weight: 5 }, { move: "g6", weight: 5 }] },
  { moves: ["e4", "c6", "d4", "d5", "Nc3"], responses: [{ move: "dxe4", weight: 50 }, { move: "Nf6", weight: 30 }, { move: "g6", weight: 15 }, { move: "e6", weight: 5 }] },
  { moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4"], responses: [{ move: "Bf5", weight: 50 }, { move: "Nd7", weight: 20 }, { move: "Nf6", weight: 15 }, { move: "e6", weight: 15 }] },
  { moves: ["e4", "c6", "d4", "d5", "exd5"], responses: [{ move: "cxd5", weight: 80 }, { move: "Nf6", weight: 10 }, { move: "Qxd5", weight: 10 }] },

  // Pirc / Modern
  { moves: ["e4", "d6", "d4"], responses: [{ move: "Nf6", weight: 50 }, { move: "g6", weight: 30 }, { move: "e5", weight: 20 }] },
  { moves: ["e4", "g6", "d4"], responses: [{ move: "Bg7", weight: 80 }, { move: "d6", weight: 15 }, { move: "Nf6", weight: 5 }] },

  // Scotch Game
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4"], responses: [{ move: "exd4", weight: 80 }, { move: "d6", weight: 10 }, { move: "Nxd4", weight: 10 }] },
  { moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"], responses: [{ move: "Nf6", weight: 30 }, { move: "Bc5", weight: 25 }, { move: "Nxd4", weight: 20 }, { move: "Qh4", weight: 15 }, { move: "d6", weight: 10 }] },

  // Four Knights
  { moves: ["e4", "e5", "Nf3", "Nc6", "Nc3"], responses: [{ move: "Nf6", weight: 70 }, { move: "Bb4", weight: 20 }, { move: "d6", weight: 10 }] },

  // King's Gambit
  { moves: ["e4", "e5", "f4"], responses: [{ move: "exf4", weight: 60 }, { move: "d5", weight: 20 }, { move: "Nc6", weight: 10 }, { move: "Be7", weight: 10 }] },

  // Vienna Game
  { moves: ["e4", "e5", "Nc3"], responses: [{ move: "Nf6", weight: 40 }, { move: "Nc6", weight: 30 }, { move: "Bc5", weight: 20 }, { move: "d6", weight: 10 }] },

  // d4 openings - Queen's Gambit
  { moves: ["d4", "d5", "c4"], responses: [{ move: "e6", weight: 40 }, { move: "dxc4", weight: 25 }, { move: "c6", weight: 20 }, { move: "Nc6", weight: 10 }, { move: "Nf6", weight: 5 }] },
  { moves: ["d4", "d5", "c4", "e6", "Nc3"], responses: [{ move: "Nf6", weight: 40 }, { move: "c6", weight: 20 }, { move: "Be7", weight: 20 }, { move: "Bb4", weight: 20 }] },
  { moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5"], responses: [{ move: "Be7", weight: 45 }, { move: "Nbd7", weight: 20 }, { move: "dxc4", weight: 20 }, { move: "h6", weight: 15 }] },
  { moves: ["d4", "d5", "c4", "dxc4"], responses: [{ move: "e3", weight: 30 }, { move: "Nf3", weight: 30 }, { move: "e4", weight: 25 }, { move: "Qa4+", weight: 15 }] },
  { moves: ["d4", "d5", "c4", "c6"], responses: [{ move: "Nf3", weight: 30 }, { move: "Nc3", weight: 25 }, { move: "cxd5", weight: 20 }, { move: "e3", weight: 15 }, { move: "Bf4", weight: 10 }] },

  // Slav Defense
  { moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3"], responses: [{ move: "dxc4", weight: 30 }, { move: "e6", weight: 25 }, { move: "a6", weight: 15 }, { move: "g6", weight: 10 }, { move: "Bf5", weight: 20 }] },

  // Indian Defenses
  { moves: ["d4", "Nf6", "c4"], responses: [{ move: "e6", weight: 35 }, { move: "g6", weight: 30 }, { move: "c6", weight: 10 }, { move: "d6", weight: 10 }, { move: "b6", weight: 10 }, { move: "c5", weight: 5 }] },

  // Nimzo-Indian
  { moves: ["d4", "Nf6", "c4", "e6", "Nc3"], responses: [{ move: "Bb4", weight: 70 }, { move: "d5", weight: 20 }, { move: "b6", weight: 10 }] },

  // Queen's Indian
  { moves: ["d4", "Nf6", "c4", "e6", "Nf3"], responses: [{ move: "b6", weight: 40 }, { move: "d5", weight: 30 }, { move: "Bb4+", weight: 15 }, { move: "Be7", weight: 10 }, { move: "c5", weight: 5 }] },

  // King's Indian
  { moves: ["d4", "Nf6", "c4", "g6", "Nc3"], responses: [{ move: "Bg7", weight: 80 }, { move: "d5", weight: 10 }, { move: "O-O", weight: 10 }] },
  { moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4"], responses: [{ move: "d6", weight: 70 }, { move: "O-O", weight: 20 }, { move: "c5", weight: 10 }] },

  // Grünfeld
  { moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"], responses: [{ move: "cxd5", weight: 30 }, { move: "Bf4", weight: 20 }, { move: "Nf3", weight: 20 }, { move: "e3", weight: 15 }, { move: "Bg5", weight: 15 }] },

  // Dutch Defense
  { moves: ["d4", "f5"], responses: [{ move: "g3", weight: 25 }, { move: "Nf3", weight: 20 }, { move: "c4", weight: 20 }, { move: "Bf4", weight: 15 }, { move: "e3", weight: 10 }, { move: "Nc3", weight: 10 }] },

  // English Opening
  { moves: ["c4"], responses: [{ move: "e5", weight: 35 }, { move: "Nf6", weight: 25 }, { move: "c5", weight: 15 }, { move: "e6", weight: 10 }, { move: "d6", weight: 10 }, { move: "g6", weight: 5 }] },
  { moves: ["Nf3"], responses: [{ move: "d5", weight: 25 }, { move: "Nf6", weight: 25 }, { move: "c5", weight: 20 }, { move: "g6", weight: 10 }, { move: "e6", weight: 10 }, { move: "d6", weight: 10 }] },

  // Reti / Zukertort
  { moves: ["Nf3", "d5", "c4"], responses: [{ move: "e6", weight: 25 }, { move: "dxc4", weight: 25 }, { move: "d4", weight: 20 }, { move: "c6", weight: 15 }, { move: "Nf6", weight: 15 }] },
  { moves: ["Nf3", "Nf6", "c4"], responses: [{ move: "g6", weight: 25 }, { move: "e6", weight: 25 }, { move: "d5", weight: 20 }, { move: "c6", weight: 15 }, { move: "b6", weight: 15 }] },

  // Bishop's Opening
  { moves: ["e4", "e5", "Bc4"], responses: [{ move: "Nf6", weight: 30 }, { move: "Bc5", weight: 25 }, { move: "Nc6", weight: 20 }, { move: "d6", weight: 15 }, { move: "c6", weight: 10 }] },

  // Petroff Defense
  { moves: ["e4", "e5", "Nf3", "Nf6"], responses: [{ move: "Nxe5", weight: 60 }, { move: "d4", weight: 20 }, { move: "Nc3", weight: 15 }, { move: "Bc4", weight: 5 }] },
]

const TOTAL_WEIGHTS = 1000

export function getBookMove(moveHistory: string[]): string | null {
  for (const entry of BOOK) {
    if (entry.moves.length > moveHistory.length) continue
    const matches = entry.moves.every((m, i) => m === moveHistory[i])
    if (!matches) continue
    const remaining = moveHistory.slice(entry.moves.length)
    if (remaining.length === 0) {
      const total = entry.responses.reduce((s, r) => s + r.weight, 0)
      let roll = Math.floor(Math.random() * total)
      for (const r of entry.responses) {
        roll -= r.weight
        if (roll < 0) return r.move
      }
      return entry.responses[0].move
    }
  }
  return null
}
