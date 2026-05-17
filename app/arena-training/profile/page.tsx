"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Trophy, Sword, Brain, BarChart3, Star, Zap, Target, Shield, Crosshair, Gamepad2 } from "lucide-react"

type PlayedGame = {
  botName: string
  botRating: number
  playerColor: string
  result: string
  reason: string
  moves: number
  date: string
  engineType: string
}

type PuzzleStats = {
  solved: number
  total: number
  bestStreak: number
}

type TuringStats = {
  correct: number
  total: number
}

export default function ProfilePage() {
  const [playedGames, setPlayedGames] = useState<PlayedGame[]>([])
  const [puzzleStats, setPuzzleStats] = useState<PuzzleStats>({ solved: 0, total: 0, bestStreak: 0 })
  const [turingStats, setTuringStats] = useState<TuringStats>({ correct: 0, total: 0 })

  useEffect(() => {
    const stored = localStorage.getItem("arena-game-history")
    if (stored) {
      try { setPlayedGames(JSON.parse(stored)) } catch { /* */ }
    }
    const puz = localStorage.getItem("arena-puzzle-stats")
    if (puz) {
      try { setPuzzleStats(JSON.parse(puz)) } catch { /* */ }
    }
    const tur = localStorage.getItem("arena-turing-stats")
    if (tur) {
      try { setTuringStats(JSON.parse(tur)) } catch { /* */ }
    }
  }, [])

  const winRate = playedGames.length > 0
    ? Math.round((playedGames.filter((g) => g.result === "win").length / playedGames.length) * 100)
    : 0

  const puzzleAccuracy = puzzleStats.total > 0
    ? Math.round((puzzleStats.solved / puzzleStats.total) * 100)
    : 0

  const turingAccuracy = turingStats.total > 0
    ? Math.round((turingStats.correct / turingStats.total) * 100)
    : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.05 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-4xl">
      <motion.div variants={itemVariants} className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-2 ring-cyan-400/20">
          <User className="h-8 w-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Player Profile</h1>
          <p className="text-sm text-white/50">Statistik dan riwayat permainan Anda</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Sword className="mx-auto h-5 w-5 text-cyan-400" />
          <p className="mt-2 text-2xl font-bold text-white">{playedGames.length}</p>
          <p className="text-[10px] text-white/40">Games Played</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Trophy className="mx-auto h-5 w-5 text-yellow-400" />
          <p className="mt-2 text-2xl font-bold text-yellow-400">{winRate}%</p>
          <p className="text-[10px] text-white/40">Win Rate</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Brain className="mx-auto h-5 w-5 text-purple-400" />
          <p className="mt-2 text-2xl font-bold text-purple-400">{puzzleAccuracy}%</p>
          <p className="text-[10px] text-white/40">Puzzle Acc</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-green-400" />
          <p className="mt-2 text-2xl font-bold text-green-400">{turingAccuracy}%</p>
          <p className="text-[10px] text-white/40">Turing Acc</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Play Stats */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Gamepad2 className="h-4 w-4 text-cyan-400" /> Game History
          </h2>
          {playedGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-white/30">Belum ada game yang dimainkan.</p>
              <p className="mt-1 text-[10px] text-white/20">Mainkan game di VS Bot untuk melihat statistik.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {playedGames.slice().reverse().map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/80 truncate">vs {g.botName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        g.result === "win" ? "bg-green-400/10 text-green-400" :
                        g.result === "loss" ? "bg-red-400/10 text-red-400" :
                        "bg-yellow-400/10 text-yellow-400"
                      }`}>
                        {g.result === "win" ? "W" : g.result === "loss" ? "L" : "D"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/30">{g.playerColor === "white" ? "Putih" : "Hitam"}</span>
                      <span className="text-[10px] text-white/20">|</span>
                      <span className="text-[10px] text-white/30">{g.moves} moves</span>
                      {g.engineType && (
                        <>
                          <span className="text-[10px] text-white/20">|</span>
                          <span className="text-[10px] text-cyan-400/60">{g.engineType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-white/20">{g.date}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Puzzle Stats */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <BarChart3 className="h-4 w-4 text-purple-400" /> Puzzle Progress
          </h2>
          {puzzleStats.total === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-white/30">Belum ada puzzle yang dikerjakan.</p>
              <p className="mt-1 text-[10px] text-white/20">Coba Puzzle Academy untuk melatih taktik.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Solved</span>
                <span className="text-sm font-semibold text-green-400">{puzzleStats.solved}/{puzzleStats.total}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                  style={{ width: `${puzzleAccuracy}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Best Streak</span>
                <span className="text-sm font-semibold text-yellow-400">{puzzleStats.bestStreak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Accuracy</span>
                <span className="text-sm font-semibold text-cyan-400">{puzzleAccuracy}%</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Turing Stats */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Target className="h-4 w-4 text-green-400" /> Bot or Not Progress
          </h2>
          {turingStats.total === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-white/30">Belum ada tebakan Turing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{turingStats.total}</p>
                <p className="text-[10px] text-white/40">Total Rounds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{turingStats.correct}</p>
                <p className="text-[10px] text-white/40">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{turingAccuracy}%</p>
                <p className="text-[10px] text-white/40">Accuracy</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
