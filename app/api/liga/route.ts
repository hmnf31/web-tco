import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabaseClient"

export async function GET() {
  const supabase = getSupabase()

  const [playersRes, schedulesRes, resultsRes, configRes] = await Promise.all([
    (supabase as any).from("tco_league_players").select("*").order("elo", { ascending: false }),
    (supabase as any).from("tco_league_schedules").select("*"),
    (supabase as any).from("tco_league_results").select("*"),
    (supabase as any).from("tco_league_config").select("*"),
  ])

  for (const res of [playersRes, schedulesRes, resultsRes, configRes]) {
    if (res.error) {
      return NextResponse.json({ error: res.error.message, data: null }, { status: 500 })
    }
  }

  const seasonRow = (configRes.data || []).find((c: { key: string }) => c.key === "season")
  const season = seasonRow?.value || "1"

  return NextResponse.json({
    data: {
      players: playersRes.data || [],
      schedules: schedulesRes.data || [],
      results: (resultsRes.data || []).map((r: any) => ({
        ...r,
        score1: Number(r.score1),
        score2: Number(r.score2),
      })),
      season,
    },
  })
}