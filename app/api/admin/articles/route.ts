import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { validateAdmin } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")

  const parts = Buffer.from(token, "base64").toString().split(":")
  const user = validateAdmin(parts[0] || "", parts[1] || "")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await (supabase as any)
    .from("tco_articles")
    .select("*")
    .order("published_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")

    const parts = Buffer.from(token, "base64").toString().split(":")
    const user = validateAdmin(parts[0] || "", parts[1] || "")
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80)

    if (body.id) {
      const { error } = await (supabase as any)
        .from("tco_articles")
        .update({
          title: body.title,
          slug,
          content: body.content,
          excerpt: body.content?.split("\n\n")[0]?.substring(0, 200) || "",
          image_url: body.image_url || "",
          watermarked_image_url: body.image_url || "",
          published_at: body.published_at || new Date().toISOString(),
          author: body.author || user.name,
          category: body.category || "Chess News",
          is_published: true,
        })
        .eq("id", body.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await (supabase as any)
        .from("tco_articles")
        .insert({
          title: body.title,
          slug,
          content: body.content,
          excerpt: body.content?.split("\n\n")[0]?.substring(0, 200) || "",
          source_url: body.source_url || "",
          source_url_hash: body.source_url_hash || `manual-${Date.now()}`,
          image_url: body.image_url || "",
          watermarked_image_url: body.image_url || "",
          published_at: body.published_at || new Date().toISOString(),
          author: body.author || user.name,
          category: body.category || "Chess News",
          is_published: true,
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Admin articles error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  const parts = Buffer.from(token, "base64").toString().split(":")
  const user = validateAdmin(parts[0] || "", parts[1] || "")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Article ID required" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await (supabase as any).from("tco_articles").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
