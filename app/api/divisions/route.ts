import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabaseClient"
import { DEFAULT_DIVISION_PLAYERS } from "@/lib/divisions"

export async function GET() {
  const { data, error } = await (getSupabase() as any)
    .from("tco_division_players")
    .select("*")
    .eq("is_active", true)
    .order("division", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ data: DEFAULT_DIVISION_PLAYERS, fallback: true })
  return NextResponse.json({ data: data?.length ? data : DEFAULT_DIVISION_PLAYERS })
}
