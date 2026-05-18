import { WorkerEngine, type StockfishEval, type StockfishMultiPvEval } from "./worker-engine"

export class EngineManager {
  private stockfish: WorkerEngine
  private _ready = false

  constructor() {
    this.stockfish = new WorkerEngine()
  }

  async init(): Promise<void> {
    try {
      await this.stockfish.init()
      await this.stockfish.configure({ threads: 1, hash: 16 })
    } catch {
      // stockfish init failed, fallback mode
    }
    this._ready = true
  }

  async configure(options: { threads?: number; hash?: number; skillLevel?: number }): Promise<void> {
    if (this._ready) {
      await this.stockfish.configure(options)
    }
  }

  quit(): void {
    this.stockfish.quit()
    this._ready = false
  }

  async getBestMove(fen: string, movetime = 700): Promise<StockfishEval> {
    return this.stockfish.getBestMove(fen, movetime)
  }

  async evaluateAllMoves(fen: string, depth = 14, multiPv = 10): Promise<StockfishMultiPvEval> {
    if (this._ready) {
      return this.stockfish.evaluateAllMoves(fen, depth, multiPv)
    }
    const { Chess } = await import("chess.js")
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    return {
      fen,
      depth: 0,
      moves: moves.map((m: any) => ({ move: m.from + m.to + (m.promotion || ""), san: m.san, cp: 0, winrate: 0.5, mate: null })),
      bestmove: moves[0]?.from + moves[0]?.to + (moves[0]?.promotion || "") || "",
    }
  }

  async evaluatePositionAsync(fen: string): Promise<number> {
    if (this._ready) {
      try {
        return await this.stockfish.evaluatePosition(fen)
      } catch {
        return 0
      }
    }
    return 0
  }

  isReady(): boolean {
    return this._ready
  }

  isFallback(): boolean {
    return !this.stockfish.isReady()
  }

  isStockfishReady(): boolean {
    return this.stockfish.isReady()
  }
}
