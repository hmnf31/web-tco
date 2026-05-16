# TCO Esports — Web Platform

Platform web resmi **TCO Esports**, komunitas catur online & Mobile Legends terbesar berbasis TikTok di Indonesia. Dibangun dengan **Next.js 16**, **Tailwind CSS v4**, dan **TypeScript**.

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 16.2.6 (App Router) | Framework React fullstack, static generation |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling, dark theme |
| Supabase (Free Tier) | Database backend untuk registrasi member |
| Stockfish.js (WASM) | Engine catur untuk analisis & bot training |
| chess.js | Logika permainan catur client-side |
| react-chessboard | Papan catur interaktif React |
| Lucide React | Icon set |
| Vercel | Deployment target |

## Fitur

### Landing Page (`/`)
- Hero section dengan branding TCO
- Tentang Kami — sejarah dan visi komunitas
- Artikel terbaru (prestasi Arena Kings)
- Timeline kegiatan bulanan
- Dinding prestasi (Achievements)
- Sponsorship / kolaborasi
- Kontak & sosial media

### Pendaftaran Member (`/register`)
- Google Form embedded untuk pendaftaran anggota baru
- Integrasi dengan database Supabase (via API route)

### Divisi (`/divisi`)
- **Chess Division** — Leaderboard pemain dengan rating, link ke profil Chess.com
- **MLBB Division** — Roster tim inti, status recruitment

### Arena Training (`/arena-training/*`)
Paket fitur latihan catur interaktif:

- **VS Bot** (`/arena-training/play`) — Main melawan bot dengan personality & level berbeda, evaluasi real-time, coach virtual, export PGN
- **Game Analysis** (`/arena-training/analysis`) — Analisis permainan dari PGN, Chess.com, atau Lichess; auto-play moves; klasifikasi langkah (Best/Excellent/Mistake/Blunder)
- **Puzzle Academy** (`/arena-training/learn`) — Teka-teki taktik dengan tingkat kesulitan, hint system, tracking skor

### Admin Dashboard (`/admin/dashboard`)
- Password gate
- Tabel member dengan search
- Export CSV

### Artikel (`/artikel`)
- Berita & artikel prestasi TCO Arena Kings

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Start production server
npm start
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Struktur Proyek

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout (Navbar + Footer)
│   ├── register/             # Pendaftaran member (Google Form)
│   ├── divisi/               # Divisi Chess & MLBB
│   ├── artikel/              # Berita & artikel
│   ├── admin/dashboard/      # Admin panel
│   ├── arena-training/
│   │   ├── play/             # VS Bot
│   │   ├── analysis/         # Game Analysis
│   │   └── learn/            # Puzzle Academy
│   └── api/register/         # API route Supabase
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── JadwalCard.tsx
│   └── chess/
│       └── EvaluationBar.tsx
├── engine/
│   └── stockfish.ts          # Stockfish WASM + lightweight engine
├── public/engine/            # Stockfish WASM assets
└── next.config.ts
```

## Deployment

Deploy ke Vercel:

```bash
vercel --prod
```

Pastikan environment variables sudah di-set di dashboard Vercel.

## Credits

- **hmnf31** — Manajemen & Kapten Tim TCO
- Seluruh anggota TCO Esports
- [Chess.com](https://chess.com) — Platform turnamen Arena Kings
- [Stockfish](https://stockfishchess.org) — Engine catur open-source

---

© 2026 TCO Esports. All Rights Reserved. Powered by Gens Una Sumus.
