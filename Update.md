## Update

- Role
We want to build a completely production-grade, autonomous microservice that acts as an Automated Chess News Scraper, AI Translator, and WhatsApp Group Broadcast Bot for the TCO (TikTok Chess Online) community. 

Due to Vercel Serverless timeout limitations, we will build this as a dedicated, lightweight Node.js/Express service deployed on Render/Railway, which will expose a secure webhook endpoint triggered by a Vercel Cron Job.

Please generate the complete codebase with the following modular architecture:

# Worker

We want to build an Autonomous News & Article Aggregator system for the TCO website. The system should run automatically in the background via a daily cron job to fetch, translate, format, watermark, and publish chess news.

Please implement an API route at `app/api/cron/fetch-news/route.ts` with the following production pipeline:

1. NEWS FETCHING LAYER:
   - Fetch the latest chess news articles from the official Chess.com RSS Feed/API (`https://www.chess.com/rss/news`) or a valid public chess news RSS aggregator.
   - Extract the following fields from the feed: Title, PubDate, Original Link, Description/Content, and the main image URL from the Media/Enclosure CDN tags.

2. AI TRANSLATION & TEMPLATE FORMATTING (Using Gemini/OpenAI API):
   - Send the extracted English text to an LLM translation function.
   - Instruct the AI to translate the content into engaging, natural Indonesian chess community slang (casual yet highly educational).
   - Enforce a strict structural template for the final output:
     * Catchy Indonesian Title
     * Main Body Paragraphs (cleanly separated)
     * Mandatory TCO Closing Outro: "Pantau terus perkembangan catur dunia hanya di TCO Official. Jangan lupa evaluasi game kalian hari ini di web-tco.vercel.app! Gens Una Sumus! ♟️🔥"

3. IMAGE & WATERMARK HANDLING:
   - Take the original image CDN URL from Chess.com.
   - To avoid pure hotlinking and add our branding, create a helper that can overlay a subtle visual watermark text ("TCO Official") or a tiny translucent logo on the bottom-right corner of the image dynamically (you can use an HTML5 Canvas on the client side when rendering, or an edge-runtime image manipulation library like 'sharp' or a Cloudinary transformation URL if integrated).

4. AUTOMATED DATABASE PERSISTENCE:
   - Check if the article already exists in our database using the unique original URL hash to prevent duplicates.
   - If it is a new article, save it into our database (Title, Content, Watermarked Image URL, Publish Date, Slug).
   - Set the route authorization headers so that only verified Vercel Cron Job triggers can execute this endpoint.

Generate the clean API background pipeline script along with the database schema fields required to display these autonomous articles seamlessly on our frontend news section.

# Worker 2

1. PROJECT SETUP & WHATSAPP-WEB.JS INITIALIZATION:
   - Create a standard Node.js project with Express, TypeScript, dotenv, and 'whatsapp-web.js' paired with 'qrcode-terminal'.
   - Initialize the `Client` from `whatsapp-web.js` with Puppeteer headless configurations optimized for low-resource Linux environments (Docker/Render flags: `--no-sandbox`, `--disable-setuid-sandbox`).
   - Implement the `client.on('qr', ...)` listener to render a QR code in the server terminal so I can scan it once using my phone to authenticate the bot.
   - Implement persistent session authentication storage using `LocalAuth` so the bot stays logged in even if the server restarts.

2. SECURE WEBHOOK & SCRAPER CONTROLLER (`/api/trigger-news`):
   - Expose a POST/GET route protected by a secure Bearer Token/API Key check from environment variables (`process.env.TCO_CRON_TOKEN`).
   - Upon a validated request, fetch the latest chess news articles from the Chess.com RSS Feed (`https://www.chess.com/rss/news`).
   - Extract: Title, Link, Publication Date, Description, and the main thumbnail image from the media tags.
   - Implement an in-memory or lightweight database check (like a local JSON file tracker or MongoDB if provided) using the original article URL hash to ensure we ONLY process new articles (Idempotency check).

3. AI TRANSLATION & TEXT FORMATTING LAYER:
   - If a new article is found, send the English title and description to the Gemini API or OpenAI API using the official SDK.
   - Use a system prompt instructing the AI to:
     * Translate the text into engaging, natural, and trendy Indonesian chess community slang (casual, informative, and exciting).
     * Automatically generate a short, high-engagement 3-line summary of the news.
     * Convert the original title into a catchy, clickbait-free Indonesian headline.
     * Generate a URL-friendly slug from the translated title (e.g., "magnus-carlsen-juara" -> web-tco.vercel.app/news/magnus-carlsen-juara).

4. WHATSAPP BROADCAST ENGINE:
   - Once the translated payload is ready, find the target TCO WhatsApp Group ID from `process.env.WA_GROUP_ID`.
   - Format the broadcast message with strict WhatsApp markdown styling exactly like this:
     
     *📰 BERITA CATUR TERBARU TCO ARENA*
     
     *[INSERT_TRANSLATED_HEADLINE_HERE]*
     
     _" [INSERT_SHORT_3_LINE_SUMMARY_HERE]... "_
     
     👉 *Baca selengkapnya secara instan di Web Resmi TCO:*
     https://web-tco.vercel.app/artikel/[INSERT_ARTICLE_SLUG_HERE]
     
     ---
     TCO Official 
     Gens Una Sumus!

   - Use `client.sendMessage(groupId, formattedText)` to fire the broadcast.
   - Ensure a robust try/catch system wraps the WhatsApp delivery so network drops or session disconnections don't crash the entire Node.js server script.

Generate the full package.json dependencies, the main application file containing the client lifecycle, the RSS parser layer, the translation wrapper, and clear setup instructions. Do not use placeholders or leave functions empty.
