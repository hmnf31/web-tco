import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import { LEAGUES, type League, type Schedule } from "@/lib/league"

function sanitizeSchedule(body: any): Partial<Schedule> {
  const league = LEAGUES.includes(body?.league as League) ? (body.league as League) : "Liga 1"
  const status: Schedule["status"] =
    body?.status === "live" ? "live" : body?.status === "completed" ? "completed" : "upcoming"
  return {
    league,
    round: Math.max(1, Math.round(Number(body?.round || 1))),
    player1_id: String(body?.player1_id || ""),
    player2_id: String(body?.player2_id || ""),
    date: String(body?.date || ""),
    time: String(body?.time || ""),
    status,
  }
}

export async function GET(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any).from("tco_league_schedules").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const body = await request.json()
  const clean = sanitizeSchedule(body)
  if (!clean.player1_id || !clean.player2_id || clean.player1_id === clean.player2_id) {
    return NextResponse.json({ error: "Pilih dua player yang berbeda" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (body.id) {
    const { error } = await (supabase as any)
      .from("tco_league_schedules")
      .update(clean)
      .eq("id", body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await (supabase as any)
      .from("tco_league_schedules")
      .insert([{ id: body.id || `s${Date.now().toString(36)}`, ...clean }])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const { id, league } = await request.json()
  const supabase = getSupabaseAdmin()

  // Bulk reset: hapus semua jadwal satu liga beserta hasil terkait
  if (league && LEAGUES.includes(league as League)) {
    const { data: rows } = await (supabase as any)
      .from("tco_league_schedules")
      .select("id")
      .eq("league", league)
    const ids = (rows || []).map((r: any) => r.id)
    if (ids.length > 0) {
      const { error: resErr } = await (supabase as any)
        .from("tco_league_results")
        .delete()
        .in("schedule_id", ids)
      if (resErr) return NextResponse.json({ error: resErr.message }, { status: 500 })
    }
    const { error } = await (supabase as any)
      .from("tco_league_schedules")
      .delete()
      .eq("league", league)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, deleted: ids.length })
  }

  if (!id) return NextResponse.json({ error: "Parameter id wajib diisi" }, { status: 400 })
  const { error } = await (supabase as any).from("tco_league_schedules").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}