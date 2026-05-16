"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import { ChessboardProvider, Chessboard } from "react-chessboard"
import { LozzaEngine, classifyMove, getCentipawnLoss } from "@/engine/lozza"
import EvaluationBar from "@/components/chess/EvaluationBar"
import {
  Search, FileText, ExternalLink, ChevronLeft, ChevronRight,
  AlertCircle, Zap, Brain, RotateCcw, Play, Pause, SkipBack, SkipForward, Loader2
} from "lucide-react"

type Tab = "chesscom" | "lichess" | "pgn"

type MoveAnalysis = {
  moveNumber: number
  san: string
  fen: string
  evaluationBefore: number
  evaluationAfter: number
  centipawnLoss: number
  classification: ReturnType<typeof classifyMove>
}

type GameInfo = {
  pgn: string
  label: string
  white?: string
  black?: string
  result?: string
  date?: string
  url?: string
  fetched?: boolean
}

export default function AnalysisPage() {
  const [tab, setTab] = useState<Tab>("pgn")
  const [username, setUsername] = useState("")
  const [pgn, setPgn] = useState("")
  const [gameFen, setGameFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  const [moves, setMoves] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [gamesList, setGamesList] = useState<GameInfo[]>([])
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null)
  const [engine] = useState(() => new LozzaEngine())
  const [engineReady, setEngineReady] = useState(false)
  const [evaluation, setEvaluation] = useState(0)
  const [mate, setMate] = useState<number | null>(null)
  const [hasResults, setHasResults] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [playMode, setPlayMode] = useState(false)
  const [coachComment, setCoachComment] = useState("")
  const [page, setPage] = useState(0)
  const [gamesPerPage] = useState(5)
  const abortRef = useRef(false)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const COACH_ADVICE: Record<string, string> = {
    Best: "Langkah terbaik! Maintain tekanan.",
    Excellent: "Langkah hampir sempurna!",
    Good: "Langkah solid, pertahankan.",
    Inaccuracy: "Kurang akurat. Coba cari alternatif yang lebih baik.",
    Mistake: "Kesalahan! Perhatikan kalkulasi dengan lebih teliti.",
    Blunder: "Blunder! Kamu kehilangan materi atau posisi.",
  }

  useEffect(() => {
    async function init() { await engine.init(); setEngineReady(true) }
    init()
    return () => { engine.quit(); abortRef.current = true }
  }, [engine])

  useEffect(() => {
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("analysisPgn")
      if (stored) {
        localStorage.removeItem("analysisPgn")
        loadPGN(stored)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playMode) return
    playIntervalRef.current = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        const next = prev + 1
        if (next >= moves.length) { setPlayMode(false); return prev }
        const chess = new Chess()
        for (let i = 0; i <= next; i++) chess.move(moves[i])
        setGameFen(chess.fen())
        updateEval(chess.fen())
        const hist = chess.history({ verbose: true })
        const lm = hist[hist.length - 1]
        if (lm) setLastMove({ from: lm.from, to: lm.to })
        return next
      })
    }, 1200)
    return () => { if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null } }
  }, [playMode, moves])

  function updateEval(fen: string) {
    setEvaluation(engine.evaluatePosition(fen))
    setMate(null)
  }

  const analyzeMoves = useCallback(async (moveList: string[], label?: string) => {
    if (!engineReady || moveList.length === 0) return
    setAnalyzing(true)
    setHasResults(false)
    setCurrentMoveIndex(-1)
    setPlayMode(false)
    abortRef.current = false

    const results: MoveAnalysis[] = []
    const chess = new Chess()
    setGameFen(chess.fen())

    for (let i = 0; i < moveList.length; i++) {
      if (abortRef.current) break
      const evalBefore = engine.evaluatePosition(chess.fen())
      chess.move(moveList[i])
      const evalAfter = engine.evaluatePosition(chess.fen())
      const loss = getCentipawnLoss(evalAfter, evalBefore)
      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        san: moveList[i],
        fen: chess.fen(),
        evaluationBefore: evalBefore,
        evaluationAfter: evalAfter,
        centipawnLoss: loss,
        classification: classifyMove(loss),
      })
    }

    setAnalysis(results)
    setHasResults(true)
    setAnalyzing(false)
    setMoves(moveList)
  }, [engine, engineReady])

  function loadPGN(pgnText: string, gameInfo?: GameInfo) {
    try {
      setError("")
      const chess = new Chess()
      chess.loadPgn(pgnText)
      const moveList = chess.history()
      setGameFen(chess.fen())
      updateEval(chess.fen())
      setSelectedGame(gameInfo || null)
      analyzeMoves(moveList, gameInfo?.label)
    } catch {
      setError("PGN tidak valid. Periksa format PGN.")
    }
  }

  async function fetchChessCom(username: string) {
    setLoading(true); setError(""); setGamesList([]); setHasResults(false)
    setSelectedGame(null)
    setPage(0)
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${username}/games/2026/05`)
      if (!res.ok) throw new Error("Gagal mengambil data. Cek username.")
      const data = await res.json()
      const games: GameInfo[] = (data.games || []).map((g: {
        pgn: string; url: string; white?: string; black?: string; time_class?: string
      }) => {
        const h = { pgn: g.pgn, label: g.url ? g.url.split("/").pop() || "Game" : "Game", url: g.url }
        try {
          const c = new Chess(); c.loadPgn(g.pgn)
          const info = c.header()
          return {
            ...h,
            pgn: g.pgn,
            white: info.White || "?",
            black: info.Black || "?",
            result: info.Result || "*",
            date: info.Date || "",
          }
        } catch { return { ...h, pgn: g.pgn } }
      })
      if (games.length === 0) throw new Error("Tidak ada game untuk bulan ini")
      setGamesList(games)

      if (games[0]) {
        loadPGN(games[0].pgn, games[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal fetch Chess.com")
    } finally { setLoading(false) }
  }

  async function fetchLichess(username: string) {
    setLoading(true); setError(""); setGamesList([]); setHasResults(false)
    setSelectedGame(null)
    setPage(0)
    try {
      const res = await fetch(`https://lichess.org/api/games/user/${username}?max=50`)
      if (!res.ok) throw new Error("Gagal mengambil data. Cek username.")
      const text = await res.text()
      const pgns = text.split("\n\n\n").filter(Boolean)
      const games: GameInfo[] = pgns.map((pgn, i) => {
        try {
          const c = new Chess(); c.loadPgn(pgn)
          const info = c.header()
          return {
            pgn,
            label: `${info.White || "?"} vs ${info.Black || "?"}`,
            white: info.White || "?",
            black: info.Black || "?",
            result: info.Result || "*",
            date: info.Date || "",
          }
        } catch { return { pgn, label: `Game #${i + 1}` } }
      })
      if (games.length === 0) throw new Error("Tidak ada game ditemukan")
      setGamesList(games)

      if (games[0]) loadPGN(games[0].pgn, games[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal fetch Lichess")
    } finally { setLoading(false) }
  }

  function goToMove(index: number) {
    setPlayMode(false)
    setCurrentMoveIndex(index)
    if (index === -1) { const c = new Chess(); setGameFen(c.fen()); setEvaluation(0); setLastMove(null); setCoachComment(""); return }
    const chess = new Chess()
    for (let i = 0; i <= index; i++) chess.move(moves[i])
    setGameFen(chess.fen())
    updateEval(chess.fen())
    const hist = chess.history({ verbose: true })
    const lm = hist[hist.length - 1]
    if (lm) setLastMove({ from: lm.from, to: lm.to })
    if (analysis[index]) setCoachComment(COACH_ADVICE[analysis[index].classification.label] || "")
  }

  function togglePlay() {
    if (playMode) {
      setPlayMode(false)
    } else {
      if (currentMoveIndex >= moves.length - 1) goToMove(-1)
      setPlayMode(true)
    }
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
    squareStyles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.25)", borderRadius: "4px" }
  }

  const boardOrientation: "white" | "black" = "white"
  const boardOptions = {
    id: "analysis-board",
    position: gameFen,
    boardOrientation,
    boardStyle: { borderRadius: "12px", boxShadow: "0 0 30px rgba(0, 210, 255, 0.1)" },
    darkSquareStyle: { backgroundColor: "#1e293b" },
    lightSquareStyle: { backgroundColor: "#334155" },
    showNotation: true,
    allowDragging: false,
    allowDrawingArrows: true,
    squareStyles,
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Game Analysis</h1>
          <p className="text-sm text-white/50">Analisis permainan catur instan</p>
        </div>
        {engineReady && (
          <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400">
            <Zap className="h-3 w-3" /> Siap
          </span>
        )}
      </div>

      {/* Input Section */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {(["chesscom", "lichess", "pgn"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                tab === t ? "bg-cyan-400/10 text-cyan-400" : "text-white/40 hover:text-white/60"
              }`}>
              {t === "chesscom" ? <ExternalLink className="h-3 w-3" /> : t === "lichess" ? <Search className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
              {t === "chesscom" ? "Chess.com" : t === "lichess" ? "Lichess" : "Manual PGN"}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "pgn" ? (
            <div className="space-y-3">
              <textarea value={pgn} onChange={(e) => setPgn(e.target.value)}
                placeholder="Tempel PGN di sini..."
                className="h-28 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-400/50" />
              <button onClick={() => loadPGN(pgn)} disabled={!pgn.trim() || analyzing}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
                {analyzing ? "Menganalisis..." : <><Brain className="h-3.5 w-3.5" /> Analisis</>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder={`Username ${tab === "chesscom" ? "Chess.com" : "Lichess"}...`}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400/50" />
              <button onClick={() => (tab === "chesscom" ? fetchChessCom(username) : fetchLichess(username))}
                disabled={loading || !username.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
                {loading ? "Loading..." : <Search className="h-3.5 w-3.5" />} Fetch
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}
      </div>

      {/* Game List */}
      {gamesList.length > 0 && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {username} — {gamesList.length} game ditemukan
            </h3>
            <div className="flex items-center gap-2">
              {tab !== "pgn" && (
                <button onClick={() => (tab === "chesscom" ? fetchChessCom(username) : fetchLichess(username))}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50">
                  <RotateCcw className="h-3 w-3" /> Refresh
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {gamesList.slice(page * gamesPerPage, (page + 1) * gamesPerPage).map((g, i) => {
              const actualIndex = i + page * gamesPerPage
              const isSelected = selectedGame?.label === g.label && selectedGame?.pgn === g.pgn
              return (
                <div key={actualIndex}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all cursor-pointer ${
                    isSelected ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                  onClick={() => loadPGN(g.pgn, g)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {g.white || "?"} <span className="text-white/30">vs</span> {g.black || "?"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {g.result && g.result !== "*" && (
                        <span className="text-xs text-yellow-400/80">{g.result}</span>
                      )}
                      {g.date && <span className="text-[10px] text-white/30">{g.date}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {isSelected && (
                      <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-400">
                        <Brain className="h-3 w-3" /> Dianalisis
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {gamesList.length > gamesPerPage && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    page === 0 ? "opacity-50 pointer-events-none" : "border border-white/10 text-white/50 hover:border-cyan-400/30 hover:text-cyan-400"
                  }`}
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <span className="text-xs text-white/40">
                  Halaman {page + 1} dari {Math.ceil(gamesList.length / gamesPerPage)}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(Math.ceil(gamesList.length / gamesPerPage) - 1, prev + 1))}
                  disabled={page >= Math.ceil(gamesList.length / gamesPerPage) - 1}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    page >= Math.ceil(gamesList.length / gamesPerPage) - 1 ? "opacity-50 pointer-events-none" : "border border-white/10 text-white/50 hover:border-cyan-400/30 hover:text-cyan-400"
                  }`}
                >
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Re-analysis button */}
              {selectedGame && hasResults && (
                <button onClick={() => loadPGN(selectedGame.pgn, selectedGame)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                  <RotateCcw className="h-3.5 w-3.5" /> Analisis Ulang
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Game Info Banner */}
      {selectedGame && hasResults && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-white">{selectedGame.white || "Putih"}</span>
            <span className="text-white/30">vs</span>
            <span className="font-semibold text-white">{selectedGame.black || "Hitam"}</span>
          </div>
          {selectedGame.result && selectedGame.result !== "*" && (
            <span className="rounded-full bg-yellow-400/10 px-3 py-0.5 text-xs font-medium text-yellow-400">
              {selectedGame.result}
            </span>
          )}
          {selectedGame.date && (
            <span className="text-[11px] text-white/30">{selectedGame.date}</span>
          )}
          <span className="text-xs text-white/30 ml-auto">{moves.length} langkah</span>
        </div>
      )}

      {/* Board & Analysis */}
      {(analyzing || hasResults) && moves.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="relative mx-auto max-w-[560px]">
              <ChessboardProvider options={boardOptions}>
                <Chessboard />
              </ChessboardProvider>

              {/* Loading overlay while analyzing */}
              {analyzing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-cyan-400">Game sedang dianalisis</p>
                      <p className="mt-1 text-xs text-white/40">Menganalisis {moves.length} langkah...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            {hasResults && !analyzing && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button onClick={() => goToMove(-1)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button onClick={() => goToMove(Math.max(-1, currentMoveIndex - 1))}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[140px] text-center text-xs text-white/30">
                  {currentMoveIndex < 0 ? "Posisi awal" : `#${currentMoveIndex + 1} ${moves[currentMoveIndex]}`}
                </span>
                <button onClick={() => goToMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => goToMove(moves.length - 1)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                  <SkipForward className="h-4 w-4" />
                </button>
                <div className="mx-2 h-5 w-px bg-white/10" />
                <button onClick={togglePlay}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    playMode
                      ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105"
                  }`}>
                  {playMode ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Play</>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Evaluation</h3>
              <div className="mt-2 flex justify-center">
                <div className="scale-75 origin-top"><EvaluationBar evaluation={evaluation} mate={mate} /></div>
              </div>
            </div>

            {hasResults && !analyzing && (() => {
              const counts: Record<string, number> = {}
              const weights: Record<string, number> = { Best: 1, Excellent: 0.8, Good: 0.6, Inaccuracy: 0.4, Mistake: 0.2, Blunder: 0 }
              let totalScore = 0
              for (const a of analysis) {
                counts[a.classification.label] = (counts[a.classification.label] || 0) + 1
                totalScore += weights[a.classification.label] || 0
              }
              const accuracy = analysis.length > 0 ? Math.round((totalScore / analysis.length) * 100) : 0
              const perfElo = Math.round(accuracy * 20 + 500)
              return (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Review Summary</h3>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "Best", count: counts.Best || 0, color: "text-green-400 bg-green-400/10 border-green-400/30" },
                        { label: "Excellent", count: counts.Excellent || 0, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
                        { label: "Good", count: counts.Good || 0, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
                        { label: "Inaccuracy", count: counts.Inaccuracy || 0, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
                        { label: "Mistake", count: counts.Mistake || 0, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
                        { label: "Blunder", count: counts.Blunder || 0, color: "text-red-400 bg-red-400/10 border-red-400/30" },
                      ].map((c) => (
                        <div key={c.label} className={`rounded-lg border px-2 py-1.5 text-center ${c.color}`}>
                          <p className="text-xs font-bold">{c.count}</p>
                          <p className="text-[9px] leading-tight">{c.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Performa</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{accuracy}%</p>
                        <p className="text-[10px] text-white/40">Akurasi</p>
                      </div>
                      <div className="h-10 w-px bg-white/10" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{perfElo}</p>
                        <p className="text-[10px] text-white/40">Estimasi Performa Elo</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Evaluation Graph</h3>
                    <div className="relative h-20">
                      {(() => {
                        const vals = analysis.map(a => a.evaluationAfter)
                        const min = Math.min(...vals, -0.5)
                        const max = Math.max(...vals, 0.5)
                        const range = Math.max(max - min, 1)
                        return (
                          <svg viewBox={`0 0 ${analysis.length * 20} 80`} className="h-full w-full" preserveAspectRatio="none">
                            <line x1="0" y1="40" x2={analysis.length * 20} y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            {vals.map((v, i) => {
                              const x = i * 20 + 10
                              const y = 40 - ((v - (min + range / 2)) / (range / 2)) * 35
                              const color = v >= 0 ? "#22d3ee" : "#f87171"
                              const prev = i > 0 ? vals[i - 1] : v
                              const px = (i - 1) * 20 + 10
                              const py = 40 - ((prev - (min + range / 2)) / (range / 2)) * 35
                              return (
                                <g key={i}>
                                  {i > 0 && <line x1={px} y1={py} x2={x} y2={y} stroke={color} strokeWidth="2" />}
                                  <circle cx={x} cy={y} r="3" fill={color}
                                    className="cursor-pointer hover:r-4"
                                    onClick={() => goToMove(i)} />
                                </g>
                              )
                            })}
                          </svg>
                        )
                      })()}
                    </div>
                  </div>
                </>
              )
            })()}

            {coachComment && (
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                    <Brain className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-cyan-400">Virtual Coach</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{coachComment}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                Moves <span className="text-white/30 font-normal">({analysis.length})</span>
              </h3>
              <div className="space-y-0.5">
                {analysis.map((a, i) => (
                  <div key={i} onClick={() => goToMove(i)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      currentMoveIndex === i ? "bg-cyan-400/10" : "hover:bg-white/[0.02]"
                    }`}>
                    <span className="w-5 text-white/30 text-[10px]">{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ""}</span>
                    <span className="flex-1 text-white/80">{a.san}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${a.classification.color}`}>{a.classification.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
