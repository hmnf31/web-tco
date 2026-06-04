import { Client } from 'whatsapp-web.js'

export function formatBroadcastMessage(
  headline: string,
  summary: string,
  slug: string,
  websiteUrl: string,
): string {
  return `*📰 BERITA CATUR TERBARU TCO ARENA*

*${headline}*

_"${summary}..."_

👉 *Baca selengkapnya secara instan di Web Resmi TCO:*
${websiteUrl}/artikel/${slug}

---
TCO Official 
Gens Una Sumus!`
}

export async function sendBroadcast(
  client: Client,
  groupId: string,
  headline: string,
  summary: string,
  slug: string,
  websiteUrl: string,
): Promise<boolean> {
  try {
    const message = formatBroadcastMessage(headline, summary, slug, websiteUrl)
    await client.sendMessage(groupId, message)
    console.log(`✅ Broadcast sent successfully for: ${headline}`)
    return true
  } catch (err) {
    console.error(`❌ Failed to send broadcast for "${headline}":`, err)
    return false
  }
}
