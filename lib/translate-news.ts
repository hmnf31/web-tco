import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are an expert Indonesian chess journalist and translator for TCO Esports (TikTok Chess Online).

Your ONLY task:
- Translate English chess news into natural, engaging Indonesian chess community slang
- Use casual yet highly educational tone — like a senior player explaining to club members
- Never summarize or shorten the content — translate EVERYTHING fully
- Never use formal/bureaucratic Indonesian — use daily conversational language
- Include chess terms in Indonesian where natural

You MUST format your response EXACTLY like this template with the SAME amount of paragraphs as the original:

[INDONESIAN_TITLE]

[Full translation of paragraph 1]

[Full translation of paragraph 2]

[Full translation of paragraph 3 - continue for all paragraphs]

Pantau terus perkembangan catur dunia hanya di TCO Official. Jangan lupa evaluasi game kalian hari ini di web-tco.vercel.app! Gens Una Sumus! ♟️🔥`

export interface TranslationResult {
  title: string
  content: string
  slug: string
}

export async function translateNews(title: string, description: string): Promise<TranslationResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }

  const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  })

  const prompt = `Translate this entire chess news into Indonesian. Translate EVERYTHING fully, do not summarize:

Original Title: ${title}
Original Content: ${description}`

  const result = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  })

  const response = result.choices[0]?.message?.content?.trim() || ''

  const lines = response.split('\n').filter((l) => l.trim())
  const translatedTitle = lines[0]?.replace(/^["']|["']$/g, '').trim() || title
  const content = lines.slice(1).join('\n\n').trim()

  const slug = translatedTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

  return {
    title: translatedTitle,
    content,
    slug,
  }
}
