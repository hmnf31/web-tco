import { Chess } from "chess.js"
import { getBookMove } from "./opening-book"

const MATERIAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
  P: -100, N: -320, B: -330, R: -500, Q: -900, K: -20000,
}

const CENTER = new Set(["d4", "d5", "e4", "e5"])
const CENTER_EXT = new Set(["c3", "c4", "c5", "c6", "d3", "d6", "e3", "e6", "f3", "f4", "f5", "f6"])

function evaluateBoard(fen: string): number {
  const parts = fen.split(" ")
  const board = parts[0]
  const castlingRights = parts[2] || "-"
  let score = 0
  let idx = 0
  let wKingSq = ""
  let bKingSq = ""

  for (const ch of board) {
    if (ch === "/") continue
    if (ch >= "1" && ch <= "8") { idx += parseInt(ch); continue }

    const isWhite = ch === ch.toUpperCase()
    const piece = ch.toLowerCase()
    const val = MATERIAL[ch] || 0
    const file = idx % 8
    const rank = Math.floor(idx / 8)
    const fileCh = String.fromCharCode(97 + file)
    const rankNum = 8 - rank
    const sq = fileCh + rankNum

    if (piece === "k") { if (isWhite) wKingSq = sq; else bKingSq = sq }

    let pos = 0
    if (piece === "p") {
      if (isWhite) pos += (rankNum - 1) * 5
      else pos -= (8 - rankNum) * 5
      if (CENTER.has(sq)) pos += isWhite ? 10 : -10
    } else if (piece === "n" || piece === "b") {
      if (CENTER.has(sq)) pos += isWhite ? 20 : -20
      else if (CENTER_EXT.has(sq)) pos += isWhite ? 10 : -10
      if (isWhite && rankNum < 7) pos += 10
      else if (!isWhite && rankNum > 2) pos -= 10
    } else if (piece === "r") {
      if (rankNum === (isWhite ? 1 : 8)) pos += isWhite ? -10 : 10
    } else if (piece === "q") {
      if (CENTER.has(sq)) pos += isWhite ? 5 : -5
    } else if (piece === "k") {
      if (rankNum === (isWhite ? 1 : 8)) pos += isWhite ? 15 : -15
      if (file === 0 || file === 7) pos += isWhite ? 5 : -5
    }

    score += val + pos
    idx++
  }

  // Castling bonuses
  if (wKingSq === "g1") score += 35
  else if (wKingSq === "c1") score += 30
  else if (wKingSq === "e1" && castlingRights.includes("K")) score -= 15
  else if (wKingSq === "e1" && castlingRights.includes("Q")) score -= 10

  if (bKingSq === "g8") score -= 35
  else if (bKingSq === "c8") score -= 30
  else if (bKingSq === "e8" && castlingRights.includes("k")) score += 15
  else if (bKingSq === "e8" && castlingRights.includes("q")) score += 10

  return score / 100
}

function alphaBeta(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess.fen()) * (maximizing ? 1 : -1)

  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return evaluateBoard(chess.fen()) * (maximizing ? 1 : -1)

  moves.sort((a, b) => {
    const capA = a.captured ? MATERIAL[a.captured.toUpperCase()] || 0 : 0
    const capB = b.captured ? MATERIAL[b.captured.toUpperCase()] || 0 : 0
    return capB - capA
  })

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      chess.move(move.san)
      const val = alphaBeta(chess, depth - 1, alpha, beta, false)
      chess.undo()
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      chess.move(move.san)
      const val = alphaBeta(chess, depth - 1, alpha, beta, true)
      chess.undo()
      best = Math.min(best, val)
      beta = Math.min(beta, val)
      if (beta <= alpha) break
    }
    return best
  }
}

function getBestMoveLightweight(fen: string, depth: number = 2): { bestmove: string; evaluation: number; from?: string; to?: string } {
  const chess = new Chess(fen)
  const isWhite = chess.turn() === "w"
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return { bestmove: "", evaluation: 0 }

  moves.sort((a, b) => {
    const capA = a.captured ? MATERIAL[a.captured.toUpperCase()] || 0 : 0
    const capB = b.captured ? MATERIAL[b.captured.toUpperCase()] || 0 : 0
    return capB - capA
  })

  let bestScore = isWhite ? -Infinity : Infinity
  let bestMove = moves[0]

  for (const move of moves) {
    chess.move(move.san)
    const score = alphaBeta(chess, depth, -Infinity, Infinity, !isWhite)
    chess.undo()

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return { bestmove: bestMove.san, evaluation: bestScore, from: bestMove.from, to: bestMove.to }
}

export class LozzaEngine {
  private ready = false

  async init(): Promise<void> {
    this.ready = true
  }

  getBestMove(fen: string, depth?: number, moveHistory?: string[]): { bestmove: string; evaluation: number; from?: string; to?: string } {
    if (moveHistory) {
      const bookMove = getBookMove(moveHistory)
      if (bookMove) {
        const c = new Chess(fen)
        try {
          const m = c.move(bookMove, { strict: true })
          if (m) return { bestmove: bookMove, evaluation: 0, from: m.from, to: m.to }
        } catch { /* fall through */ }
      }
    }
    return getBestMoveLightweight(fen, depth ?? 4)
  }

  evaluatePosition(fen: string): number {
    return evaluateBoard(fen)
  }

  quit() {
    this.ready = false
  }

  isFallback() { return false }
}

export type AnalysisResult = {
  bestmove: string
  evaluation: number
  mate: number | null
  pv: string[]
  depth: number
}

export function getCentipawnLoss(evaluation: number, bestEval: number): number {
  return Math.abs(evaluation - bestEval)
}

export function classifyMove(centipawnLoss: number): {
  label: string
  color: string
} {
  if (centipawnLoss <= 20) return { label: "Best", color: "text-green-400 bg-green-400/10 border-green-400/30" }
  if (centipawnLoss <= 50) return { label: "Excellent", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" }
  if (centipawnLoss <= 100) return { label: "Good", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" }
  if (centipawnLoss <= 200) return { label: "Inaccuracy", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" }
  if (centipawnLoss <= 500) return { label: "Mistake", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" }
  return { label: "Blunder", color: "text-red-400 bg-red-400/10 border-red-400/30" }
}
