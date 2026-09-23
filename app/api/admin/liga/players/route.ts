import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import { LEAGUES, type League, type Player } from "@/lib/league"

function sanitizePlayer(body: any): Partial<Player> {
  const league = LEAGUES.includes(body?.league as League) ? (body.league as League) : "Liga 1"
  return {
    name: String(body?.name || "").trim(),
    username: String(body?.username || "").trim(),
    league,
    elo: Math.max(0, Math.round(Number(body?.elo || 1000))),
    wo_count: Math.max(0, Math.round(Number(body?.wo_count || 0))),
    status: body?.status === "disqualified" ? "disqualified" : "active",
  }
}

export async function GET(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any)
    .from("tco_league_players")
    .select("*")
    .order("elo", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const body = await request.json()
  const clean = sanitizePlayer(body)
  if (!clean.name) {
    return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (body.id) {
    const { error } = await (supabase as any)
      .from("tco_league_players")
      .update(clean)
      .eq("id", body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await (supabase as any)
      .from("tco_league_players")
      .insert([{ id: body.id || `p${Date.now().toString(36)}`, ...clean }])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const { id } = await request.json()
  const supabase = getSupabaseAdmin()
  const { error } = await (supabase as any).from("tco_league_players").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}