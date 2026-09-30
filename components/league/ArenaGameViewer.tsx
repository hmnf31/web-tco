"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ExternalLink, Link2, Loader2, TriangleAlert, Users } from "lucide-react"
import { checkGameLink } from "@/lib/league"

type Pick = 1 | 2

interface GameSlot {
  pick: Pick
  url: string
  label: string
}

function buildSlots(sp: URLSearchParams): GameSlot[] {
  const slots: GameSlot[] = []
  const g1 = checkGameLink(sp.get("g1"))
  const g2 = checkGameLink(sp.get("g2"))
  if (g1.ok && g1.url) slots.push({ pick: 1, url: g1.url, label: "Game 1" })
  if (g2.ok && g2.url) slots.push({ pick: 2, url: g2.url, label: "Game 2" })
  return slots
}

function Viewer() {
  const sp = useSearchParams()
  const slots = useMemo(() => buildSlots(sp), [sp])
  const meta = useMemo(() => {
    const s1 = sp.get("s1")
    const s2 = sp.get("s2")
    return {
      league: sp.get("lg") || "",
      round: sp.get("r") || "",
      date: sp.get("d") || "",
      p1: sp.get("p1") || "?",
      p2: sp.get("p2") || "?",
      u1: sp.get("u1") || "",
      u2: sp.get("u2") || "",
      score: s1 !== null && s2 !== null ? `${s1} — ${s2}` : "",
    }
  }, [sp])

  const defaultPick = useMemo<Pick>(() => {
    const requested = Number(sp.get("pick"))
    return slots.some(s => s.pick === requested) ? (requested as Pick) : (slots[0]?.pick ?? 1)
  }, [sp, slots])

  // Override hanya berlaku selama query string tidak berubah, jadi tidak perlu effect.
  const [override, setOverride] = useState<{ key: string; pick: Pick } | null>(null)
  const slotsKey = slots.map(s => s.url).join("|")
  const active: Pick = override && override.key === slotsKey ? override.pick : defaultPick

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const current = slots.find(s => s.pick === active) ?? slots[0]
  const loading = Boolean(current) && loadedUrl !== current?.url

  if (slots.length === 0) {
    return (
      <div className="mx-auto max-w-lg border border-white/[0.08] bg-[#0d0d0e] p-8 text-center">
        <span className="mono-label-sm text-[#ffb454]">BELUM ADA GAME</span>
        <h1 className="mt-3 text-2xl font-bold text-white">Belum ada link game Chessigma</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">
          Buka tab <b className="text-white">03 · Results</b> di halaman Liga TCO, lalu klik
          <b className="text-white"> Analisis Game 1</b> atau <b className="text-white"> Analisis Game 2</b>.
          Admin menginput link game setiap pertandingan di panel admin Liga.
        </p>
        <a
          href="/liga"
          className="mono-label-sm mt-6 inline-flex items-center gap-1.5 border border-white/[0.16] px-3 py-2 text-white transition-colors hover:border-[#00d9ff] hover:text-[#00d9ff]"
        >
          Buka halaman Liga
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {meta.league && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-white/[0.08] bg-[#0d0d0e] px-3 py-2">
          <span className="mono-label-sm text-[#00d9ff]">{meta.league}</span>
          {meta.round && <span className="mono-label-sm text-[#8e9192]">ROUND {meta.round}</span>}
          {meta.date && <span className="mono-label-sm text-[#5c5f60]">{meta.date}</span>}
          {meta.score && (
            <span className="mono-label-sm text-white">
              {meta.p1} <span className="text-[#00d9ff]">{meta.score}</span> {meta.p2}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {slots.map(s => (
          <button
            key={s.pick}
            onClick={() => setOverride({ key: slotsKey, pick: s.pick })}
            className={`mono-label-sm border px-3 py-1.5 transition-colors ${
              active === s.pick
                ? "border-[#00d9ff] bg-[#00d9ff]/10 text-[#00d9ff]"
                : "border-white/[0.12] text-[#8e9192] hover:border-white/[0.28] hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
        {current && (
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label-sm ml-auto flex items-center gap-1.5 text-[#8e9192] transition-colors hover:text-white"
          >
            Buka di Chessigma <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="relative aspect-[4/3] w-full border border-white/[0.08] bg-[#0d0d0e]">
        {current && (
          <iframe
            key={current.url}
            src={current.url}
            title={`Liga TCO ${meta.league} — ${current.label}`}
            className="h-full w-full border-0"
            allow="clipboard-write; fullscreen"
            onLoad={() => setLoadedUrl(current.url)}
          />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#0d0d0e] text-[#8e9192]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="mono-label-sm">MEMUAT GAME…</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border border-white/[0.08] bg-[#0d0d0e] px-3 py-2">
        <span className="mono-label-sm flex items-center gap-1.5 text-[#8e9192]">
          <Users className="h-3 w-3" />
          {meta.p1}{meta.u1 ? ` (@${meta.u1})` : ""} vs {meta.p2}{meta.u2 ? ` (@${meta.u2})` : ""}
        </span>
        <span className="mono-label-sm flex items-center gap-1.5 text-[#5c5f60]">
          <TriangleAlert className="h-3 w-3" />
          Memuat game dari chessigma.com — perlu koneksi internet
        </span>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#5c5f60]">
        <Link2 className="mt-0.5 h-3 w-3 shrink-0" />
        Kalau halaman tetap kosong, buka link game di tab baru lalu pilih <b>Fullscreen</b> atau
        <b> Board view</b> di dalam Chessigma.
      </p>
    </div>
  )
}

export default function ArenaGameViewer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-20 text-[#8e9192]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="mono-label-sm">MEMUAT…</span>
        </div>
      }
    >
      <Viewer />
    </Suspense>
  )
}
