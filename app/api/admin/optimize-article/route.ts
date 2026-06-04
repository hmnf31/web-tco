import { NextResponse } from "next/server"
import OpenAI from "openai"

const SYSTEM_PROMPT = `You are an expert Indonesian chess journalist and content creator for TCO Esports (TikTok Chess Online).

Your ONLY task:
- Translate English chess news articles into natural, engaging Indonesian chess community slang
- Use a casual yet highly educational tone — like a senior player explaining to club members
- Never summarize or shorten the content — translate EVERY paragraph fully
- Never use formal/bureaucratic Indonesian — use daily conversational language
- Include chess terms in Indonesian where natural
- STRUKTUR KONTEN: Susun otomatis menjadi paragraf-paragraf yang rapi. SETIAP paragraf WAJIB dibungkus dengan tag <p>. Gunakan tag <strong> untuk istilah penting.

Given a title and content draft, you MUST respond with ONLY a valid JSON object (no markdown, no backticks). 
CRITICAL: The entire JSON response MUST be on ONE SINGLE LINE. Do NOT use literal newlines anywhere in the response. Use \n for any newlines needed within string values.

JSON structure:
{ "title": "...", "content": "Full translation in HTML format with every paragraph wrapped in <p> tags...", "slug": "..." }

The closing outro MUST be included at the end of the content within a <p> tag:
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
    console.log("AI Raw Response Length:", text.length)

    // Robust extraction: find first '{' and last '}'
    let cleaned = text
    const firstBrace = text.indexOf("{")
    const lastBrace = text.lastIndexOf("}")
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = text.substring(firstBrace, lastBrace + 1)
    }

    // Replace literal newlines inside string values with \n
    // This is a common failure point for LLMs returning JSON
    const sanitized = cleaned
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      // Re-fix potential double-escaping of quotes if the AI already tried to be helpful
      .replace(/\\\\n/g, "\\n")

    try {
      // If the above sanitization is too aggressive, we try a more targeted approach
      // but usually the AI returns valid JSON structure with literal newlines.
      let parsed;
      try {
        parsed = JSON.parse(cleaned); // Try original first
      } catch (e) {
        // Targeted fix: only replace newlines that are NOT between fields
        // but for simplicity and common AI behavior, we try a basic fix
        const fixed = cleaned.replace(/[\r\n]+/g, " ");
        parsed = JSON.parse(fixed);
      }

      return NextResponse.json({
        title: parsed.title || title,
        content: parsed.content || content,
        slug: parsed.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 80),
      })
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr, "Cleaned text snippet:", cleaned.substring(0, 100))
      return NextResponse.json({ error: "Gagal memproses respons AI", raw: text }, { status: 500 })
    }
  } catch (err: any) {
    console.error("Optimize route detailed error:", err)
    return NextResponse.json({ 
      error: "Gagal optimasi artikel", 
      details: err?.message || String(err) 
    }, { status: 500 })
  }
}
