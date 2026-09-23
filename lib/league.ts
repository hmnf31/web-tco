export type League = "Liga 1" | "Liga 2" | "Liga 3" | "Liga 4"

export interface Player {
  id: string
  name: string
  username: string
  league: League
  elo: number
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
  pgn?: string | null
}

export interface LeagueData {
  players: Player[]
  schedules: Schedule[]
  results: GameResult[]
  season: string
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
    const sc1 = Number(r.score1)
    const sc2 = Number(r.score2)
    if (s1) {
      s1.mp++
      s1.pts += sc1
      if (sc1 > sc2) s1.w++
      else if (sc1 === sc2) s1.d++
      else s1.l++
    }
    if (s2) {
      s2.mp++
      s2.pts += sc2
      if (sc2 > sc1) s2.w++
      else if (sc2 === sc1) s2.d++
      else s2.l++
    }
  }

  return players
    .map(p => ({ ...p, ...stats.get(p.id)! }))
    .sort((a, b) => b.pts - a.pts || b.w - a.w || b.elo - a.elo)
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