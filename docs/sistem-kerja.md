# Sistem Kerja TCO Website

## 1. Cron Job — Fetch Berita Otomatis

**Trigger:** Setiap hari pukul **08:00 WIB** via Vercel Cron (`vercel.json`)

### Alur:

```
[Vercel Cron] ──GET──> /api/cron/fetch-news
                              │
                              ▼
                    Parse RSS Chess.com/news
                              │
                              ▼
           Looping setiap item berita (≈20 item/hari)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        Cek duplikat    Extract full     Extract og:image
        (SHA-256        content dari    dari halaman
        source_url)     halaman artikel artikel
              │         (<p> tags)          │
              │               │             │
              └───────┬───────┘             │
                      ▼                     ▼
              Groq Translation          Watermark
              (llama-3.3-70b)           (Sharp - "TCO
              EN → ID, full text        Official" overlay)
                      │                     │
                      └───────┬─────────────┘
                              ▼
                      Simpan ke Supabase
                      `tco_articles` table
                              │
                              ▼
                      Tampil di halaman
                      /artikel & homepage
```

### Komponen:

| File | Fungsi |
|---|---|
| `vercel.json` | Jadwal cron `0 8 * * *` |
| `app/api/cron/fetch-news/route.ts` | Pipeline utama: RSS → content extract → Groq → watermark → DB |
| `lib/translate-news.ts` | Groq API call (LLaMA 3.3 70B), no max_tokens |
| `lib/watermark-image.ts` | Sharp overlay "TCO Official" di pojok kanan bawah |
| `lib/supabaseAdmin.ts` | Supabase client dengan service_role key |

### Auth:
- Header `Authorization: Bearer <CRON_SECRET>` atau `x-vercel-cron`
- Vercel otomatis mengirim header internal `x-vercel-cron` untuk cron jobs

### Duplikasi:
- Setiap URL artikel di-hash dengan SHA-256 (`source_url_hash`)
- Dicek ke database sebelum insert → skip jika sudah ada

---

## 2. WhatsApp Bot — Broadcast Berita

**Deploy target:** Render (Web Service)

### Alur:

```
[Vercel Cron / Manual] ──GET/POST──> https://bot.onrender.com/api/trigger-news
                                           │
                                           ▼
                                    Auth check (Bearer token)
                                           │
                                           ▼
                                    Fetch RSS Chess.com
                                           │
                                           ▼
                            ┌─── Loop setiap item ───┐
                            │                        │
                            ▼                        ▼
                      Cek duplikat            Groq Translation
                      (in-memory Set)         EN → ID (headline
                                              + summary teaser)
                            │                        │
                            └────────┬───────────────┘
                                     ▼
                           Send Broadcast ke
                           WhatsApp Group
                           (whatsapp-web.js)
```

### Komponen WA Bot:

| File | Fungsi |
|---|---|
| `wa-bot/src/index.ts` | Express server + WhatsApp client (whatsapp-web.js) |
| `wa-bot/src/rss-fetcher.ts` | Fetch RSS Chess.com, extract metadata |
| `wa-bot/src/translate.ts` | Groq translate → JSON output {headline, summary, slug} |
| `wa-bot/src/broadcast.ts` | Format & kirim pesan ke grup WA |
| `wa-bot/.env.example` | Template env variables |

### Format Broadcast WA:

```
📰 BERITA CATUR TERBARU TCO ARENA

{headline}

"{summary}..."

👉 Baca selengkapnya secara instan di Web Resmi TCO:
{website}/artikel/{slug}

---
TCO Official
Gens Una Sumus!
```

### Catatan Deploy Render:

1. Root directory: `wa-bot`
2. Build command: `npm install`
3. Start command: `npm run start`
4. Environment variables:
   - `PORT` → 10000 (Render default)
   - `TCO_CRON_TOKEN` → untuk auth webhook
   - `GROQ_API_KEY` → API key Groq
   - `WA_GROUP_ID` → ID grup WA tujuan (format: `62812...@g.us`)
   - `TCO_WEBSITE_URL` → `https://web-tco.vercel.app`
5. Pertama jalan, scan QR code dari terminal Render via WhatsApp

### Catatan Penting:
- **whatsapp-web.js** butuh headless Chrome → Render support (pilih plan yg sesuai)
- **In-memory Set** untuk tracking duplikat → akan reset jika bot restart
- Tidak ada database terpisah untuk WA bot (berbeda dengan cron Next.js yang pakai Supabase)

---

## 3. Admin Dashboard — Manajemen Artikel Manual

**Route:** `/admin/dashboard`

### Fitur:
- Multi-user auth (Fajar, Riyuu, Admin TCO) — hardcoded di `lib/admin-auth.ts`
- Tab Members & Articles
- Create/Edit artikel + tombol "Optimize with AI" (Groq)

### Alur Optimasi Manual:

```
[Admin klik "Optimize with AI"] ──POST──> /api/admin/optimize-article
                                            │
                                            ▼
                                     Groq Translate
                                     (sama seperti cron)
                                            │
                                            ▼
                                     Update content field
                                     di form editor
```

---

## 4. Database Supabase

**Project ref:** `kixbxslvunzcdqpzpdjj`

### Table `tco_articles`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| created_at | timestamptz | auto |
| title | text | Judul terjemahan Indonesia |
| slug | text | UNIQUE, untuk URL |
| content | text | Full translation |
| excerpt | text | 200 chars pertama |
| source_url | text | Link artikel asli Chess.com |
| source_url_hash | text | SHA-256, untuk dedup |
| image_url | text | og:image asli |
| watermarked_image_url | text | Hasil watermark |
| published_at | timestamptz | Waktu publikasi RSS |
| author | text | Default "TCO Official" |
| category | text | Contoh: "Norway Chess" |
| is_published | boolean | Default true |

### RLS Policies:
- `anon`: SELECT only
- `service_role`: ALL (untuk cron & admin)

---

## 5. Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://kixbxslvunzcdqpzpdjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_ROLE_KEY=service_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
CRON_SECRET=your_cron_secret_here
```

---

## 6. Deploy Checklist

- [ ] Set env variables di Vercel Dashboard
- [ ] Deploy Next.js ke Vercel
- [ ] Verifikasi cron berjalan (cek log Vercel Cron)
- [ ] Deploy wa-bot ke Render
- [ ] Scan QR WA bot (pertama kali)
- [ ] Test trigger webhook WA bot
- [ ] Update cron Vercel untuk panggil WA bot endpoint (opsional)
