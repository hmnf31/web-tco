import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { validateAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]
  const [username, password] = atob(token).split(":")
  if (!validateAdmin(username, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("tco_announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]
  const [username, password] = atob(token).split(":")
  if (!validateAdmin(username, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const supabase = getSupabaseAdmin()

  const dataToSave = {
    title: body.title,
    content: body.content,
    start_date: body.start_date || new Date().toISOString(),
    end_date: body.end_date,
    is_active: body.is_active ?? true,
    link_url: body.link_url || null,
    link_text: body.link_text || null,
  }

  if (body.id) {
    const { error } = await supabase
      .from("tco_announcements")
      .update(dataToSave)
      .eq("id", body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from("tco_announcements")
      .insert([dataToSave])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]
  const [username, password] = atob(token).split(":")
  if (!validateAdmin(username, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("tco_announcements").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
