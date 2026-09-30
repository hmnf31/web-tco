"use client"

import { Suspense, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ExternalLink, Link2, Loader2, Search, TriangleAlert, Users, X } from "lucide-react"
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

// Input manual untuk user biasa: tempel link Chessigma sendiri, tanpa lewat Liga Results.
function ManualInput({ onLoad, onClose }: { onLoad: (url: string) => void; onClose: () => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const check = checkGameLink(value)
    if (!check.ok) { setError(check.reason); return }
    if (!check.url) { setError("Link game belum diisi"); return }
    setError(null)
    onLoad(check.url)
  }

  return (
    <form onSubmit={submit} className="border border-white/[0.08] bg-[#0d0d0e] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mono-label-sm text-[#ffb454]">ANALISIS GAME SENDIRI</span>
          <p className="mt-1 text-sm text-[#8e9192]">
            Tempel link game dari <b className="text-white">chessigma.com</b>, lalu move demi move bisa
            dipelajari di bawah.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup input link game"
          className="shrink-0 text-[#5c5f60] transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          inputMode="url"
          value={value}
          onChange={e => { setValue(e.target.value); if (error) setError(null) }}
          placeholder="https://www.chessigma.com/game/..."
          aria-label="Link game Chessigma"
          aria-invalid={Boolean(error)}
          className="mono-label-sm min-w-0 flex-1 border border-white/[0.12] bg-black/40 px-3 py-2 text-white placeholder:text-[#5c5f60] focus:border-[#00d9ff] focus:outline-none"
        />
        <button
          type="submit"
          className="mono-label-sm flex items-center justify-center gap-1.5 border border-[#00d9ff] bg-[#00d9ff]/10 px-4 py-2 text-[#00d9ff] transition-colors hover:bg-[#00d9ff]/20"
        >
          <Search className="h-3 w-3" />
          Muat Game
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-[#ff3aae]">{error}</p>}
    </form>
  )
}

function Viewer() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [showInput, setShowInput] = useState(false)
  const slots = useMemo(() => buildSlots(sp), [sp])

  // Link manual ditulis ke query string, sama seperti link dari Liga Results,
  // supaya bisa di-share, di-bookmark, dan di-back-button.
  function loadManual(url: string) {
    const q = new URLSearchParams(sp.toString())
    q.set("g1", url)
    q.delete("g2")
    q.delete("pick")
    router.replace(`${pathname}?${q.toString()}`)
    setShowInput(false)
  }
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
      <div className="mx-auto max-w-lg space-y-4">
        <div className="border border-white/[0.08] bg-[#0d0d0e] p-8 text-center">
          <span className="mono-label-sm text-[#ffb454]">BELUM ADA GAME</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Analisis game Liga TCO</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">
            Tempel link game dari <b className="text-white">chessigma.com</b> untuk memuat papan
            analisis move demi move, atau buka tab <b className="text-white">03 · Results</b> di
            halaman Liga TCO untuk melihat game yang sudah diinput admin.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="mono-label-sm flex w-full items-center justify-center gap-1.5 border border-[#00d9ff] bg-[#00d9ff]/10 px-4 py-2.5 text-[#00d9ff] transition-colors hover:bg-[#00d9ff]/20 sm:w-auto"
            >
              <Search className="h-3 w-3" />
              Tempel Link Game
            </button>
            <a
              href="/liga"
              className="mono-label-sm flex w-full items-center justify-center gap-1.5 border border-white/[0.16] px-4 py-2.5 text-white transition-colors hover:border-[#00d9ff] hover:text-[#00d9ff] sm:w-auto"
            >
              Buka halaman Liga
            </a>
          </div>
        </div>
        {showInput && <ManualInput onLoad={loadManual} onClose={() => setShowInput(false)} />}
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
        <button
          type="button"
          onClick={() => setShowInput(v => !v)}
          className={`mono-label-sm border px-3 py-1.5 transition-colors ${
            showInput
              ? "border-[#ffb454] bg-[#ffb454]/10 text-[#ffb454]"
              : "border-white/[0.12] text-[#8e9192] hover:border-white/[0.28] hover:text-white"
          }`}
        >
          {showInput ? "Tutup" : "Ganti Link"}
        </button>
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

      {showInput && <ManualInput onLoad={loadManual} onClose={() => setShowInput(false)} />}

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
