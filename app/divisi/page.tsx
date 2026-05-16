"use client"

import { useState, useEffect } from "react"
import { Swords, Castle, ChevronRight, ExternalLink, Clock, X, Globe, Users, Trophy, Loader2 } from "lucide-react"

const chessPlayers = [
  { username: "45had0w" },
  { username: "69hehehehehehehehehehe69" },
  { username: "aanmarino" },
  { username: "Abdi0324" },
  { username: "Abdul_493" },
  { username: "adikember" },
  { username: "adwar3184" },
  { username: "afiatul" },
  { username: "Ai_isdarliansyah" },
  { username: "Akun_Pemalu" },
  { username: "Akun_Pemaluu" },
  { username: "andre_31_1993" },
  { username: "arshakabumi" },
  { username: "asaches03" },
  { username: "BaldwinKingsIV" },
  { username: "blitzkkrieg" },
  { username: "Blunders69" },
  { username: "bobob77" },
  { username: "bung_iky" },
  { username: "carilho_pablo_eskobar199" },
  { username: "carilho_pablo_eskobar1993" },
  { username: "caturaga2018" },
  { username: "CH3VROLET" },
  { username: "chessjunior0" },
  { username: "Chris_Amoeba" },
  { username: "Depri_i" },
  { username: "Derpandora" },
  { username: "dewacucibaju" },
  { username: "diah89" },
  { username: "El_NorthDoustan" },
  { username: "Fans-TLID-RAFFY" },
  { username: "Galih_Citra" },
  { username: "gtempur" },
  { username: "Harjay_TCO" },
  { username: "Heex86" },
  { username: "indra11611" },
  { username: "IwanTambunan" },
  { username: "Iyus_515" },
  { username: "KingWalkVariations" },
  { username: "KKajow" },
  { username: "Kudojingkrak" },
  { username: "Linnxyn" },
  { username: "Liyaannnnnnn" },
  { username: "LoveAyyme" },
  { username: "mal_21j" },
  { username: "Munaa377" },
  { username: "Ochhi_03" },
  { username: "Official_TCO" },
  { username: "oke23q" },
  { username: "Pak_RT_05" },
  { username: "PangeranKe17" },
  { username: "patris01" },
  { username: "Pixelfern8" },
  { username: "PutraRian" },
  { username: "rais88" },
  { username: "rendi-Yanto" },
  { username: "Restu_Azikusuma" },
  { username: "Revelation_T" },
  { username: "runarunarunaruna" },
  { username: "Shakabumi" },
  { username: "StreetChess0502" },
  { username: "Sulfancuk" },
  { username: "SultanAulia" },
  { username: "Supri_adi_22" },
  { username: "szeschaa" },
  { username: "TCO_Constantine" },
  { username: "TCO_JAYA" },
  { username: "TeddyPlays_IG" },
  { username: "TheDartVine" },
  { username: "vozodd" },
  { username: "vpol3" },
  { username: "W-indrayana" },
  { username: "W_Ochhi" },
  { username: "XICOLAGI" },
]

const mlbbPlayers = [
  { id: 1, username: "MrTheodore", role: "Jungler", tier: "Mythical Glory" },
  { id: 2, username: "ManaluJr", role: "Mid Lane", tier: "Mythical Honor" },
  { id: 3, username: "Afiatul", role: "Roamer", tier: "Mythic" },
  { id: 4, username: "Munaa377", role: "Gold Lane", tier: "Mythic" },
  { id: 5, username: "RennChess", role: "Exp Lane", tier: "Legend" },
]

type PlayerProfile = {
  username: string
  name: string
  avatar: string
  country: string
  bullet: number
  blitz: number
  rapid: number
}

type ClubInfo = {
  name: string
  description: string
  members: number
}

