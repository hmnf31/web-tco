import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, whatsapp_number, game_username, division, payment_info } = body

    if (!full_name || !whatsapp_number || !game_username || !division) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
    }

    const validDivisions = ["Chess", "MLBB", "Both"]
    if (!validDivisions.includes(division)) {
      return NextResponse.json({ error: "Divisi tidak valid" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from("tco_members")
      .insert({
        full_name,
        whatsapp_number,
        game_username,
        division,
        payment_info: payment_info || "",
        status: "Pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
