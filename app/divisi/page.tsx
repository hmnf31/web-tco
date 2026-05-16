"use client"

import { useState } from "react"
import { Swords, Castle, ChevronRight, ExternalLink, Clock } from "lucide-react"

const chessPlayers = [
  { rank: 1, username: "blitzkkrieg", score: "2307" },
  { rank: 2, username: "mal_21j", score: "2186" },
  { rank: 3, username: "Sultan_Aulia", score: "2181" },
  { rank: 4, username: "BaldwinKingsIV", score: "2142" },
  { rank: 5, username: "TeddyPlays_IG", score: "2099" },
  { rank: 6, username: "Kkjow", score: "2079" },
  { rank: 7, username: "Blunders69", score: "2069" },
  { rank: 8, username: "Abdi0324", score: "2028" },
  { rank: 9, username: "Iyus_515", score: "2013" },
  { rank: 10, username: "Harjay_TCO", score: "2011" },
  { rank: 11, username: "LoveAyyme", score: "1996" },
  { rank: 12, username: "Ai_isdarliansyah", score: "1949" },
  { rank: 13, username: "Bobob77", score: "1903" },
  { rank: 14, username: "Sulfancuk", score: "1891" },
  { rank: 15, username: "Akun pemalu", score: "1889" },
  { rank: 16, username: "Caturaga2018", score: "1847" },
  { rank: 17, username: "supri_adi_22", score: "1808" },
  { rank: 18, username: "Depri_i", score: "1792" },
  { rank: 19, username: "Pak_Rt_05", score: "1785" },
  { rank: 20, username: "shakabumi", score: "1761" },
  { rank: 21, username: "Rusli_26", score: "1746" },
  { rank: 22, username: "asaches03", score: "1705" },
  { rank: 23, username: "Bung_iky", score: "1689" },
  { rank: 24, username: "Streetchess 🤘", score: "1685" },
  { rank: 25, username: "Restu_Azikusuma", score: "1681" },
  { rank: 26, username: "diah89", score: "1654" },
  { rank: 27, username: "TheDartVine", score: "1621" },
  { rank: 28, username: "vozodd", score: "1571" },
  { rank: 29, username: "Adikember", score: "1549" },
  { rank: 30, username: "carilho_pablo_eskobar1993", score: "1542" },
  { rank: 31, username: "TCO_Constantine", score: "1487" },
  { rank: 32, username: "chris_amoeba", score: "1376" },
  { rank: 33, username: "Afiatul", score: "1329" },
  { rank: 34, username: "PutraRian", score: "1317" },
  { rank: 35, username: "69hehehehehehehehehehe69", score: "1268" },
  { rank: 36, username: "adwar3184", score: "1191" },
  { rank: 37, username: "Dewacucibaju", score: "1170" },
  { rank: 38, username: "pixelfern8", score: "962" },
  { rank: 39, username: "szeschaa", score: "754" },
]

const mlbbPlayers = [
  { id: 1, username: "MrTheodore", role: "Jungler", tier: "Mythical Glory" },
  { id: 2, username: "ManaluJr", role: "Mid Lane", tier: "Mythical Honor" },
  { id: 3, username: "Afiatul", role: "Roamer", tier: "Mythic" },
  { id: 4, username: "Munaa377", role: "Gold Lane", tier: "Mythic" },
  { id: 5, username: "RennChess", role: "Exp Lane", tier: "Legend" },
]

export default function DivisiPage() {
  const [tab, setTab] = useState<"chess" | "mlbb">("chess")

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
              <a
                href="https://chess.com/club/tco"
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
              <h3 className="text-lg font-bold text-white">Top Players ({chessPlayers.length})</h3>
              <div className="mt-4 max-h-[600px] space-y-2 overflow-y-auto">
                {chessPlayers.map((p) => (
                  <a
                    key={p.username}
                    href={`https://chess.com/member/${p.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 transition-all hover:border-cyan-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          p.rank === 1
                            ? "bg-yellow-400/10 text-yellow-400"
                            : p.rank === 2
                              ? "bg-gray-400/10 text-gray-400"
                              : p.rank === 3
                                ? "bg-orange-400/10 text-orange-400"
                                : "bg-white/5 text-white/50"
                        }`}
                      >
                        {p.rank}
                      </span>
                      <span className="text-sm text-white/80">{p.username}</span>
                    </div>
                    <span className="text-sm text-cyan-400">{p.score}</span>
                  </a>
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

      {/* CTA */}
      <div className="mt-12 text-center">
        <a
          href={tab === "chess" ? "https://chess.com/club/tco" : "#"}
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
