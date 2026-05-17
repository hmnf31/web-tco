"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import Chessground from "@react-chess/chessground"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, RotateCcw, ThumbsUp, ThumbsDown, BarChart3, Brain, Loader2, ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react"
import type { Key } from "chessground/types"

type TuringGame = {
  id: string
  moves: string[]
  isHuman: boolean
  rating: number
}

type Guess = {
  moveIndex: number
  guessed: "human" | "engine"
  correct: boolean
}

const SAMPLE_GAMES: TuringGame[] = [
  { id: "1", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7", "Nbd2", "Bb7", "Bc2", "Re8", "Nf1", "Bf8", "Ng3", "g6", "b3", "Bg7", "d5", "c6", "c4", "bxc4", "bxc4", "Qc7"], isHuman: true, rating: 1800 },
  { id: "2", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "dxe5", "dxe5", "Qxd8", "Rxd8", "Bg5", "Re8", "Nd5", "Nxd5", "cxd5", "f6", "Be3", "Bd7", "O-O", "Bc6", "Rfd1", "Kf7", "Rd2", "a5", "Rad1", "h5", "g3", "h4", "Kg2", "hxg3", "hxg3", "Rh8", "Kf1", "Bf8", "Bc1", "Nd7", "Bd3", "Nc5", "Bc2", "Bd7", "Bb3", "Rh5", "Kg2", "Be6", "Ba4", "Rdh8", "Bc2", "Bf5", "Bxf5", "Rxf5", "e4", "Rf8", "Bd2", "b5", "b3", "b4", "Ne1", "Nd3", "Nxd3", "cxd3", "f4", "exf4", "gxf4", "Bh6", "f5", "Rc8", "e5", "Bf8", "e6", "fxe6", "fxe6", "Rc2+", "Kf3", "Rf8+", "Ke4", "Rxb2", "Bf4", "Rb4+", "Ke5", "Bc5", "Be3", "Rb2", "Bd4+", "Bxd4+", "Kxd4", "Rb3", "Kc4", "Rxa3", "Kb5", "Ra2", "e7", "Re8", "Kxb4", "Rxe7"], isHuman: false, rating: 2200 },
  { id: "3", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e6", "f3", "b5", "Qd2", "Nbd7", "O-O-O", "Bb7", "g4", "Nb6", "Qf2", "Nfd7", "Bd3", "Ne5", "Be2", "b4", "Na4", "Nec4", "Bxc4", "Nxc4", "b3", "Ne5", "Kb1", "Rc8", "Rhg1", "d5", "exd5", "Nxd5", "Nf5", "exf5", "gxf5", "Bh6", "Bxh6", "Qxh6", "Rge1+", "Kd8", "Qd4", "Qd6", "Qxd6+", "Nxd6", "Re6", "Kd7", "Rde1", "Rc6", "Rxc6", "Kxc6", "c4", "bxc3", "Nxc3", "Nxc4", "bxc4", "Rc8", "Rd1", "Kc5", "Re1", "Bxf3", "Re5+", "Kd4", "Rxf5", "Bg4", "Rd5+", "Kc3", "Rxd5", "cxd5", "Kc2", "Bf5+", "Kb3", "Kd4", "a3", "d6", "Kb4", "Be4", "Kb5", "Kd3", "Kb6", "Kc4", "Kb7", "Kd4", "Kc6", "Ke3", "Kd7", "Kf4", "Ke6", "Kg5", "Bf5", "h4", "Bg6", "Kh6", "Kf5", "Kh7", "g6+", "Kh8", "h5", "d5", "h6", "d4", "Kh7", "d3", "Kg8", "d2", "Kf8", "d1=Q", "Ke7", "Qb3", "Ke6", "Qxg8+", "Kf5", "Qf7+", "Kg4", "Qxg6+", "Kh3", "Qh5+", "Kg2", "Qxh6", "Kf1"], isHuman: true, rating: 2000 },
  { id: "4", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Qf3", "Be7", "Bxc6+", "Nxc6", "Qxc6+", "Bd7", "Qf3", "O-O", "d3", "h6", "Ne4", "Nd5", "O-O", "f5", "Nc3", "Nf4", "Bxf4", "exf4", "Rae1", "Bd6", "Nxd5", "fxe4", "dxe4", "Bc6", "Nb4", "Bxf3", "Nxf3+", "Kg2", "Bc5", "Rxf4", "Qd3", "Rg4", "Kh8", "Nd4", "Rfe8", "Rxe8+", "Rxe8", "h3", "Re2", "Kh1", "Qd7", "Ne6", "Bd6", "Kg1", "Qe7", "Kh1", "Qf6", "Kg1", "Bc5", "Kh1", "Qe5", "Rg3", "Bd4", "f4", "Qf6", "Rg4", "Be3", "Rg3", "Bf2", "Rg4", "Bc5"], isHuman: false, rating: 2400 },
  { id: "5", moves: ["d4", "d5", "c4", "c6", "Nc3", "Nf6", "Nf3", "e6", "Bg5", "dxc4", "e4", "b5", "e5", "h6", "Bh4", "g5", "Nxg5", "hxg5", "Bxg5", "Nbd7", "g3", "Bb7", "Bg2", "Qb6", "exf6", "O-O-O", "O-O", "c5", "d5", "b4", "dxe6", "Bxd1", "Raxd1", "fxe6", "Be3", "Bd6", "b3", "cxb3", "axb3", "Ne5", "Rb1", "Rdg8", "Rfe1", "a5", "Bf1", "Rxg5+", "Kh1", "Rxg3", "fxg3", "Qf6", "Be2", "a4", "bxa4", "Nc4", "Rd1", "Ne5", "Rb3", "c4", "Rc3", "c5", "Rxc5", "Bxc5", "Bxc4", "Rc8", "Bd5", "Rc2", "Kg1", "Qd4+", "Kg2", "Qd2+", "Kh1", "Nf3", "hxg3", "Rxh2+", "Kg1", "Qxg2+"], isHuman: false, rating: 2100 },
]

export default function TuringPage() {
  const [game, setGame] = useState<TuringGame | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState<"human" | "engine" | null>(null)
  const [score, setScore] = useState(0)
  const [totalRounds, setTotalRounds] = useState(0)
  const [fen, setFen] = useState("")
  const [moveIndex, setMoveIndex] = useState(-1)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const loadGame = useCallback((g: TuringGame) => {
    setGame(g)
    setGuesses([])
    setCurrentGuess(null)
    setShowResult(false)
    setShowAnswer(false)
    setMoveIndex(-1)
    const chess = new Chess()
    setFen(chess.fen())
    setLastMove(null)
  }, [])

  useEffect(() => {
    const g = SAMPLE_GAMES[Math.floor(Math.random() * SAMPLE_GAMES.length)]
    loadGame(g)
  }, [loadGame])

  const handleGuess = useCallback((guess: "human" | "engine") => {
    if (!game || currentGuess !== null) return
    setCurrentGuess(guess)
  }, [game, currentGuess])

  const confirmGuess = useCallback(() => {
    if (!game || currentGuess === null) return
    const correct = (currentGuess === "human") === game.isHuman
    setGuesses((prev) => [...prev, { moveIndex: totalRounds, guessed: currentGuess, correct }])
    if (correct) setScore((s) => s + 1)
    setTotalRounds((t) => t + 1)
    setShowAnswer(true)
    setCurrentGuess(null)
    setTimeout(() => {
      setShowAnswer(false)
      const next = SAMPLE_GAMES[Math.floor(Math.random() * SAMPLE_GAMES.length)]
      loadGame(next)
    }, 2000)
  }, [game, currentGuess, totalRounds, loadGame])

  const navigateMove = useCallback((dir: number) => {
    if (!game) return
    const newIdx = moveIndex + dir
    if (newIdx < -1 || newIdx >= game.moves.length) return
    setMoveIndex(newIdx)
    if (newIdx === -1) {
      setFen(new Chess().fen())
      setLastMove(null)
      return
    }
    const chess = new Chess()
    for (let i = 0; i <= newIdx; i++) chess.move(game.moves[i])
    setFen(chess.fen())
    const hist = chess.history({ verbose: true })
    const lm = hist[hist.length - 1]
    if (lm) setLastMove({ from: lm.from, to: lm.to })
  }, [game, moveIndex])

  const turnColor = useMemo((): "white" | "black" => {
    const turn = fen.split(" ")[1]
    return turn === "w" ? "white" : "black"
  }, [fen])

  const boardConfig = {
    fen,
    orientation: "white" as const,
    turnColor,
    coordinates: true,
    highlight: { lastMove: true, check: true },
    lastMove: lastMove ? [lastMove.from as Key, lastMove.to as Key] : undefined,
    viewOnly: true,
    animation: { enabled: true, duration: 200 },
  }

  const accuracy = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bot or Not</h1>
          <p className="text-sm text-white/50">Tebak apakah langkah dibuat oleh manusia atau engine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/30">Score</p>
            <p className="text-lg font-bold text-cyan-400">{score}/{totalRounds}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-white/30">Accuracy</p>
            <p className="text-lg font-bold text-yellow-400">{accuracy}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mx-auto max-w-[560px]">
            <div className="board-custom-wrap rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
              <Chessground config={boardConfig} contained />
            </div>
          </div>

          {game && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={() => navigateMove(-1)} disabled={moveIndex <= -1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-30">
                <SkipBack className="h-4 w-4" />
              </button>
              <button onClick={() => navigateMove(-1)} disabled={moveIndex <= -1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] text-center text-xs text-white/30">
                {moveIndex < 0 ? "Start" : `#${moveIndex + 1} ${game.moves[moveIndex]}`}
              </span>
              <button onClick={() => navigateMove(1)} disabled={moveIndex >= game.moves.length - 1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigateMove(1)} disabled={moveIndex >= game.moves.length - 1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-30">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          )}

          <AnimatePresence>
            {showAnswer && game && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm ${game.isHuman ? "border-green-400/20 bg-green-400/5 text-green-400" : "border-red-400/20 bg-red-400/5 text-red-400"}`}
              >
                <Brain className="h-4 w-4" />
                {game.isHuman ? "Manusia!" : "Engine!"} (Rating: {game.rating})
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Your Guess</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleGuess("human")} disabled={currentGuess !== null}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${currentGuess === "human" ? "border-green-400/60 bg-green-400/10 text-green-400" : currentGuess !== null ? "border-white/5 text-white/20" : "border-white/10 text-white/60 hover:border-green-400/40 hover:text-green-400"}`}>
                <User className="h-5 w-5" /> Human
              </button>
              <button onClick={() => handleGuess("engine")} disabled={currentGuess !== null}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${currentGuess === "engine" ? "border-red-400/60 bg-red-400/10 text-red-400" : currentGuess !== null ? "border-white/5 text-white/20" : "border-white/10 text-white/60 hover:border-red-400/40 hover:text-red-400"}`}>
                <Bot className="h-5 w-5" /> Engine
              </button>
            </div>
            <AnimatePresence>
              {currentGuess && !showAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <button onClick={confirmGuess}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
                    Confirm
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3 w-3" /> Guess History
            </h3>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {guesses.length === 0 && <p className="text-xs text-white/20">Belum ada tebakan.</p>}
              {guesses.map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-white/40">Round #{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={g.guessed === "human" ? "text-green-400" : "text-red-400"}>{g.guessed === "human" ? "Human" : "Engine"}</span>
                    {g.correct ? <ThumbsUp className="h-3 w-3 text-green-400" /> : <ThumbsDown className="h-3 w-3 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
