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

export type EvalCallback = (evalData: { fen: string; evaluation: number; mate: number | null; depth: number }) => void

export class StockfishEngine {
  private worker: Worker | null = null
  private ready = false
  private resolvers: Map<string, (value: any) => void> = new Map()
  private isAnalyzing = false
  private fallbackMode = false
  private lastEval = 0
  private lastMate: number | null = null
  private bestmoveValue: StockfishEval | null = null
  private evalValue: number | null = null
  private multiPvResults: MoveEval[] = []
  private multiPvCount = 0
  private multiPvSeen = 0
  private evalCallback: EvalCallback | null = null
  private currentEvalDepth = 0
  private streamActive = false
  private commandQueue: Array<{ cmd: string; resolve: () => void; reject: (err: any) => void }> = []
  private commandRunning = false
  private lockId = 0

  private async runLocked<T>(fn: () => Promise<T>): Promise<T> {
    const id = ++this.lockId
    while (this.commandRunning && this.lockId === id) {
      await this.sleep(10)
    }
    if (this.lockId !== id) {
      throw new Error("Command superseded")
    }
    this.commandRunning = true
    try {
      return await fn()
    } finally {
      this.commandRunning = false
    }
  }

  async init(): Promise<void> {
    try {
      const workerUrl = this.getWorkerUrl()
      this.worker = new Worker(workerUrl, { type: "module" })

      this.worker.onmessage = (e) => {
        const msg = e.data
        if (msg.type === "ready") {
          this.ready = true
          this.fallbackMode = false
          this.resolve("init")
        } else if (msg.type === "error") {
          console.warn("Stockfish worker error:", msg.data)
          this.fallbackMode = true
          this.ready = true
          this.resolve("init")
        } else if (msg.type === "line") {
          this.handleLine(msg.data)
        }
      }

      this.worker.onerror = (err) => {
        console.warn("Stockfish worker error event:", err.message)
        this.fallbackMode = true
        this.ready = true
        this.resolve("init")
      }

      this.worker.postMessage("init")
      await this.wait("init", 20000)

      if (this.ready && !this.fallbackMode) {
        this.send("ucinewgame")
        await this.sleep(100)
        this.send("isready")
      }
    } catch (err) {
      console.warn("Stockfish init failed, using fallback:", err)
      this.fallbackMode = true
      this.ready = true
    }
  }

  private getWorkerUrl(): string {
    if (typeof window === "undefined") return "/stockfish/stockfish-worker.js"
    return `${window.location.origin}/stockfish/stockfish-worker.js`
  }

  private handleLine(line: string) {
    if (line.startsWith("bestmove")) {
      this.isAnalyzing = false
      this.streamActive = false
      const parts = line.split(" ")
      const bestmove = parts[1] || ""
      const from = bestmove ? bestmove.substring(0, 2) : undefined
      const to = bestmove ? bestmove.substring(2, 4) : undefined
      this.bestmoveValue = { bestmove, evaluation: this.lastEval, mate: this.lastMate, from, to }
      if (!this.multiPvResults.length) {
        this.multiPvResults.push({ move: bestmove, san: bestmove, cp: Math.round(this.lastEval * 100), winrate: 0.5, mate: this.lastMate })
      }
      this.resolve("bestmove")
    }

    if (line.startsWith("info")) {
      const parts = line.split(" ")
      let scoreCp: number | null = null
      let scoreMate: number | null = null
      let depthReached = 0
      let multiPv = -1
      let pvMove = ""
      let curLine = ""

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "depth") depthReached = parseInt(parts[i + 1], 10) || 0
        if (parts[i] === "multipv") multiPv = parseInt(parts[i + 1], 10)
        if (parts[i] === "score" && parts[i + 1] === "cp") scoreCp = parseInt(parts[i + 2], 10) / 100
        if (parts[i] === "score" && parts[i + 1] === "mate") scoreMate = parseInt(parts[i + 2], 10)
        if (parts[i] === "pv") {
          pvMove = parts[i + 1] || ""
          curLine = parts.slice(i + 1).join(" ")
        }
      }

      if (scoreCp !== null) this.lastEval = scoreCp
      if (scoreMate !== null) this.lastMate = scoreMate
      this.currentEvalDepth = depthReached

      if (multiPv > 0 && (scoreCp !== null || scoreMate !== null) && pvMove) {
        const idx = multiPv - 1
        if (!this.multiPvResults[idx]) {
          this.multiPvResults[idx] = { move: pvMove, san: pvMove, cp: scoreCp !== null ? Math.round(scoreCp * 100) : 0, winrate: 0.5, mate: scoreMate }
        } else {
          this.multiPvResults[idx].cp = scoreCp !== null ? Math.round(scoreCp * 100) : this.multiPvResults[idx].cp
          this.multiPvResults[idx].mate = scoreMate !== null ? scoreMate : this.multiPvResults[idx].mate
        }
      }

