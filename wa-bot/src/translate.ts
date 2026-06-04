import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are an expert Indonesian chess journalist and translator for TCO Esports (TikTok Chess Online).

Your ONLY task:
- Translate English chess news into natural, engaging Indonesian chess community slang
- Use a casual yet highly educational tone
- Never summarize or shorten the content — translate EVERYTHING fully
- Never use formal/bureaucratic Indonesian

Given an English chess news title and description, you MUST respond with ONLY a JSON object (no markdown, no backticks) with these fields:
{
  "headline": "Catchy Indonesian translated headline",
  "summary": "First 3 lines of the translated content in Indonesian as a teaser (max 250 chars)",
  "slug": "url-friendly-slug-derived-from-headline"
}`

export interface TranslationResult {
  headline: string
  summary: string
  slug: string
}

export async function translateNews(title: string, description: string): Promise<TranslationResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  })

  const prompt = `Translate this entire chess news into Indonesian. Translate EVERYTHING fully:

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

  const text = result.choices[0]?.message?.content?.trim() || '{}'
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  const parsed: TranslationResult = JSON.parse(text)

  if (!parsed.slug) {
    parsed.slug = parsed.headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80)
  }

  return parsed
}
