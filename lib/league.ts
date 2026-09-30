export type League = "Liga 1" | "Liga 2" | "Liga 3" | "Liga 4"

export interface Player {
  id: string
  name: string
  username: string
  league: League
  elo: number
  elo_avg: number
  peak_blitz?: number
  pp: string
  wo_count: number
  status: "active" | "disqualified"
}

export interface Schedule {
  id: string
  league: League
  round: number
  player1_id: string
  player2_id: string
  date: string
  time: string
  status: "upcoming" | "live" | "completed"
}

export interface GameResult {
  id: string
  schedule_id: string
  score1: number
  score2: number
  wo_player?: 0 | 1 | 2 | null
  game1_url?: string | null
  game2_url?: string | null
  pgn?: string | null
}

export type GameLinkCheck = { ok: true; url: string } | { ok: false; reason: string }

const GAME_LINK_HOST = "chessigma.com"

// Link game untuk analisis: hanya host Chessigma yang boleh di-embed lewat iframe.
export function checkGameLink(raw: unknown): GameLinkCheck {
  if (raw === null || raw === undefined) return { ok: true, url: "" }
  if (typeof raw !== "string") return { ok: false, reason: "Link game harus berupa teks" }
  const value = raw.trim()
  if (!value) return { ok: true, url: "" }
  if (value.length > 500) return { ok: false, reason: "Link game terlalu panjang" }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return { ok: false, reason: `Link game tidak valid: ${value.slice(0, 60)}` }
  }
  if (url.protocol !== "https:") return { ok: false, reason: "Link game harus memakai https://" }
  const host = url.hostname.toLowerCase()
  if (host !== GAME_LINK_HOST && host !== `www.${GAME_LINK_HOST}`) {
    return { ok: false, reason: `Link game harus dari ${GAME_LINK_HOST}` }
  }
  return { ok: true, url: `${url.origin}${url.pathname}${url.search}`.replace(/\/$/, "") }
}

export const GAME_LINK_MIGRATION = "supabase/migrations/20260930000000_add_league_game_links.sql"

// Kolom game1_url/game2_url hanya ada setelah migration dijalankan. Tanpa ini,
// PostgREST hanya membalas "column does not exist" (42703 / PGRST204) yang tidak jelas.
export function isMissingGameLinkColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const code = error.code || ""
  const message = error.message || ""
  const isMissingColumn =
    code === "42703" || code === "PGRST204" || /does not exist/i.test(message)
  if (!isMissingColumn) return false
  // Jangan tertukar dengan kolom lain yang kebetulan belum ada.
  if (!message) return true
  return /game[12]_url/i.test(message)
}

export function describeDbError(error: { code?: string; message?: string } | null): string | null {
  if (!error) return null
  const message = error.message || "Terjadi kesalahan database"
  if (isMissingGameLinkColumn(error)) {
    return `Kolom link game belum ada di database. Jalankan ${GAME_LINK_MIGRATION} di Supabase SQL Editor.`
  }
  return message
}

export interface LeagueData {
  players: Player[]
  schedules: Schedule[]
  results: GameResult[]
  season: string
}

export interface AnalysisHrefInput {
  game1?: string | null
  game2?: string | null
  player1?: string
  player2?: string
  username1?: string
  username2?: string
  league?: string
  round?: number
  score1?: number
  score2?: number
  date?: string
}

// Link dari tab Results ke Arena Training, yang menampilkan game via Chessigma.
export function buildAnalysisHref(input: AnalysisHrefInput, pick?: 1 | 2): string {
  const q = new URLSearchParams()
  if (input.game1) q.set("g1", input.game1)
  if (input.game2) q.set("g2", input.game2)
  if (input.player1) q.set("p1", input.player1)
  if (input.player2) q.set("p2", input.player2)
  if (input.username1) q.set("u1", input.username1)
  if (input.username2) q.set("u2", input.username2)
  if (input.league) q.set("lg", input.league)
  if (input.round) q.set("r", String(input.round))
  if (input.score1 !== undefined) q.set("s1", String(input.score1))
  if (input.score2 !== undefined) q.set("s2", String(input.score2))
  if (input.date) q.set("d", input.date)
  if (pick) q.set("pick", String(pick))
  const qs = q.toString()
  return qs ? `/arena-training?${qs}` : "/arena-training"
}

export const LEAGUES: League[] = ["Liga 1", "Liga 2", "Liga 3", "Liga 4"]

export const LC: Record<League, { color: string; soft: string; level: string; label: string }> = {
  "Liga 1": { color: "#00d9ff", soft: "rgba(0,217,255,.14)", level: "KASTA TERTINGGI", label: "CYBER BLUE" },
  "Liga 2": { color: "#ffad19", soft: "rgba(255,173,25,.14)", level: "PENANTANG ELIT", label: "FIRE AMBER" },
  "Liga 3": { color: "#66f24a", soft: "rgba(102,242,74,.14)", level: "ARENA KOMPETITIF", label: "ELECTRIC GREEN" },
  "Liga 4": { color: "#ff3aae", soft: "rgba(255,58,174,.14)", level: "KASTA AWAL", label: "NEON MAGENTA" },
}

