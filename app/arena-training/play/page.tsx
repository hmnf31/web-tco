"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import { ChessboardProvider, Chessboard } from "react-chessboard"
import { StockfishEngine, BOT_PERSONALITIES, type BotPersonality } from "@/engine/stockfish"
import EvaluationBar from "@/components/chess/EvaluationBar"
import { Play, Bot, Zap, Cpu, RotateCcw } from "lucide-react"

const COACH = [
  "Langkahmu kurang akurat! Coba perhatikan perwira yang tidak dijaga.",
  "Waspada! Lawan mengincar skakmat di sisi Raja.",
  "Bagus! Kendali pusat papan sangat penting.",
  "Jangan terburu-buru, evaluasi dulu semua kemungkinan.",
  "Coba pertimbangkan untuk mengembangkan perwira ringanmu.",
  "Perhatikan struktur pionmu!",
  "Kamu kehilangan materi, coba cari taktik untuk mengimbangi.",
  "Langkah yang solid! Pertahankan tekanan.",
]

export default function PlayBotPage() {
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [engine] = useState(() => new StockfishEngine())
  const [engineReady, setEngineReady] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white")
  const [elo, setElo] = useState(1200)
  const [personality, setPersonality] = useState<BotPersonality>(BOT_PERSONALITIES[1])
  const [evaluation, setEvaluation] = useState(0)
  const [moves, setMoves] = useState<string[]>([])
  const [coachText, setCoachText] = useState("")
  const [commentary, setCommentary] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [legalSquares, setLegalSquares] = useState<string[]>([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const gameRef = useRef(game)
  const thinkingRef = useRef(false)
  const botMovePendingRef = useRef(false)

  useEffect(() => { gameRef.current = game }, [game])

  useEffect(() => {
    (async () => {
      await engine.init()
      setEngineReady(true)
      setIsFallback(engine.isFallback())
    })()
    return () => engine.quit()
  }, [engine])

  useEffect(() => {
    if (!gameStarted) return
    const iv = setInterval(() => setEvaluation(engine.evaluatePosition(gameRef.current.fen())), 1000)
    return () => clearInterval(iv)
  }, [gameStarted, engine])

  const isBotTurn = useCallback(() => {
    const c = new Chess(gameRef.current.fen())
    return playerColor === "white" ? c.turn() === "b" : c.turn() === "w"
  }, [playerColor])

  const doBotMove = useCallback(() => {
    if (thinkingRef.current || gameOver || botMovePendingRef.current) return
    if (!isBotTurn()) return
    botMovePendingRef.current = true
    thinkingRef.current = true

    setTimeout(() => {
      const result = engine.getBestMove(gameRef.current.fen())
      if (!result.bestmove) { thinkingRef.current = false; botMovePendingRef.current = false; return }

      const g = new Chess(gameRef.current.fen())
      try {
        g.move(result.bestmove, { strict: true })
        const h = g.history()
        const last = h[h.length - 1]
        const from = result.bestmove.substring(0, 2)
        const to = result.bestmove.substring(2, 4)
        setLastMove({ from, to })
        setGame(g)
        setFen(g.fen())
        setMoves(h)
        const c = COACH[Math.floor(Math.random() * COACH.length)]
        setCoachText(c)
        setCommentary((prev) => [...prev.slice(-29), `Bot (${playerColor === "white" ? "Hitam" : "Putih"}): ${last}`])
        if (g.isGameOver()) {
          setGameOver(true)
          setCommentary((prev) => [...prev, "Game Over!"])
        }
      } catch { /* ignore */ }
      thinkingRef.current = false
      botMovePendingRef.current = false
    }, 400)
  }, [engine, gameOver, playerColor, isBotTurn])

  function onSquareClick({ square }: { square: string }) {
    if (!gameStarted || gameOver || isBotTurn()) return
    const g = new Chess(gameRef.current.fen())
    const piece = g.get(square as Square)

    if (selectedSquare) {
      // Try to move
      try {
        const move = g.move({ from: selectedSquare, to: square, promotion: "q" })
        if (move) {
          setLegalSquares([])
          setSelectedSquare(null)
          setLastMove({ from: selectedSquare, to: square })
          setGame(g)
          setFen(g.fen())
          setMoves(g.history())
          setCommentary((prev) => [...prev.slice(-29), `Kamu (${playerColor === "white" ? "Putih" : "Hitam"}): ${move.san}`])
          if (g.isGameOver()) { setGameOver(true); setCommentary((prev) => [...prev, "Game Over!"]); return }
          doBotMove()
          return
        }
      } catch { /* not a valid move */ }

      // If clicked on own piece, select it instead
      if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
        setSelectedSquare(square)
        setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
        return
      }

      // Deselect
      setSelectedSquare(null)
      setLegalSquares([])
      return
    }

    if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
      setSelectedSquare(square)
      setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
    }
  }

  function startGame(color: "white" | "black") {
    const fresh = new Chess()
    setGame(fresh); setFen(fresh.fen()); setMoves([])
    setEvaluation(0); setCoachText(""); setCommentary([]); setLastMove(null); setLegalSquares([]); setSelectedSquare(null)
    setPlayerColor(color); setGameStarted(true); setGameOver(false)
  }

  function resetGame() {
    setGameStarted(false); setGameOver(false); setLastMove(null); setLegalSquares([]); setSelectedSquare(null)
    const fresh = new Chess()
    setGame(fresh); setFen(fresh.fen()); setMoves([]); setEvaluation(0); setCoachText(""); setCommentary([])
  }

  // Build square styles
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
    squareStyles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
  }
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: "rgba(0, 210, 255, 0.35)", borderRadius: "4px" }
  }
  for (const sq of legalSquares) {
    squareStyles[sq] = {
      background: "radial-gradient(circle, rgba(0,210,255,0.4) 25%, transparent 25%)",
      borderRadius: "50%",
    }
  }

  const boardOrientation: "white" | "black" = playerColor === "black" ? "black" : "white"
  const boardOptions = {
    id: "play-bot-board",
    position: fen,
    boardOrientation,
    onSquareClick,
    boardStyle: { borderRadius: "12px", boxShadow: "0 0 30px rgba(0, 210, 255, 0.1)" },
    darkSquareStyle: { backgroundColor: "#1e293b" },
    lightSquareStyle: { backgroundColor: "#334155" },
    showNotation: true,
    squareStyles,
    allowDragging: false,
  }

  if (!gameStarted) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-cyan-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">VS Bot Training</h1>
          <p className="mt-1 text-sm text-white/50">Atur pengaturan lalu mulai permainan</p>
          {engineReady && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium bg-cyan-400/10 text-cyan-400">
              <Zap className="h-3 w-3" /> Engine Siap
            </span>
          )}
        </div>

        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <label className="text-sm font-medium text-white/70">Level (Elo: {elo})</label>
            <input type="range" min={800} max={2800} step={100} value={elo}
              onChange={(e) => setElo(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400" />
            <div className="mt-1 flex justify-between text-xs text-white/30"><span>800</span><span>2800</span></div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/70">Bot Personality</label>
            <select value={personality.name}
              onChange={(e) => { const f = BOT_PERSONALITIES.find((p) => p.name === e.target.value); if (f) setPersonality(f) }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50">
              {BOT_PERSONALITIES.map((p) => (
                <option key={p.name} value={p.name} className="bg-slate-950">{p.name} — {p.description}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => startGame("white")} disabled={!engineReady}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] disabled:opacity-50">
              <Play className="h-4 w-4" /> Main sebagai Putih
            </button>
            <button onClick={() => startGame("black")} disabled={!engineReady}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50">
              <Play className="h-4 w-4" /> Main sebagai Hitam
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/70">Kamu ({playerColor === "white" ? "Putih" : "Hitam"})</span>
          <span className="text-white/30">vs</span>
          <span className="flex items-center gap-1 text-sm font-medium text-cyan-400">
            <Bot className="h-3.5 w-3.5" /> {personality.name}
          </span>
          {isFallback ? (
            <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-400"><Zap className="h-3 w-3" /> Light Mode</span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-400"><Cpu className="h-3 w-3" /> Stockfish</span>
          )}
        </div>
        <button onClick={resetGame}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <ChessboardProvider options={boardOptions}>
            <div className="mx-auto max-w-[560px]"><Chessboard /></div>
          </ChessboardProvider>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap gap-1">
              {moves.length === 0 ? (
                <span className="text-xs text-white/20">Klik bidak untuk mulai...</span>
              ) : (
                moves.map((m, i) => (
                  <span key={i} className={`rounded px-1.5 py-0.5 text-[11px] ${i % 2 === 0 ? "bg-white/5 text-white/60" : "bg-cyan-400/5 text-cyan-400/80"}`}>
                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}{m}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Evaluation</h3>
            <div className="mt-2 flex justify-center">
              <div className="scale-75 origin-top"><EvaluationBar evaluation={evaluation} mate={null} /></div>
            </div>
            <div className="mt-2 text-center">
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-cyan-400">
                {(() => {
                  const cp = evaluation * 100
                  const pct = 50 + 50 * (2 / (1 + Math.exp(-0.003682 * cp)) - 1)
                  return `${Math.round(Math.max(0, Math.min(100, pct)))}%`
                })()} win chance
              </span>
            </div>
          </div>
          {coachText && (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10"><Bot className="h-3.5 w-3.5 text-cyan-400" /></div>
                <div>
                  <p className="text-[10px] font-medium text-cyan-400">Virtual Coach</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">{coachText}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Commentary</h3>
            <div className="mt-2 space-y-1">
              {commentary.map((c, i) => (<p key={i} className="text-[11px] leading-relaxed text-white/40">{c}</p>))}
            </div>
          </div>
          {moves.length > 0 && (
            <button onClick={() => {
              const g = new Chess()
              moves.forEach((m) => { try { g.move(m) } catch { /* */ } })
              const pgn = g.pgn()
              navigator.clipboard.writeText(pgn)
              setCoachText("PGN copied!")
            }}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
              Export PGN
            </button>
          )}
          {gameOver && (
            <button onClick={resetGame}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
              <RotateCcw className="h-4 w-4" /> Main Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
