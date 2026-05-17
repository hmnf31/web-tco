import { Chess } from "chess.js"

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 1000, k: 20000,
}

const PST: Record<string, number[]> = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
}

function pstIndex(sq: string, isWhite: boolean): number {
  const f = sq.charCodeAt(0) - 97
  const r = parseInt(sq[1]) - 1
  return isWhite ? (7 - r) * 8 + f : r * 8 + f
}

function evaluateBoard(chess: Chess): number {
  let score = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const sq = String.fromCharCode(97 + c) + (r + 1)
      const val = PIECE_VALUES[p.type] || 0
      const pstVal = PST[p.type]?.[pstIndex(sq, p.color === "w")] || 0
      score += (p.color === "w" ? 1 : -1) * (val + pstVal)
    }
  }
  return score
}

export type TCOEval = {
  bestmove: string
  displayBestmove: string
  evaluation: number
  from?: string
  to?: string
  promotion?: string
}

function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  }
}

function isCapture(chess: Chess, from: string, to: string): boolean {
  const p = chess.get(to as any)
  return !!p
}

function moveOrderScore(chess: Chess, move: any, bestScore: number): number {
  let score = 0
  if (move.captured) {
    score += 10 * (PIECE_VALUES[move.captured] || 0) - (PIECE_VALUES[move.piece] || 0) / 100
  }
  if (move.promotion) score += 800
  if (move.san === bestScore.toString()) score += 1000000
  return score
}

export class TCOEngine {
  private searchDepth: number
  private nodes = 0
  private maxNodes = 50000
  private blunderRate: number
  private inaccuracyRate: number
  private midgameDepth: number

  constructor(elo: number) {
    if (elo < 1000) {
      this.searchDepth = 1
      this.midgameDepth = 1
      this.blunderRate = 0.35
      this.inaccuracyRate = 0.30
    } else if (elo < 1400) {
      this.searchDepth = 2
      this.midgameDepth = 2
      this.blunderRate = 0.20
      this.inaccuracyRate = 0.25
    } else if (elo < 1800) {
      this.searchDepth = 3
      this.midgameDepth = 3
      this.blunderRate = 0.10
      this.inaccuracyRate = 0.18
    } else if (elo < 2200) {
      this.searchDepth = 3
      this.midgameDepth = 3
      this.blunderRate = 0.04
      this.inaccuracyRate = 0.10
    } else {
      this.searchDepth = 4
      this.midgameDepth = 4
      this.blunderRate = 0.01
      this.inaccuracyRate = 0.05
    }
  }

  getBestMove(fen: string, _depth?: number): TCOEval {
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    if (moves.length === 0) return { bestmove: "", displayBestmove: "", evaluation: 0 }

    if (moves.length === 1) {
      const m = moves[0]
      return {
        bestmove: m.from + m.to + (m.promotion || ""),
        displayBestmove: m.san,
        evaluation: 0,
        from: m.from,
        to: m.to,
        promotion: m.promotion,
      }
    }

    const scored = this.searchWithEval(chess, moves, this.searchDepth)

    const depth = chess.moveNumber() < 8 ? Math.min(this.searchDepth + 1, 4) : this.midgameDepth
    const finalScored = depth > this.searchDepth ? this.searchWithEval(chess, moves, depth) : scored

    const bestCp = finalScored[0]?.score ?? 0
    const worstCp = finalScored[finalScored.length - 1]?.score ?? -500

    let chosen: number

    const rand = Math.random()
    if (rand < this.blunderRate) {
      const blunderPool = finalScored.filter((m) => m.score < bestCp - 200)
      if (blunderPool.length > 0) {
        chosen = finalScored.indexOf(blunderPool[Math.floor(Math.random() * blunderPool.length)])
      } else {
        const bottomHalf = Math.floor(finalScored.length * 0.5)
        chosen = bottomHalf + Math.floor(Math.random() * (finalScored.length - bottomHalf))
      }
    } else if (rand < this.blunderRate + this.inaccuracyRate) {
      const inaccPool = finalScored.filter((m) => m.score < bestCp - 50 && m.score >= bestCp - 200)
      if (inaccPool.length > 0) {
        chosen = finalScored.indexOf(inaccPool[Math.floor(Math.random() * inaccPool.length)])
      } else {
        const inaccIndex = Math.min(1 + Math.floor(Math.random() * 3), finalScored.length - 1)
        chosen = inaccIndex
      }
    } else {
      chosen = 0
    }

    const selected = finalScored[chosen]
    return {
      bestmove: selected.uci,
      displayBestmove: selected.san,
      evaluation: bestCp,
      from: selected.from,
      to: selected.to,
      promotion: selected.promotion,
    }
  }

  evaluatePosition(fen: string): number {
    const chess = new Chess(fen)
    return evaluateBoard(chess) / 100
  }

  private searchWithEval(
    chess: Chess,
    moves: { from: string; to: string; san: string; promotion?: string; captured?: string; piece: string }[],
    depth: number,
  ): { uci: string; san: string; score: number; from: string; to: string; promotion?: string }[] {
    const scored: any[] = []

    const bestMoveSoFar = ""
    const ordered = [...moves].sort((a, b) => moveOrderScore(chess, b, 0) - moveOrderScore(chess, a, 0))

    for (const m of ordered) {
      this.nodes = 0
      chess.move({ from: m.from as any, to: m.to as any, promotion: m.promotion })
      const score = -this.alphaBeta(chess, depth - 1, -100000, 100000, false)
      chess.undo()
      scored.push({ uci: m.from + m.to + (m.promotion || ""), san: m.san, score, from: m.from, to: m.to, promotion: m.promotion })
    }

    scored.sort((a: any, b: any) => b.score - a.score)
    return scored
  }

  private alphaBeta(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (this.nodes > this.maxNodes) return evaluateBoard(chess)

    if (depth === 0 || chess.isGameOver()) {
      this.nodes++
      return evaluateBoard(chess)
    }

    const moves = chess.moves({ verbose: true })
    if (moves.length === 0) {
      return chess.isCheckmate() ? (isMaximizing ? -100000 + (this.searchDepth - depth) : 100000 - (this.searchDepth - depth)) : 0
    }

    const ordered = [...moves].sort((a, b) => moveOrderScore(chess, b, 0) - moveOrderScore(chess, a, 0))

    for (const m of ordered) {
      chess.move({ from: m.from as any, to: m.to as any, promotion: m.promotion })
      const score = -this.alphaBeta(chess, depth - 1, -beta, -alpha, !isMaximizing)
      chess.undo()

      if (score > alpha) alpha = score
      if (alpha >= beta) break
    }

    return alpha
  }
}
