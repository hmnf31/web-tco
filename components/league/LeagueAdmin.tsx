"use client"

import { useEffect, useMemo, useState } from "react"
import { validateAdmin, type AdminUser } from "@/lib/admin-auth"
import {
  LEAGUES, LC, SCORE_OPTS, computeStandings,
  type GameResult, type League, type Player, type Schedule,
} from "@/lib/league"

type AdminTab = "players" | "schedule" | "score" | "season" | "sheet"

async function apiCall(
  path: string,
  token: string,
  options: { method?: string; body?: unknown } = {}
) {
  const res = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`)
  return body
}

function Logo() {
  return (
    <div className="brand">
      <span className="brand-piece">♞</span><span>TCO</span><small>LEAGUE</small>
    </div>
  )
}

function Av({ name, color, size = 31 }: { name: string; color: string; size?: number }) {
  return (
    <span className="avatar" style={{ borderColor: color, width: size, height: size, fontSize: size < 30 ? 8 : 9 }}>
      {name.split(" ").map(x => x[0]).slice(0, 2).join("")}
    </span>
  )
}

function ScoreTag({ s1, s2 }: { s1: number; s2: number }) {
  const col = s1 > s2 ? "#65f396" : s1 < s2 ? "#ff6b7a" : "#c8d6e8"
  return <b style={{ color: col, fontFamily: "var(--font-oxanium), Oxanium", fontSize: 16 }}>{s1} — {s2}</b>
}

// ── Admin: Players ────────────────────────────────────────────────────────────
function AdminPlayers({
  players, setPlayers, token, onSeeded,
}: {
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  token: string
  onSeeded: () => void
}) {
  const [form, setForm] = useState({ name: "", username: "", league: "Liga 1" as League, elo: "" })
  const [editId, setEditId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState("")
  const [filter, setFilter] = useState<League | "">("")
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const displayed = filter ? players.filter(p => p.league === filter) : players

  const fetchChesscom = async () => {
    if (!form.username.trim()) return
    setFetching(true); setFetchErr("")
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${form.username.trim()}/stats`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const elo = data.chess_blitz?.last?.rating || data.chess_rapid?.last?.rating || 0
      if (!elo) throw new Error()
      setForm(f => ({ ...f, elo: String(elo) }))
    } catch {
      setFetchErr("Gagal ambil data. Isi ELO secara manual.")
    } finally {
      setFetching(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { id: editId || undefined, name: form.name, username: form.username, league: form.league, elo: Number(form.elo) }
      await apiCall("/api/admin/liga/players", token, { method: "POST", body })
      if (editId) {
        setPlayers(prev => prev.map(p => p.id === editId ? { ...p, name: body.name, username: body.username, league: body.league, elo: body.elo } : p))
        setEditId(null)
      } else {
        const res = await apiCall("/api/admin/liga/players", token)
        if (Array.isArray(res.data)) setPlayers(res.data)
      }
      setForm({ name: "", username: "", league: "Liga 1", elo: "" }); setFetchErr("")
    } catch (err) {
      setFetchErr(err instanceof Error ? err.message : "Gagal simpan")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: Player) => {
    setEditId(p.id)
    setForm({ name: p.name, username: p.username, league: p.league, elo: String(p.elo) })
  }

  const del = async (id: string) => {
    if (!window.confirm("Hapus peserta ini dari sistem?")) return
    try {
      await apiCall("/api/admin/liga/players", token, { method: "DELETE", body: { id } })
      setPlayers(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal hapus")
    }
  }

  const seed = async () => {
    if (!window.confirm("Muat 48 pemain + jadwal demo (hanya jika tabel masih kosong)?")) return
    setSeeding(true)
    try {
      await apiCall("/api/admin/liga/seed", token, { method: "POST" })
      onSeeded()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal seed data")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="admin2-col">
      <form className="admin-card" onSubmit={submit}>
        <h3 className="ac-title">{editId ? "✎ Edit Peserta" : "+ Tambah Peserta Baru"}</h3>
        <label className="ac-label">Nama Lengkap
          <input required className="ac-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap player" />
        </label>
        <label className="ac-label">Chess.com Username
          <div className="fetch-row">
            <input className="ac-input" style={{ flex: 1 }} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username_chesscom" />
            <button type="button" className="fetch-btn" onClick={fetchChesscom} disabled={fetching || !form.username.trim()}>
              {fetching ? "···" : "Fetch ELO"}
            </button>
          </div>
        </label>
        {fetchErr && <p className="err-msg">{fetchErr}</p>}
        <label className="ac-label">Blitz ELO
          <input required type="number" className="ac-input" value={form.elo} onChange={e => setForm(f => ({ ...f, elo: e.target.value }))} placeholder="Contoh: 1500" />
        </label>
        <label className="ac-label">Divisi
          <select className="ac-input" value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value as League }))}>
            {LEAGUES.map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
        <div className="form-actions">
          <button className="primary-btn" type="submit" style={{ flex: 1 }} disabled={saving}>
            {saving ? "Menyimpan…" : editId ? "Simpan Perubahan" : "+ Tambah ke Liga"}
          </button>
          {editId && <button type="button" className="outline-btn" onClick={() => { setEditId(null); setForm({ name: "", username: "", league: "Liga 1", elo: "" }) }}>Batal</button>}
        </div>
      </form>

      <div className="admin-card" style={{ minHeight: 420 }}>
        <div className="player-list-top">
          <h3 className="ac-title">Semua Peserta <span className="ac-count">({displayed.length}/{players.length})</span></h3>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="ac-input" style={{ width: "auto", padding: "6px 10px" }} value={filter} onChange={e => setFilter(e.target.value as League | "")}>
              <option value="">Semua Liga</option>
              {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        {players.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <p className="muted">Belum ada peserta. Muat data demo atau tambah manual.</p>
            <button className="outline-btn" style={{ marginTop: 14 }} onClick={seed} disabled={seeding}>
              {seeding ? "Memuat…" : "⚡ Muat Data Demo (48 pemain)"}
            </button>
          </div>
        )}
        <div className="player-list-body">
          {displayed.map(p => (
            <div key={p.id} className="pli">
              <Av name={p.name} color={LC[p.league].color} />
              <div className="pli-info">
                <b>{p.name}</b>
                <small>@{p.username} · {p.elo} ELO · <span style={{ color: LC[p.league].color }}>{p.league}</span>
                  {p.wo_count > 0 && <span className="wo-badge"> WO×{p.wo_count}</span>}
                  {p.status === "disqualified" && <span className="wo-badge" style={{ color: "#ff6b7a", borderColor: "#ff6b7a44" }}>DISKUALIFIKASI</span>}
                </small>
              </div>
              <div className="pli-actions">
                <button className="icon-btn" onClick={() => startEdit(p)} title="Edit">✎</button>
                <button className="icon-btn danger" onClick={() => del(p.id)} title="Hapus">×</button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && players.length > 0 && <p className="muted" style={{ padding: "20px 0" }}>Tidak ada peserta di filter ini.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Admin: Schedule ────────────────────────────────────────────────────────────
function AdminSchedule({
  players, schedules, setSchedules, token,
}: {
  players: Player[]
  schedules: Schedule[]
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
  token: string
}) {
  const [form, setForm] = useState<{ league: League; round: string; player1_id: string; player2_id: string; date: string; time: string; status: Schedule["status"] }>({
    league: "Liga 1", round: "1", player1_id: "", player2_id: "", date: "", time: "19:00", status: "upcoming",
  })
  const [editId, setEditId] = useState<string | null>(null)
  const [filterL, setFilterL] = useState<League>("Liga 1")
  const [saving, setSaving] = useState(false)

  const [gen, setGen] = useState({ league: "Liga 1" as League, rounds: "", roundsPerWeek: "1", startDate: "", time: "19:00", includeInactive: false })
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState("")

  const genPlayers = players.filter(p => p.league === gen.league && (gen.includeInactive || p.status === "active"))
  const fullCycleRounds = Math.max(1, genPlayers.length - 1)

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (genPlayers.length < 2) { alert("Minimal 2 pemain di liga ini untuk generate."); return }
    setGenerating(true); setGenMsg("")
    try {
      const res = await apiCall("/api/admin/liga/generate", token, {
        method: "POST",
        body: {
          league: gen.league,
          rounds: Number(gen.rounds) || fullCycleRounds,
          roundsPerWeek: Number(gen.roundsPerWeek) || 1,
          startDate: gen.startDate,
          time: gen.time,
          includeInactive: gen.includeInactive,
        },
      })
      setGenMsg(`✓ ${res.created} match (${res.rounds} ronde) berhasil digenerate.`)
      const sRes = await apiCall("/api/admin/liga/schedules", token)
      setSchedules(sRes.data || [])
    } catch (err) {
      setGenMsg(err instanceof Error ? err.message : "Gagal generate jadwal")
    } finally {
      setGenerating(false)
    }
  }

  const resetLeague = async (league: League) => {
    if (!window.confirm(`Hapus SEMUA jadwal + hasil di ${league}? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await apiCall("/api/admin/liga/schedules", token, { method: "DELETE", body: { league } })
      setSchedules(prev => prev.filter(s => s.league !== league))
      alert(`Selesai. ${res.deleted} jadwal dihapus.`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal reset jadwal")
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  const lPlayers = players.filter(p => p.league === form.league)
  const displayed = schedules.filter(s => s.league === filterL).sort((a, b) => a.round - b.round || a.date.localeCompare(b.date))
  const getPlayer = (id: string) => players.find(p => p.id === id)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.player1_id === form.player2_id) { alert("Pilih player yang berbeda!"); return }
    setSaving(true)
    try {
      const body = {
        id: editId || undefined,
        league: form.league,
        round: Number(form.round),
        player1_id: form.player1_id,
        player2_id: form.player2_id,
        date: form.date,
        time: form.time,
        status: form.status,
      }
      await apiCall("/api/admin/liga/schedules", token, { method: "POST", body })
      if (editId) {
        setSchedules(prev => prev.map(s => s.id === editId
          ? { ...s, league: form.league, round: Number(form.round), player1_id: form.player1_id, player2_id: form.player2_id, date: form.date, time: form.time, status: form.status }
          : s))
        setEditId(null)
      } else {
        const res = await apiCall("/api/admin/liga/schedules", token)
        setSchedules(res.data || [])
      }
      setForm({ league: "Liga 1", round: "1", player1_id: "", player2_id: "", date: "", time: "19:00", status: "upcoming" })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal simpan")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (s: Schedule) => {
    setEditId(s.id)
    setForm({ league: s.league, round: String(s.round), player1_id: s.player1_id, player2_id: s.player2_id, date: s.date, time: s.time, status: s.status })
  }

  const del = async (id: string) => {
    if (!window.confirm("Hapus jadwal ini?")) return
    try {
      await apiCall("/api/admin/liga/schedules", token, { method: "DELETE", body: { id } })
      setSchedules(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal hapus")
    }
  }

  const statusColor: Record<string, string> = { upcoming: "#8a9ab5", live: "#65f396", completed: "#6a7a8a" }

  return (
    <div>
      <form className="admin-card" onSubmit={generate} style={{ marginBottom: 18 }}>
        <h3 className="ac-title">⚡ Generate Jadwal Round-Robin</h3>
        <div className="form2">
          <label className="ac-label">Liga
            <select className="ac-input" value={gen.league} onChange={e => setGen(g => ({ ...g, league: e.target.value as League }))}>
              {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="ac-label">Jumlah Ronde
            <input type="number" min={1} max={100} className="ac-input" value={gen.rounds} onChange={e => setGen(g => ({ ...g, rounds: e.target.value }))} placeholder={`Kosong = 1 siklus (${fullCycleRounds})`} />
          </label>
        </div>
        <div className="form2">
          <label className="ac-label">Ronde per Minggu
            <input type="number" min={1} max={10} className="ac-input" value={gen.roundsPerWeek} onChange={e => setGen(g => ({ ...g, roundsPerWeek: e.target.value }))} />
          </label>
          <label className="ac-label">Tanggal Mulai
            <input type="date" className="ac-input" value={gen.startDate} max={today} min="2026-01-01" onChange={e => setGen(g => ({ ...g, startDate: e.target.value }))} />
          </label>
        </div>
        <div className="form2">
          <label className="ac-label">Jam (WIB)
            <input type="time" className="ac-input" value={gen.time} onChange={e => setGen(g => ({ ...g, time: e.target.value }))} />
          </label>
          <label className="ac-label" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, textTransform: "none" }}>
            <input type="checkbox" checked={gen.includeInactive} onChange={e => setGen(g => ({ ...g, includeInactive: e.target.checked }))} style={{ width: "auto", margin: 0 }} />
            Sertakan pemain diskualifikasi
          </label>
        </div>
        <p className="muted" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 12 }}>
          Algoritma round-robin (circle method). {genPlayers.length} pemain aktif di {gen.league} → siklus penuh = {fullCycleRounds} ronde · setiap pemain saling bertemu. Ronde per minggu menggeser tanggal otomatis (+7 hari per {Number(gen.roundsPerWeek) || 1} ronde).
        </p>
        <div className="form-actions">
          <button className="primary-btn" type="submit" disabled={generating} style={{ flex: 1 }}>
            {generating ? "Menggenerate…" : `⚡ Generate ${Number(gen.rounds) || fullCycleRounds} Ronde`}
          </button>
          <button type="button" className="outline-btn" onClick={() => resetLeague(gen.league)}>Reset {gen.league}</button>
        </div>
        {genMsg && <p className={`err-msg ${genMsg.startsWith("✓") ? "gen-ok" : ""}`} style={genMsg.startsWith("✓") ? { color: "#65f396", background: "rgba(102,242,74,.08)", borderLeft: "2px solid #65f396" } : undefined}>{genMsg}</p>}
      </form>

      <div className="admin2-col">
      <form className="admin-card" onSubmit={submit}>
        <h3 className="ac-title">{editId ? "✎ Edit Jadwal" : "+ Tambah Jadwal Match"}</h3>
        <div className="form2">
          <label className="ac-label">Liga
            <select className="ac-input" value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value as League, player1_id: "", player2_id: "" }))}>
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="ac-label">Round
            <input type="number" min={1} className="ac-input" value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))} />
          </label>
        </div>
        <label className="ac-label">Player 1
          <select required className="ac-input" value={form.player1_id} onChange={e => setForm(f => ({ ...f, player1_id: e.target.value }))}>
            <option value="">— Pilih Player 1 —</option>
            {lPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.elo} ELO)</option>)}
          </select>
        </label>
        <label className="ac-label">Player 2
          <select required className="ac-input" value={form.player2_id} onChange={e => setForm(f => ({ ...f, player2_id: e.target.value }))}>
            <option value="">— Pilih Player 2 —</option>
            {lPlayers.filter(p => p.id !== form.player1_id).map(p => <option key={p.id} value={p.id}>{p.name} ({p.elo} ELO)</option>)}
          </select>
        </label>
        <div className="form2">
          <label className="ac-label">Tanggal
            <input type="date" required className="ac-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </label>
          <label className="ac-label">Jam (WIB)
            <input type="time" className="ac-input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </label>
        </div>
        <label className="ac-label">Status
          <select className="ac-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Schedule["status"] }))}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <div className="form-actions">
          <button className="primary-btn" type="submit" style={{ flex: 1 }} disabled={saving}>
            {saving ? "Menyimpan…" : editId ? "Simpan" : "Tambah Jadwal"}
          </button>
          {editId && <button type="button" className="outline-btn" onClick={() => setEditId(null)}>Batal</button>}
        </div>
      </form>

      <div className="admin-card" style={{ minHeight: 420 }}>
        <div className="player-list-top">
          <h3 className="ac-title">Jadwal <span className="ac-count">({displayed.length})</span></h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="icon-btn danger" onClick={() => resetLeague(filterL)} title="Hapus semua jadwal liga ini">Reset</button>
            <select className="ac-input" style={{ width: "auto", padding: "6px 10px" }} value={filterL} onChange={e => setFilterL(e.target.value as League)}>
              {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="player-list-body">
          {displayed.map(s => {
            const p1 = getPlayer(s.player1_id)
            const p2 = getPlayer(s.player2_id)
            return (
              <div key={s.id} className="sli">
                <div className="sli-info">
                  <div className="sli-round">RND {s.round} · <span style={{ color: statusColor[s.status], fontWeight: 700 }}>{s.status.toUpperCase()}</span></div>
                  <div className="sli-players">{p1?.name || "?"} <em>vs</em> {p2?.name || "?"}</div>
                  <div className="sli-date">{s.date} · {s.time} WIB</div>
                </div>
                <div className="pli-actions">
                  <button className="icon-btn" onClick={() => startEdit(s)}>✎</button>
                  <button className="icon-btn danger" onClick={() => del(s.id)}>×</button>
                </div>
              </div>
            )
          })}
          {displayed.length === 0 && <p className="muted" style={{ padding: "20px 0" }}>Belum ada jadwal di {filterL}.</p>}
        </div>
      </div>
      </div>
    </div>
  )
}

// ── Admin: Score & PGN ────────────────────────────────────────────────────────
function AdminScore({
  players, schedules, setSchedules, results, setResults, setPlayers, token,
}: {
  players: Player[]
  schedules: Schedule[]
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
  results: GameResult[]
  setResults: React.Dispatch<React.SetStateAction<GameResult[]>>
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  token: string
}) {
  const [filterL, setFilterL] = useState<League>("Liga 1")
  const [selId, setSelId] = useState<string>("")
  const [scoreIdx, setScoreIdx] = useState(2)
  const [pgn, setPgn] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const rMap = useMemo(() => new Map(results.map(r => [r.schedule_id, r])), [results])
  const getPlayer = (id: string) => players.find(p => p.id === id)

  const lSchedules = schedules.filter(s => s.league === filterL).sort((a, b) => a.round - b.round || a.date.localeCompare(b.date))
  const sel = selId ? schedules.find(s => s.id === selId) : null
  const existing = sel ? rMap.get(sel.id) : null

  const selectMatch = (id: string) => {
    setSelId(id)
    setSaved(false)
    const ex = rMap.get(id)
    if (ex) {
      const idx = SCORE_OPTS.findIndex(o => o.s1 === Number(ex.score1) && o.s2 === Number(ex.score2))
      setScoreIdx(idx >= 0 ? idx : 2)
      setPgn(ex.pgn || "")
    } else {
      setScoreIdx(2); setPgn("")
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sel) return
    const opt = SCORE_OPTS[scoreIdx]
    setSaving(true)
    try {
      const res = await apiCall("/api/admin/liga/results", token, {
        method: "POST",
        body: { scheduleId: sel.id, score1: opt.s1, score2: opt.s2, wo: opt.wo, pgn },
      })
      if (!res.success) throw new Error("Gagal simpan skor")
      setResults(prev => [
        ...prev.filter(r => r.schedule_id !== sel.id),
        { id: existing?.id || `r${Date.now().toString(36)}`, schedule_id: sel.id, score1: opt.s1, score2: opt.s2, pgn: pgn.trim() || undefined },
      ])
      setSchedules(prev => prev.map(s => s.id === sel.id ? { ...s, status: "completed" } : s))
      if (opt.wo === 1 || opt.wo === 2) {
        const loserId = opt.wo === 1 ? sel.player1_id : sel.player2_id
        setPlayers(prev => prev.map(p => p.id === loserId
          ? { ...p, wo_count: p.wo_count + 1, status: p.wo_count + 1 >= 2 ? "disqualified" : "active" }
          : p))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal simpan skor")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin2-col">
      <div className="admin-card">
        <h3 className="ac-title">Pilih Match</h3>
        <label className="ac-label">Liga
          <select className="ac-input" value={filterL} onChange={e => { setFilterL(e.target.value as League); setSelId("") }}>
            {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <div className="score-match-list">
          {lSchedules.map(s => {
            const p1 = getPlayer(s.player1_id)
            const p2 = getPlayer(s.player2_id)
            const r = rMap.get(s.id)
            return (
              <div key={s.id} className={`smi ${selId === s.id ? "smi-sel" : ""}`} onClick={() => selectMatch(s.id)}>
                <div className="smi-left">
                  <span className="smi-round">R{s.round}</span>
                  <span className="smi-players">{p1?.name || "?"} <em>vs</em> {p2?.name || "?"}</span>
                  <span className="smi-date">{s.date}</span>
                </div>
                <div className="smi-right">
                  {r ? <ScoreTag s1={Number(r.score1)} s2={Number(r.score2)} /> : <span className="smi-pending">{s.status === "live" ? "🔴 LIVE" : "—"}</span>}
                  {r?.pgn && <span className="pgn-dot" title="PGN tersedia">PGN</span>}
                </div>
              </div>
            )
          })}
          {lSchedules.length === 0 && <p className="muted" style={{ padding: "16px 0" }}>Belum ada jadwal di {filterL}.</p>}
        </div>
      </div>

      {sel ? (
        <form className="admin-card" onSubmit={submit}>
          <h3 className="ac-title">Update Skor & PGN</h3>
          <div className="match-preview">
            <div className="mp-player">
              <Av name={getPlayer(sel.player1_id)?.name || "?"} color={LC[filterL].color} size={36} />
              <div><b>{getPlayer(sel.player1_id)?.name}</b><small>Player 1</small></div>
            </div>
            <div className="mp-vs">VS</div>
            <div className="mp-player">
              <Av name={getPlayer(sel.player2_id)?.name || "?"} color={LC[filterL].color} size={36} />
              <div><b>{getPlayer(sel.player2_id)?.name}</b><small>Player 2</small></div>
            </div>
          </div>
          <label className="ac-label">Hasil (2 game · tanpa keterangan warna)
            <select className="ac-input" value={scoreIdx} onChange={e => setScoreIdx(Number(e.target.value))}>
              {SCORE_OPTS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
          </label>
          <label className="ac-label">PGN Pertandingan <span style={{ color: "#6a7a8a", fontWeight: 400 }}>(opsional — untuk analisis papan)</span>
            <textarea className="ac-input ac-pgn" value={pgn} onChange={e => setPgn(e.target.value)} placeholder={"Paste PGN di sini...\nContoh: 1. e4 e5 2. Nf3 Nc6 3. Bb5..."} rows={5} />
          </label>
          <button className="primary-btn" type="submit" style={{ width: "100%", background: saved ? "#1c4a2a" : undefined, borderColor: saved ? "#65f396" : undefined }} disabled={saving}>
            {saving ? "Menyimpan…" : saved ? "✓ Skor & PGN Tersimpan!" : "Simpan Skor & PGN"}
          </button>
        </form>
      ) : (
        <div className="admin-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>←</div>
            <p className="muted">Pilih match dari daftar untuk update skor dan input PGN</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin: Season Transition ───────────────────────────────────────────────────
function AdminSeason({
  players, setPlayers, allSchedules, allResults, token, onSeasonChange,
}: {
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  allSchedules: Schedule[]
  allResults: GameResult[]
  token: string
  onSeasonChange: (season: string) => void
}) {
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const preview = useMemo(() => {
    return LEAGUES.map(lg => {
      const lp = players.filter(p => p.league === lg)
      const ls = allSchedules.filter(s => s.league === lg)
      return { lg, standings: computeStandings(lp, ls, allResults) }
    })
  }, [players, allSchedules, allResults])

  const simulate = async () => {
    if (!window.confirm("Terapkan promosi 2 teratas & degradasi 2 terbawah di tiap liga untuk season berikutnya?")) return
    setProcessing(true)
    try {
      const res = await apiCall("/api/admin/liga/season", token, { method: "POST" })
      if (!res.success) throw new Error("Gagal memproses transisi season")
      setPlayers(res.players || players)
      if (res.season) onSeasonChange(String(res.season))
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memproses transisi")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="season-page">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 className="ac-title">Transisi Season</h3>
        <p style={{ color: "#8fa0b3", margin: "10px 0 20px", fontSize: 13, lineHeight: 1.6 }}>
          Proses promosi 2 pemain teratas dan degradasi 2 pemain terbawah dari tiap liga.<br />
          Berdasarkan klasemen akhir, pemain akan dipindah ke divisi yang sesuai untuk season berikutnya.
        </p>
        <div className="season-preview">
          {preview.map(({ lg, standings }, idx) => (
            <div key={lg} className="sp-block" style={{ borderTopColor: LC[lg].color }}>
              <div className="sp-header" style={{ color: LC[lg].color }}>{lg}</div>
              {standings.slice(0, 2).map(p => (
                <div key={p.id} className="sp-row sp-promo">
                  ↑ {p.name} <span>{p.pts.toFixed(1)} pts</span>
                  {idx > 0 && <em style={{ color: LC[LEAGUES[idx - 1]].color }}>→ {LEAGUES[idx - 1]}</em>}
                </div>
              ))}
              <div className="sp-divider" />
              {standings.slice(-2).map(p => (
                <div key={p.id} className="sp-row sp-degrade">
                  ↓ {p.name} <span>{p.pts.toFixed(1)} pts</span>
                  {idx < 3 && <em style={{ color: LC[LEAGUES[idx + 1]].color }}>→ {LEAGUES[idx + 1]}</em>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <button className="primary-btn" style={{ marginTop: 24 }} onClick={simulate} disabled={processing}>
          {processing ? "Memproses…" : done ? "✓ Transisi Season Diterapkan!" : "🔄 Terapkan Transisi Season Berikutnya"}
        </button>
      </div>
    </div>
  )
}

// ── Admin: Google Spreadsheet Sync ─────────────────────────────────────────────
function AdminSheet() {
  const [exporting, setExporting] = useState(false)
  const [msg, setMsg] = useState("")

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const downloadSnapshot = async () => {
    setExporting(true); setMsg("")
    try {
      const res = await fetch("/api/liga")
      const body = await res.json()
      if (!res.ok || !body.data) throw new Error(body.error || "Gagal mengambil data")
      const blob = new Blob([JSON.stringify(body.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tco-league-snapshot-${body.data.season}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg(`✓ Snapshot season ${body.data.season} diunduh (${body.data.players.length} pemain, ${body.data.schedules.length} jadwal).`)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal export")
    } finally {
      setExporting(false)
    }
  }

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => setMsg("✓ URL disalin.")).catch(() => {})
  }

  const row = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ width: 130, fontSize: 11, color: "#6a7a8a", flexShrink: 0 }}>{label}</span>
      <code style={{ flex: 1, fontSize: 11, color: "#aef", wordBreak: "break-all" }}>{value}</code>
      <button type="button" className="icon-btn" onClick={() => copy(value)}>Copy</button>
    </div>
  )

  return (
    <div className="admin2-col">
      <div className="admin-card">
        <h3 className="ac-title">🔗 Endpoint Sinkronisasi</h3>
        <p className="muted" style={{ margin: "10px 0 14px" }}>
          Isi nilai-nilai ini di <b style={{ color: "#d8eaf8" }}>Script Properties</b> pada Google Apps Script (menunggu: <code>WEBSITE_URL</code>, <code>SHEET_SECRET</code>).
        </p>
        {row("Pull (publik)", `${origin}/api/liga`)}
        {row("Push/Import (secret)", `${origin}/api/admin/liga/sheet-sync`)}
        {row("Generate jadwal", `${origin}/api/admin/liga/generate`)}
        <p className="muted" style={{ fontSize: 11, marginTop: 14, lineHeight: 1.6 }}>
          Skrip lengkap: <code style={{ color: "#aef" }}>docs/apps-script/tco-league-sync.gs</code> — tempel ke Ekstensi → Apps Script, set Property, lalu jalankan <code>setup()</code>. Menu "TCO Sync" akan muncul di spreadsheet.
        </p>
      </div>
      <div className="admin-card">
        <h3 className="ac-title">📥 Snapshot JSON</h3>
        <p className="muted" style={{ margin: "10px 0 14px" }}>
          Unduh seluruh data liga (players + schedules + results + season) sebagai file JSON untuk cadangan atau untuk diimpor ke spreadsheet secara manual.
        </p>
        <button className="primary-btn" style={{ width: "100%" }} onClick={downloadSnapshot} disabled={exporting}>
          {exporting ? "Mengambil data…" : "⬇ Download Snapshot Liga"}
        </button>
        {msg && <p className="err-msg" style={msg.startsWith("✓") || msg.startsWith("☑") ? { color: "#65f396", background: "rgba(102,242,74,.08)", borderLeft: "2px solid #65f396" } : undefined}>{msg}</p>}
        <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "18px 0" }} />
        <p className="muted" style={{ fontSize: 11, lineHeight: 1.6 }}>
          1. Buat spreadsheet baru → Ekstensi → Apps Script.<br />
          2. Tempel <code style={{ color: "#aef" }}>tco-league-sync.gs</code> dan simpan.<br />
          3. Set <code style={{ color: "#aef" }}>WEBSITE_URL</code> &amp; <code style={{ color: "#aef" }}>SHEET_SECRET</code> + jalankan <code>setup()</code>.<br />
          4. Menu <b style={{ color: "#d8eaf8" }}>TCO Sync</b>: Pull dari Website / Import dari Sheet / Auto-Sync tiap 5 menit.
        </p>
      </div>
    </div>
  )
}

// ── Main Admin ────────────────────────────────────────────────────────────────
export default function LeagueAdmin() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<AdminTab>("players")
  const [loading, setLoading] = useState(true)

  const [players, setPlayers] = useState<Player[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [results, setResults] = useState<GameResult[]>([])
  const [season, setSeason] = useState("1")

  const token = user ? btoa(`${user.username}:${loginPassword}`) : ""

  async function loadData() {
    setLoading(true)
    try {
      const [pRes, sRes, rRes] = await Promise.all([
        apiCall("/api/admin/liga/players", token),
        apiCall("/api/admin/liga/schedules", token),
        apiCall("/api/admin/liga/results", token),
      ])
      setPlayers(pRes.data || [])
      setSchedules(sRes.data || [])
      setResults((rRes.data || []).map((r: any) => ({ ...r, score1: Number(r.score1), score2: Number(r.score2) })))
      const lRes = await apiCall("/api/liga", token)
      setSeason(lRes.data?.season || "1")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memuat data liga")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const found = validateAdmin(loginUsername, loginPassword)
    if (found) { setUser(found); setLoginError("") }
    else { setLoginError("Username atau password salah") }
  }

  function handleLogout() {
    setUser(null); setLoginUsername(""); setLoginPassword("")
    setPlayers([]); setSchedules([]); setResults([])
  }

  const style = { "--league": "#00d9ff", "--league-soft": "rgba(0,217,255,.14)" } as React.CSSProperties

  if (!user) {
    return (
      <main style={style} className="tco-league app-shell">
        <div className="scanlines" />
        <header className="topbar">
          <Logo />
          <button className="live-pill"><i /> CONTROL ROOM</button>
        </header>
        <section className="rules-page">
          <div className="admin-heading" style={{ maxWidth: 480 }}>
            <div>
              <p className="eyebrow">CONTROL ROOM</p>
              <h2 style={{ fontSize: 40 }}>Admin Liga</h2>
              <p>Masuk untuk mengelola peserta, jadwal, skor & PGN, dan transisi season.</p>
            </div>
          </div>
          <form className="admin-card" style={{ maxWidth: 480, marginTop: 20 }} onSubmit={handleLogin}>
            <label className="ac-label">Username
              <input className="ac-input" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="Admin username" />
            </label>
            <label className="ac-label">Password
              <input type="password" className="ac-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </label>
            {loginError && <p className="err-msg">{loginError}</p>}
            <button className="primary-btn" type="submit" style={{ marginTop: 20 }}>Masuk ke Admin Liga</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main style={style} className="tco-league app-shell">
      <div className="scanlines" />
      <header className="topbar">
        <Logo />
        <nav>
          <button className="active">Admin Liga</button>
          <a href="/liga" style={{ color: "inherit", textDecoration: "none" }}><button>Lihat Halaman Liga ↗</button></a>
          <a href="/admin/dashboard" style={{ color: "inherit", textDecoration: "none" }}><button>Dashboard Utama</button></a>
          <button onClick={handleLogout} style={{ color: "#ff7a8a" }}>Keluar</button>
        </nav>
        <button className="live-pill"><i /> SEASON {String(season).padStart(2, "0")}</button>
      </header>

      <section className="admin-page">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">CONTROL ROOM</p>
            <h2>Admin Dashboard Liga</h2>
            <p>Kelola peserta, jadwal, skor & PGN, dan transisi season dari satu tempat.</p>
          </div>
          <span className="admin-badge">● TERHUBUNG SUPABASE</span>
        </div>

        <div className="admin-tabs">
          {(["players", "schedule", "score", "season", "sheet"] as AdminTab[]).map(t => (
            <button key={t} className={`admin-tab-btn ${tab === t ? "atb-active" : ""}`} onClick={() => setTab(t)}>
              {t === "players" ? "👥 Peserta" : t === "schedule" ? "📅 Jadwal" : t === "score" ? "📊 Skor & PGN" : t === "season" ? "🔄 Transisi Season" : "🔗 Spreadsheet"}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="league-loading" style={{ minHeight: 300 }}><div><div className="spin" /><p className="muted">Memuat…</p></div></div>
          ) : (
            <>
              {tab === "players" && <AdminPlayers players={players} setPlayers={setPlayers} token={token} onSeeded={loadData} />}
              {tab === "schedule" && <AdminSchedule players={players} schedules={schedules} setSchedules={setSchedules} token={token} />}
              {tab === "score" && (
                <AdminScore
                  players={players}
                  schedules={schedules}
                  setSchedules={setSchedules}
                  results={results}
                  setResults={setResults}
                  setPlayers={setPlayers}
                  token={token}
                />
              )}
              {tab === "season" && (
                <AdminSeason
                  players={players}
                  setPlayers={setPlayers}
                  allSchedules={schedules}
                  allResults={results}
                  token={token}
                  onSeasonChange={setSeason}
                />
              )}
              {tab === "sheet" && <AdminSheet />}
            </>
          )}
        </div>
      </section>
    </main>
  )
}