      if (multiPv > 0 && multiPv === this.multiPvCount && (scoreCp !== null || scoreMate !== null)) {
        this.multiPvSeen = this.multiPvCount
      }

      if (this.evalCallback && depthReached > 0 && scoreCp !== null) {
        this.evalCallback({ fen: "", evaluation: scoreCp, mate: scoreMate, depth: depthReached })
      }

      if (scoreCp !== null && depthReached > 0 && !this.streamActive) {
        this.evalValue = scoreCp
        this.resolve("eval")
      }

      if (this.streamActive && scoreCp !== null && depthReached > 0) {
        this.evalValue = scoreCp
        this.resolve("eval-stream")
      }
    }
  }

  private send(cmd: string) {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage(cmd)
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
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
    const resolveFn = this.resolvers.get(id)
    if (resolveFn) {
      this.resolvers.delete(id)
      resolveFn(value !== undefined ? value : true)
    }
  }

  async getBestMove(fen: string, depth = 12, _moveHistory?: string[], _maxNodes?: number): Promise<StockfishEval> {
    return this.runLocked(async () => {
      if (this.fallbackMode || !this.ready || !this.worker) {
        return this.fallbackEval(fen, depth)
      }

      this.lastEval = 0
      this.lastMate = null
      this.bestmoveValue = null
      this.multiPvResults = []

      this.send("ucinewgame")
      await this.sleep(50)
      this.send(`position fen ${fen}`)
      this.send(`go depth ${depth}`)

      this.isAnalyzing = true
      const result = await this.wait("bestmove", 30000)

      if (!result || !this.bestmoveValue) {
        return this.fallbackEval(fen, depth)
      }

      return this.bestmoveValue!
    })
  }

  async evaluateAllMoves(fen: string, depth = 14, multiPv = 10): Promise<StockfishMultiPvEval> {
    return this.runLocked(async () => {
      if (this.fallbackMode || !this.ready || !this.worker) {
        return this.fallbackMultiPv(fen)
      }

      this.multiPvResults = []
      this.multiPvCount = multiPv
      this.multiPvSeen = 0
      this.lastEval = 0
      this.lastMate = null

      this.send("ucinewgame")
      await this.sleep(50)
      this.send("setoption name MultiPv value " + multiPv)
      await this.sleep(20)
      this.send(`position fen ${fen}`)
      this.send(`go depth ${depth}`)

      this.isAnalyzing = true
      const result = await this.wait("bestmove", 60000)

      this.send("setoption name MultiPv value 1")

      const chess = new Chess(fen)
      const legalMoves = chess.moves({ verbose: true })

      const moves: MoveEval[] = this.multiPvResults
        .filter((m) => m.move)
        .map((m) => {
          const legalMove = legalMoves.find((lm) => lm.from + lm.to + (lm.promotion || "") === m.move)
          return {
            move: m.move,
            san: legalMove?.san || m.move,
            cp: m.cp,
            winrate: 0.5,
            mate: m.mate,
          }
        })

      return {
        fen,
        depth,
        moves,
        bestmove: moves[0]?.move || "",
      }
    })
  }

  async streamEvaluation(fen: string, callback: EvalCallback, depth = 18): Promise<void> {
    return this.runLocked(async () => {
      if (this.fallbackMode || !this.ready || !this.worker) {
        callback({ fen, evaluation: 0, mate: null, depth: 0 })
        return
      }

      this.evalCallback = callback
      this.streamActive = true

      this.send("ucinewgame")
      await this.sleep(30)
      this.send(`position fen ${fen}`)
      this.send(`go depth ${depth}`)

      await this.sleep(depth * 100 + 500)
      this.streamActive = false
      this.evalCallback = null
    })
  }

  stopStreaming() {
    if (this.worker && !this.fallbackMode) {
      this.send("stop")
    }
    this.streamActive = false
    this.evalCallback = null
  }

  async evaluatePosition(fen: string): Promise<number> {
    return this.runLocked(async () => {
      if (this.fallbackMode || !this.ready || !this.worker) return 0

      this.lastEval = 0
      this.evalValue = null

      this.send("ucinewgame")
      await this.sleep(30)
      this.send(`position fen ${fen}`)
      this.send("go depth 8")

      const result = await this.wait("eval", 10000)
      return this.evalValue ?? this.lastEval ?? 0
    })
  }

  evaluatePositionSync(_fen: string): number {
    return 0
  }

  private fallbackEval(fen: string, _depth: number): StockfishEval {
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    if (moves.length === 0) return { bestmove: "", evaluation: 0, mate: null }

    const picked = moves[Math.floor(Math.random() * moves.length)]
    return { bestmove: picked.san, evaluation: 0, mate: null, from: picked.from, to: picked.to }
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

  isFallback(): boolean {
    return this.fallbackMode
  }

  quit() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.ready = false
  }
}