export default function DivisiPage() {
  const [tab, setTab] = useState<"chess" | "mlbb">("chess")
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null)
  const [loadingPlayer, setLoadingPlayer] = useState(false)
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null)
  const [loadingClub, setLoadingClub] = useState(true)

  useEffect(() => {
    async function fetchClub() {
      try {
        const res = await fetch("https://api.chess.com/pub/club/turnamen-tiktok-chess-online-club")
        if (!res.ok) return
        const data = await res.json()
        setClubInfo({ name: data.name, description: data.description, members: data.members_count })
      } catch { /* */ } finally { setLoadingClub(false) }
    }
    fetchClub()
  }, [])

  async function openPlayerPopup(username: string) {
    setLoadingPlayer(true)
    setSelectedPlayer(null)
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch(`https://api.chess.com/pub/player/${username}`),
        fetch(`https://api.chess.com/pub/player/${username}/stats`),
      ])
      if (!profileRes.ok || !statsRes.ok) throw new Error("Gagal")
      const profile = await profileRes.json()
      const stats = await statsRes.json()
      setSelectedPlayer({
        username: profile.username,
        name: profile.name || profile.username,
        avatar: profile.avatar || "",
        country: (profile.country || "").split("/").pop() || "",
        bullet: stats.chess_bullet?.last?.rating || 0,
        blitz: stats.chess_blitz?.last?.rating || 0,
        rapid: stats.chess_rapid?.last?.rating || 0,
      })
    } catch {
      setSelectedPlayer({ username, name: username, avatar: "", country: "", bullet: 0, blitz: 0, rapid: 0 })
    } finally { setLoadingPlayer(false) }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Divisi & Turnamen</h1>
        <p className="mt-2 text-white/50">Jelajahi dua lini kompetitif TCO Esports</p>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex justify-center">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setTab("chess")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              tab === "chess"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Castle className="h-4 w-4" />
            Chess Division
          </button>
          <button
            onClick={() => setTab("mlbb")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              tab === "mlbb"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Swords className="h-4 w-4" />
            MLBB Division
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-10">
        {tab === "chess" ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Chess Info */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <Castle className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-4 text-xl font-bold text-white">TCO Chess</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Divisi catur TCO berkompetisi di turnamen reguler Arena Kings dan Liga Komunitas.
                Kami memiliki pemain-pemain berbakat dari seluruh Indonesia.
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Club Stats</h3>
                {loadingClub ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/40"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</div>
                ) : clubInfo ? (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs"><Users className="h-3 w-3 text-cyan-400" /><span className="text-white/60">Anggota:</span><span className="font-medium text-white">{clubInfo.members}</span></div>
                    <div className="flex items-center gap-2 text-xs"><Trophy className="h-3 w-3 text-yellow-400" /><span className="text-white/60">Peringkat:</span><span className="font-medium text-white">#3 Arena Kings Mei 2026</span></div>
                  </div>
                ) : <p className="mt-2 text-xs text-white/30">Gagal memuat data club</p>}
              </div>
              <a
                href="https://www.chess.com/club/turnamen-tiktok-chess-online-club"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              >
                <ExternalLink className="h-4 w-4" />
                Gabung Chess.com Club
              </a>
            </div>

             {/* Chess Leaderboard */}
             <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
               <h3 className="text-lg font-bold text-white">Member TCO Internal ({chessPlayers.length})</h3>
              <div className="mt-4 max-h-[600px] space-y-2 overflow-y-auto">
                {chessPlayers.map((p, i) => (
                  <button
                    key={p.username}
                    onClick={() => openPlayerPopup(p.username)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/5 px-4 py-3 transition-all hover:border-cyan-400/20 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          i === 0
                            ? "bg-yellow-400/10 text-yellow-400"
                            : i === 1
                              ? "bg-gray-400/10 text-gray-400"
                              : i === 2
                                ? "bg-orange-400/10 text-orange-400"
                                : "bg-white/5 text-white/50"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-white/80">{p.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* MLBB Info */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <Swords className="h-8 w-8 text-yellow-400" />
              <h2 className="mt-4 text-xl font-bold text-white">TCO Mobile Legends</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Divisi MLBB TCO sedang dalam masa pengembangan roster inti. Kami mencari
                talenta-talenta terbaik untuk bertanding di Land of Dawn.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-3 py-1 text-xs font-medium text-green-400">
                Recruitment: Open
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-400">
                <Clock className="h-3 w-3" />
                Pendaftaran: Coming Soon
              </div>
            </div>

            {/* MLBB Leaderboard */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-lg font-bold text-white">Roster Tim Inti</h3>
              <div className="mt-4 space-y-2">
                {mlbbPlayers.map((p) => (
                  <div
                    key={p.username}
                    className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 transition-all hover:border-yellow-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-white/50">
                        {p.id}
                      </span>
                      <div>
                        <span className="text-sm text-white/80">{p.username}</span>
                        <span className="ml-2 text-xs text-white/40">{p.role}</span>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-400">{p.tier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Detail Popup */}
      {(loadingPlayer || selectedPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedPlayer(null); setLoadingPlayer(false) }}>
          <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedPlayer(null); setLoadingPlayer(false) }}
              className="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition-colors hover:text-white">
              <X className="h-4 w-4" />
            </button>

            {loadingPlayer ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="text-sm text-white/50">Memuat data pemain...</p>
              </div>
            ) : selectedPlayer && (
              <>
                <div className="flex flex-col items-center gap-3">
                  {selectedPlayer.avatar ? (
                    <img src={selectedPlayer.avatar} alt={selectedPlayer.username}
                      className="h-20 w-20 rounded-full border-2 border-cyan-400/30 object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 text-2xl font-bold text-cyan-400">
                      {selectedPlayer.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{selectedPlayer.name}</p>
                    <p className="text-xs text-cyan-400">@{selectedPlayer.username}</p>
                  </div>
                  {selectedPlayer.country && (
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Globe className="h-3 w-3" /> {selectedPlayer.country}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Bullet", rating: selectedPlayer.bullet, color: "text-red-400", border: "border-red-400/20" },
                    { label: "Blitz", rating: selectedPlayer.blitz, color: "text-orange-400", border: "border-orange-400/20" },
                    { label: "Rapid", rating: selectedPlayer.rapid, color: "text-green-400", border: "border-green-400/20" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl border ${s.border} bg-white/[0.02] p-3 text-center`}>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{s.label}</p>
                      <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.rating || "-"}</p>
                    </div>
                  ))}
                </div>

                <a href={`https://chess.com/member/${selectedPlayer.username}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                  <ExternalLink className="h-3.5 w-3.5" /> Lihat Profil di Chess.com
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center">
        <a
          href={tab === "chess" ? "https://www.chess.com/club/turnamen-tiktok-chess-online-club" : "#"}
          target={tab === "chess" ? "_blank" : undefined}
          rel={tab === "chess" ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
        >
          {tab === "chess" ? "Gabung Chess.com Club" : "Coming Soon"}
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
