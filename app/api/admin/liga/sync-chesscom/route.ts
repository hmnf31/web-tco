import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import type { League, Player } from "@/lib/league"

export const maxDuration = 60

const MODES = ["chess_bullet", "chess_blitz", "chess_rapid", "chess_daily"] as const

interface SyncResult { elo: number; elo_avg: number; pp: string }
type OneResult = { updated: SyncResult; pp: string; pp_ok: boolean } | { failed: string }

async function syncOne(p: Player): Promise<OneResult> {
  const username = p.username.trim()
  if (!username) return { failed: "kosong" }
  try {
    const [statsRes, profRes] = await Promise.all([
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`, { cache: "no-store" }),
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`, { cache: "no-store" }),
    ])
    if (!statsRes.ok) return { failed: `chess.com ${statsRes.status}` }
    const stats = await statsRes.json()
    const prof = await profRes.json().catch(() => ({}))
    const elo =
      stats.chess_blitz?.last?.rating ||
      stats.chess_rapid?.last?.rating ||
      stats.chess_bullet?.last?.rating ||
      0
    if (!elo) return { failed: "belum ada rating" }
    const ratings = MODES
      .map(m => Number(stats[m]?.last?.rating) || 0)
      .filter(r => r > 0)
    const elo_avg = ratings.length
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0
    const pp = typeof prof.avatar === "string" && prof.avatar ? prof.avatar : ""
    return { updated: { elo, elo_avg, pp }, pp, pp_ok: !!pp }
  } catch {
    return { failed: "network" }
  }
}

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()
  const { data: players } = await (supabase as any)
    .from("tco_league_players")
    .select("*")

  if (!Array.isArray(players)) {
    return NextResponse.json({ error: "Gagal ambil data player" }, { status: 500 })
  }

  const updated: Player[] = []
  const failed: { id: string; username: string; reason: string }[] = []

  const BATCH = 8
  for (let i = 0; i < players.length; i += BATCH) {
    const results = await Promise.all(players.slice(i, i + BATCH).map(syncOne))
    for (let j = 0; j < results.length; j++) {
      const p = players[i + j] as Player
      const r = results[j] as OneResult
      if ("updated" in r) {
        const { error } = await (supabase as any)
          .from("tco_league_players")
          .update({ elo: r.updated.elo, elo_avg: r.updated.elo_avg, pp: r.updated.pp })
          .eq("id", p.id)
        if (error) {
          failed.push({ id: p.id, username: p.username, reason: `db: ${error.message}` })
        } else {
          updated.push({ ...p, elo: r.updated.elo, elo_avg: r.updated.elo_avg, pp: r.updated.pp })
        }
      } else {
        failed.push({ id: p.id, username: p.username, reason: r.failed })
      }
    }
  }

  return NextResponse.json({ success: true, updated: updated.length, failed, players: updated })
}
