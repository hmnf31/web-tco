import Parser from 'rss-parser'
import { createHash } from 'crypto'

const RSS_URL = 'https://www.chess.com/rss/news'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
    ],
  },
})

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  imageUrl: string
  hash: string
}

export async function fetchLatestNews(): Promise<NewsItem[]> {
  const feed = await parser.parseURL(RSS_URL)
  const items: NewsItem[] = []

  for (const item of feed.items || []) {
    const link = item.link || ''
    if (!link) continue

    let imageUrl = ''
    const media = (item as any).media
    if (media?.$?.url) {
      imageUrl = media.$.url
    } else if ((item as any).thumbnail?.$?.url) {
      imageUrl = (item as any).thumbnail.$.url
    } else if (item.enclosure?.url) {
      imageUrl = item.enclosure.url
    }

    items.push({
      title: item.title || 'Untitled',
      link,
      pubDate: item.pubDate || new Date().toISOString(),
      description: item.contentSnippet || item.content || '',
      imageUrl,
      hash: createHash('sha256').update(link).digest('hex'),
    })
  }

  return items
}
