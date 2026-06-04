# TCO WhatsApp Bot

Automated Chess News Scraper, AI Translator, and WhatsApp Group Broadcast Bot for TCO Esports.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **WhatsApp:** whatsapp-web.js (Puppeteer)
- **AI Translation:** Google Gemini API
- **RSS Parser:** rss-parser

## Setup

### Prerequisites

- Node.js 18+
- A Google Gemini API key
- A WhatsApp account (for the bot)

### Installation

```bash
cd wa-bot
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3001) |
| `TCO_CRON_TOKEN` | Secret token for webhook authentication |
| `GEMINI_API_KEY` | Google Gemini API key |
| `WA_GROUP_ID` | Target WhatsApp Group ID (e.g., 62812...@g.us) |
| `TCO_WEBSITE_URL` | Your TCO website URL |

### Running

```bash
npm run dev       # Development with hot reload
npm run start     # Production with tsx
npm run build     # Compile to JS
npm run prod      # Run compiled JS
```

On first run, a QR code will appear in the terminal. Scan it with your WhatsApp mobile app to authenticate the bot.

## API Endpoints

### `POST/GET /api/trigger-news`

Trigger news fetch, translation, and broadcast to WhatsApp group.

**Headers:**
- `Authorization: Bearer <TCO_CRON_TOKEN>`

### `GET /health`

Health check endpoint.

## Deployment (Render)

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `wa-bot`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm run start`
5. Add all environment variables from `.env`
6. Deploy

> **Important:** Render's free tier supports Puppeteer. Make sure to select a plan that supports headless Chrome.

## Integration with Vercel Cron

Set up a Vercel Cron Job to call `https://your-bot.onrender.com/api/trigger-news` daily:

```json
{
  "crons": [
    {
      "path": "https://your-bot.onrender.com/api/trigger-news",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Or configure a cron job in Render Dashboard.
