"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import Chessground from "@react-chess/chessground"
import { motion, AnimatePresence } from "framer-motion"
import EvaluationBar from "@/components/chess/EvaluationBar"
import { useChessContext, TIME_PRESETS, type BotInfo } from "@/contexts/ChessContext"
import { usePlayController } from "@/hooks/usePlayController"
import { BOT_PERSONALITIES, createTCOPlayerList, fetchAllTCOPlayerStats, type TCOPlayerStats } from "@/engine/bot-personalities"
import {
  Play, Bot, Zap, Cpu, RotateCcw, Clock, Loader2, Users,
  ChevronDown, Shield, Crosshair, Brain,
  MessageCircle, Sword, Target, Gamepad2,
} from "lucide-react"
import type { Key } from "chessground/types"

const tcoPlayerList = createTCOPlayerList()

function buildTCOPlayerList(statsMap?: Record<string, TCOPlayerStats>): BotInfo[] {
  return tcoPlayerList.map((p) => {
    const pers = BOT_PERSONALITIES[p.name]
    const stat = statsMap?.[p.name]
    return {
      name: p.name,
      rating: stat?.rating || p.rating,
      isEngine: false,
      style: pers?.style || "solid",
      avatarUrl: stat?.avatarUrl || pers?.avatarUrl,
    }
  })
}

// Moved inside component as botOptions

const STYLE_ICONS: Record<string, typeof Sword> = {
  aggressive: Sword,
  solid: Shield,
  positional: Target,
  tactical: Crosshair,
}

const STYLE_COLORS: Record<string, string> = {
  aggressive: "text-red-400 bg-red-400/10 border-red-400/30",
  solid: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  positional: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  tactical: "text-purple-400 bg-purple-400/10 border-purple-400/30",
}

