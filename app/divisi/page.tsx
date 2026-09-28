"use client"

import { useState, useEffect } from "react"
import { Swords, Castle, ChevronRight, ExternalLink, Clock, X, Globe, Users, Trophy, Loader2 } from "lucide-react"
import { DEFAULT_DIVISION_PLAYERS, type DivisionPlayer } from "@/lib/divisions"

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
  const [divisionPlayers, setDivisionPlayers] = useState<DivisionPlayer[]>(DEFAULT_DIVISION_PLAYERS)
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

  useEffect(() => {
    fetch("/api/divisions")
      .then(res => res.json())
      .then(body => { if (Array.isArray(body.data) && body.data.length) setDivisionPlayers(body.data) })
      .catch(() => {})
  }, [])

  const displayChessPlayers = divisionPlayers.filter(player => player.division === "Chess")
  const displayMlbbPlayers = divisionPlayers.filter(player => player.division === "MLBB")

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
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mono-label text-[#8e9192]">Divisi &amp; Turnamen</span>
          <h1 className="display-xl mt-5 text-4xl text-white sm:text-6xl">
            Divisi &amp;<br />Turnamen
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#c4c7c8] lg:text-right">
          Jelajahi dua lini kompetitif TCO Esports
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-12 flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-6">
        <button
          onClick={() => setTab("chess")}
          className={`mono-label flex items-center gap-2 border px-5 py-3 transition-colors ${
            tab === "chess"
              ? "border-white bg-white text-[#080808]"
              : "border-white/[0.16] text-[#c4c7c8] hover:border-white hover:text-white"
          }`}
        >
          <Castle className="h-4 w-4" />
          Chess Division
        </button>
        <button
          onClick={() => setTab("mlbb")}
          className={`mono-label flex items-center gap-2 border px-5 py-3 transition-colors ${
            tab === "mlbb"
              ? "border-white bg-white text-[#080808]"
              : "border-white/[0.16] text-[#c4c7c8] hover:border-white hover:text-white"
          }`}
        >
          <Swords className="h-4 w-4" />
          MLBB Division
        </button>
      </div>

      {/* Content */}
      <div className="mt-10">
        {tab === "chess" ? (
          <div className="grid gap-px border border-white/[0.08] bg-white/[0.08] lg:grid-cols-2">
            {/* Chess Info */}
            <div className="bg-[#0f0f10] p-8">
              <Castle className="h-7 w-7 text-white" />
              <h2 className="mt-5 font-display text-2xl font-semibold uppercase tracking-tight text-white">TCO Chess</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8e9192]">
                Divisi catur TCO berkompetisi di turnamen reguler Arena Kings dan Liga Komunitas.
                Kami memiliki pemain-pemain berbakat dari seluruh Indonesia.
              </p>
              <div className="mt-6 border border-white/[0.08] bg-[#080808] p-5">
                <h3 className="mono-label text-[#444748]">Club Stats</h3>
                {loadingClub ? (
                  <div className="mono-label-sm mt-3 flex items-center gap-2 text-[#8e9192]"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</div>
                ) : clubInfo ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs"><Users className="h-3.5 w-3.5 text-[#8e9192]" /><span className="text-[#8e9192]">Anggota:</span><span className="font-medium text-white">{clubInfo.members}</span></div>
                    <div className="flex items-center gap-2 text-xs"><Trophy className="h-3.5 w-3.5 text-[#8e9192]" /><span className="text-[#8e9192]">Peringkat:</span><span className="font-medium text-white">#3 Arena Kings Mei 2026</span></div>
                  </div>
                ) : <p className="mono-label-sm mt-3 text-[#444748]">Gagal memuat data club</p>}
              </div>
              <a
                href="https://www.chess.com/club/turnamen-tiktok-chess-online-club"
                target="_blank"
                rel="noopener noreferrer"
                className="mono-label-sm mt-6 inline-flex items-center gap-2 text-white underline-offset-4 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Gabung Chess.com Club
              </a>
            </div>

             {/* Chess Leaderboard */}
             <div className="bg-[#0f0f10] p-8">
               <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-4">
                 <h3 className="font-display text-lg font-semibold text-white">Member TCO Internal</h3>
                  <span className="mono-label text-[#444748]">{`${displayChessPlayers.length} // Atlet`}</span>
               </div>
              <div className="mt-2 max-h-[600px] overflow-y-auto">
                {displayChessPlayers.map((p, i) => (
                  <button
                    key={p.username}
                    onClick={() => openPlayerPopup(p.username)}
                    className="flex w-full items-center gap-4 border-b border-white/[0.08] px-1 py-3.5 text-left transition-colors hover:bg-[#161718]"
                  >
                    <span className="mono-label w-8 shrink-0 text-[#444748]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[#c4c7c8]">{p.username}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#444748]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-px border border-white/[0.08] bg-white/[0.08] lg:grid-cols-2">
            {/* MLBB Info */}
            <div className="bg-[#0f0f10] p-8">
              <Swords className="h-7 w-7 text-white" />
              <h2 className="mt-5 font-display text-2xl font-semibold uppercase tracking-tight text-white">TCO Mobile Legends</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8e9192]">
                Divisi MLBB TCO sedang dalam masa pengembangan roster inti. Kami mencari
                talenta-talenta terbaik untuk bertanding di Land of Dawn.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="pill">Recruitment: Open</span>
                <span className="pill">
                  <Clock className="h-3 w-3" />
                  Pendaftaran: Coming Soon
                </span>
              </div>
            </div>

            {/* MLBB Leaderboard */}
            <div className="bg-[#0f0f10] p-8">
              <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-4">
                <h3 className="font-display text-lg font-semibold text-white">Roster Tim Inti</h3>
                <span className="mono-label text-[#444748]">{`${displayMlbbPlayers.length} // Atlet`}</span>
              </div>
              <div className="mt-2">
                {displayMlbbPlayers.map((p, i) => (
                  <div
                    key={p.username}
                    className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-1 py-3.5 transition-colors hover:bg-[#161718]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="mono-label w-8 shrink-0 text-[#444748]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm text-white">{p.username}</span>
                        {p.role && <span className="mono-label-sm ml-2 text-[#444748]">{p.role}</span>}
                      </div>
                    </div>
                    {p.tier && <span className="mono-label-sm shrink-0 text-[#c4c7c8]">{p.tier}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Detail Popup */}
      {(loadingPlayer || selectedPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/92 p-4" onClick={() => { setSelectedPlayer(null); setLoadingPlayer(false) }}>
          <div className="relative w-full max-w-sm border border-white/[0.16] bg-[#161718] p-7" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedPlayer(null); setLoadingPlayer(false) }}
              className="absolute right-4 top-4 p-1 text-[#8e9192] transition-colors hover:text-white">
              <X className="h-4 w-4" />
            </button>

            {loadingPlayer ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
                <p className="mono-label-sm text-[#8e9192]">Memuat data pemain...</p>
              </div>
            ) : selectedPlayer && (
              <>
                <div className="flex flex-col items-center gap-3">
                  {selectedPlayer.avatar ? (
                    <img src={selectedPlayer.avatar} alt={selectedPlayer.username}
                      className="h-20 w-20 border border-white/[0.16] object-cover photo-mono" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center border border-white/[0.16] bg-[#0f0f10] text-2xl font-bold text-white">
                      {selectedPlayer.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-display text-lg font-semibold text-white">{selectedPlayer.name}</p>
                    <p className="mono-label-sm text-[#8e9192]">@{selectedPlayer.username}</p>
                  </div>
                  {selectedPlayer.country && (
                    <div className="mono-label-sm flex items-center gap-1 text-[#444748]">
                      <Globe className="h-3 w-3" /> {selectedPlayer.country}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-px border border-white/[0.08] bg-white/[0.08]">
                  {[
                    { label: "Bullet", rating: selectedPlayer.bullet },
                    { label: "Blitz", rating: selectedPlayer.blitz },
                    { label: "Rapid", rating: selectedPlayer.rapid },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#0f0f10] p-3 text-center">
                      <p className="mono-label text-[#444748]">{s.label}</p>
                      <p className="mt-1 font-display text-lg font-semibold text-white">{s.rating || "-"}</p>
                    </div>
                  ))}
                </div>

                <a href={`https://chess.com/member/${selectedPlayer.username}`} target="_blank" rel="noopener noreferrer"
                  className="btn-primary mt-5 w-full !py-3">
                  <ExternalLink className="h-3.5 w-3.5" /> Lihat Profil di Chess.com
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12">
        <a
          href={tab === "chess" ? "https://www.chess.com/club/turnamen-tiktok-chess-online-club" : "#"}
          target={tab === "chess" ? "_blank" : undefined}
          rel={tab === "chess" ? "noopener noreferrer" : undefined}
          className="btn-primary"
        >
          {tab === "chess" ? "Gabung Chess.com Club" : "Coming Soon"}
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
