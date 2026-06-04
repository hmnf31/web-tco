import { NextResponse } from "next/server"
import Parser from "rss-parser"
import { createHash } from "crypto"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { translateNews } from "@/lib/translate-news"
import { watermarkImage } from "@/lib/watermark-image"

const RSS_URL = "https://www.chess.com/rss/news"
const CRON_SECRET = process.env.CRON_SECRET

const parser = new Parser()

async function extractImageFromUrl(articleUrl: string): Promise<string> {
  try {
    const res = await fetch(articleUrl, { signal: AbortSignal.timeout(5000) })
    const html = await res.text()
    const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    return match?.[1] || ""
  } catch {
    return ""
  }
}

async function extractFullContentFromUrl(articleUrl: string): Promise<string> {
  try {
    const res = await fetch(articleUrl, { signal: AbortSignal.timeout(10000) })
    const html = await res.text()
    const paragraphRegex = /<p[^>]*>([^<]+)<\/p>/g
    const paragraphs: string[] = []
    let pMatch
    while ((pMatch = paragraphRegex.exec(html)) !== null) {
      const text = pMatch[1].trim()
      if (text.length > 30) paragraphs.push(text)
    }
    return paragraphs.join("\n\n")
  } catch {
    return ""
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-vercel-cron")
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && authHeader !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const feed = await parser.parseURL(RSS_URL)

    const results: { title: string; slug: string; status: string }[] = []

    for (const item of feed.items || []) {
      const sourceUrl = item.link || ""
      if (!sourceUrl) continue

      const sourceUrlHash = createHash("sha256").update(sourceUrl).digest("hex")

      const { data: existing } = await supabase
        .from("tco_articles")
        .select("id")
        .eq("source_url_hash", sourceUrlHash)
        .maybeSingle()

      if (existing) {
        results.push({ title: item.title || "", slug: "", status: "skipped (duplicate)" })
        continue
      }

      const title = item.title || "Untitled"
      let description = item.contentSnippet || item.content || ""
      if (description.length < 500) {
        const fullContent = await extractFullContentFromUrl(sourceUrl)
        if (fullContent.length > description.length) description = fullContent
      }
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()

      let imageUrl = ""
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url
      }
      if (!imageUrl) {
        try {
          imageUrl = await extractImageFromUrl(sourceUrl)
        } catch {
          // ignore
        }
      }

      let translation: { title: string; content: string; slug: string }
      try {
        translation = await translateNews(title, description)
      } catch (err) {
        console.error(`Translation failed for "${title}":`, err)
        translation = {
          title,
          content: description,
          slug: title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 80),
        }
      }

      let watermarkedImageUrl = ""
      if (imageUrl) {
        try {
          watermarkedImageUrl = await watermarkImage(imageUrl)
        } catch (err) {
          console.error(`Watermark failed for "${title}":`, err)
          watermarkedImageUrl = imageUrl
        }
      }

      const { error } = await supabase
        .from("tco_articles")
        .insert({
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          excerpt: translation.content.split("\n\n")[0]?.substring(0, 200) || "",
          source_url: sourceUrl,
          source_url_hash: sourceUrlHash,
          image_url: imageUrl,
          watermarked_image_url: watermarkedImageUrl,
          published_at: pubDate,
          author: "TCO Official",
          category: "Chess News",
          is_published: true,
        } as any)

      if (error) {
        console.error(`Failed to insert article "${translation.title}":`, error)
        results.push({ title: translation.title, slug: translation.slug, status: `error: ${error.message}` })
      } else {
        results.push({ title: translation.title, slug: translation.slug, status: "inserted" })
      }
    }

    return NextResponse.json({
      success: true,
      total: feed.items?.length || 0,
      results,
    })
  } catch (err) {
    console.error("Cron fetch-news error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
