import { Chess } from "chess.js"

export type StockfishEval = {
  bestmove: string
  evaluation: number
  mate: number | null
  from?: string
  to?: string
}

export type MoveEval = {
  move: string
  san: string
  cp: number
  winrate: number
  mate: number | null
}

export type StockfishMultiPvEval = {
  fen: string
  depth: number
  moves: MoveEval[]
  bestmove: string
}

export class WorkerEngine {
  private worker: Worker | null = null
  private ready = false
  private resolvers = new Map<string, (value: any) => void>()
  private busy = false
  private workerUrl: string

  private lastEval = 0
  private lastMate: number | null = null
  private bestmoveValue: StockfishEval | null = null
  private evalValue: number | null = null
  private multiPvResults: MoveEval[] = []
  private multiPvCount = 0

  constructor(workerUrl = "/workers/chess-engine.worker.js") {
    this.workerUrl = workerUrl
  }

  async init(): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.worker = new Worker(this.workerUrl)

        this.worker.onmessage = (e) => {
          const line = typeof e.data === "string" ? e.data : ""
          this.handleLine(line)
        }

        this.worker.onerror = () => {
          this.ready = true
          resolve()
        }

        this.wait("uciok", 10000).then(() => {
          this.ready = true
          resolve()
        })
      } catch {
        this.ready = true
        resolve()
      }
    })
  }

  private handleLine(line: string) {
    if (line === "uciok") {
      this.resolve("uciok")
      return
    }
    if (line === "readyok") {
      this.resolve("readyok")
      return
    }
    if (line.startsWith("bestmove")) {
      this.busy = false
      const parts = line.split(" ")
      const bestmove = parts[1] || ""
      const from = bestmove ? bestmove.substring(0, 2) : undefined
      const to = bestmove ? bestmove.substring(2, 4) : undefined
      this.bestmoveValue = { bestmove, evaluation: this.lastEval, mate: this.lastMate, from, to }
      if (!this.multiPvResults.length) {
        this.multiPvResults.push({ move: bestmove, san: bestmove, cp: Math.round(this.lastEval * 100), winrate: 0.5, mate: this.lastMate })
      }
      this.resolve("bestmove")
      return
    }
    if (line.startsWith("info")) {
      const parts = line.split(" ")
      let scoreCp: number | null = null
      let scoreMate: number | null = null
      let depthReached = 0
      let multiPv = -1
      let pvMove = ""

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "depth") depthReached = parseInt(parts[i + 1], 10) || 0
        if (parts[i] === "multipv") multiPv = parseInt(parts[i + 1], 10)
        if (parts[i] === "score" && parts[i + 1] === "cp") scoreCp = parseInt(parts[i + 2], 10) / 100
        if (parts[i] === "score" && parts[i + 1] === "mate") scoreMate = parseInt(parts[i + 2], 10)
        if (parts[i] === "pv") pvMove = parts[i + 1] || ""
      }

      if (scoreCp !== null) this.lastEval = scoreCp
      if (scoreMate !== null) this.lastMate = scoreMate

      if (multiPv > 0 && (scoreCp !== null || scoreMate !== null) && pvMove) {
        const idx = multiPv - 1
        if (!this.multiPvResults[idx]) {
          this.multiPvResults[idx] = { move: pvMove, san: pvMove, cp: scoreCp !== null ? Math.round(scoreCp * 100) : 0, winrate: 0.5, mate: scoreMate }
        } else {
          this.multiPvResults[idx].cp = scoreCp !== null ? Math.round(scoreCp * 100) : this.multiPvResults[idx].cp
          this.multiPvResults[idx].mate = scoreMate !== null ? scoreMate : this.multiPvResults[idx].mate
        }
      }

      if (scoreCp !== null && depthReached > 0) {
        this.evalValue = scoreCp
        this.resolve("eval")
      }
    }
  }

  private send(cmd: string) {
    if (this.worker) {
      this.worker.postMessage(cmd)
    }
  }

  private wait(id: string, timeoutMs = 5000): Promise<any> {
    return new Promise((resolve) => {
      this.resolvers.set(id, resolve)
      setTimeout(() => {
        if (this.resolvers.has(id)) {
          this.resolvers.delete(id)
          resolve(null)
        }
      }, timeoutMs)
    })
  }

  private resolve(id: string, value?: any) {
    const fn = this.resolvers.get(id)
    if (fn) {
      this.resolvers.delete(id)
      fn(value !== undefined ? value : true)
    }
  }

  private async exec<T>(fn: () => Promise<T>): Promise<T> {
    while (this.busy) await new Promise((r) => setTimeout(r, 20))
    this.busy = true
    try {
      return await fn()
    } finally {
      this.busy = false
    }
  }

  async setOption(name: string, value: string): Promise<void> {
    this.send(`setoption name ${name} value ${value}`)
    await new Promise((r) => setTimeout(r, 20))
  }

  async configure(options: { threads?: number; hash?: number; skillLevel?: number }): Promise<void> {
    if (options.threads !== undefined) await this.setOption("Threads", String(options.threads))
    if (options.hash !== undefined) await this.setOption("Hash", String(options.hash))
    if (options.skillLevel !== undefined) await this.setOption("Skill Level", String(options.skillLevel))
  }

  async getBestMove(fen: string, movetime = 700): Promise<StockfishEval> {
    return this.exec(async () => {
      if (!this.ready || !this.worker) return { bestmove: "", evaluation: 0, mate: null }

      this.lastEval = 0
      this.lastMate = null
      this.bestmoveValue = null
      this.multiPvResults = []

      this.send("position fen " + fen)
      this.send(`go movetime ${movetime}`)

      const result = await this.wait("bestmove", Math.max(movetime + 2000, 5000))
      if (!result || !this.bestmoveValue) {
        return { bestmove: "", evaluation: 0, mate: null }
      }
      return this.bestmoveValue!
    })
  }

  async evaluateAllMoves(fen: string, depth = 12, multiPv = 10): Promise<StockfishMultiPvEval> {
    return this.exec(async () => {
      if (!this.ready || !this.worker) return this.fallbackMultiPv(fen)

      this.multiPvResults = []
      this.multiPvCount = multiPv
      this.lastEval = 0
      this.lastMate = null

      this.send("setoption name MultiPv value " + multiPv)
      await new Promise((r) => setTimeout(r, 20))
      this.send("position fen " + fen)
      this.send("go movetime 1500")

      await this.wait("bestmove", 10000)
      this.send("setoption name MultiPv value 1")

      const chess = new Chess(fen)
      const legalMoves = chess.moves({ verbose: true })

      const moves: MoveEval[] = this.multiPvResults
        .filter((m) => m.move)
        .map((m) => {
          const lm = legalMoves.find((l) => l.from + l.to + (l.promotion || "") === m.move)
          return { move: m.move, san: lm?.san || m.move, cp: m.cp, winrate: 0.5, mate: m.mate }
        })

      return { fen, depth, moves, bestmove: moves[0]?.move || "" }
    })
  }

  async evaluatePosition(fen: string): Promise<number> {
    return this.exec(async () => {
      if (!this.ready || !this.worker) return 0

      this.lastEval = 0
      this.evalValue = null

      this.send("position fen " + fen)
      this.send("go depth 6")

      const result = await this.wait("eval", 5000)
      return this.evalValue ?? this.lastEval ?? 0
    })
  }

  private fallbackMultiPv(fen: string): StockfishMultiPvEval {
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    return {
      fen,
      depth: 0,
      moves: moves.map((m) => ({ move: m.from + m.to + (m.promotion || ""), san: m.san, cp: 0, winrate: 0.5, mate: null })),
      bestmove: moves[0]?.from + moves[0]?.to + (moves[0]?.promotion || "") || "",
    }
  }

  isReady(): boolean {
    return this.ready
  }

  quit() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.ready = false
  }
}