export default function PlayBotPage() {
  const ctx = useChessContext()
  const controller = usePlayController()
  const [showBotList, setShowBotList] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [gameHistory, setGameHistory] = useState<{ botName: string; result: string; date: string }[]>([])
  const [tcoStats, setTcoStats] = useState<Record<string, TCOPlayerStats> | null>(null)

  useEffect(() => {
    fetchAllTCOPlayerStats().then(setTcoStats)
  }, [])

  const tcoPlayers = useMemo(() => buildTCOPlayerList(tcoStats || undefined), [tcoStats])
  const botOptions = useMemo(() => [...tcoPlayers, { name: "Stockfish", rating: 2800, isEngine: true }], [tcoPlayers])

  useEffect(() => {
    const stored = localStorage.getItem("arena-game-history")
    if (stored) {
      try { setGameHistory(JSON.parse(stored)) } catch { /* */ }
    }
  }, [])

  useEffect(() => {
    if (ctx.gameOver) {
      const entry = {
        botName: ctx.bot.name,
        result: ctx.gameResult?.winner === ctx.playerColor ? "win" : ctx.gameResult?.winner === "draw" ? "draw" : "loss",
        date: new Date().toLocaleDateString(),
      }
      setGameHistory((prev) => {
        const updated = [...prev, entry]
        localStorage.setItem("arena-game-history", JSON.stringify(updated))
        return updated
      })
    }
  }, [ctx.gameOver])

  const personality = BOT_PERSONALITIES[ctx.bot.name]
  const StyleIcon = personality ? STYLE_ICONS[personality.style] || Brain : Brain
  const styleColor = personality ? STYLE_COLORS[personality.style] || "text-cyan-400" : "text-cyan-400"

  const filteredBots = useMemo(() => {
    if (!searchQuery) return botOptions
    const q = searchQuery.toLowerCase()
    return botOptions.filter((b) => b.name.toLowerCase().includes(q))
  }, [searchQuery, botOptions])

  const canInteract = ctx.gameStarted && !ctx.gameOver && !ctx.botThinking

  const onMove = useCallback((orig: Key, dest: Key) => {
    controller.applyPlayerMove(orig, dest)
  }, [controller])

  const dests = useMemo(() => {
    if (!canInteract) return undefined
    try {
      const g = new Chess(ctx.fen)
      const moves = g.moves({ verbose: true })
      const d = new Map<Key, Key[]>()
      for (const m of moves) {
        const existing = d.get(m.from as Key) || []
        existing.push(m.to as Key)
        d.set(m.from as Key, existing)
      }
      return d
    } catch { return undefined }
  }, [ctx.fen, canInteract])

  const playerCgColor = ctx.gameStarted ? (ctx.playerColor === "white" ? "white" : "black") : undefined
  const fenTurn = ctx.fen.split(" ")[1]
  const turnColor: "white" | "black" = fenTurn === "w" ? "white" : "black"

  const boardConfig = {
    fen: ctx.fen,
    orientation: (ctx.playerColor === "black" ? "black" : "white") as "white" | "black",
    turnColor,
    coordinates: true,
    highlight: { lastMove: true, check: true },
    lastMove: ctx.lastMove ? [ctx.lastMove.from as Key, ctx.lastMove.to as Key] : undefined,
    selected: ctx.selectedSquare as Key | undefined,
    movable: {
      color: canInteract ? playerCgColor : undefined,
      dests,
      showDests: true,
      events: { after: onMove },
    } as any,
    draggable: { enabled: canInteract },
    animation: { enabled: true, duration: 200 },
  } as any

  function selectBot(bot: BotInfo) {
    ctx.setBot(bot)
    setShowBotList(false)
    setSearchQuery("")
  }

  if (!ctx.gameStarted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-400/20">
            <Sword className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">VS Bot Training</h1>
          <p className="mt-1 text-sm text-white/50">Pilih lawan dari Bot_Anggota Divisi TCO Chess atau engine catur</p>
          {ctx.engineReady && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                <Cpu className="h-3 w-3" /> Stockfish 18 Siap
              </span>
            </motion.div>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-white/70">Pilih Bot</label>
                {personality && (
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${styleColor}`}>
                    <StyleIcon className="h-3 w-3" />
                    {personality.style.charAt(0).toUpperCase() + personality.style.slice(1)}
                  </span>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowBotList(!showBotList)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-cyan-400/30">
                  {personality?.avatarUrl ? (
                    <img src={personality.avatarUrl} alt={personality.displayName} className="h-10 w-10 rounded-full object-cover ring-1 ring-cyan-400/20" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-bold text-cyan-400 ring-1 ring-cyan-400/20">
                      {ctx.bot.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{personality?.displayName || ctx.bot.name}</span>
                      {ctx.bot.isEngine && (
                        <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400">ENGINE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-yellow-400/80">Elo {ctx.activeElo}</span>
                      {personality?.description && (
                        <span className="text-[10px] text-white/30 truncate">{personality.description}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/30 shrink-0" />
                </button>

                <AnimatePresence>
                  {showBotList && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[320px] overflow-y-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50">
                      <div className="sticky top-0 border-b border-white/10 bg-slate-900 p-2">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari bot..."
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-400/50" autoFocus />
                      </div>
                      <div className="py-1">
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/60">TCO Players - Bot Anggota Divisi</div>
                        {filteredBots.filter((b) => !b.isEngine).map((bot) => {
                          const p = BOT_PERSONALITIES[bot.name]
                          const SI = p ? STYLE_ICONS[p.style] || Brain : Brain
                          const SC = p ? STYLE_COLORS[p.style] || "text-cyan-400" : "text-cyan-400"
                          return (
                            <button key={bot.name} onClick={() => selectBot(bot)}
                              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.03] ${ctx.bot.name === bot.name ? "bg-cyan-400/5" : ""}`}>
                              {p?.avatarUrl ? (
                                <img src={p.avatarUrl} alt={p.displayName} className="h-8 w-8 rounded-full object-cover ring-1 ring-cyan-400/10" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 text-xs font-bold text-cyan-400 ring-1 ring-cyan-400/10">{bot.name.charAt(0)}</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-white/80">{p?.displayName || bot.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-yellow-400/70">Elo {bot.rating}</span>
                                  {p && <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] ${SC}`}><SI className="h-2.5 w-2.5" />{p.style}</span>}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                        <div className="border-t border-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/60 mt-1">Engines</div>
                        {filteredBots.filter((b) => b.isEngine).map((bot) => (
                          <button key={bot.name} onClick={() => selectBot(bot)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.03] ${ctx.bot.name === bot.name ? "bg-cyan-400/5" : ""}`}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-pink-600/10 text-xs font-bold text-purple-400 ring-1 ring-purple-400/10"><Cpu className="h-4 w-4" /></div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-white/80">{bot.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-yellow-400/70">Elo {bot.rating}</span>
                                <span className="text-[9px] text-purple-400/60">Engine</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {personality && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.02] p-3">
                    <p className="text-xs leading-relaxed text-white/60">{personality.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {personality.strengths.map((s) => (
                        <span key={s} className="rounded bg-green-400/10 px-2 py-0.5 text-[9px] text-green-400/80">+ {s}</span>
                      ))}
                      {personality.weaknesses.map((w) => (
                        <span key={w} className="rounded bg-red-400/10 px-2 py-0.5 text-[9px] text-red-400/80">- {w}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!ctx.bot.isEngine && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-2.5">
                  <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px] text-cyan-400/80">
                    TCO Player &mdash; {personality ? `Gaya ${personality.style}` : `Elo ${ctx.bot.rating}`}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <label className="text-sm font-semibold text-white/70">Time Control</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIME_PRESETS.map((p) => (
                  <button key={p.mode} onClick={() => ctx.setTimeMode(p.mode)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ctx.timeMode === p.mode ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "border border-white/10 text-white/50 hover:text-white/70"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              {ctx.timeMode === "custom" && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-white/40">Menit per pemain:</span>
                  <input type="number" min={1} max={60} value={ctx.customMinutes}
                    onChange={(e) => ctx.setCustomMinutes(Math.max(1, Math.min(60, Number(e.target.value))))}
                    className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white text-center outline-none focus:border-cyan-400/50" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => controller.startGame("white")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] ${!ctx.engineReady ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Play className="h-4 w-4" /> Main Putih
              </button>
              <button onClick={() => controller.startGame("black")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${!ctx.engineReady ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Play className="h-4 w-4" /> Main Hitam
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              {personality ? (
                <>
                  {personality.avatarUrl ? (
                    <img src={personality.avatarUrl} alt={personality.displayName} className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-cyan-400/20" />
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-2 ring-cyan-400/20">
                      <span className="text-4xl font-bold text-cyan-400">{personality.name.charAt(0)}</span>
                    </div>
                  )}
                  <h2 className="mt-4 text-xl font-bold text-white">{personality.displayName}</h2>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-yellow-400">{personality.elo}</span>
                    <span className="text-xs text-white/30">Elo</span>
                    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${styleColor}`}>
                      <StyleIcon className="h-3 w-3" />{personality.style.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Opening Preference</p>
                    <div className="flex flex-wrap gap-1.5">
                      {personality.openingPreference.map((op) => (
                        <span key={op} className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60">{op}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <p className="text-xs text-white/40 italic">&ldquo;{personality.description}&rdquo;</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 ring-2 ring-purple-400/20">
                    <Cpu className="h-10 w-10 text-purple-400" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">{ctx.bot.name}</h2>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-yellow-400">{ctx.activeElo}</span>
                    <span className="text-xs text-white/30">Max Elo</span>
                  </div>
                  <p className="mt-3 text-xs text-white/40">Stockfish 18 Lite &mdash; strongest chess engine</p>
                </>
              )}
            </div>

            {gameHistory.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                  <Gamepad2 className="h-3 w-3" /> Recent Games
                </h3>
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                  {gameHistory.slice(-5).reverse().map((g, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-white/50 truncate">vs {g.botName}</span>
                      <span className={`font-medium ${g.result === "win" ? "text-green-400" : g.result === "loss" ? "text-red-400" : "text-yellow-400"}`}>
                        {g.result === "win" ? "W" : g.result === "loss" ? "L" : "D"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/70">Kamu ({ctx.playerColor === "white" ? "Putih" : "Hitam"})</span>
            <span className="text-white/20">vs</span>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
              {personality?.avatarUrl ? (
                <img src={personality.avatarUrl} alt={personality.displayName} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-[10px] font-bold text-cyan-400">{ctx.bot.name.charAt(0)}</div>
              )}
              <span className="text-sm font-semibold text-cyan-400">{personality?.displayName || ctx.bot.name}</span>
              <span className="text-[10px] text-white/30">Elo {ctx.activeElo}</span>
              {personality && (
                <span className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${styleColor}`}>
                  <StyleIcon className="h-2.5 w-2.5" />{personality.style}
                </span>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-medium text-cyan-400">
            <Cpu className="h-2.5 w-2.5" />SF18
          </span>
        </div>
        <button onClick={controller.resetGame}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-red-400/30 hover:text-red-400">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {ctx.timeMode !== "none" && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-white/30">Kamu</span>
            <span className={`font-semibold tabular-nums ${ctx.playerTime <= 30 ? "text-red-400" : "text-white"}`}>{ctx.formatTime(ctx.playerTime)}</span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white/30">Bot</span>
            <span className={`font-semibold tabular-nums ${ctx.botTime <= 30 ? "text-red-400" : "text-cyan-400"}`}>{ctx.formatTime(ctx.botTime)}</span>
          </div>
          <span className="text-[10px] text-white/30">{ctx.timeMode === "custom" ? `${ctx.customMinutes}m` : TIME_PRESETS.find((t) => t.mode === ctx.timeMode)?.label}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex gap-4 items-start">
            <div className="max-w-[560px] flex-1">
              <div className="board-custom-wrap rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
                <Chessground config={boardConfig} contained />
              </div>
            </div>
            <div className="shrink-0">
              <EvaluationBar evaluation={ctx.evaluation} mate={null} playerColor={ctx.playerColor} />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap gap-1">
              {ctx.moves.length === 0 ? (
                <span className="text-xs text-white/20">Klik bidak untuk mulai...</span>
              ) : (
                ctx.moves.map((m, i) => (
                  <span key={i} className={`rounded px-1.5 py-0.5 text-[11px] ${i % 2 === 0 ? "bg-white/5 text-white/60" : "bg-cyan-400/5 text-cyan-400/80"}`}>
                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}{m}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {ctx.gameOver && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <p className="text-sm font-bold text-white">
                  {ctx.gameResult?.winner === "draw" ? "Draw" : ctx.gameResult?.winner === "white" ? "Putih Menang!" : ctx.gameResult?.winner === "black" ? "Hitam Menang!" : "Game Over"}
                </p>
                <p className="mt-1 text-xs text-white/40">{ctx.gameResult?.reason}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button onClick={() => {
                    const g = new Chess()
                    ctx.moves.forEach((m) => { try { g.move(m) } catch { /* */ } })
                    if (typeof window !== "undefined") localStorage.setItem("analysisPgn", g.pgn())
                    window.location.href = "/arena-training/analysis"
                  }} className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
                    <Brain className="h-3.5 w-3.5" /> Analisis Game
                  </button>
                  <button onClick={controller.resetGame}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <RotateCcw className="h-3.5 w-3.5" /> Main Lagi
                  </button>
                </div>
              </motion.div>
            )}
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                  {ctx.botThinking ? <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Bot className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-cyan-400">Virtual Coach</p>
                  {ctx.botThinking ? (
                    <p className="mt-0.5 text-xs italic text-cyan-400/60">{personality?.name || "Bot"} berpikir...</p>
                  ) : ctx.coachText ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{ctx.coachText}</p>
                  ) : (
                    <p className="mt-0.5 text-xs text-white/30">Coach akan memberi komentar setelah langkah dimainkan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-3.5 w-3.5 text-cyan-400" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80">{(personality?.displayName || ctx.bot.name)} Commentator</h3>
            </div>
            <div className="max-h-[200px] min-h-[80px] overflow-y-auto space-y-1">
              {ctx.commentary.length === 0 ? (
                <p className="text-[11px] text-white/20 italic">Belum ada komentar...</p>
              ) : (
                ctx.commentary.slice(-15).map((c, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] leading-relaxed text-white/40">{c}</motion.p>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Game Info</h3>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Moves</span>
                <span className="text-white/60">{ctx.moves.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Engine</span>
                <span className="text-cyan-400">Stockfish 18</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Bot Elo</span>
                <span className="text-yellow-400/80">{ctx.activeElo}</span>
              </div>
              {personality && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Style</span>
                  <span className={`font-medium ${styleColor}`}>{personality.style}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
