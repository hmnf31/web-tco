"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { computeStandings, LEAGUES, LC, type GameResult, type League, type Player, type Schedule } from "@/lib/league"
import LeagueAnalysisModal from "./LeagueAnalysisModal"

function Logo({ color }: { color: string }) {
  return (
    <div className="brand">
      <span className="brand-piece" style={{ color }}>♞</span><span>TCO</span><small>LEAGUE</small>
    </div>
  )
}

function Av({ name, color, size = 31, pp }: { name: string; color: string; size?: number; pp?: string }) {
  return (
    <span className="avatar" style={{ borderColor: color, width: size, height: size, fontSize: size < 30 ? 8 : 9 }}>
      {pp ? <img src={pp} alt="" /> : name.split(" ").map(x => x[0]).slice(0, 2).join("")}
    </span>
  )
}

function ScoreTag({ s1, s2 }: { s1: number; s2: number }) {
  const col = s1 > s2 ? "#65f396" : s1 < s2 ? "#ff6b7a" : "#c8d6e8"
  return <b style={{ color: col, fontFamily: "var(--font-oxanium), Oxanium", fontSize: 16 }}>{s1} — {s2}</b>
}

const RULES = [
  "Setiap player bermain melawan seluruh player di divisinya (Round Robin).",
  "Dua game Blitz 5 menit, warna bergantian, rated, menggunakan akun Chess.com utama.",
  "Waktu bermain ditentukan kedua pemain; koordinasi lewat japri atau grup TCO.",
  "Periode ronde: Senin 01.00 WIB hingga Minggu 19.00 WIB.",
  "Wajib lapor di grup TCO sebelum bermain. Tanpa laporan, match dianggap tidak sah.",
  "Dilarang bermain sambil live streaming. Hasil dilaporkan ke koordinator liga.",
  "WO: 1× −1 poin, 2× −3 poin, 3× diskualifikasi dari Liga.",
  "Akun dan nama akun tidak boleh diganti selama kompetisi berlangsung.",
  "Minimal 48 player tanpa batas maksimal; player diratakan tiap divisi.",
  "Promosi dan degradasi 2 pemain per musim antara liga yang berdekatan.",
]

