"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Chess, type Square } from "chess.js"
import Chessground from "@react-chess/chessground"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, RefreshCw, Award, Brain, Loader2, Star, ChevronRight, Zap, BarChart3, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Key } from "chessground/types"

type Puzzle = {
  fen: string
  moves: string[]
  rating: number
  themes: string[]
}

const difficultyMap = [
  { label: "Easy", min: 0, max: 1200 },
  { label: "Medium", min: 1201, max: 1600 },
  { label: "Hard", min: 1601, max: 3000 },
]

const FALLBACK_PUZZLES: Puzzle[] = [
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", moves: ["Nxe5", "Nxe5", "d4"], rating: 1200, themes: ["fork"] },
  { fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3", moves: ["Bxf7+", "Kxf7", "Ng5+"], rating: 1400, themes: ["sacrifice", "check"] },
  { fen: "1k1r4/ppp2ppp/8/3q4/8/2N5/PPP2PPP/R3K3 w Q - 0 1", moves: ["Rd1"], rating: 1500, themes: ["pin"] },
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 5 5", moves: ["Bxf7+", "Rxf7", "Ng5"], rating: 1600, themes: ["sacrifice", "attack"] },
  { fen: "r1bqkb1r/pppp1ppp/2n5/4N3/2B1n3/8/PPPP1PPP/RNBQK2R w KQkq - 0 6", moves: ["Bxf7+", "Kxf7", "Nxg6+"], rating: 1300, themes: ["fork", "sacrifice"] },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 5 5", moves: ["Bxf2+", "Kxf2", "Nxe4+"], rating: 1700, themes: ["counterattack", "sacrifice"] },
  { fen: "r4rk1/ppp2ppp/2np4/2b1p3/2B1P1q1/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 9", moves: ["h3", "Qh5", "g4"], rating: 1800, themes: ["trap", "queen"] },
  { fen: "5rk1/pp3ppp/4p3/2n5/2BP4/2P5/P4PPP/R5K1 w - - 0 1", moves: ["Bxf7+"], rating: 1100, themes: ["skewer"] },
  { fen: "r1b2rk1/pppp1ppp/2n2q2/2b5/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", moves: ["e5", "Qe6", "exf6"], rating: 1500, themes: ["discovered-attack", "queen"] },
  { fen: "r2r2k1/ppp2ppp/2n5/3q4/2B5/2P3P1/PP3PBP/R4RK1 w - - 0 1", moves: ["Bxf7+", "Rxf7", "Rxd5"], rating: 1400, themes: ["sacrifice", "fork"] },
  { fen: "3r2k1/p4ppp/2p5/8/1r6/5N2/P4PPP/3R2K1 w - - 0 1", moves: ["Rd8+"], rating: 1600, themes: ["back-rank", "checkmate"] },
  { fen: "r1bq1r1k/pppp1Npp/2n5/2b1p3/2B1P3/8/PPPP1PPP/RNBQ1RK1 w - - 0 1", moves: ["Nxh7", "Kxh7", "Qh5+"], rating: 1700, themes: ["sacrifice", "attack", "check"] },
  { fen: "2kr3r/pppqbppp/2np4/4N3/2B1P3/4B3/PPPP1PPP/R4RK1 w - - 0 1", moves: ["Nxf7"], rating: 1900, themes: ["fork", "sacrifice"] },
  { fen: "r1b1r1k1/pppp1ppp/2n2q2/2b5/2B4n/2NP1N2/PPP2PPP/R1BQ1RK1 b - - 0 1", moves: ["Nxg2", "Kxg2", "Qh4"], rating: 1500, themes: ["attack", "trap"] },
  { fen: "r3k2r/pppq1ppp/2np4/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w kq - 0 1", moves: ["Bxf7+", "Kxf7", "Ng5+"], rating: 1600, themes: ["sacrifice", "fork"] },
  { fen: "r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P1n1/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", moves: ["Nxg4"], rating: 1200, themes: ["capture"] },
  { fen: "2r3k1/ppp2ppp/8/6q1/3n4/2P5/PP3PPP/3QR1K1 w - - 0 1", moves: ["Rd8+", "Rxd8", "Qxd8+"], rating: 1800, themes: ["back-rank", "checkmate"] },
  { fen: "5r1k/pp4pp/2p5/2b1p1N1/4Pq2/2P5/PP3QPP/R5K1 w - - 0 1", moves: ["Qxf4"], rating: 1100, themes: ["exchange"] },
  { fen: "r1b1k2r/pppp1ppp/2n2n2/2b1q3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b kq - 0 1", moves: ["Qxe4"], rating: 1400, themes: ["trap"] },
  { fen: "rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1", moves: ["dxe5"], rating: 1000, themes: ["center", "development"] },
  { fen: "3r2k1/p6p/2p5/2b5/8/1P2P3/PB3PPP/3R2K1 b - - 0 1", moves: ["Bxf2+"], rating: 1300, themes: ["skewer", "counterattack"] },
  { fen: "r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", moves: ["Nd5"], rating: 1600, themes: ["center", "development"] },
  { fen: "8/8/2k5/5K2/8/8/8/8 w - - 0 1", moves: ["Ke5"], rating: 900, themes: ["endgame", "center"] },
  { fen: "k7/1K6/8/8/8/8/8/8 b - - 0 1", moves: ["Kb8"], rating: 800, themes: ["endgame"] },
  { fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", moves: ["Nxe5", "Nxe5", "Qh5+"], rating: 1300, themes: ["fork", "check"] },
  { fen: "r1bqkb1r/ppp2ppp/2np4/4p3/2B1P2n/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", moves: ["Nxh4"], rating: 1100, themes: ["capture"] },
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1P3/2B5/2NP1N2/PPP2PPP/R1BQ1RK1 b - - 0 1", moves: ["Nxe5"], rating: 1500, themes: ["counterattack"] },
  { fen: "r2qk2r/ppp2ppp/2n5/2bpp1N1/2B1P1n1/3P4/PPP2PPP/R1BQK2R w KQkq - 0 1", moves: ["Qxg4"], rating: 1200, themes: ["capture", "defense"] },
  { fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQ - 0 1", moves: ["d5"], rating: 1400, themes: ["center", "attack"] },
  { fen: "r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P1n1/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", moves: ["hxg4"], rating: 1000, themes: ["capture"] },
]

const THEME_BADGES: Record<string, string> = {
  fork: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  sacrifice: "bg-red-400/10 text-red-400 border-red-400/20",
  check: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  pin: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  attack: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  counterattack: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  trap: "bg-pink-400/10 text-pink-400 border-pink-400/20",
  queen: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  center: "bg-green-400/10 text-green-400 border-green-400/20",
  development: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
  skewer: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  "discovered-attack": "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "back-rank": "bg-rose-400/10 text-rose-400 border-rose-400/20",
  checkmate: "bg-red-400/10 text-red-400 border-red-400/20",
  capture: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  exchange: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  endgame: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  defense: "bg-blue-400/10 text-blue-400 border-blue-400/20",
}

export default function LearnPage() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(FALLBACK_PUZZLES)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [fen, setFen] = useState("")
  const [moveIdx, setMoveIdx] = useState(0)
  const [solved, setSolved] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"correct" | "wrong" | "info" | null>(null)
  const [selectedSq, setSelectedSq] = useState<string | null>(null)
  const [legalSqs, setLegalSqs] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [puzzleHistory, setPuzzleHistory] = useState<{ result: boolean; rating: number }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("arena-puzzle-stats")
    if (stored) {
      try {
        const s = JSON.parse(stored)
        if (s.total) setTotal(s.total)
        if (s.solved) setScore(s.solved)
        if (s.bestStreak) setBestStreak(s.bestStreak)
        if (s.history) setPuzzleHistory(s.history)
      } catch { /* */ }
    }
  }, [])

  const filtered = useMemo(() => puzzles.filter((p) => {
    const r = difficultyMap.find((d) => d.label === difficulty)
    return r ? p.rating >= r.min && p.rating <= r.max : true
  }), [puzzles, difficulty])

  const safeIdx = currentIdx < filtered.length ? currentIdx : 0

  useEffect(() => {
    async function fetchPuzzles() {
      setLoading(true)
      try {
        const res = await fetch("https://lichess.org/api/puzzle?opening=true")
        if (!res.ok) throw new Error("API failed")
        const data = await res.json()
        if (data?.puzzle) {
          const p = data.puzzle
          const newPuzzle: Puzzle = { fen: p.fen, moves: p.moves.split(" "), rating: p.rating, themes: p.themes || [] }
          setPuzzles((prev) => {
            const exists = prev.some((x) => x.fen === newPuzzle.fen)
            return exists ? prev : [newPuzzle, ...prev]
          })
        }
      } catch {
        // Use fallback puzzles
      } finally { setLoading(false) }
    }
    fetchPuzzles()
  }, [])

  const savePuzzleStats = useCallback((newScore: number, newTotal: number, newBestStreak: number, history: { result: boolean; rating: number }[]) => {
    localStorage.setItem("arena-puzzle-stats", JSON.stringify({ solved: newScore, total: newTotal, bestStreak: newBestStreak, history }))
  }, [])

  const loadPuzzle = useCallback((index: number) => {
    const arr = filtered.length > 0 ? filtered : puzzles
    const p = arr[index % arr.length]
    if (!p) return
    const chess = new Chess(p.fen)
    setFen(chess.fen())
    setMoveIdx(0)
    setSolved(null)
    setShowHint(false)
    setShowSolution(false)
    setMessage("")
    setMessageType(null)
    setSelectedSq(null)
    setLegalSqs([])
    setLastMove(null)
    setShowOverlay(false)
  }, [filtered, puzzles])

  useEffect(() => {
    if (filtered.length > 0) loadPuzzle(0)
  }, [filtered.length, difficulty])

  function handleMove(orig: Key, dest: Key) {
    if (solved !== null) return
    const p = filtered[safeIdx]
    if (!p) return

    const g = new Chess(fen)
    try {
      const move = g.move({ from: orig as Square, to: dest as Square, promotion: "q" })
      if (!move) return
      setSelectedSq(null)
      setLegalSqs([])
      const expected = p.moves[moveIdx]
      if (move.san === expected) {
        setLastMove({ from: orig, to: dest })
        setFen(g.fen())
        if (moveIdx >= p.moves.length - 1) {
          setSolved(true)
          const newScore = score + 1
          const newTotal = total + 1
          const newStreak = streak + 1
          const newBest = Math.max(bestStreak, newStreak)
          setScore(newScore)
          setTotal(newTotal)
          setStreak(newStreak)
          setBestStreak(newBest)
          const newHist = [...puzzleHistory, { result: true, rating: p.rating }]
          setPuzzleHistory(newHist)
          savePuzzleStats(newScore, newTotal, newBest, newHist)
          setMessage("Benar! Puzzle selesai!")
          setMessageType("correct")
          return
        }
        setMoveIdx((i) => i + 1)
        setMessage("Benar! Lanjutkan...")
        setMessageType("correct")

        const nextMove = p.moves[moveIdx + 1]
        if (nextMove) {
          setTimeout(() => {
            const g2 = new Chess(g.fen())
            try {
              g2.move(nextMove)
              const from = nextMove.substring(0, 2)
              const to = nextMove.substring(2, 4)
              if (from.length === 2 && to.length === 2) setLastMove({ from, to })
              setFen(g2.fen())
              setMoveIdx((i) => i + 1)
            } catch { /* */ }
          }, 500)
        }
      } else {
        setMessage(`Langkah salah. Coba lagi!`)
        setMessageType("wrong")
        setShowOverlay(true)
        setTimeout(() => setShowOverlay(false), 1500)
      }
    } catch { /* */ }
  }

  function onCgSelect(key: Key) {
    if (solved !== null) return
    const p = filtered[safeIdx]
    if (!p) return
    const g = new Chess(fen)
    const piece = g.get(key as Square)

    if (selectedSq) {
      setSelectedSq(null)
      setLegalSqs([])
      if (piece && piece.color === "w") {
        setSelectedSq(key)
        setLegalSqs(g.moves({ square: key as Square, verbose: true }).map((m) => m.to))
      }
      return
    }

    if (piece && piece.color === "w") {
      setSelectedSq(key)
      setLegalSqs(g.moves({ square: key as Square, verbose: true }).map((m) => m.to))
    }
  }

  function nextPuzzle() {
    if (solved !== true) {
      const newStreakVal = 0
      setStreak(newStreakVal)
    }
    const n = (safeIdx + 1) % filtered.length
    setCurrentIdx(n)
    loadPuzzle(n)
  }

  function handleSkip() {
    const newTotal = total + 1
    const newHist = [...puzzleHistory, { result: false, rating: filtered[safeIdx]?.rating || 0 }]
    setTotal(newTotal)
    setStreak(0)
    setPuzzleHistory(newHist)
    savePuzzleStats(score, newTotal, bestStreak, newHist)
    setMessage("Puzzle di-skip")
    setMessageType("info")
    setTimeout(nextPuzzle, 500)
  }

  function handleReveal() {
    setShowSolution(!showSolution)
  }

  const currentPuzzle = filtered[safeIdx]

  const dests = useMemo(() => {
    if (!selectedSq || solved !== null) return undefined
    const d = new Map<Key, Key[]>()
    d.set(selectedSq as Key, legalSqs as Key[])
    return d
  }, [selectedSq, legalSqs, solved])

  const fenTurn = fen.split(" ")[1]
  const turnColor: "white" | "black" = fenTurn === "w" ? "white" : "black"

  const boardConfig = {
    fen,
    orientation: "white" as const,
    turnColor,
    coordinates: true,
    highlight: { lastMove: true, check: true },
    lastMove: lastMove ? [lastMove.from as Key, lastMove.to as Key] : undefined,
    selected: selectedSq as Key | undefined,
    movable: {
      free: false,
      color: solved === null ? "white" as const : undefined,
      dests,
      showDests: true,
      events: { after: handleMove },
    },
    events: { select: onCgSelect },
    animation: { enabled: true, duration: 200 },
  }

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Puzzle Academy</h1>
          <p className="text-sm text-white/50">Asah taktik dan pola catur dengan puzzle interaktif</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-white/30">Score</p>
              <p className="text-lg font-bold text-cyan-400">{score}/{total}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-white/30">Streak</p>
              <p className={`text-lg font-bold ${streak >= 3 ? "text-yellow-400" : "text-white/60"}`}>{streak}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-white/30">Best</p>
              <p className="text-lg font-bold text-white/60">{bestStreak}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-white/30">Accuracy</p>
              <p className="text-lg font-bold text-purple-400">{accuracy}%</p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 p-1">
            {difficultyMap.map((d) => (
              <button key={d.label} onClick={() => { setDifficulty(d.label as typeof difficulty); setCurrentIdx(0) }}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${difficulty === d.label ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-white/40 hover:text-white/60"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative mx-auto max-w-[560px]">
            <div className="board-custom-wrap rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
              <Chessground config={boardConfig} contained />
            </div>

            <AnimatePresence>
              {showOverlay && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-red-950/60 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-2">
                    <X className="h-12 w-12 text-red-400" />
                    <p className="text-lg font-bold text-red-400">Try Again!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {solved === true && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-green-950/40 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-2">
                    <Check className="h-12 w-12 text-green-400" />
                    <p className="text-lg font-bold text-green-400">Puzzle Solved!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-950/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {message && !showOverlay && solved !== true && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${messageType === "correct" ? "border-green-400/20 bg-green-400/5 text-green-400" : messageType === "wrong" ? "border-red-400/20 bg-red-400/5 text-red-400" : "border-cyan-400/20 bg-cyan-400/5 text-cyan-400"}`}>
                {messageType === "correct" ? <Check className="h-4 w-4" /> : messageType === "wrong" ? <X className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {showSolution && currentPuzzle && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-purple-400/20 bg-purple-400/[0.03] p-4">
              <p className="text-xs text-purple-400/80">
                Solution: <span className="font-bold text-white">{currentPuzzle.moves.join(", ")}</span>
              </p>
            </motion.div>
          )}

          <div className="mt-4 flex justify-center gap-3">
            <button onClick={loadPuzzle.bind(null, safeIdx)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
            <button onClick={handleSkip}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-orange-400/30 hover:text-orange-400">
              <ChevronRight className="h-3.5 w-3.5" /> Skip
            </button>
            <button onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-yellow-400/30 hover:text-yellow-400">
              <Brain className="h-3.5 w-3.5" /> {showHint ? "Hide Hint" : "Hint"}
            </button>
            <button onClick={handleReveal}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-purple-400/30 hover:text-purple-400">
              <Zap className="h-3.5 w-3.5" /> Solution
            </button>
            {solved === true && (
              <motion.button initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={nextPuzzle}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                <Award className="h-3.5 w-3.5" /> Next Puzzle
              </motion.button>
            )}
          </div>

          {showHint && currentPuzzle && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.03] p-4">
              <p className="text-xs text-yellow-400/80">
                Petunjuk: Coba langkah <span className="font-bold text-white">{currentPuzzle.moves[0]}</span>
                {currentPuzzle.themes.length > 0 && <> &mdash; Tema: {currentPuzzle.themes.join(", ")}</>}
              </p>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Puzzle Info</h3>
            {currentPuzzle ? (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Rating</span>
                  <span className="flex items-center gap-1 font-semibold text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> {currentPuzzle.rating}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Moves</span>
                  <span className="text-white/80">{currentPuzzle.moves.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Progress</span>
                  <span className="text-cyan-400">{moveIdx}/{currentPuzzle.moves.length}</span>
                </div>
                {currentPuzzle.themes.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {currentPuzzle.themes.map((theme) => (
                        <span key={theme} className={`rounded border px-2 py-0.5 text-[10px] font-medium ${THEME_BADGES[theme] || "bg-white/5 text-white/40 border-white/10"}`}>{theme}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : <p className="mt-3 text-xs text-white/30">No puzzles for this difficulty</p>}
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400" /> Tips
            </h3>
            {currentPuzzle ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">Giliran:</span>
                  <span className="font-medium text-white/80">{new Chess(currentPuzzle.fen).turn() === "w" ? "Putih melangkah" : "Hitam melangkah"}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Cari langkah terbaik untuk mendapatkan keuntungan materi atau posisi.
                  {currentPuzzle.themes.length > 0 && <> Fokus pada tema: <span className="text-cyan-400">{currentPuzzle.themes.join(", ")}</span></>}
                </p>
              </div>
            ) : <p className="mt-3 text-xs text-white/30">No puzzles</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3 w-3" /> History
            </h3>
            <div className="space-y-1 max-h-[160px] overflow-y-auto">
              {puzzleHistory.length === 0 ? (
                <p className="text-xs text-white/30">Belum ada riwayat puzzle.</p>
              ) : (
                puzzleHistory.slice(-10).reverse().map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs">
                    <span className="text-white/40">#{puzzleHistory.length - i}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{h.rating}</span>
                      {h.result ? <ThumbsUp className="h-3 w-3 text-green-400" /> : <ThumbsDown className="h-3 w-3 text-red-400" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Puzzle List</h3>
            <div className="mt-2 space-y-1 max-h-[240px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-white/30">Tidak ada puzzle</p>
              ) : (
                filtered.map((p, i) => (
                  <button key={`${p.fen}-${i}`} onClick={() => { setCurrentIdx(i); loadPuzzle(i) }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${safeIdx === i ? "bg-cyan-400/10 text-cyan-400" : "text-white/40 hover:bg-white/[0.02]"}`}>
                    <span>Puzzle #{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{p.rating}</span>
                      {safeIdx === i && <ChevronRight className="h-3 w-3" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
