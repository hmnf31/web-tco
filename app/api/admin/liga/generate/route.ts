import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import { LEAGUES, roundRobinPairs, scheduleDateFor, type League } from "@/lib/league"

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })

  const league: League | undefined = LEAGUES.find(l => l === body.league)
  if (!league) return NextResponse.json({ error: "Pilih liga yang valid" }, { status: 400 })

  const rounds = Math.max(1, Math.min(100, Math.round(Number(body.rounds) || 1)))
  const roundsPerWeek = Math.max(1, Math.round(Number(body.roundsPerWeek) || 1))
  const startDate = typeof body.startDate === "string" && body.startDate ? body.startDate : new Date().toISOString().slice(0, 10)
  const time = typeof body.time === "string" && body.time.trim() ? body.time.trim() : "19:00"
  const status: "upcoming" | "live" = body.status === "live" ? "live" : "upcoming"
  const includeInactive = body.includeInactive === true
  const playerIds: string[] | undefined = Array.isArray(body.playerIds)
    ? body.playerIds.map(String)
    : undefined

  const supabase = getSupabaseAdmin()
  const { data: leaguePlayers, error } = await (supabase as any)
    .from("tco_league_players")
    .select("*")
    .eq("league", league)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let eligible = (leaguePlayers || []) as any[]
  if (!includeInactive) eligible = eligible.filter((p: any) => p.status === "active")
  if (playerIds) eligible = eligible.filter((p: any) => playerIds.includes(p.id))

  if (eligible.length < 2) {
    return NextResponse.json({ error: "Minimal 2 pemain aktif dibutuhkan untuk generate jadwal" }, { status: 400 })
  }

  const pairs = roundRobinPairs(eligible.map((p: any) => p.id), rounds)

  const rows: any[] = []
  for (const gr of pairs) {
    for (const m of gr.matches) {
      rows.push({
        id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        league,
        round: gr.round,
        player1_id: m.player1_id,
        player2_id: m.player2_id,
        date: scheduleDateFor(startDate, gr.round, roundsPerWeek),
        time,
        status,
      })
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada pasangan yang bisa dijadwalkan" }, { status: 400 })
  }

  const { data, error: insError } = await (supabase as any)
    .from("tco_league_schedules")
    .insert(rows)
    .select("*")

  if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    created: rows.length,
    rounds: pairs.length,
    data: data || rows,
  })
}