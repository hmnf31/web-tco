import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { validateAdmin } from "@/lib/admin-auth"
import sanitizeHtml from "sanitize-html"

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "h3", "h4", "h5", "h6",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption", "hr", "br",
    "span", "div", "section",
  ]),
  allowedAttributes: {
    "*": ["style", "class", "id", "align"],
    "a": ["href", "target", "rel"],
    "img": ["src", "alt", "width", "height"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
    "table": ["border", "cellpadding", "cellspacing"],
  },
  allowedStyles: {
    "*": {
      "font-family": [/.*/],
      "font-size": [/^\d+px$/],
      "text-align": [/^(left|right|center|justify)$/],
      "color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      "font-weight": [/^bold$/],
      "font-style": [/^italic$/],
      "text-decoration": [/^underline$/],
    },
  },
}

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

    let gamesJson = body.games_json
    if (typeof gamesJson === "string") {
      try { gamesJson = JSON.parse(gamesJson) } catch { gamesJson = [] }
    }

    const sanitizedContent = sanitizeHtml(body.content || "", SANITIZE_OPTIONS)

    const updateData: any = {
      title: body.title,
      slug,
      content: sanitizedContent,
      excerpt: sanitizedContent.replace(/<[^>]*>/g, "").split(/\s+/).slice(0, 40).join(" ") || "",
      image_url: body.image_url || "",
      watermarked_image_url: body.image_url || "",
      image_caption: body.image_caption || "",
      language: body.language || "id",
      published_at: body.published_at || new Date().toISOString(),
      author: body.author || user.name,
      category: body.category || "Chess News",
      is_published: true,
      games_json: JSON.stringify(gamesJson || []),
    }

    if (body.id) {
      const { error } = await (supabase as any)
        .from("tco_articles")
        .update(updateData)
        .eq("id", body.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await (supabase as any)
        .from("tco_articles")
        .insert({
          ...updateData,
          source_url: body.source_url || "",
          source_url_hash: body.source_url_hash || `manual-${Date.now()}`,
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
