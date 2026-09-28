"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useChessContext, TIME_PRESETS } from "@/contexts/ChessContext"
import {
  MODE_PROFILE, MODE_ORDER, DEFAULT_CONFIG, DEFAULT_THRESHOLDS,
  loadConfig, saveConfig, resetConfig, type AnalysisConfig, type AnalysisMode,
} from "@/lib/analysis/config"
import { Volume2, VolumeX, Palette, Cpu, User, RefreshCw, Save, Check, Zap, SlidersHorizontal } from "lucide-react"

const BOARD_THEMES = [
  { id: "brown", name: "Brown", bg: "bg-amber-800", light: "bg-amber-200", dark: "bg-amber-800" },
  { id: "blue", name: "Blue", bg: "bg-blue-900", light: "bg-blue-200", dark: "bg-blue-800" },
  { id: "green", name: "Green", bg: "bg-green-900", light: "bg-green-200", dark: "bg-green-800" },
  { id: "purple", name: "Purple", bg: "bg-purple-900", light: "bg-purple-200", dark: "bg-purple-800" },
  { id: "gray", name: "Gray", bg: "bg-gray-800", light: "bg-gray-300", dark: "bg-gray-700" },
]

const PIECE_STYLES = [
  { id: "cburnett", name: "CBurnett" },
  { id: "merida", name: "Merida" },
  { id: "alpha", name: "Alpha" },
  { id: "anarcandy", name: "AnarCandy" },
]

export default function SettingsPage() {
  const ctx = useChessContext()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [boardTheme, setBoardTheme] = useState("brown")
  const [pieceStyle, setPieceStyle] = useState("cburnett")
  const [saved, setSaved] = useState(false)
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const saved = localStorage.getItem("arena-settings")
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.soundEnabled !== undefined) setSoundEnabled(s.soundEnabled)
        if (s.boardTheme) setBoardTheme(s.boardTheme)
        if (s.pieceStyle) setPieceStyle(s.pieceStyle)
      } catch { /* */ }
    }
    setAnalysisConfig(loadConfig())
  }, [])

  function updateThreshold(key: keyof typeof DEFAULT_THRESHOLDS, value: number) {
    setAnalysisConfig((prev) => ({ ...prev, thresholds: { ...prev.thresholds, [key]: value } }))
  }

  function saveSettings() {
    localStorage.setItem("arena-settings", JSON.stringify({ soundEnabled, boardTheme, pieceStyle }))
    saveConfig(analysisConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetSettings() {
    localStorage.removeItem("arena-settings")
    setBoardTheme("brown")
    setPieceStyle("cburnett")
    setSoundEnabled(true)
    setAnalysisConfig(resetConfig())
    saveSettings()
  }

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
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/50">Customize your Arena Training experience.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {/* Sound */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              {soundEnabled ? <Volume2 className="h-5 w-5 text-cyan-400" /> : <VolumeX className="h-5 w-5 text-white/30" />}
              <h2 className="text-sm font-semibold text-white">Sound</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Enable sound effects</span>
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${soundEnabled ? "bg-cyan-500" : "bg-white/10"}`}>
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${soundEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </motion.div>

          {/* Board Theme */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Board Theme</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {BOARD_THEMES.map((t) => (
                <button key={t.id} onClick={() => setBoardTheme(t.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${boardTheme === t.id ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/10 hover:border-white/20"}`}>
                  <div className="flex h-6 w-6 rounded overflow-hidden">
                    <div className={`h-full w-1/2 ${t.light}`} />
                    <div className={`h-full w-1/2 ${t.dark}`} />
                  </div>
                  <span className="text-xs text-white/70">{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Piece Style */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Piece Style</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {PIECE_STYLES.map((p) => (
                <button key={p.id} onClick={() => setPieceStyle(p.id)}
                  className={`rounded-lg border px-4 py-2 text-xs transition-all ${pieceStyle === p.id ? "border-cyan-400/40 bg-cyan-400/5 text-cyan-400" : "border-white/10 text-white/60 hover:border-white/20"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Analysis Configuration */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Analysis Configuration</h2>
            </div>

            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Default Mode (desktop)</p>
              <div className="flex gap-2">
                {MODE_ORDER.map((id) => (
                  <button key={id} onClick={() => setAnalysisConfig((prev) => ({ ...prev, defaultMode: id as AnalysisMode }))}
                    className={`flex-1 rounded-lg border px-2 py-2 text-center transition-all ${analysisConfig.defaultMode === id ? "border-cyan-400/40 bg-cyan-400/5 text-cyan-400" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                    <span className="block text-xs font-semibold">{MODE_PROFILE[id].label}</span>
                    <span className="block text-[9px] opacity-60">depth {MODE_PROFILE[id].depth}</span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-white/30">Mobile selalu memakai Quick sebagai default.</p>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Cloud eval path</p>
                <p className="text-[10px] text-white/30">Jalur cepat memakai cloud eval di mode Quick</p>
              </div>
              <button onClick={() => setAnalysisConfig((prev) => ({ ...prev, cloudEvalEnabled: !prev.cloudEvalEnabled }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${analysisConfig.cloudEvalEnabled ? "bg-cyan-500" : "bg-white/10"}`}>
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${analysisConfig.cloudEvalEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-white/30">Accuracy k</span>
                <input type="number" step="0.0005" min="0.0005" max="0.05" value={analysisConfig.accuracyK}
                  onChange={(e) => setAnalysisConfig((prev) => ({ ...prev, accuracyK: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-white/30">Critical swing</span>
                <input type="number" step="0.1" min="0.3" max="6" value={analysisConfig.criticalSwing}
                  onChange={(e) => setAnalysisConfig((prev) => ({ ...prev, criticalSwing: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50" />
              </label>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-white/30">Move thresholds (cp)</p>
              <button onClick={() => setAnalysisConfig((prev) => ({ ...prev, thresholds: { ...DEFAULT_THRESHOLDS } }))}
                className="text-[10px] text-white/30 transition-colors hover:text-cyan-400">Reset</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DEFAULT_THRESHOLDS) as (keyof typeof DEFAULT_THRESHOLDS)[]).map((key) => (
                <label key={key} className="block">
                  <span className="text-[9px] capitalize text-white/40">{key}</span>
                  <input type="number" min="0" value={analysisConfig.thresholds[key]}
                    onChange={(e) => updateThreshold(key, Number(e.target.value))}
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50" />
                </label>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-white/30">
              Threshold disimpan lokal dan bisa diubah tanpa mengubah source code.
            </p>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Engine Info */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Engine Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Status</span>
                <span className={`flex items-center gap-1 ${ctx.engineReady ? "text-green-400" : "text-yellow-400"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${ctx.engineReady ? "bg-green-400" : "bg-yellow-400"}`} />
                  {ctx.engineReady ? "Ready" : "Initializing..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Engine</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Zap className="h-3 w-3" /> Stockfish 18
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Mode</span>
                <span className="text-white/60">Client-side WASM</span>
              </div>
            </div>
          </motion.div>

          {/* Save Settings */}
          <motion.div variants={itemVariants} className="space-y-3">
            <button onClick={saveSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
              {saved ? <><Check className="h-4 w-4" /> Settings Saved</> : <><Save className="h-4 w-4" /> Save Settings</>}
            </button>
            <button onClick={resetSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-medium text-white/50 transition-all hover:border-red-400/30 hover:text-red-400">
              <RefreshCw className="h-3.5 w-3.5" /> Reset to Default
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
