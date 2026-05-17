import { StockfishEngine, type StockfishEval, type StockfishMultiPvEval, type EvalCallback } from "./stockfish-engine"
import { TCOEngine, type TCOEval } from "./tco-engine"

export class EngineManager {
  private stockfish: StockfishEngine
  private tcoEngine: TCOEngine | null = null
  private _ready = false

  constructor() {
    this.stockfish = new StockfishEngine()
  }

  async init(): Promise<void> {
    try {
      await this.stockfish.init()
    } catch {
      // stockfish init failed, fallback mode
    }
    this._ready = true
  }

  setBotElo(elo: number): void {
    this.tcoEngine = new TCOEngine(elo)
  }

  quit(): void {
    this.stockfish.quit()
    this._ready = false
  }

  async getBestMove(
    fen: string,
    depth: number = 12,
    moveHistory: string[] = [],
    maxNodes: number = 0,
  ): Promise<StockfishEval> {
    const tco = this.tcoEngine
    if (tco) {
      const result: TCOEval = tco.getBestMove(fen, depth)
      return {
        bestmove: result.displayBestmove || result.bestmove,
        evaluation: result.evaluation,
        mate: null,
        from: result.from,
        to: result.to,
      }
    }
    return this.stockfish.getBestMove(fen, depth, moveHistory, maxNodes)
  }

  async evaluateAllMoves(fen: string, depth = 14, multiPv = 10): Promise<StockfishMultiPvEval> {
    if (this._ready && !this.isFallback()) {
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

  async streamEvaluation(fen: string, callback: EvalCallback, depth = 18): Promise<void> {
    if (this._ready && !this.isFallback()) {
      return this.stockfish.streamEvaluation(fen, callback, depth)
    }
    callback({ fen, evaluation: 0, mate: null, depth: 0 })
  }

  stopStreaming(): void {
    this.stockfish.stopStreaming()
  }

  async evaluatePositionAsync(fen: string): Promise<number> {
    if (this._ready && !this.isFallback()) {
      try {
        return await this.stockfish.evaluatePosition(fen)
      } catch {
        return 0
      }
    }
    if (this.tcoEngine) {
      return this.tcoEngine.evaluatePosition(fen)
    }
    return 0
  }

  isReady(): boolean {
    return this._ready
  }

  isFallback(): boolean {
    return this.stockfish.isFallback()
  }

  isStockfishReady(): boolean {
    return this._ready && !this.stockfish.isFallback()
  }
}
