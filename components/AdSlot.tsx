"use client"

import { useState } from "react"
import { X } from "lucide-react"

type AdSlotType = "leaderboard" | "sidebar" | "mobile-sticky"

const DIMENSIONS: Record<AdSlotType, { width: string; height: string }> = {
  leaderboard: { width: "w-full", height: "h-[90px]" },
  sidebar: { width: "w-full", height: "min-h-[250px] md:min-h-[600px]" },
  "mobile-sticky": { width: "w-full", height: "h-[60px]" },
}

export default function AdSlot({ type, className = "" }: { type: AdSlotType; className?: string }) {
  const [dismissed, setDismissed] = useState(false)
  const dims = DIMENSIONS[type]

  if (type === "mobile-sticky" && dismissed) return null

  const content = (
    <div
      className={`${dims.width} ${dims.height} flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] ${className}`}
    >
      <div className="text-center">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/15">ADVERTISEMENT</p>
        <p className="mt-1 text-[10px] text-white/10">— Ad Space Available —</p>
      </div>
    </div>
  )

  if (type === "mobile-sticky") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
        <div className="relative mx-auto max-w-7xl px-2 pb-2">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white/40 hover:text-white"
            aria-label="Tutup iklan"
          >
            <X className="h-3 w-3" />
          </button>
          {content}
        </div>
      </div>
    )
  }

  return content
}
