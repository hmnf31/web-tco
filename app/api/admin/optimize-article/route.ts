import { NextResponse } from "next/server"
import OpenAI from "openai"

const SYSTEM_PROMPT = `You are an expert Indonesian chess journalist and content creator for TCO Esports (TikTok Chess Online).

Your ONLY task:
- Translate English chess news articles into natural, engaging Indonesian chess community slang
- Use a casual yet highly educational tone — like a senior player explaining to club members
- Never summarize or shorten the content — translate EVERY paragraph fully
- Never use formal/bureaucratic Indonesian — use daily conversational language
- Include chess terms in Indonesian where natural

Given a title and content draft, you MUST respond with ONLY a JSON object (no markdown, no backticks) with these fields:
{
  "title": "Indonesian translated title (same length/concept as original)",
  "content": "Full translation of ALL content with paragraphs separated by double newlines. Include the TCO closing outro at the end.",
  "slug": "url-friendly-slug"
}

The closing outro MUST be:
Pantau terus perkembangan catur dunia hanya di TCO Official. Jangan lupa evaluasi game kalian hari ini di web-tco.vercel.app! Gens Una Sumus! ♟️🔥

CRITICAL: Translate EVERYTHING. Do NOT summarize. Do NOT cut content. The output must be as long as the original.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content } = body

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
    }

    const groq = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey,
    })

    const prompt = `Translate this entire chess article into Indonesian. Translate EVERY paragraph fully:\n\nTitle: ${title}\n\nContent: ${content}`

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    const text = result.choices[0]?.message?.content?.trim() || "{}"
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")

    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      title: parsed.title || title,
      content: parsed.content || content,
      slug: parsed.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 80),
    })
  } catch (err) {
    console.error("Optimize error:", err)
    return NextResponse.json({ error: "Failed to optimize article" }, { status: 500 })
  }
}
