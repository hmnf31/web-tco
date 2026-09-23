import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import { computeStandings, LEAGUES, type League } from "@/lib/league"

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()

  const { data: players } = await (supabase as any).from("tco_league_players").select("*")
  const { data: schedules } = await (supabase as any).from("tco_league_schedules").select("*")
  const { data: results } = await (supabase as any).from("tco_league_results").select("*")

  if (!players || !schedules || !results) {
    return NextResponse.json({ error: "Data liga kosong" }, { status: 400 })
  }

  const moves: Record<string, League> = {}

  LEAGUES.forEach((lg, idx) => {
    const lp = players.filter((p: any) => p.league === lg)
    const ls = schedules.filter((s: any) => s.league === lg)
    const standings = computeStandings(lp, ls, results)
    if (idx > 0) standings.slice(0, 2).forEach(p => { moves[p.id] = LEAGUES[idx - 1] })
    if (idx < 3) standings.slice(-2).forEach(p => { moves[p.id] = LEAGUES[idx + 1] })
  })

  for (const [id, league] of Object.entries(moves)) {
    await (supabase as any).from("tco_league_players").update({ league }).eq("id", id)
  }

  // Naikkan nomor season
  const { data: seasonRow } = await (supabase as any)
    .from("tco_league_config")
    .select("*")
    .eq("key", "season")
    .single()

  const nextSeason = String((Number(seasonRow?.value || 1) || 1) + 1)
  if (seasonRow) {
    await (supabase as any).from("tco_league_config").update({ value: nextSeason }).eq("key", "season")
  } else {
    await (supabase as any).from("tco_league_config").insert([{ key: "season", value: nextSeason }])
  }

  const { data: updatedPlayers } = await (supabase as any).from("tco_league_players").select("*")

  return NextResponse.json({
    success: true,
    season: nextSeason,
    moved: Object.values(moves).length,
    players: updatedPlayers || [],
  })
}