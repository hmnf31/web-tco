import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabaseClient"

export async function GET() {
  const supabase = getSupabase()
  
  const { data, error } = await (supabase as any)
    .from("tco_announcements")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
