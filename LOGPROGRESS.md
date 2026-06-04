# LOGPROGRESS — TCO Esports Website

## Deskripsi Proyek
TCO Esports adalah website komunitas catur online TikTok Indonesia #1 dengan fitur-fitur utama:
- Landing page profil klub dengan statistik, jadwal kegiatan, dan form pendaftaran
- Arena Training: platform analisis catur dengan engine terintegrasi (Stockfish WASM)
- Sistem artikel berita otomatis via cron job dari Chess.com RSS
- WhatsApp Bot untuk broadcast berita ke grup komunitas
- Dashboard admin untuk manajemen member, artikel, dan pengumuman

## Timeline Pengembangan

### v0.1.0 — Foundation (Current)

#### Progress Log

**2026-06-04**
- Update tabel pengumuman (`tco_pengumuman`) di Supabase via CLI - API sudah sesuai
- Halaman `/pengumuman` terhubung ke database (dari hardcoded ke API)
- AnnouncementBanner diupdate untuk filter client-side pengumuman aktif
- Schema SQL ditambah field: `language`, `games_json`, `image_caption` di `tco_articles`
- RLS policy `tco_announcements` diubah untuk mengizinkan semua pengumuman aktif
- Deploy ke Vercel production

#### Core Features
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Layout**: Navbar, Footer, AnnouncementBanner, SiteTour, MusicPlayer komponen
- **Routing**: App Router structure dengan halaman:
   - `/` - Homepage dengan hero section, artikel terbaru, jadwal, prestasi
   - `/artikel` - Daftar berita/artikel dengan pagination
   - `/artikel/[slug]` - Halaman detail artikel
   - `/pengumuman` - Daftar pengumuman/kegiatan
   - `/register` - Pendaftaran member
     - `/register/arena` - Pendaftaran arena training
     - `/register/internal` - Pendaftaran member internal
   - `/arena-training/*` - Platform analisis catur chess.com/lichess/PGN
   - `/admin/dashboard` - Dashboard admin
   - `/sponsorship` - Halaman kolaborasi sponsor

#### Arena Training Features
- Analisis game dari Chess.com API dan Lichess API
- Input PGN manual untuk analisis game custom
- Stockfish engine via WASM (lila-stockfish-web) untuk evaluasi posisi
- Classification moves: book, brilliant, best, excellent, good, inaccuracy, mistake, blunder, mate
- Evaluation chart dengan recharts
- Blunder meter statistik
- Playback animasi langkah game

#### News Aggregator System
- Cron job otomatis fetch RSS Chess.com (`api/cron/fetch-news`)
- Translation via Groq API (LLaMA 3.3 70B) EN→ID
- Image watermark otomatis dengan Sharp
- Deduplication via SHA-256 hash source_url
- Storage di Supabase (tco_articles table)

#### WhatsApp Bot
- Express.js server di folder `wa-bot/`
- whatsapp-web.js untuk koneksi WA
- RSS fetch + translation + broadcast ke grup
- Environment: Render deployment

#### Database (Supabase)
- Table `tco_members`: registrasi member (Chess/MLBB/Both divisi)
- Table `tco_articles`: berita/artikel dengan games_json, watermark images
- Table `tco_announcements`: pengumuman/kegiatan dengan start_date, end_date, is_active, link
- RLS policies: anon SELECT only, service_role ALL

#### Admin Dashboard
- Multi-user auth hardcoded (Fajar, Riyuu, Admin TCO)
- Manajemen member dengan export CSV
- Editor artikel dengan TiptapEditor
- Optimasi artikel via AI (Groq)
- Manajemen pengumuman/kegiatan

#### Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GROQ_API_KEY
- CRON_SECRET

## File Structure Penting

```
app/
├── page.tsx              # Homepage
├── layout.tsx            # Root layout + Analytics
├── artikel/              # News pages
├── pengumuman/           # Announcements pages
├── arena-training/       # Chess analysis platform
├── register/             # Registration forms
│   ├── page.tsx          # Register index
│   ├── arena/            # Arena registration
│   └── internal/         # Internal registration
├── admin/dashboard/      # Admin panel
├── sponsorship/          # Sponsorship page
├── api/
│   ├── cron/fetch-news/  # RSS aggregation
│   ├── admin/articles/   # CRUD articles
│   ├── admin/members/    # CRUD members
│   └── register/         # Registration API

components/
├── Navbar.tsx
├── Footer.tsx
├── MusicPlayer.tsx
├── AnnouncementBanner.tsx
├── SiteTour.tsx
├── JadwalCard.tsx
├── chess/
│   ├── EvaluationBar.tsx
│   ├── IconBadge.tsx
│   └── ArticleGameViewer.tsx
└── editor/
    ├── TiptapEditor.tsx
    └── ImageUpload.tsx

hooks/
└── useAnalysisController.ts  # Chess analysis state management

engine/
├── worker-engine.ts      # Stockfish WASM wrapper
├── classify-utils.ts     # Move classification logic
├── tco-engine.ts         # TCO engine logic
├── bot-personalities.ts  # AI bot personalities
└── opening-book.ts       # Chess opening book

lib/
├── supabaseClient.ts     # Public Supabase client
├── supabaseAdmin.ts      # Service role client
├── admin-auth.ts         # Admin hardcoded credential validation
├── translate-news.ts     # Groq translation API
└── watermark-image.ts    # Image processing

wa-bot/
├── src/
│   ├── index.ts          # Express server + WA client
│   ├── translate.ts      # Groq translation
│   ├── rss-fetcher.ts    # Chess.com RSS fetch
│   └── broadcast.ts      # WA message sender
└── package.json

database/
└── schema.sql            # Supabase schema
```

## Status Deploy

- **Frontend**: Siap deploy ke Vercel
- **WA Bot**: Siap deploy ke Render
- **Cron**: Konfigurasi di vercel.json (08:00 WIB harian)

## Catatan Pengembangan
- [ ] Verifikasi environment variables di .env.local
- [ ] Setup vercel.json untuk cron schedule
- [x] Deploy ke Vercel production
- [x] Update tabel pengumuman via Supabase CLI
- [x] Halaman /pengumuman terhubung ke database
- [x] AnnouncementBanner filter pengumuman aktif
- [x] Schema SQL field baru (language, games_json, image_caption)
- [x] RLS policy tco_announcements untuk pengumuman aktif

---
*Dikembangkan dengan Next.js 16, React 19, TypeScript, dan Supabase*
*Generated: 2026-06-04T23:27:24+07:00*