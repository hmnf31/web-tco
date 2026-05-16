import { Chess } from "chess.js"

// ─── Bot Personalities ───────────────────────────────────────
export type BotPersonality = {
  name: string
  description: string
  uciOptions: Record<string, string>
}

export const BOT_PERSONALITIES: BotPersonality[] = [
  {
    name: "Bot FajarSadChess",
    description: "Gaya agresif, selalu menyerang, taktis",
    uciOptions: { Contempt: "50", Aggressiveness: "200", Cowardice: "0" },
  },
  {
    name: "Bot TCO Coach",
    description: "Gaya posisional solid, bertahan",
    uciOptions: { Contempt: "0", Aggressiveness: "50", Cowardice: "100" },
  },
  {
    name: "Bot Arena King",
    description: "Gaya seimbang, all-around",
    uciOptions: { Contempt: "25", Aggressiveness: "100", Cowardice: "50" },
  },
  {
    name: "Bot TCO Rookie",
    description: "Cocok untuk pemula, banyak kesalahan",
    uciOptions: { Contempt: "-50", Aggressiveness: "30", Cowardice: "150" },
  },
]

// ─── Types ───────────────────────────────────────────────────
export type AnalysisResult = {
  bestmove: string
  evaluation: number
  mate: number | null
  pv: string[]
  depth: number
}

type Listener = (result: AnalysisResult | string) => void

// ─── Material Values ─────────────────────────────────────────
const MATERIAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
  P: -100, N: -320, B: -330, R: -500, Q: -900, K: -20000,
}

// ─── Position Evaluation (material + basic positioning) ──────
// Key squares: center (d4,d5,e4,e5), development zones
const CENTER = new Set(["d4", "d5", "e4", "e5"])
const CENTER_EXT = new Set(["c3", "c4", "c5", "c6", "d3", "d6", "e3", "e6", "f3", "f4", "f5", "f6"])

function evaluateBoard(fen: string): number {
  const board = fen.split(" ")[0]
  let score = 0
  let idx = 0

  for (const ch of board) {
    if (ch === "/") continue
    if (ch >= "1" && ch <= "8") { idx += parseInt(ch); continue }

    const isWhite = ch === ch.toUpperCase()
    const piece = ch.toLowerCase()
    const val = MATERIAL[ch] || 0

    // Positional bonus
    const file = idx % 8
    const rank = Math.floor(idx / 8)  // 0=rank8(top), 7=rank1(bottom) for white
    const fileCh = String.fromCharCode(97 + file)
    const rankNum = 8 - rank        // Convert to 1-indexed rank
    const sq = fileCh + rankNum

    let pos = 0
    if (piece === "p") {
      // Pawns: bonus for advancing, extra for center
      if (isWhite) pos += (rankNum - 1) * 5  // advancement bonus
      else pos -= (8 - rankNum) * 5
      if (CENTER.has(sq)) pos += isWhite ? 10 : -10
    } else if (piece === "n" || piece === "b") {
      // Knights and bishops: bonus for center control
      if (CENTER.has(sq)) pos += isWhite ? 20 : -20
      else if (CENTER_EXT.has(sq)) pos += isWhite ? 10 : -10
      // Development bonus (off back rank)
      if (isWhite && rankNum < 7) pos += 10
      else if (!isWhite && rankNum > 2) pos -= 10
    } else if (piece === "r") {
      // Rooks: bonus for open files (semi-open)
      if (rankNum === (isWhite ? 1 : 8)) pos += isWhite ? -10 : 10  // penalty for not moving
    } else if (piece === "q") {
      if (CENTER.has(sq)) pos += isWhite ? 5 : -5
    } else if (piece === "k") {
      // King: bonus for being in corners in middlegame
      if (rankNum === (isWhite ? 1 : 8)) pos += isWhite ? 15 : -15
      if (file === 0 || file === 7) pos += isWhite ? 5 : -5
    }

    score += val + pos
    idx++
  }

  return score / 100  // Convert centipawns to pawns
}

// ─── Alpha-Beta Search ──────────────────────────────────────
function alphaBeta(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess.fen()) * (maximizing ? 1 : -1)

  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return evaluateBoard(chess.fen()) * (maximizing ? 1 : -1)

  // Move ordering: captures first, checks, then by MVV-LVA
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

function getBestMoveLightweight(fen: string): { bestmove: string; evaluation: number } {
  const chess = new Chess(fen)
  const isWhite = chess.turn() === "w"
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return { bestmove: "", evaluation: 0 }

  // Move ordering
  moves.sort((a, b) => {
    const capA = a.captured ? MATERIAL[a.captured.toUpperCase()] || 0 : 0
    const capB = b.captured ? MATERIAL[b.captured.toUpperCase()] || 0 : 0
    return capB - capA
  })

  let bestScore = isWhite ? -Infinity : Infinity
  let bestMove = moves[0].san

  for (const move of moves) {
    chess.move(move.san)
    const score = alphaBeta(chess, 2, -Infinity, Infinity, !isWhite)
    chess.undo()

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move.san
    }
  }

  return { bestmove: bestMove, evaluation: bestScore }
}

