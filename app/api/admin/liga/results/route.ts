import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import { GAME_LINK_MIGRATION, SCORE_OPTS, checkGameLink, describeDbError, isMissingGameLinkColumn } from "@/lib/league"

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

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })
  const scheduleId = String(body?.scheduleId || "")
  if (!scheduleId) {
    return NextResponse.json({ error: "scheduleId wajib diisi" }, { status: 400 })
  }

  const score1 = Number(body?.score1 ?? 0)
  const score2 = Number(body?.score2 ?? 0)
  const wo = Number(body?.wo ?? 0)
  const validScore = SCORE_OPTS.some(option => option.s1 === score1 && option.s2 === score2 && option.wo === wo)
  if (!validScore || !Number.isFinite(score1) || !Number.isFinite(score2) || ![0, 1, 2].includes(wo)) {
    return NextResponse.json({ error: "Skor atau status WO tidak valid" }, { status: 400 })
  }

  const link1 = checkGameLink(body?.game1Url)
  if (!link1.ok) return NextResponse.json({ error: `Game 1 — ${link1.reason}` }, { status: 400 })
  const link2 = checkGameLink(body?.game2Url)
  if (!link2.ok) return NextResponse.json({ error: `Game 2 — ${link2.reason}` }, { status: 400 })
  const game1_url = link1.url || null
  const game2_url = link2.url || null

  const supabase = getSupabaseAdmin()
  const { data: schedule, error: scheduleError } = await (supabase as any)
    .from("tco_league_schedules")
    .select("id, player1_id, player2_id")
    .eq("id", scheduleId)
    .single()
  if (scheduleError || !schedule) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 })

  // 1. Simpan / update hasil berdasarkan schedule (unique)
  // Link game bersifat opsional, dan kolomnya belum tentu ada di database.
  // Kalau kolomnya belum ada, skor tetap disimpan tanpa link daripada gagal total.
  const base = { score1, score2, wo_player: wo }
  const withLinks = { ...base, game1_url, game2_url }
  const { data: existingRows } = await (supabase as any)
    .from("tco_league_results")
    .select("id, wo_player")
    .eq("schedule_id", scheduleId)
    .limit(1)
  const isUpdate = Boolean(existingRows && existingRows.length > 0)

  const write = (payload: Record<string, unknown>) => isUpdate
    ? (supabase as any).from("tco_league_results").update(payload).eq("schedule_id", scheduleId)
    : (supabase as any).from("tco_league_results").insert([{ id: `r${Date.now().toString(36)}`, schedule_id: scheduleId, ...payload }])

  let resultError: any = null
  let linksDropped = false
  const first = await write(withLinks)
  resultError = first.error
  if (isMissingGameLinkColumn(resultError)) {
    resultError = (await write(base)).error
    linksDropped = true
  }

  if (resultError) return NextResponse.json({ error: describeDbError(resultError) }, { status: 500 })

  // 2. Tandai schedule selesai
  const { error: schErr } = await (supabase as any)
    .from("tco_league_schedules")
    .update({ status: "completed" })
    .eq("id", scheduleId)
  if (schErr) return NextResponse.json({ error: schErr.message }, { status: 500 })

  // 3. Penalti WO
  const previousWo = existingRows?.[0]?.wo_player || 0
  if (previousWo !== wo) {
    const affected = [previousWo, wo]
      .filter(value => value > 0)
      .map(value => value === 1 ? schedule.player1_id : schedule.player2_id)
    for (const playerId of new Set(affected)) {
      const p = (await (supabase as any).from("tco_league_players").select("wo_count").eq("id", playerId).single()).data
      if (!p) continue
      const delta = (wo > 0 && (wo === 1 ? schedule.player1_id : schedule.player2_id) === playerId ? 1 : 0)
        - (previousWo > 0 && (previousWo === 1 ? schedule.player1_id : schedule.player2_id) === playerId ? 1 : 0)
      const newWo = Math.max(0, (p.wo_count || 0) + delta)
      const { error } = await (supabase as any).from("tco_league_players").update({ wo_count: newWo, status: newWo >= 3 ? "disqualified" : "active" }).eq("id", playerId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const warning = linksDropped
    ? `Skor tersimpan, tetapi link game belum bisa disimpan. Jalankan ${GAME_LINK_MIGRATION} di Supabase SQL Editor.`
    : null
  return NextResponse.json(warning ? { success: true, warning } : { success: true })
}