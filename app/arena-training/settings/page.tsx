"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useChessContext, TIME_PRESETS } from "@/contexts/ChessContext"
import { Volume2, VolumeX, Palette, Cpu, User, RefreshCw, Save, Check, Zap } from "lucide-react"

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
  }, [])

  function saveSettings() {
    localStorage.setItem("arena-settings", JSON.stringify({ soundEnabled, boardTheme, pieceStyle }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetSettings() {
    localStorage.removeItem("arena-settings")
    setBoardTheme("brown")
    setPieceStyle("cburnett")
    setSoundEnabled(true)
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