export const SCORE_OPTS = [
  { label: "2 – 0   (Player 1 menang semua)", s1: 2, s2: 0, wo: 0 },
  { label: "1.5 – 0.5   (Player 1 unggul)", s1: 1.5, s2: 0.5, wo: 0 },
  { label: "1 – 1   (Imbang / Draw)", s1: 1, s2: 1, wo: 0 },
  { label: "0.5 – 1.5   (Player 2 unggul)", s1: 0.5, s2: 1.5, wo: 0 },
  { label: "0 – 2   (Player 2 menang semua)", s1: 0, s2: 2, wo: 0 },
  { label: "WO — Player 1 forfeit (0 – 2)", s1: 0, s2: 2, wo: 1 },
  { label: "WO — Player 2 forfeit (2 – 0)", s1: 2, s2: 0, wo: 2 },
] as const

export interface Standing extends Player {
  mp: number
  w: number
  d: number
  l: number
  pts: number
  rawPts: number
  woPenalty: number
}

// Penalti WO sesuai aturan liga: 1× −1, 2× −3, 3× (dan seterusnya) diskualifikasi.
export function woPenaltyFor(woCount: number): number {
  const n = Number(woCount) || 0
  if (n >= 2) return 3
  if (n === 1) return 1
  return 0
}

export function woStatusLabel(woCount: number, status?: string): string {
  const n = Number(woCount) || 0
  if (status === "disqualified" || n >= 3) return "DISKUALIFIKASI"
  if (n === 2) return "WO ×2"
  if (n === 1) return "WO ×1"
  return ""
}

// Skor 0.5 / 1.5 berarti satu game gritty: 1 menang + 1 remis.
function isSplitScore(score: number): boolean {
  return score === 0.5 || score === 1.5
}

export interface ScoreOutcome {
  w: number
  d: number
  l: number
  pts: number
}

// Konversi skor match (2 game) → W / D / L / poin untuk satu sisi.
//   2 – 0     → W 1, D 0, L 0, 2.0
//   1.5 – 0.5 → W 1, D 1, L 0, 1.5   (1 menang + 1 remis)
//   1 – 1     → W 0, D 1, L 0, 1.0
//   0.5 – 1.5 → W 0, D 1, L 1, 0.5
//   0 – 2     → W 0, D 0, L 1, 0.0
export function outcomeFromScore(score: number, opponent: number): ScoreOutcome {
  if (score === opponent) return { w: 0, d: 1, l: 0, pts: score }
  if (score > opponent) return { w: 1, d: isSplitScore(score) ? 1 : 0, l: 0, pts: score }
  return { w: 0, d: isSplitScore(score) ? 1 : 0, l: 1, pts: score }
}

export function computeStandings(
  players: Player[],
  schedules: Schedule[],
  results: GameResult[]
): Standing[] {
  const rMap = new Map<string, GameResult>(results.map(r => [r.schedule_id, r]))
  const stats = new Map<string, { mp: number; w: number; d: number; l: number; pts: number }>(
    players.map(p => [p.id, { mp: 0, w: 0, d: 0, l: 0, pts: 0 }])
  )

  for (const s of schedules) {
    if (s.status !== "completed") continue
    const r = rMap.get(s.id)
    if (!r) continue
    const s1 = stats.get(s.player1_id)
    const s2 = stats.get(s.player2_id)
    // Kedua sisi wajib dikenal, kalau tidak MP/W/D/L jadi tidak simetris.
    if (!s1 || !s2) continue
    const sc1 = Number(r.score1)
    const sc2 = Number(r.score2)
    if (!Number.isFinite(sc1) || !Number.isFinite(sc2)) continue
    const o1 = outcomeFromScore(sc1, sc2)
    const o2 = outcomeFromScore(sc2, sc1)
    s1.mp++; s1.w += o1.w; s1.d += o1.d; s1.l += o1.l; s1.pts += o1.pts
    s2.mp++; s2.w += o2.w; s2.d += o2.d; s2.l += o2.l; s2.pts += o2.pts
  }

  return players
    .map(p => {
      const st = stats.get(p.id)!
      const penalty = woPenaltyFor(p.wo_count)
      return { ...p, ...st, rawPts: st.pts, woPenalty: penalty, pts: Math.max(0, st.pts - penalty) }
    })
    .sort((a, b) => b.pts - a.pts || b.w - a.w || b.elo - a.elo || a.name.localeCompare(b.name))
}

export function uid(prefix = "p"): string {
  return prefix + Math.random().toString(36).slice(2, 8)
}

// ── Round-robin generator ──────────────────────────────────────────────────────
export interface RoundRobinPair {
  player1_id: string
  player2_id: string
}

export interface GeneratedRound {
  round: number
  matches: RoundRobinPair[]
}

const BYE = "__BYE__"

export function roundRobinPairs(playerIds: string[], rounds: number): GeneratedRound[] {
  if (playerIds.length < 2 || rounds < 1) return []
  const list = playerIds.length % 2 === 1 ? [...playerIds, BYE] : [...playerIds]
  const n = list.length
  const out: GeneratedRound[] = []
  let arr = list.slice()

  for (let r = 0; r < rounds; r++) {
    const matches: RoundRobinPair[] = []
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      if (a !== BYE && b !== BYE) matches.push({ player1_id: a, player2_id: b })
    }
    out.push({ round: r + 1, matches })
    if (n > 2) arr = [arr[0], ...arr.slice(-1), ...arr.slice(1, -1)]
  }
  return out
}

export function scheduleDateFor(startDate: string, round: number, roundsPerWeek: number): string {
  const base = new Date(`${startDate}T00:00:00`)
  if (Number.isNaN(base.getTime())) return startDate
  const addDays = Math.floor((round - 1) / roundsPerWeek) * 7
  const d = new Date(base.getTime() + addDays * 86400000)
  return d.toISOString().slice(0, 10)
}