// ─── Stockfish WASM (CDN) ────────────────────────────────────
class StockfishWorker {
  private worker: Worker | null = null
  private listeners: Listener[] = []
  private ready = false
  private initPromise: Promise<void> | null = null

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise
    this.initPromise = this._init()
    return this.initPromise
  }

  private _init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("Not in browser"))

      const urls = [
        "https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm.js",
        "/engine/stockfish.wasm.js",
        "/engine/stockfish.js",
      ]

      const tryLoad = (i: number) => {
        if (i >= urls.length) return reject(new Error("Failed to load Stockfish from any source"))

        try { this.worker = new Worker(urls[i]) } catch { return tryLoad(i + 1) }

        const timeout = setTimeout(() => {
          this.worker?.terminate(); this.worker = null; tryLoad(i + 1)
        }, 20000)

        this.worker.onmessage = (e: MessageEvent) => {
          const data = e.data as string
          this.listeners.forEach((fn) => fn(data))
          if (data === "uciok") {
            this.send("setoption name Threads value 1")
            this.send("setoption name Hash value 16")
            this.send("isready")
          }
          if (data === "readyok") {
            clearTimeout(timeout); this.ready = true; resolve()
          }
        }
        this.worker.onerror = () => {
          clearTimeout(timeout); this.worker?.terminate(); this.worker = null; tryLoad(i + 1)
        }
        this.send("uci")
      }
      tryLoad(0)
    })
  }

  send(cmd: string) { this.worker?.postMessage(cmd) }
  setPosition(fen: string) { this.send(`position fen ${fen}`) }
  setPositionFromMoves(moves: string[]) { this.send(`position startpos moves ${moves.join(" ")}`) }
  go(depth: number) { this.send(`go depth ${Math.min(depth, 18)}`) }
  goTime(ms: number) { this.send(`go movetime ${ms}`) }

  setElo(elo: number) {
    this.send("setoption name UCI_LimitStrength value true")
    this.send(`setoption name UCI_Elo value ${elo}`)
  }

  setSkillLevel(level: number) { this.send(`setoption name Skill Level value ${level}`) }

  applyPersonality(p: BotPersonality) {
    Object.entries(p.uciOptions).forEach(([k, v]) => this.send(`setoption name ${k} value ${v}`))
  }

  stop() { this.send("stop") }

  quit() { this.send("quit"); this.worker?.terminate(); this.worker = null; this.ready = false; this.initPromise = null }

  onMessage(fn: Listener) {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter((l) => l !== fn) }
  }

  isReady() { return this.ready }

  parseAnalysis(data: string): AnalysisResult | null {
    const depthM = data.match(/depth (\d+)/)
    const scoreM = data.match(/score (cp|mate) (-?\d+)/)
    const pvM = data.match(/ pv (.+)$/)
    if (scoreM && depthM) {
      const isMate = scoreM[1] === "mate"
      const score = Number.parseInt(scoreM[2])
      const pv = pvM ? pvM[1].split(" ") : []
      return {
        bestmove: pv[0] || "",
        evaluation: isMate ? (score > 0 ? 99999 : -99999) : score / 100,
        mate: isMate ? score : null,
        pv, depth: parseInt(depthM[1]),
      }
    }
    if (data.startsWith("bestmove")) {
      const m = data.match(/bestmove (\S+)/)
      return { bestmove: m ? m[1] : "", evaluation: 0, mate: null, pv: [], depth: 0 }
    }
    return null
  }
}

// ─── Public Engine API ───────────────────────────────────────
export class StockfishEngine {
  private worker = new StockfishWorker()
  private fallbackMode = false
  private ready = false

  async init(): Promise<void> {
    try { await this.worker.init(); this.ready = true }
    catch { this.fallbackMode = true; this.ready = true }
  }

  evaluatePosition(fen: string): number { return evaluateBoard(fen) }
  getBestMove(fen: string): { bestmove: string; evaluation: number } { return getBestMoveLightweight(fen) }

  send(cmd: string) { if (!this.fallbackMode) this.worker.send(cmd) }
  setPosition(fen: string) { if (!this.fallbackMode) this.worker.setPosition(fen) }
  setPositionFromMoves(moves: string[]) { if (!this.fallbackMode) this.worker.setPositionFromMoves(moves) }
  go(depth: number) { if (!this.fallbackMode) this.worker.go(depth) }
  goTime(ms: number) { if (!this.fallbackMode) this.worker.goTime(ms) }
  setElo(elo: number) { if (!this.fallbackMode) this.worker.setElo(elo) }
  applyPersonality(p: BotPersonality) { if (!this.fallbackMode) this.worker.applyPersonality(p) }
  stop() { if (!this.fallbackMode) this.worker.stop() }
  quit() { this.worker.quit(); this.ready = false }
  onMessage(fn: Listener) { return this.worker.onMessage(fn) }
  isReady() { return this.ready }
  isFallback() { return this.fallbackMode }
  parseAnalysis(data: string): AnalysisResult | null { return this.worker.parseAnalysis(data) }
}

// ─── Helpers ─────────────────────────────────────────────────
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
