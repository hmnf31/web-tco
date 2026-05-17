"use client"

import { useMemo, useState } from "react"
import { Chess } from "chess.js"
import Chessground from "@react-chess/chessground"
import { motion } from "framer-motion"
import EvaluationBar from "@/components/chess/EvaluationBar"
import { cpToWinrate } from "@/engine/classify-utils"
import { useAnalysisController, type TabType } from "@/hooks/useAnalysisController"
import {
  Search, FileText, ExternalLink, ChevronLeft, ChevronRight,
  AlertCircle, Zap, Brain, RotateCcw, Play, Pause, SkipBack, SkipForward,
  Loader2, BarChart3, Award, Target, ShieldAlert,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import type { Key } from "chessground/types"

const TABS: { key: TabType; label: string; icon: typeof Search }[] = [
  { key: "chesscom", label: "Chess.com", icon: ExternalLink },
  { key: "lichess", label: "Lichess", icon: Search },
  { key: "pgn", label: "Manual PGN", icon: FileText },
]

export default function AnalysisPage() {
  const ctrl = useAnalysisController()
  const [showAnalysisSidebar, setShowAnalysisSidebar] = useState(true)

  const fenTurn = ctrl.gameFen.split(" ")[1]
  const turnColor: "white" | "black" = fenTurn === "w" ? "white" : "black"

  const boardConfig = {
    fen: ctrl.gameFen,
    orientation: "white" as const,
    turnColor,
    coordinates: true,
    highlight: { lastMove: true, check: true },
    lastMove: ctrl.lastMove ? [ctrl.lastMove.from as Key, ctrl.lastMove.to as Key] : undefined,
    viewOnly: true,
    animation: { enabled: true, duration: 200 },
    movable: { free: false },
  }

  const chartData = ctrl.analysis.map((a, i) => ({
    move: `#${i + 1}`,
    evaluation: a.evaluationAfter,
    san: a.san,
    classification: a.classification.label,
  }))

  const CLASSIFICATION_STYLES = [
    { label: "Best", count: ctrl.classificationCounts.Best || 0, color: "text-green-400 bg-green-400/10 border-green-400/30" },
    { label: "Excellent", count: ctrl.classificationCounts.Excellent || 0, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
    { label: "Good", count: ctrl.classificationCounts.Good || 0, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
    { label: "Inaccuracy", count: ctrl.classificationCounts.Inaccuracy || 0, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    { label: "Mistake", count: ctrl.classificationCounts.Mistake || 0, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    { label: "Blunder", count: ctrl.classificationCounts.Blunder || 0, color: "text-red-400 bg-red-400/10 border-red-400/30" },
  ]

  const winPercent = useMemo(() => {
    const wr = cpToWinrate(ctrl.evaluation * 100)
    return `${Math.round(wr * 100)}%`
  }, [ctrl.evaluation])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Game Analysis</h1>
            <p className="text-sm text-white/50">Analisis instan dengan engine, blunder meter, dan evaluasi</p>
          </div>
          {ctrl.engineReady && (
            <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-400/20">
              <Zap className="h-3 w-3" /> Engine Siap
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => ctrl.setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ctrl.tab === t.key ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "text-white/40 hover:text-white/60 border border-transparent"}`}>
              <t.icon className="h-3 w-3" />{t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {ctrl.tab === "pgn" ? (
            <div className="space-y-3">
              <textarea value={ctrl.pgn} onChange={(e) => ctrl.setPgn(e.target.value)}
                placeholder="Tempel PGN di sini..."
                className="h-28 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-400/50 font-mono" />
              <div className="flex gap-2">
                <button onClick={() => ctrl.loadPGN(ctrl.pgn)} disabled={!ctrl.pgn.trim() || ctrl.analyzing}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
                  {ctrl.analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                  {ctrl.analyzing ? "Menganalisis..." : "Mulai Analisis"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input type="text" value={ctrl.username} onChange={(e) => ctrl.setUsername(e.target.value)}
                placeholder={`Username ${ctrl.tab === "chesscom" ? "Chess.com" : "Lichess"}...`}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400/50" />
              <button onClick={() => (ctrl.tab === "chesscom" ? ctrl.fetchChessCom(ctrl.username) : ctrl.fetchLichess(ctrl.username))}
                disabled={ctrl.loading || !ctrl.username.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
                {ctrl.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                {ctrl.loading ? "Loading..." : "Fetch"}
              </button>
            </div>
          )}
        </div>

        {ctrl.error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-400/5 border border-red-400/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {ctrl.error}
          </div>
        )}
      </div>

      {ctrl.gamesList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {ctrl.username} &mdash; {ctrl.gamesList.length} game ditemukan
            </h3>
            <button onClick={() => (ctrl.tab === "chesscom" ? ctrl.fetchChessCom(ctrl.username) : ctrl.fetchLichess(ctrl.username))}
              disabled={ctrl.loading}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50">
              <RotateCcw className="h-3 w-3" /> Refresh
            </button>
          </div>
          <div className="space-y-2">
            {ctrl.gamesList.slice(ctrl.page * ctrl.gamesPerPage, (ctrl.page + 1) * ctrl.gamesPerPage).map((g, i) => {
              const actualIndex = i + ctrl.page * ctrl.gamesPerPage
              const isSelected = ctrl.selectedGame?.label === g.label && ctrl.selectedGame?.pgn === g.pgn
              return (
                <div key={actualIndex}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all cursor-pointer ${isSelected ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"}`}
                  onClick={() => ctrl.loadPGN(g.pgn, g)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{g.white || "?"} <span className="text-white/30">vs</span> {g.black || "?"}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {g.result && g.result !== "*" && <span className="text-xs text-yellow-400/80">{g.result}</span>}
                      {g.date && <span className="text-[10px] text-white/30">{g.date}</span>}
                    </div>
                  </div>
                  {isSelected && <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-400 ml-3"><Brain className="h-3 w-3" /> Dianalisis</span>}
                </div>
              )
            })}
          </div>

          {ctrl.gamesList.length > ctrl.gamesPerPage && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => ctrl.setPage(Math.max(0, ctrl.page - 1))} disabled={ctrl.page === 0}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ctrl.page === 0 ? "opacity-50 pointer-events-none" : "border border-white/10 text-white/50 hover:border-cyan-400/30 hover:text-cyan-400"}`}>
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <span className="text-xs text-white/40">Halaman {ctrl.page + 1} dari {Math.ceil(ctrl.gamesList.length / ctrl.gamesPerPage)}</span>
                <button onClick={() => ctrl.setPage(Math.min(Math.ceil(ctrl.gamesList.length / ctrl.gamesPerPage) - 1, ctrl.page + 1))} disabled={ctrl.page >= Math.ceil(ctrl.gamesList.length / ctrl.gamesPerPage) - 1}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ctrl.page >= Math.ceil(ctrl.gamesList.length / ctrl.gamesPerPage) - 1 ? "opacity-50 pointer-events-none" : "border border-white/10 text-white/50 hover:border-cyan-400/30 hover:text-cyan-400"}`}>
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {ctrl.selectedGame && ctrl.hasResults && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-white">{ctrl.selectedGame.white || "Putih"}</span>
            <span className="text-white/30">vs</span>
            <span className="font-semibold text-white">{ctrl.selectedGame.black || "Hitam"}</span>
          </div>
          {ctrl.selectedGame.result && ctrl.selectedGame.result !== "*" && (
            <span className="rounded-full bg-yellow-400/10 px-3 py-0.5 text-xs font-medium text-yellow-400">{ctrl.selectedGame.result}</span>
          )}
          {ctrl.selectedGame.date && <span className="text-[11px] text-white/30">{ctrl.selectedGame.date}</span>}
          <span className="text-xs text-white/30 ml-auto">{ctrl.moves.length} langkah</span>
        </div>
      )}

      {(ctrl.analyzing || ctrl.hasResults) && ctrl.moves.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="relative mx-auto max-w-[560px]">
              <div className="board-custom-wrap rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
                <Chessground config={boardConfig} contained />
              </div>

              {ctrl.analyzing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-cyan-400">Game sedang dianalisis</p>
                      <p className="mt-1 text-xs text-white/40">Menganalisis {ctrl.moves.length} langkah...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {ctrl.hasResults && !ctrl.analyzing && (
              <>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button onClick={() => ctrl.goToMove(-1)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button onClick={() => ctrl.goToMove(Math.max(-1, ctrl.currentMoveIndex - 1))}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[140px] text-center text-xs text-white/30">
                    {ctrl.currentMoveIndex < 0 ? "Posisi awal" : `#${ctrl.currentMoveIndex + 1} ${ctrl.moves[ctrl.currentMoveIndex]}`}
                  </span>
                  <button onClick={() => ctrl.goToMove(Math.min(ctrl.moves.length - 1, ctrl.currentMoveIndex + 1))}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => ctrl.goToMove(ctrl.moves.length - 1)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <div className="mx-2 h-5 w-px bg-white/10" />
                  <button onClick={ctrl.togglePlay}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${ctrl.playMode ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30" : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105"}`}>
                    {ctrl.playMode ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Play</>}
                  </button>
                </div>

                {ctrl.currentMoveIndex >= 0 && ctrl.analysis[ctrl.currentMoveIndex] && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="rounded-lg bg-cyan-400/5 border border-cyan-400/10 px-3 py-1 text-[10px] font-medium text-cyan-400">
                      Eval: {ctrl.evaluation > 0 ? "+" : ""}{(ctrl.evaluation * 100).toFixed(1)}
                    </span>
                    <span className="rounded-lg bg-yellow-400/5 border border-yellow-400/10 px-3 py-1 text-[10px] font-medium text-yellow-400">
                      {winPercent} win
                    </span>
                    <span className={`rounded-lg border px-3 py-1 text-[10px] font-medium ${
                      ctrl.analysis[ctrl.currentMoveIndex].classification.color
                    }`}>
                      {ctrl.analysis[ctrl.currentMoveIndex].classification.label}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-3">Evaluation</h3>
                <div className="flex justify-center">
                  <EvaluationBar evaluation={ctrl.evaluation} mate={ctrl.mate} />
                </div>
                <div className="mt-2 text-center">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-cyan-400">{winPercent} win</span>
                </div>
              </div>
            </div>

            {ctrl.hasResults && !ctrl.analyzing && (
              <>
                {(() => {
                  const total = ctrl.analysis.length
                  const good = (ctrl.classificationCounts.Best || 0) + (ctrl.classificationCounts.Excellent || 0) + (ctrl.classificationCounts.Good || 0)
                  const ok = (ctrl.classificationCounts.Inaccuracy || 0) + (ctrl.classificationCounts.Mistake || 0)
                  const blunder = ctrl.classificationCounts.Blunder || 0
                  const goodPct = total > 0 ? Math.round((good / total) * 100) : 0
                  const okPct = total > 0 ? Math.round((ok / total) * 100) : 0
                  const blunderPct = total > 0 ? Math.round((blunder / total) * 100) : 0
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" /> Blunder Meter
                      </h3>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="flex h-full">
                          <div style={{ width: `${goodPct}%` }} className="bg-green-500 transition-all duration-500" />
                          <div style={{ width: `${okPct}%` }} className="bg-yellow-500 transition-all duration-500" />
                          <div style={{ width: `${blunderPct}%` }} className="bg-red-500 transition-all duration-500" />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-[10px]">
                        <span className="text-green-400">{goodPct}% Good</span>
                        <span className="text-yellow-400">{okPct}% OK</span>
                        <span className="text-red-400">{blunderPct}% Blunder</span>
                      </div>
                    </motion.div>
                  )
                })()}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" /> Review Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLASSIFICATION_STYLES.map((c) => (
                      <div key={c.label} className={`rounded-lg border px-2 py-1.5 text-center ${c.color}`}>
                        <p className="text-xs font-bold">{c.count}</p>
                        <p className="text-[9px] leading-tight">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <Award className="h-3 w-3" /> Performa
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-cyan-400">{ctrl.accuracy}%</p>
                      <p className="text-[10px] text-white/40">Akurasi</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-yellow-400">{ctrl.performanceElo}</p>
                      <p className="text-[10px] text-white/40">Estimasi Elo</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Evaluation Graph
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="move" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={[-5, 5]} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                          formatter={(value: any) => [`${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}`, "Evaluation"]} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                        <Line type="monotone" dataKey="evaluation" stroke="#22d3ee" strokeWidth={2}
                          dot={(props: any) => {
                            const { cx, cy, index } = props
                            const classification = chartData[index]?.classification
                            const colors: Record<string, string> = { Best: "#22c55e", Excellent: "#3b82f6", Good: "#06b6d4", Inaccuracy: "#eab308", Mistake: "#f97316", Blunder: "#ef4444" }
                            return <circle key={index} cx={cx} cy={cy} r={3} fill={colors[classification] || "#22d3ee"} className="cursor-pointer" onClick={() => ctrl.goToMove(index)} />
                          }}
                          activeDot={{ r: 5, fill: "#22d3ee" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </>
            )}

            {ctrl.coachComment && (
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                    <Brain className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-cyan-400">Virtual Coach</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{ctrl.coachComment}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                Moves <span className="text-white/30 font-normal">({ctrl.analysis.length})</span>
              </h3>
              <div className="space-y-0.5">
                {ctrl.analysis.map((a, i) => (
                  <div key={i} onClick={() => ctrl.goToMove(i)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${ctrl.currentMoveIndex === i ? "bg-cyan-400/10" : "hover:bg-white/[0.02]"}`}>
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
    </motion.div>
  )
}
