import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"

const SHEET_SECRET = process.env.SHEET_SYNC_SECRET || ""

function isSheetAuthed(request: Request): boolean {
  if (!SHEET_SECRET) return false
  const given = request.headers.get("x-sheet-secret") || ""
  return given === SHEET_SECRET
}

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  const sheetAuthed = isSheetAuthed(request)
  if (guard instanceof NextResponse && !sheetAuthed) return guard

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })

  const supabase = getSupabaseAdmin()

  if (body.action === "export" || (body.export === true || !body.action)) {
    const [playersRes, schedulesRes, resultsRes, configRes] = await Promise.all([
      (supabase as any).from("tco_league_players").select("*"),
      (supabase as any).from("tco_league_schedules").select("*"),
      (supabase as any).from("tco_league_results").select("*"),
      (supabase as any).from("tco_league_config").select("*"),
    ])
    for (const res of [playersRes, schedulesRes, resultsRes, configRes]) {
      if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 })
    }
    const seasonRow = (configRes.data || []).find((c: { key: string }) => c.key === "season")
    return NextResponse.json({
      success: true,
      data: {
        season: seasonRow?.value || "1",
        players: playersRes.data || [],
        schedules: schedulesRes.data || [],
        results: resultsRes.data || [],
      },
    })
  }

  // ── Import dari spreadsheet → Supabase ───────────────────────────────────
  const summaries: Record<string, number> = {}
  const errors: string[] = []

  if (Array.isArray(body.players) && body.players.length > 0) {
    const rows = body.players.map((r: any) => ({
      id: String(r.id),
      name: String(r.name || ""),
      username: String(r.username || ""),
      league: ["Liga 1", "Liga 2", "Liga 3", "Liga 4"].includes(r.league) ? r.league : "Liga 1",
      elo: Math.max(0, Math.round(Number(r.elo || 1000))),
      elo_avg: Math.max(0, Math.round(Number(r.elo_avg || 0))),
      pp: String(r.pp || "").trim().slice(0, 500),
      wo_count: Math.max(0, Math.round(Number(r.wo_count || 0))),
      status: r.status === "disqualified" ? "disqualified" : "active",
    }))
    const { error } = await (supabase as any)
      .from("tco_league_players")
      .upsert(rows, { onConflict: "id" })
    if (error) errors.push(`players: ${error.message}`)
    else summaries.players = rows.length
  }

  if (Array.isArray(body.schedules) && body.schedules.length > 0) {
    const rows = body.schedules.map((r: any) => ({
      id: String(r.id),
      league: ["Liga 1", "Liga 2", "Liga 3", "Liga 4"].includes(r.league) ? r.league : "Liga 1",
      round: Math.max(1, Math.round(Number(r.round || 1))),
      player1_id: String(r.player1_id || ""),
      player2_id: String(r.player2_id || ""),
      date: String(r.date || ""),
      time: String(r.time || ""),
      status: r.status === "completed" ? "completed" : r.status === "live" ? "live" : "upcoming",
    }))
    const { error } = await (supabase as any)
      .from("tco_league_schedules")
      .upsert(rows, { onConflict: "id" })
    if (error) errors.push(`schedules: ${error.message}`)
    else summaries.schedules = rows.length
  }

  if (Array.isArray(body.results) && body.results.length > 0) {
    const rows = body.results.map((r: any) => ({
      id: String(r.id || `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`),
      schedule_id: String(r.schedule_id || ""),
      score1: Number(r.score1 || 0),
      score2: Number(r.score2 || 0),
      pgn: typeof r.pgn === "string" && r.pgn.trim() ? r.pgn.trim() : null,
    }))
    const { error } = await (supabase as any)
      .from("tco_league_results")
      .upsert(rows, { onConflict: "schedule_id" })
    if (error) errors.push(`results: ${error.message}`)
    else summaries.results = rows.length
  }

  if (body.season && String(body.season).trim()) {
    const value = String(body.season).trim()
    const { data: existing } = await (supabase as any)
      .from("tco_league_config")
      .select("key")
      .eq("key", "season")
      .limit(1)
    const { error } = existing && existing.length > 0
      ? await (supabase as any).from("tco_league_config").update({ value }).eq("key", "season")
      : await (supabase as any).from("tco_league_config").insert([{ key: "season", value }])
    if (error) errors.push(`season: ${error.message}`)
    else summaries.season = 1
  }

  if (errors.length > 0) {
    return NextResponse.json({ success: false, error: errors.join("; ") }, { status: 500 })
  }

  return NextResponse.json({ success: true, imported: summaries })
}