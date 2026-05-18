"use client"

import { useMemo } from "react"
import { Chessboard } from "react-chessboard"
import { motion } from "framer-motion"
import EvaluationBar from "@/components/chess/EvaluationBar"
import IconBadge, { SQUARE_BG_COLORS, IconImg } from "@/components/chess/IconBadge"
import AdSlot from "@/components/AdSlot"
import { cpToWinrate } from "@/engine/classify-utils"
import { useAnalysisController, type TabType } from "@/hooks/useAnalysisController"
import type { MoveAnalysis } from "@/hooks/useAnalysisController"
import {
  Search, FileText, ExternalLink, ChevronLeft, ChevronRight,
  AlertCircle, Zap, Brain, RotateCcw, Play, Pause, SkipBack, SkipForward,
  Loader2, BarChart3, Award, Target, ShieldAlert, CheckCircle, AlertTriangle, MinusCircle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Area, ComposedChart, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from "recharts"

const TABS: { key: TabType; label: string; icon: typeof Search }[] = [
  { key: "chesscom", label: "Chess.com", icon: ExternalLink },
  { key: "lichess", label: "Lichess", icon: Search },
  { key: "pgn", label: "Manual PGN", icon: FileText },
]

const CLICKABLE_CLASSIFICATION_COLORS: Record<string, string> = {
  book: "#a855f7", brilliant: "#3b82f6", great_find: "#6366f1", best: "#22c55e",
  excellent: "#93c5fd", good: "#06b6d4", forced: "#9ca3af",
  inaccuracy: "#eab308", mistake: "#f97316", blunder: "#ef4444", mate: "#f43f5e",
}

export default function AnalysisPage() {
  const ctrl = useAnalysisController()
  const currentClassification = ctrl.currentMoveIndex >= 0 && ctrl.analysis[ctrl.currentMoveIndex]
    ? ctrl.analysis[ctrl.currentMoveIndex].classification
    : null

  const squareStyles = useMemo(() => {
    if (ctrl.currentMoveIndex < 0 || !ctrl.lastMove || !currentClassification) return {}
    const bg = SQUARE_BG_COLORS[currentClassification.key] || "rgba(34, 211, 238, 0.15)"
    return {
      [ctrl.lastMove.from]: { backgroundColor: bg },
      [ctrl.lastMove.to]: { backgroundColor: bg },
    }
  }, [ctrl.currentMoveIndex, ctrl.analysis, ctrl.lastMove, currentClassification])

  const iconOverlay = useMemo(() => {
    if (ctrl.currentMoveIndex < 0 || !ctrl.lastMove || !currentClassification) return null
    const file = ctrl.lastMove.to.charCodeAt(0) - 97
    const rank = 8 - parseInt(ctrl.lastMove.to[1])
    const iconSize = 24
    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          style={{
            position: 'absolute',
            left: `${((file + 1) / 8) * 100}%`,
            top: `${(rank / 8) * 100}%`,
            transform: 'translate(-100%, 0)',
            width: iconSize,
            height: iconSize,
          }}
        >
          <IconImg classification={currentClassification} size={iconSize} />
        </div>
      </div>
    )
  }, [ctrl.currentMoveIndex, ctrl.lastMove, currentClassification])

  const chartData = ctrl.analysis.map((a, i) => ({
    move: `#${i + 1}`,
    evaluation: a.evaluationAfter,
    san: a.san,
    classificationKey: a.classification.key,
  }))

  const CLASSIFICATION_STYLE_LIST = [
    { label: "Best", key: "best", count: ctrl.classificationCounts.best || 0, color: "text-green-400 bg-green-400/10 border-green-400/30" },
    { label: "Excellent", key: "excellent", count: ctrl.classificationCounts.excellent || 0, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
    { label: "Good", key: "good", count: ctrl.classificationCounts.good || 0, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
    { label: "Inaccuracy", key: "inaccuracy", count: ctrl.classificationCounts.inaccuracy || 0, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    { label: "Mistake", key: "mistake", count: ctrl.classificationCounts.mistake || 0, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    { label: "Blunder", key: "blunder", count: ctrl.classificationCounts.blunder || 0, color: "text-red-400 bg-red-400/10 border-red-400/30" },
  ]

  const winPercent = useMemo(() => {
    const wr = cpToWinrate(ctrl.evaluation * 100)
    return `${Math.round(wr * 100)}%`
  }, [ctrl.evaluation])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AdSlot type="leaderboard" className="mb-6" />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
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

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => { ctrl.setTab(t.key); if (t.key !== "pgn") ctrl.setPgn("") }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${ctrl.tab === t.key ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "text-white/40 hover:text-white/60 border border-transparent"}`}>
              <t.icon className="h-3 w-3" />{t.label}
            </button>
          ))}
        </div>

        {ctrl.tab === "pgn" ? (
          <div className="flex gap-2">
            <textarea value={ctrl.pgn} onChange={(e) => ctrl.setPgn(e.target.value)}
              placeholder="Tempel PGN di sini..."
              className="h-20 flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-400/50 font-mono" />
            <button onClick={() => ctrl.loadPGN(ctrl.pgn)} disabled={!ctrl.pgn.trim() || ctrl.analyzing}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
              {ctrl.analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              {ctrl.analyzing ? "Menganalisis..." : "Muat Game"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={ctrl.username} onChange={(e) => ctrl.setUsername(e.target.value)}
              placeholder={`Masukkan ID ${ctrl.tab === "chesscom" ? "Chess.com" : "Lichess"}...`}
              className="max-w-sm flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-400/50" />
            <button onClick={() => (ctrl.tab === "chesscom" ? ctrl.fetchChessCom(ctrl.username) : ctrl.fetchLichess(ctrl.username))}
              disabled={ctrl.loading || !ctrl.username.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 disabled:opacity-50">
              {ctrl.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {ctrl.loading ? "Loading..." : "Cari Game"}
            </button>
          </div>
        )}

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

      {(ctrl.selectedGame || ctrl.moves.length > 0) && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
            {ctrl.selectedGame ? (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-white">{ctrl.selectedGame.white || "Putih"}</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-white">{ctrl.selectedGame.black || "Hitam"}</span>
                </div>
                {ctrl.selectedGame.result && ctrl.selectedGame.result !== "*" && (
                  <span className="rounded-full bg-yellow-400/10 px-3 py-0.5 text-xs font-medium text-yellow-400">{ctrl.selectedGame.result}</span>
                )}
                {ctrl.selectedGame.date && <span className="text-[11px] text-white/30">{ctrl.selectedGame.date}</span>}
              </>
            ) : (
              <span className="text-sm text-white/60">Game dimuat ({ctrl.moves.length} langkah)</span>
            )}
            <span className="text-xs text-white/30 ml-auto">{ctrl.moves.length} langkah</span>
          </div>

          {ctrl.moves.length > 0 && !ctrl.analyzing && !ctrl.hasResults && (
            <div className="mb-6 text-center">
              <button onClick={ctrl.startAnalysis}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                <Brain className="h-5 w-5" /> Mulai Analisis
              </button>
              <p className="mt-2 text-xs text-white/30">Engine akan menganalisis {ctrl.moves.length} langkah permainan</p>
            </div>
          )}
        </>
      )}

      {(ctrl.analyzing || ctrl.hasResults) && ctrl.moves.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="relative mx-auto max-w-[560px]">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <EvaluationBar evaluation={ctrl.evaluation} mate={ctrl.mate} />
                </div>
                <div className="relative flex-1 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10" style={{ lineHeight: 0 }}>
                  <Chessboard options={{
                    position: ctrl.gameFen,
                    boardOrientation: "white",
                    boardStyle: { borderRadius: 0 },
                    squareStyles,
                    allowDragging: false,
                    animationDurationInMs: 200,
                    showAnimations: true,
                    showNotation: true,
                  }} />
                  {iconOverlay}
                </div>
              </div>

              {ctrl.analyzing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-cyan-400">Menganalisis...</p>
                      <p className="mt-1 text-xs text-white/40">Langkah {ctrl.analysisCurrentStep}/{ctrl.analysisTotalSteps} ({ctrl.analysisProgress}%)</p>
                    </div>
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300" style={{ width: `${ctrl.analysisProgress}%` }} />
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

                <div className="mt-4 text-center text-xs text-white/50">
                  {ctrl.currentMoveIndex >= 0 ? (
                    <>Langkah <span className="font-semibold text-white">#{ctrl.currentMoveIndex + 1}</span> —{" "}
                    <span className="font-mono text-white/70">{ctrl.moves[ctrl.currentMoveIndex]}</span></>
                  ) : (
                    "Posisi awal permainan"
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Evaluation Trend
                  </h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="move" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} domain={[-5, 5]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                          formatter={(value: any) => [`${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}`, "Evaluation"]}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                        <defs>
                          <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="evaluation" fill="url(#evalGradient)" stroke="none" />
                        <Line type="monotone" dataKey="evaluation" stroke="#22d3ee" strokeWidth={2}
                          dot={(props: any) => {
                            const { cx, cy, index } = props
                            const key = chartData[index]?.classificationKey
                            const color = CLICKABLE_CLASSIFICATION_COLORS[key] || "#22d3ee"
                            return <circle key={index} cx={cx} cy={cy} r={3} fill={color} className="cursor-pointer" onClick={() => ctrl.goToMove(index)} />
                          }}
                          activeDot={{ r: 5, fill: "#22d3ee" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {ctrl.currentMoveIndex >= 0 && currentClassification && ctrl.analysis[ctrl.currentMoveIndex] && (() => {
              const ma = ctrl.analysis[ctrl.currentMoveIndex]
              const diff = ma.evaluationAfter - ma.evaluationBefore
              const diffSymbol = diff > 0.005 ? "▲" : diff < -0.005 ? "▼" : "—"
              const diffColor = diff > 0.005 ? "text-green-400" : diff < -0.005 ? "text-red-400" : "text-white/50"
              return (
                <motion.div key={ctrl.currentMoveIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" /> Ulasan Langkah
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <IconBadge classification={ma.classification} size={28} />
                    <span className="text-sm font-mono font-bold text-white">{ma.san}</span>
                    <span className="ml-auto text-[10px] text-white/30">#{ma.moveNumber}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="w-20">Evaluation</span>
                      <span>{ma.evaluationBefore > 0 ? "+" : ""}{(ma.evaluationBefore * 100).toFixed(1)}</span>
                      <span className="text-white/20">→</span>
                      <span className={diffColor}>
                        {ma.evaluationAfter > 0 ? "+" : ""}{(ma.evaluationAfter * 100).toFixed(1)}
                      </span>
                      <span className={`${diffColor} text-[10px]`}>{diffSymbol} {Math.abs(diff * 100).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="w-20">Centipawn Loss</span>
                      <span className="font-medium text-white/70">{Math.round(ma.centipawnLoss)} cp</span>
                    </div>
                    {ctrl.coachComment && (
                      <div className="mt-1.5 rounded-lg bg-cyan-400/5 border border-cyan-400/10 px-2.5 py-1.5">
                        <p className="text-[10px] font-medium text-cyan-400 mb-0.5">Saran</p>
                        <p className="text-xs text-white/60">{ctrl.coachComment}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()}

            {ctrl.hasResults && !ctrl.analyzing && (
              <>
                {(() => {
                  const total = ctrl.analysis.length
                  const good = (ctrl.classificationCounts.best || 0) + (ctrl.classificationCounts.excellent || 0) + (ctrl.classificationCounts.good || 0)
                  const ok = (ctrl.classificationCounts.inaccuracy || 0) + (ctrl.classificationCounts.mistake || 0)
                  const blunder = ctrl.classificationCounts.blunder || 0
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
                    {CLASSIFICATION_STYLE_LIST.map((c) => (
                      <div key={c.key} className={`rounded-lg border px-2 py-1.5 text-center ${c.color}`}>
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
              </>
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
                    <IconBadge classification={a.classification} size={16} />
                    <span className="flex-1 text-white/80">{a.san}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${a.classification.color}`}>{a.classification.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <AdSlot type="sidebar" />
          </div>
        </div>
      )}

      <div className="mt-12 border-t border-white/5 pt-6">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/30">
          <a href="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
          <a href="/about" className="hover:text-white/50 transition-colors">About</a>
          <a href="/contact" className="hover:text-white/50 transition-colors">Contact</a>
        </div>
        <p className="mt-3 text-center text-[10px] text-white/20">&copy; 2026 TCO Esports. All Rights Reserved. Powered by TCO.</p>
      </div>

      <AdSlot type="mobile-sticky" />
    </motion.div>
  )
}
