"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import { ChessboardProvider, Chessboard } from "react-chessboard"
import { LozzaEngine } from "@/engine/lozza"
import EvaluationBar from "@/components/chess/EvaluationBar"
import { Play, Bot, Zap, Cpu, RotateCcw, Clock, Loader2, Users } from "lucide-react"

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

type TimeMode = "bullet" | "blitz" | "rapid" | "custom" | "none"

const TIME_PRESETS: { mode: TimeMode; label: string; minutes: number }[] = [
  { mode: "bullet", label: "Bullet 1m", minutes: 1 },
  { mode: "blitz", label: "Blitz 3m", minutes: 3 },
  { mode: "rapid", label: "Rapid 10m", minutes: 10 },
  { mode: "custom", label: "Custom", minutes: 0 },
  { mode: "none", label: "No Time", minutes: 0 },
]

type BotInfo = { name: string; rating: number; isEngine: boolean }

const TCO_PLAYERS: BotInfo[] = [
  { name: "blitzkkrieg", rating: 2307, isEngine: false },
  { name: "mal_21j", rating: 2186, isEngine: false },
  { name: "Sultan_Aulia", rating: 2181, isEngine: false },
  { name: "BaldwinKingsIV", rating: 2142, isEngine: false },
  { name: "TeddyPlays_IG", rating: 2099, isEngine: false },
  { name: "Kkjow", rating: 2079, isEngine: false },
  { name: "Blunders69", rating: 2069, isEngine: false },
  { name: "Abdi0324", rating: 2028, isEngine: false },
  { name: "Iyus_515", rating: 2013, isEngine: false },
  { name: "Harjay_TCO", rating: 2011, isEngine: false },
  { name: "LoveAyyme", rating: 1996, isEngine: false },
  { name: "Ai_isdarliansyah", rating: 1949, isEngine: false },
  { name: "Bobob77", rating: 1903, isEngine: false },
  { name: "Sulfancuk", rating: 1891, isEngine: false },
  { name: "Akun pemalu", rating: 1889, isEngine: false },
  { name: "Caturaga2018", rating: 1847, isEngine: false },
  { name: "supri_adi_22", rating: 1808, isEngine: false },
  { name: "Depri_i", rating: 1792, isEngine: false },
  { name: "Pak_Rt_05", rating: 1785, isEngine: false },
  { name: "shakabumi", rating: 1761, isEngine: false },
  { name: "Rusli_26", rating: 1746, isEngine: false },
  { name: "asaches03", rating: 1705, isEngine: false },
  { name: "Bung_iky", rating: 1689, isEngine: false },
  { name: "Streetchess 🤘", rating: 1685, isEngine: false },
  { name: "Restu_Azikusuma", rating: 1681, isEngine: false },
  { name: "diah89", rating: 1654, isEngine: false },
  { name: "TheDartVine", rating: 1621, isEngine: false },
  { name: "vozodd", rating: 1571, isEngine: false },
  { name: "Adikember", rating: 1549, isEngine: false },
  { name: "carilho_pablo_eskobar1993", rating: 1542, isEngine: false },
  { name: "TCO_Constantine", rating: 1487, isEngine: false },
  { name: "chris_amoeba", rating: 1376, isEngine: false },
  { name: "Afiatul", rating: 1329, isEngine: false },
  { name: "PutraRian", rating: 1317, isEngine: false },
  { name: "69hehehehehehehehehehe69", rating: 1268, isEngine: false },
  { name: "adwar3184", rating: 1191, isEngine: false },
  { name: "Dewacucibaju", rating: 1170, isEngine: false },
  { name: "pixelfern8", rating: 962, isEngine: false },
  { name: "szeschaa", rating: 754, isEngine: false },
]

const BOT_OPTIONS: BotInfo[] = [
  ...TCO_PLAYERS,
  { name: "Lozza", rating: 1200, isEngine: true },
]

