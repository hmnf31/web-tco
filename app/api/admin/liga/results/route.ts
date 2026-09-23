import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"

export async function GET(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any).from("tco_league_results").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const body = await request.json()
  const scheduleId = String(body?.scheduleId || "")
  if (!scheduleId) {
    return NextResponse.json({ error: "scheduleId wajib diisi" }, { status: 400 })
  }

  const score1 = Number(body?.score1 ?? 0)
  const score2 = Number(body?.score2 ?? 0)
  const wo = Number(body?.wo ?? 0)
  const pgn = typeof body?.pgn === "string" && body.pgn.trim() ? body.pgn.trim() : null

  const supabase = getSupabaseAdmin()

  // 1. Simpan / update hasil berdasarkan schedule (unique)
  const { data: existingRows } = await (supabase as any)
    .from("tco_league_results")
    .select("id")
    .eq("schedule_id", scheduleId)
    .limit(1)

  let resultError: any = null
  if (existingRows && existingRows.length > 0) {
    const r = await (supabase as any)
      .from("tco_league_results")
      .update({ score1, score2, pgn })
      .eq("schedule_id", scheduleId)
    resultError = r.error
  } else {
    const r = await (supabase as any)
      .from("tco_league_results")
      .insert([{ id: `r${Date.now().toString(36)}`, schedule_id: scheduleId, score1, score2, pgn }])
    resultError = r.error
  }

  if (resultError) return NextResponse.json({ error: resultError.message }, { status: 500 })

  // 2. Tandai schedule selesai
  const { error: schErr } = await (supabase as any)
    .from("tco_league_schedules")
    .update({ status: "completed" })
    .eq("id", scheduleId)
  if (schErr) return NextResponse.json({ error: schErr.message }, { status: 500 })

  // 3. Penalti WO
  const schedule = (await (supabase as any).from("tco_league_schedules").select("*").eq("id", scheduleId).single()).data
  if (schedule && wo > 0) {
    const loserId = wo === 1 ? schedule.player1_id : schedule.player2_id
    const p = (await (supabase as any).from("tco_league_players").select("*").eq("id", loserId).single()).data
    if (p) {
      const newWo = (p.wo_count || 0) + 1
      const newStatus = newWo >= 2 ? "disqualified" : "active"
      await (supabase as any)
        .from("tco_league_players")
        .update({ wo_count: newWo, status: newStatus })
        .eq("id", loserId)
    }
  }

  return NextResponse.json({ success: true })
}