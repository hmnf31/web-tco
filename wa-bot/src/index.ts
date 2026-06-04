import 'dotenv/config'
import express from 'express'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import { fetchLatestNews } from './rss-fetcher'
import { translateNews } from './translate'
import { sendBroadcast } from './broadcast'

const PORT = parseInt(process.env.PORT || '3001', 10)
const CRON_TOKEN = process.env.TCO_CRON_TOKEN
const WA_GROUP_ID = process.env.WA_GROUP_ID
const WEBSITE_URL = process.env.TCO_WEBSITE_URL || 'https://web-tco.vercel.app'

const app = express()
app.use(express.json())

// ---------------------------------------------------------------------------
// WhatsApp Client Initialization
// ---------------------------------------------------------------------------
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  },
})

client.on('qr', (qr: string) => {
  qrcode.generate(qr, { small: true })
  console.log('\n🔐 Scan the QR code above with your WhatsApp to authenticate the bot.')
})

client.on('ready', () => {
  console.log('✅ WhatsApp bot is authenticated and ready!')
})

client.on('disconnected', (reason: string) => {
  console.warn('⚠️ WhatsApp client disconnected:', reason)
})

client.initialize().catch((err) => {
  console.error('❌ Failed to initialize WhatsApp client:', err)
})

// ---------------------------------------------------------------------------
// In-memory seen-articles tracker (idempotency)
// ---------------------------------------------------------------------------
const processedHashes = new Set<string>()

// ---------------------------------------------------------------------------
// Webhook: Trigger News Fetch + Broadcast
// ---------------------------------------------------------------------------
app.all('/api/trigger-news', async (req, res) => {
  // --- Auth check ---
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (CRON_TOKEN && token !== CRON_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!WA_GROUP_ID) {
    return res.status(500).json({ error: 'WA_GROUP_ID environment variable is not set' })
  }

  try {
    // --- Fetch news ---
    const newsItems = await fetchLatestNews()
    const results: { title: string; status: string }[] = []

    for (const item of newsItems) {
      if (processedHashes.has(item.hash)) {
        results.push({ title: item.title, status: 'skipped (duplicate)' })
        continue
      }

      // --- Translate ---
      let translated: { headline: string; summary: string; slug: string }
      try {
        translated = await translateNews(item.title, item.description)
      } catch (err) {
        console.error(`Translation failed for "${item.title}":`, err)
        results.push({ title: item.title, status: 'translation failed' })
        continue
      }

      // --- Broadcast ---
      const sent = await sendBroadcast(
        client,
        WA_GROUP_ID,
        translated.headline,
        translated.summary,
        translated.slug,
        WEBSITE_URL,
      )

      if (sent) {
        processedHashes.add(item.hash)
        results.push({ title: item.title, status: 'broadcasted' })
      } else {
        results.push({ title: item.title, status: 'broadcast failed' })
      }
    }

    return res.json({
      success: true,
      total: newsItems.length,
      results,
    })
  } catch (err) {
    console.error('Trigger news error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    clientReady: client.info?.pushname ? true : false,
  })
})

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 TCO WhatsApp Bot listening on port ${PORT}`)
  console.log(`   Webhook: POST/GET http://localhost:${PORT}/api/trigger-news`)
  console.log(`   Health:  GET  http://localhost:${PORT}/health`)
})