function getBotDepth(rating: number, timeMode: TimeMode): number {
  if (rating >= 2400) return 8
  if (rating >= 2100) return 6
  if (rating >= 1800) return 4
  if (rating >= 1500) return 3
  return 2
}

function getMaxNodes(timeMode: TimeMode, customMinutes: number): number {
  if (timeMode === "bullet") return 500
  if (timeMode === "blitz") return 1000
  if (timeMode === "rapid") return 2000
  if (timeMode === "custom") return Math.min(customMinutes * 400, 2000)
  return 2000
}

function getBotDelayMs(timeMode: TimeMode, customMinutes: number): number {
  if (timeMode === "bullet") return 100
  if (timeMode === "blitz") return 300
  if (timeMode === "rapid") return 600
  if (timeMode === "custom") return Math.min(customMinutes * 100, 1000)
  return 400
}

export default function PlayBotPage() {
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [engine] = useState(() => new LozzaEngine())
  const [engineReady, setEngineReady] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white")
  const [bot, setBot] = useState<BotInfo>(BOT_OPTIONS[0])
  const [botElo, setBotElo] = useState(1200)
  const [timeMode, setTimeMode] = useState<TimeMode>("none")
  const [customMinutes, setCustomMinutes] = useState(5)
  const [playerTime, setPlayerTime] = useState(0)
  const [botTime, setBotTime] = useState(0)
  const [evaluation, setEvaluation] = useState(0)
  const [moves, setMoves] = useState<string[]>([])
  const [coachText, setCoachText] = useState("")
  const [commentary, setCommentary] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [legalSquares, setLegalSquares] = useState<string[]>([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [botThinking, setBotThinking] = useState(false)
  const [gameResult, setGameResult] = useState<string | null>(null)
  const gameRef = useRef(game)
  const thinkingRef = useRef(false)
  const botMovePendingRef = useRef(false)
  const botThinkingRef = useRef(false)
  const movesRef = useRef(moves)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const activeElo = bot.isEngine ? botElo : bot.rating

  useEffect(() => { gameRef.current = game }, [game])
  useEffect(() => { botThinkingRef.current = botThinking }, [botThinking])
  useEffect(() => { movesRef.current = moves }, [moves])

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

  useEffect(() => {
    if (!gameStarted || gameOver) return
    const timer = setTimeout(() => {
      if (isBotTurn()) doBotMove()
    }, 600)
    return () => clearTimeout(timer)
  }, [gameStarted, gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer — decreases whoever's turn it is every second
  useEffect(() => {
    if (!gameStarted || gameOver || timeMode === "none") return
    timerRef.current = setInterval(() => {
      const g = gameRef.current
      if (g.turn() === "w") {
        setPlayerTime((t) => Math.max(0, t - 1))
      } else {
        setBotTime((t) => Math.max(0, t - 1))
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStarted, gameOver, timeMode, playerColor])

  useEffect(() => {
    if (!gameStarted || gameOver || timeMode === "none") return
    if (playerTime <= 0 && gameRef.current.turn() === (playerColor === "white" ? "w" : "b")) {
      setGameOver(true)
      setGameResult("Kamu kehabisan waktu! Bot menang.")
      setCommentary((p) => [...p, "Time's up! Kamu kehabisan waktu!"])
    }
    if (botTime <= 0 && gameRef.current.turn() === (playerColor === "white" ? "b" : "w")) {
      setGameOver(true)
      setGameResult("Kamu menang! Bot kehabisan waktu.")
      setCommentary((p) => [...p, "Bot kehabisan waktu! Kamu menang!"])
    }
  }, [playerTime, botTime, gameStarted, gameOver, timeMode, playerColor])

  function getTimeInSeconds(mode: TimeMode, custom: number): number {
    if (mode === "none") return 0
    if (mode === "custom") return custom * 60
    const p = TIME_PRESETS.find((t) => t.mode === mode)
    return (p?.minutes || 0) * 60
  }

  const isBotTurn = useCallback(() => {
    const c = new Chess(gameRef.current.fen())
    return playerColor === "white" ? c.turn() === "b" : c.turn() === "w"
  }, [playerColor])

  const doBotMove = useCallback(() => {
    if (thinkingRef.current || gameOver || botMovePendingRef.current) return
    if (!isBotTurn()) return
    botMovePendingRef.current = true
    thinkingRef.current = true
    setBotThinking(true)

    const depth = getBotDepth(activeElo, timeMode)
    const maxNodes = getMaxNodes(timeMode, customMinutes)
    const delay = getBotDelayMs(timeMode, customMinutes)

    setTimeout(() => {
      const result = engine.getBestMove(gameRef.current.fen(), depth, movesRef.current, maxNodes)
      if (!result.bestmove) { thinkingRef.current = false; botMovePendingRef.current = false; setBotThinking(false); return }

      const g = new Chess(gameRef.current.fen())
      try {
        const fr = result.from || result.bestmove.substring(0, 2)
        const t = result.to || result.bestmove.substring(2, 4)
        const promo = result.bestmove.length > 4 ? result.bestmove[4] as any : undefined
        g.move({ from: fr as any, to: t as any, promotion: promo }, { strict: true })
        const h = g.history()
        const last = h[h.length - 1]
        const from = fr
        const to = t
        gameRef.current = g
        setLastMove({ from, to })
        setGame(g)
        setFen(g.fen())
        setMoves(h)
        const c = COACH[Math.floor(Math.random() * COACH.length)]
        setCoachText(c)
        setCommentary((prev) => [...prev.slice(-29), `Bot (${bot.name}): ${last}`])
        if (g.isGameOver()) {
          setGameOver(true)
          if (g.isCheckmate()) {
            const winner = g.turn() === "w" ? "Hitam" : "Putih"
            const loser = g.turn() === "w" ? "Putih" : "Hitam"
            setGameResult(`${winner} menang! ${loser} kalah.`)
            setCommentary((prev) => [...prev, `${winner} menang! Checkmate.`])
          } else if (g.isDraw()) {
            setGameResult("Hasil imbang (Draw)")
            setCommentary((prev) => [...prev, "Game berakhir draw."])
          } else {
            setGameResult("Game Over")
          }
        }
      } catch { /* ignore */ }
      thinkingRef.current = false
      botMovePendingRef.current = false
      setBotThinking(false)
    }, delay)
  }, [engine, gameOver, playerColor, isBotTurn, activeElo, timeMode, customMinutes, bot.name])

  function applyPlayerMove(from: string, to: string, promo?: string): boolean {
    if (!gameStarted || gameOver || isBotTurn() || botThinking) return false
    const g = new Chess(gameRef.current.fen())
    try {
      const move = g.move({ from: from as Square, to: to as Square, promotion: promo || "q" })
      if (!move) return false
      setLegalSquares([])
      setSelectedSquare(null)
      setLastMove({ from, to })
      gameRef.current = g
      setGame(g)
      setFen(g.fen())
      setMoves(g.history())
      setCommentary((prev) => [...prev.slice(-29), `Kamu (${playerColor === "white" ? "Putih" : "Hitam"}): ${move.san}`])
      if (g.isGameOver()) {
        setGameOver(true)
        if (g.isCheckmate()) {
          const winner = g.turn() === "w" ? "Hitam" : "Putih"
          const loser = g.turn() === "w" ? "Putih" : "Hitam"
          setGameResult(`${winner} menang! ${loser} kalah.`)
          setCommentary((prev) => [...prev, `${winner} menang! Checkmate.`])
        } else if (g.isDraw()) {
          setGameResult("Hasil imbang (Draw)")
          setCommentary((prev) => [...prev, "Game berakhir draw."])
        } else {
          setGameResult("Game Over")
        }
        return true
      }
      doBotMove()
      return true
    } catch { return false }
  }

  function onSquareClick({ square }: { square: string }) {
    if (!gameStarted || gameOver || isBotTurn() || botThinking) return
    const g = new Chess(gameRef.current.fen())
    const piece = g.get(square as Square)

    if (selectedSquare) {
      if (applyPlayerMove(selectedSquare, square)) return
      if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
        setSelectedSquare(square)
        setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
        return
      }
      setSelectedSquare(null)
      setLegalSquares([])
      return
    }

    if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
      setSelectedSquare(square)
      setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
    }
  }

  function onPieceDrop(args: { sourceSquare?: string | null; targetSquare?: string | null }): boolean {
    if (!args.sourceSquare || !args.targetSquare) return false
    return applyPlayerMove(args.sourceSquare, args.targetSquare)
  }

  function startGame(color: "white" | "black") {
    if (!engineReady) return
    const fresh = new Chess()
    const secs = getTimeInSeconds(timeMode, customMinutes)
    gameRef.current = fresh
    setGame(fresh); setFen(fresh.fen()); setMoves([])
    setEvaluation(0); setCoachText(""); setCommentary([]); setLastMove(null); setLegalSquares([]); setSelectedSquare(null)
    setPlayerColor(color); setGameStarted(true); setGameOver(false); setBotThinking(false); setGameResult(null)
    setPlayerTime(secs); setBotTime(secs)
  }

  function resetGame() {
    setGameStarted(false); setGameOver(false); setLastMove(null); setLegalSquares([]); setSelectedSquare(null); setBotThinking(false)
    const fresh = new Chess()
    gameRef.current = fresh
    setGame(fresh); setFen(fresh.fen()); setMoves([]); setEvaluation(0); setCoachText(""); setCommentary([])
    setPlayerTime(0); setBotTime(0)
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const sqStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    sqStyles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
    sqStyles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
  }
  if (selectedSquare) {
    sqStyles[selectedSquare] = { backgroundColor: "rgba(0, 210, 255, 0.35)", borderRadius: "4px" }
  }
  for (const sq of legalSquares) {
    sqStyles[sq] = {
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
    onPieceDrop,
    boardStyle: { borderRadius: "12px", boxShadow: "0 0 30px rgba(0, 210, 255, 0.1)" },
    darkSquareStyle: { backgroundColor: "#1e293b" },
    lightSquareStyle: { backgroundColor: "#334155" },
    showNotation: true,
    squareStyles: sqStyles,
    allowDragging: true,
  }

  if (!gameStarted) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-cyan-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">VS Bot Training</h1>
          <p className="mt-1 text-sm text-white/50">Pilih lawan dari anggota TCO atau Lozza Engine</p>
          {engineReady && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium bg-cyan-400/10 text-cyan-400">
              <Zap className="h-3 w-3" /> Engine Siap
            </span>
          )}
        </div>

        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {/* Bot Selector */}
          <div>
            <label className="text-sm font-medium text-white/70">Pilih Bot</label>
            <select value={bot.name}
              onChange={(e) => {
                const f = BOT_OPTIONS.find((b) => b.name === e.target.value)
                if (f) setBot(f)
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50">
              <optgroup label="— TCO Players —" className="bg-slate-950">
                {TCO_PLAYERS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-slate-950">{p.name} (Elo {p.rating})</option>
                ))}
              </optgroup>
              <optgroup label="— Lozza Engine —" className="bg-slate-950">
                <option value="Lozza" className="bg-slate-950">Lozza Engine</option>
              </optgroup>
            </select>
          </div>

          {/* Elo slider — only for Lozza engine */}
          {bot.isEngine && (
            <div>
              <label className="text-sm font-medium text-white/70">Level (Elo: {botElo})</label>
              <input type="range" min={800} max={2800} step={100} value={botElo}
                onChange={(e) => setBotElo(Number(e.target.value))}
                className="mt-2 w-full accent-cyan-400" />
              <div className="mt-1 flex justify-between text-xs text-white/30"><span>800</span><span>2800</span></div>
            </div>
          )}
          {!bot.isEngine && (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs text-cyan-400">
                <Users className="h-3.5 w-3.5" />
                TCO Player — Elo {bot.rating}
              </div>
            </div>
          )}

          {/* Time Mode */}
          <div>
            <label className="text-sm font-medium text-white/70">Time Mode</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIME_PRESETS.map((p) => (
                <button key={p.mode} onClick={() => setTimeMode(p.mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    timeMode === p.mode ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "border border-white/10 text-white/50 hover:text-white/70"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            {timeMode === "custom" && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-white/40">Menit per pemain:</span>
                <input type="number" min={1} max={60} value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, Math.min(60, Number(e.target.value))))}
                  className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white text-center outline-none focus:border-cyan-400/50" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => startGame("white")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] ${!engineReady ? "opacity-50 cursor-not-allowed" : ""}`}>
              <Play className="h-4 w-4" /> Main sebagai Putih
            </button>
            <button onClick={() => startGame("black")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${!engineReady ? "opacity-50 cursor-not-allowed" : ""}`}>
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
            <Bot className="h-3.5 w-3.5" /> {bot.name}
          </span>
          <span className="text-[10px] text-white/30">Elo {activeElo}</span>
          {isFallback ? (
            <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-400"><Zap className="h-3 w-3" /> Light Mode</span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-400"><Cpu className="h-3 w-3" /> Lozza</span>
          )}
        </div>
        <button onClick={resetGame}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Timer Display */}
      {timeMode !== "none" && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className={`font-semibold ${playerTime <= 30 ? "text-red-400" : "text-white"}`}>
              {formatTime(playerTime)}
            </span>
            <span className="text-white/30">|</span>
            <span className={`font-semibold ${botTime <= 30 ? "text-red-400" : "text-cyan-400"}`}>
              {formatTime(botTime)}
            </span>
          </div>
          <span className="text-[10px] text-white/30">
            {timeMode === "custom" ? `${customMinutes}m` : TIME_PRESETS.find((t) => t.mode === timeMode)?.label}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Board + Evaluation Bar side by side */}
          <div className="flex gap-4 items-start">
            <ChessboardProvider options={boardOptions}>
              <div className="max-w-[560px] flex-1"><Chessboard /></div>
            </ChessboardProvider>
            <div className="shrink-0">
              <EvaluationBar evaluation={evaluation} mate={null} />
              <div className="mt-2 text-center">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                  {(() => {
                    const cp = evaluation * 100
                    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.003682 * cp)) - 1)
                    return `${Math.round(Math.max(0, Math.min(100, pct)))}%`
                  })()} win
                </span>
              </div>
            </div>
          </div>

          {/* Move list */}
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

          {/* Game Over + Virtual Coach below board */}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {gameOver && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <p className="text-sm font-bold text-white">{gameResult}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button onClick={() => {
                    const g = new Chess()
                    moves.forEach((m) => { try { g.move(m) } catch { /* */ } })
                    if (typeof window !== "undefined") localStorage.setItem("analysisPgn", g.pgn())
                    window.location.href = "/arena-training/analysis"
                  }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
                    Analisis Game
                  </button>
                  <button onClick={resetGame}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <RotateCcw className="h-3.5 w-3.5" /> Main Lagi
                  </button>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                  {botThinking ? <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Bot className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-cyan-400">Virtual Coach</p>
                  {botThinking ? (
                    <p className="mt-0.5 text-xs italic text-cyan-400/60">Engine Thinking...</p>
                  ) : coachText ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{coachText}</p>
                  ) : (
                    <p className="mt-0.5 text-xs text-white/30">Coach akan memberi komentar setelah langkah dimainkan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Commentary</h3>
            <div className="mt-2 space-y-1">
              {commentary.map((c, i) => (<p key={i} className="text-[11px] leading-relaxed text-white/40">{c}</p>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
