"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Chess, type Square } from "chess.js"
import Chessground from "@react-chess/chessground"
import { motion, AnimatePresence } from "framer-motion"
import { useChessContext, TIME_PRESETS } from "@/contexts/ChessContext"
import { usePlayController } from "@/hooks/usePlayController"
import { BOT_PERSONALITIES } from "@/engine/bot-personalities"
import {
  BookOpen, Target, RotateCcw, ChevronRight, Check, X, Brain, Star,
  BarChart3, Zap, ChevronLeft, SkipBack, SkipForward, Play, Pause, Loader2
} from "lucide-react"
import type { Key } from "chessground/types"
import EvaluationBar from "@/components/chess/EvaluationBar"

type Opening = {
  id: string
  name: string
  eco: string
  fen: string
  moves: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  description: string
}

const OPENINGS: Opening[] = [
  { id: "italian", name: "Italian Game", eco: "C50", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], difficulty: "beginner", description: "Classical opening focusing on central control and quick development." },
  { id: "sicilian", name: "Sicilian Defense", eco: "B50", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "c5"], difficulty: "intermediate", description: "Aggressive response to e4, leading to asymmetrical positions." },
  { id: "ruy-lopez", name: "Ruy Lopez", eco: "C60", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], difficulty: "intermediate", description: "One of the oldest and most respected openings." },
  { id: "french", name: "French Defense", eco: "C00", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "e6"], difficulty: "beginner", description: "Solid defense leading to closed positions." },
  { id: "caro-kann", name: "Caro-Kann Defense", eco: "B10", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "c6"], difficulty: "beginner", description: "Solid defense with strong pawn structure." },
  { id: "kings-gambit", name: "King's Gambit", eco: "C30", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "e5", "f4"], difficulty: "advanced", description: "Aggressive gambit sacrificing a pawn for rapid development." },
  { id: "queens-gambit", name: "Queen's Gambit", eco: "D30", fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", moves: ["d4", "d5", "c4"], difficulty: "intermediate", description: "Popular queen pawn opening with rich strategic themes." },
  { id: "english", name: "English Opening", eco: "A10", fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1", moves: ["c4"], difficulty: "intermediate", description: "Flexible opening focusing on flank control." },
  { id: "pirc", name: "Pirc Defense", eco: "B07", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"], difficulty: "advanced", description: "Hypermodern defense allowing White to occupy the center." },
]

type DrillResult = {
  openingId: string
  correct: number
  total: number
  completedAt: string
}

export default function OpeningsPage() {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [fen, setFen] = useState("")
  const [openingMoves, setOpeningMoves] = useState<string[]>([])
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0)
  const [drillActive, setDrillActive] = useState(false)
  const [playerPrompt, setPlayerPrompt] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"correct" | "wrong" | "info" | null>(null)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [selectedSq, setSelectedSq] = useState<string | null>(null)
  const [legalSqs, setLegalSqs] = useState<string[]>([])
  const [selectedSqDests, setSelectedSqDests] = useState<Map<Key, Key[]>>(new Map())
  const [showHints, setShowHints] = useState(false)
  const [results, setResults] = useState<DrillResult[]>([])
  const [drillComplete, setDrillComplete] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("arena-opening-results")
    if (stored) {
      try { setResults(JSON.parse(stored)) } catch { /* */ }
    }
  }, [])

  const selectOpening = useCallback((op: Opening) => {
    setSelectedOpening(op)
    setDrillActive(true)
    setDrillComplete(false)
    setPlayerPrompt(true)
    setCurrentMoveIdx(0)
    setScore(0)
    setTotalAttempts(0)
    setMessage("")
    setMessageType(null)
    setLastMove(null)
    setSelectedSq(null)
    setLegalSqs([])
    setSelectedSqDests(new Map())

    const chess = new Chess(op.fen)
    setFen(chess.fen())
    setOpeningMoves(op.moves.filter((_, i) => i % 2 === 1))
  }, [])

  const fenTurn = fen.split(" ")[1]
  const turnColor: "white" | "black" = fenTurn === "w" ? "white" : "black"

  const handleMove = useCallback((orig: Key, dest: Key) => {
    if (!selectedOpening || !drillActive || drillComplete) return
    const g = new Chess(fen)
    try {
      const move = g.move({ from: orig as Square, to: dest as Square, promotion: "q" })
      if (!move) return
      setSelectedSq(null)
      setLegalSqs([])
      setSelectedSqDests(new Map())

      const expected = openingMoves[currentMoveIdx]
      if (move.san === expected) {
        setLastMove({ from: orig, to: dest })
        setFen(g.fen())
        setTotalAttempts((t) => t + 1)
        setScore((s) => s + 1)
        setMessage("Langkah benar!")
        setMessageType("correct")

        const nextIdx = currentMoveIdx + 1
        if (nextIdx >= openingMoves.length) {
          setDrillComplete(true)
          setPlayerPrompt(false)
          const result: DrillResult = {
            openingId: selectedOpening.id,
            correct: score + 1,
            total: totalAttempts + 1,
            completedAt: new Date().toISOString(),
          }
          setResults((prev) => {
            const updated = [...prev, result]
            localStorage.setItem("arena-opening-results", JSON.stringify(updated))
            return updated
          })
          setMessage("Drill selesai! Kamu menguasai pembukaan ini!")
          return
        }

        setCurrentMoveIdx(nextIdx)
        setPlayerPrompt(true)
      } else {
        setTotalAttempts((t) => t + 1)
        setMessage(`Langkah yang benar: ${expected}`)
        setMessageType("wrong")
        setTimeout(() => {
          const nextIdx = currentMoveIdx + 1
          if (nextIdx >= openingMoves.length) {
            setDrillComplete(true)
            setPlayerPrompt(false)
            const result: DrillResult = {
              openingId: selectedOpening.id,
              correct: score,
              total: totalAttempts + 1,
              completedAt: new Date().toISOString(),
            }
            setResults((prev) => {
              const updated = [...prev, result]
              localStorage.setItem("arena-opening-results", JSON.stringify(updated))
              return updated
            })
            setMessage("Drill selesai!")
            return
          }
          setCurrentMoveIdx(nextIdx)
          setPlayerPrompt(true)

          const g2 = new Chess(selectedOpening.fen)
          for (let i = 0; i < nextIdx; i++) {
            g2.move(openingMoves[i])
            const whiteIdx = i * 2 + 2
            if (whiteIdx < selectedOpening.moves.length) {
              g2.move(selectedOpening.moves[whiteIdx])
            }
          }
          setFen(g2.fen())
          const hist = g2.history({ verbose: true })
          const lm = hist[hist.length - 1]
          if (lm) setLastMove({ from: lm.from, to: lm.to })
        }, 1500)
      }
    } catch { /* */ }
  }, [fen, openingMoves, currentMoveIdx, selectedOpening, drillActive, drillComplete, score, totalAttempts])

  function onCgSelect(key: Key) {
    if (!drillActive || drillComplete || !playerPrompt) return
    const g = new Chess(fen)
    const piece = g.get(key as Square)
    if (selectedSq) {
      setSelectedSq(null)
      setLegalSqs([])
      setSelectedSqDests(new Map())
      if (piece && piece.color === turnColor.charAt(0) as any) {
        setSelectedSq(key)
        setLegalSqs(g.moves({ square: key as Square, verbose: true }).map((m) => m.to))
        const d = new Map<Key, Key[]>()
        d.set(key as Key, g.moves({ square: key as Square, verbose: true }).map((m) => m.to) as Key[])
        setSelectedSqDests(d)
      }
      return
    }
    if (piece && piece.color === turnColor.charAt(0) as any) {
      setSelectedSq(key)
      setLegalSqs(g.moves({ square: key as Square, verbose: true }).map((m) => m.to))
      const d = new Map<Key, Key[]>()
      d.set(key as Key, g.moves({ square: key as Square, verbose: true }).map((m) => m.to) as Key[])
      setSelectedSqDests(d)
    }
  }

  const dests = useMemo(() => {
    if (!selectedSq || !playerPrompt || drillComplete) return undefined
    return selectedSqDests
  }, [selectedSq, playerPrompt, drillComplete, selectedSqDests])

  const boardConfig = {
    fen,
    orientation: turnColor as "white" | "black",
    turnColor,
    coordinates: true,
    highlight: { lastMove: true, check: true },
    lastMove: lastMove ? [lastMove.from as Key, lastMove.to as Key] : undefined,
    selected: selectedSq as Key | undefined,
    movable: {
      color: playerPrompt && !drillComplete ? (turnColor as any) : undefined,
      dests,
      showDests: true,
      events: { after: handleMove },
    },
    events: { select: onCgSelect },
    animation: { enabled: true, duration: 200 },
  }

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0

  if (!drillActive) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Opening Drills</h1>
          <p className="text-sm text-white/50">Latih penguasaan pembukaan catur</p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OPENINGS.map((op) => {
            const res = results.filter((r) => r.openingId === op.id)
            const bestAccuracy = res.length > 0
              ? Math.round((res.reduce((sum, r) => sum + r.correct, 0) / res.reduce((sum, r) => sum + r.total, 0)) * 100)
              : 0
            return (
              <motion.button
                key={op.id}
                onClick={() => selectOpening(op)}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{op.name}</h3>
                    <span className="text-[10px] text-white/30">{op.eco}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                    op.difficulty === "beginner" ? "bg-green-400/10 text-green-400" :
                    op.difficulty === "intermediate" ? "bg-yellow-400/10 text-yellow-400" :
                    "bg-red-400/10 text-red-400"
                  }`}>{op.difficulty}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{op.description}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  <span className="text-white/30">{op.moves.length} langkah</span>
                  {bestAccuracy > 0 && (
                    <>
                      <span className="text-white/20">|</span>
                      <span className="text-cyan-400">{bestAccuracy}%</span>
                    </>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" /> Drill History
            </h3>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {results.slice().reverse().map((r, i) => {
                const op = OPENINGS.find((o) => o.id === r.openingId)
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                    <span className="text-white/60">{op?.name || r.openingId}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{r.correct}/{r.total}</span>
                      <span className={`font-medium ${r.correct === r.total ? "text-green-400" : "text-yellow-400"}`}>
                        {r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { setDrillActive(false); setSelectedOpening(null) }}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-red-400/30 hover:text-red-400">
            <RotateCcw className="h-3.5 w-3.5" /> Back
          </button>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="text-sm font-semibold text-white">{selectedOpening?.name}</h2>
          <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] text-cyan-400">{selectedOpening?.eco}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">Score: <span className="text-cyan-400 font-semibold">{score}</span> / {totalAttempts}</span>
          <span className="text-xs text-white/30">Accuracy: <span className="text-yellow-400 font-semibold">{accuracy}%</span></span>
          {drillComplete && (
            <button onClick={() => { setDrillActive(false); setSelectedOpening(null) }}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
              <BookOpen className="h-3 w-3" /> More Openings
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mx-auto max-w-[560px]">
            <div className="board-custom-wrap rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
              <Chessground config={boardConfig} contained />
            </div>
          </div>

          {message && (
            <div className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              messageType === "correct" ? "border-green-400/20 bg-green-400/5 text-green-400" :
              messageType === "wrong" ? "border-red-400/20 bg-red-400/5 text-red-400" :
              "border-cyan-400/20 bg-cyan-400/5 text-cyan-400"
            }`}>
              {messageType === "correct" ? <Check className="h-4 w-4" /> :
               messageType === "wrong" ? <X className="h-4 w-4" /> :
               <Brain className="h-4 w-4" />}
              {message}
            </div>
          )}

          {drillComplete && (
            <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/[0.03] p-6 text-center">
              <Check className="mx-auto h-10 w-10 text-green-400" />
              <h3 className="mt-3 text-lg font-bold text-white">Drill Complete!</h3>
              <p className="text-sm text-white/50 mt-1">
                Kamu menyelesaikan drill {selectedOpening?.name} dengan akurasi {accuracy}%
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-yellow-400/30 hover:text-yellow-400">
              <Star className="h-3.5 w-3.5" /> {showHints ? "Hide Hints" : "Hints"}
            </button>
          </div>

          {showHints && selectedOpening && (
            <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.03] p-4">
              <p className="text-xs text-yellow-400/80">
                Langkah selanjutnya: <span className="font-bold text-white">
                  {currentMoveIdx < openingMoves.length ? openingMoves[currentMoveIdx] : "Selesai!"}
                </span>
              </p>
              {currentMoveIdx < openingMoves.length && (
                <p className="mt-1 text-[10px] text-white/30">
                  Giliran {turnColor === "white" ? "Putih" : "Hitam"} melangkah
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Drill Info</h3>
            {selectedOpening && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Opening</span>
                  <span className="text-white/80 font-medium">{selectedOpening.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">ECO</span>
                  <span className="text-cyan-400">{selectedOpening.eco}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Progress</span>
                  <span className="text-cyan-400">{currentMoveIdx}/{openingMoves.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Difficulty</span>
                  <span className={`font-medium ${
                    selectedOpening.difficulty === "beginner" ? "text-green-400" :
                    selectedOpening.difficulty === "intermediate" ? "text-yellow-400" :
                    "text-red-400"
                  }`}>{selectedOpening.difficulty}</span>
                </div>
              </div>
            )}
          </div>

          {!drillComplete && playerPrompt && (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-medium text-cyan-400">Your Turn</p>
                  <p className="mt-0.5 text-xs text-white/60">
                    Giliranmu! Mainkan langkah pembukaan yang benar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