export default function LeaguePage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [results, setResults] = useState<GameResult[]>([])
  const [season, setSeason] = useState("1")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [league, setLeague] = useState<League>("Liga 1")
  const [leagueTab, setLeagueTab] = useState<"standing" | "coming" | "results">("standing")
  const [view, setView] = useState<"league" | "rules">("league")
  const [analysis, setAnalysis] = useState<{ result: GameResult; schedule: Schedule } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/liga")
      .then(res => res.json())
      .then(body => {
        if (cancelled) return
        if (!body.data) throw new Error(body.error || "Gagal memuat data liga")
        setPlayers(body.data.players || [])
        setSchedules(body.data.schedules || [])
        setResults(body.data.results || [])
        setSeason(body.data.season || "1")
      })
      .catch(err => setError(err instanceof Error ? err.message : "Gagal memuat data liga"))
      .finally(() => setLoading(false))
    return () => { cancelled = true }
  }, [])

  const cfg = LC[league]
  const style = { "--league": cfg.color, "--league-soft": cfg.soft } as React.CSSProperties

  const rMap = useMemo(() => new Map(results.map(r => [r.schedule_id, r])), [results])
  const leaguePlayers = useMemo(() => players.filter(p => p.league === league), [players, league])
  const leagueSchedules = useMemo(() => schedules.filter(s => s.league === league), [schedules, league])
  const standings = useMemo(
    () => computeStandings(leaguePlayers, leagueSchedules, results),
    [leaguePlayers, leagueSchedules, results]
  )
  const comingUp = useMemo(
    () => leagueSchedules
      .filter(s => s.status === "upcoming" || s.status === "live")
      .sort((a, b) => a.round - b.round || (a.date + a.time).localeCompare(b.date + b.time)),
    [leagueSchedules]
  )
  const completed = useMemo(
    () => leagueSchedules.filter(s => s.status === "completed").sort((a, b) => b.date.localeCompare(a.date)),
    [leagueSchedules]
  )

  const getPlayer = (id: string) => players.find(p => p.id === id)

  const exportCsv = (type: "standing" | "coming" | "results") => {
    let csv = ""
    if (type === "standing") {
      csv = ["Posisi,Nama,Chess.com,ELO,MP,W,D,L,Poin",
        ...standings.map((p, i) => [i + 1, p.name, p.username, p.elo, p.mp, p.w, p.d, p.l, p.pts.toFixed(1)].join(","))].join("\n")
    } else if (type === "coming") {
      csv = ["Round,Tanggal,Jam,Status,Player 1,Player 2",
        ...comingUp.map(s => {
          const p1 = getPlayer(s.player1_id)
          const p2 = getPlayer(s.player2_id)
          return [s.round, s.date, s.time, s.status, p1?.name || "?", p2?.name || "?"].join(",")
        })].join("\n")
    } else {
      csv = ["Round,Tanggal,Player 1,Skor,Player 2",
        ...completed.map(s => {
          const r = rMap.get(s.id)
          const p1 = getPlayer(s.player1_id)
          const p2 = getPlayer(s.player2_id)
          return [s.round, s.date, p1?.name || "?", `${r?.score1}-${r?.score2}`, p2?.name || "?"].join(",")
        })].join("\n")
    }
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }))
    a.download = `tco-league-${league.toLowerCase().replace(" ", "-")}-s${season}-${type}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const openAnalysis = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    const result = rMap.get(scheduleId)
    if (schedule && result) setAnalysis({ schedule, result })
  }

  // ── Hero countdown ──
  const [now, setNow] = useState(0)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const nextMatch = useMemo(
    () => schedules
      .filter(s => s.status === "upcoming" || s.status === "live")
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0],
    [schedules]
  )
  const target = nextMatch?.date
    ? new Date(`${nextMatch.date}T${nextMatch.time || "19:00"}`).getTime()
    : null
  const diff = target && now ? Math.max(0, target - now) : 0
  const dd = Math.floor(diff / 86400000)
  const hh = Math.floor((diff % 86400000) / 3600000)
  const mm = Math.floor((diff % 3600000) / 60000)

  if (loading) {
    return (
      <div className="tco-league app-shell" style={style}>
        <div className="league-loading">
          <div><div className="spin" /><p className="muted">Memuat data liga…</p></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tco-league app-shell" style={style}>
        <div className="league-error">
          <div>
            <p className="eyebrow" style={{ color: "#ff6b7a" }}>TERJADI KESALAHAN</p>
            <p style={{ margin: "10px 0 20px" }}>{error}</p>
            <p className="muted">Pastikan tabel liga sudah dibuat di Supabase (migrasi 20260923000000_create_tco_league.sql).</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main style={style} className="tco-league app-shell">
      <div className="scanlines" />
      <header className="topbar">
        <Logo color={cfg.color} />
        <nav>
          <button onClick={() => setView("league")} className={view === "league" ? "active" : ""}>Liga</button>
          <button onClick={() => setView("rules")} className={view === "rules" ? "active" : ""}>Regulasi</button>
          <Link href="/admin/liga" style={{ color: "inherit", textDecoration: "none" }}>
            <button>Admin</button>
          </Link>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <button>← Website</button>
          </Link>
        </nav>
        <button className="live-pill"><i /> SEASON {String(season).padStart(2, "0")} ACTIVE</button>
      </header>

      {view === "league" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">TIKTOK CHESS ONLINE PRESENTS</p>
              <h1><small>LIGA CATUR</small>TCO <span>SEASON {String(season).padStart(2, "0")}</span></h1>
              <p className="subtitle">ROAD TO MASTER TCO — Kompetisi internal, empat kasta, satu arena.</p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => { setView("league"); setLeagueTab("coming") }}>Lihat Match Pekan Ini</button>
                <button className="text-btn" onClick={() => setView("rules")}>Pelajari aturan →</button>
              </div>
            </div>
            <div className="countdown">
              <span>RONDE BERIKUTNYA DIMULAI DALAM</span>
              <div><b>{String(dd).padStart(2, "0")}</b><b>{String(hh).padStart(2, "0")}</b><b>{String(mm).padStart(2, "0")}</b></div>
              <small>HARI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JAM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MENIT</small>
            </div>
          </section>

          <section className="league-picker">
            {LEAGUES.map(item => (
              <button key={item} onClick={() => { setLeague(item); setLeagueTab("standing") }} className={league === item ? "selected" : ""} style={{ "--item": LC[item].color } as React.CSSProperties}>
                <small>{["01", "02", "03", "04"][LEAGUES.indexOf(item)]}</small>
                <b>{item}</b><span>{LC[item].level}</span>
              </button>
            ))}
          </section>

          <section className="league-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow" style={{ color: cfg.color }}>{cfg.label}</p>
                <h2>TCO {league.toUpperCase()}</h2>
                <span>{cfg.level} · ROUND ROBIN · {leaguePlayers.length} PLAYER</span>
              </div>
              <div className="export-actions">
                <button onClick={() => exportCsv(leagueTab)}>⇩ EXPORT CSV</button>
                <button onClick={() => window.print()}>▣ EXPORT JPG</button>
              </div>
            </div>
            <div className="tabs">
              {(["standing", "coming", "results"] as const).map(t => (
                <button key={t} onClick={() => setLeagueTab(t)} className={leagueTab === t ? "selected" : ""}>
                  {t === "standing" ? "01 · Klasemen" : t === "coming" ? "02 · Coming Up" : "03 · Results"}
                </button>
              ))}
            </div>

            {leagueTab === "standing" && (
              <section className="table-shell">
                <div className="table-head"><span>POS</span><span>PEMAIN</span><span>ELO</span><span>MP</span><span>W</span><span>D</span><span>L</span><span>PTS</span></div>
                {standings.map((p, i) => (
                  <div key={p.id} className={`standing-row ${i < 2 ? "promotion" : i >= standings.length - 2 ? "relegation" : ""}`}>
                    <span className="position">{i + 1}{i < 2 ? " ↑" : i >= standings.length - 2 ? " ↓" : ""}</span>
                    <span className="player"><Av name={p.name} color={cfg.color} pp={p.pp} /><b>{p.name}</b><small>@{p.username}{p.elo_avg > 0 ? ` · AVG ${p.elo_avg}` : ""}{p.wo_count > 0 ? ` · WO×${p.wo_count}` : ""}{p.status === "disqualified" ? " · DIDISKUALIFIKASI" : ""}</small></span>
                    <span>{p.elo}</span><span>{p.mp}</span><span>{p.w}</span><span>{p.d}</span><span>{p.l}</span>
                    <strong>{p.pts.toFixed(1)}</strong>
                  </div>
                ))}
                {standings.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada peserta di {league}.</p>}
              </section>
            )}

            {leagueTab === "coming" && (
              <section className="match-list">
                {comingUp.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada jadwal coming up di {league}.</p>}
                {comingUp.map(s => {
                  const p1 = getPlayer(s.player1_id)
                  const p2 = getPlayer(s.player2_id)
                  return (
                    <article key={s.id} className="match-card">
                      <div className="match-meta">
                        <span>ROUND {String(s.round).padStart(2, "0")}</span>
                        <span>{new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {s.time} WIB</span>
                        <b>{s.status === "live" ? "🔴 LIVE THIS WEEK" : "COMING UP"}</b>
                      </div>
                      <div className="versus">
                        <div><Av name={p1?.name || "?"} color={cfg.color} pp={p1?.pp} /><strong>{p1?.name || "?"}</strong><small>{p1?.elo} ELO</small></div>
                        <em>VS</em>
                        <div><Av name={p2?.name || "?"} color={cfg.color} pp={p2?.pp} /><strong>{p2?.name || "?"}</strong><small>{p2?.elo} ELO</small></div>
                      </div>
                    </article>
                  )
                })}
              </section>
            )}

            {leagueTab === "results" && (
              <section className="results-list">
                {completed.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada hasil di {league}.</p>}
                {completed.map(s => {
                  const r = rMap.get(s.id)
                  const p1 = getPlayer(s.player1_id)
                  const p2 = getPlayer(s.player2_id)
                  if (!r) return null
                  return (
                    <article key={s.id} className="result-card">
                      <div>
                        <span className="round">ROUND {String(s.round).padStart(2, "0")} · {new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                        <h3>{p1?.name} <ScoreTag s1={Number(r.score1)} s2={Number(r.score2)} /> {p2?.name}</h3>
                        <p>Blitz 5+0 · 2 permainan · Rated{r.pgn ? " · PGN tersedia" : ""}</p>
                      </div>
                      <button className="outline-btn" onClick={() => openAnalysis(s.id)}>
                        {r.pgn ? "Analisis PGN ↗" : "Lihat Detail ↗"}
                      </button>
                    </article>
                  )
                })}
              </section>
            )}
          </section>
        </>
      )}

      {view === "rules" && (
        <section className="rules-page">
          <div className="rules-intro">
            <p className="eyebrow">PERATURAN RESMI</p>
            <h2>Main fair.<br /><span>Naik kasta.</span></h2>
            <p>Liga TCO dimainkan secara konsisten, sportif, dan terukur untuk menemukan Master TCO berikutnya.</p>
          </div>
          <div className="format-card">
            <div><span>KUOTA</span><b>MIN. 48</b><small>Tanpa batas maksimal</small></div>
            <div><span>FORMAT</span><b>4 DIVISI</b><small>Player diratakan tiap divisi</small></div>
            <div><span>PERTANDINGAN</span><b>2× BLITZ</b><small>5 menit per game</small></div>
          </div>
          <div className="rules-grid">
            <article>
              <p className="eyebrow">SYARAT PENDAFTARAN</p>
              <ol><li>Member TCO aktif.</li><li>Tidak mengganti akun / nama akun selama liga.</li><li>Komitmen bermain satu ronde per minggu.</li><li>Bersedia mengikuti seluruh regulasi Liga TCO.</li></ol>
            </article>
            <article>
              <p className="eyebrow">REGULASI LIGA</p>
              <ol>{RULES.map(r => <li key={r}>{r}</li>)}</ol>
            </article>
          </div>
        </section>
      )}

      {analysis && (
        <LeagueAnalysisModal
          schedule={analysis.schedule}
          result={analysis.result}
          players={players}
          onClose={() => setAnalysis(null)}
        />
      )}
    </main>
  )
}