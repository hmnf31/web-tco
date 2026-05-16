# TCO Esports — Web Platform

Platform web resmi **TCO Esports**, komunitas catur online & Mobile Legends terbesar berbasis TikTok di Indonesia. Dibangun dengan **Next.js 16**, **Tailwind CSS v4**, dan **TypeScript**.

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 16.2.6 (App Router) | Framework React fullstack, static generation |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling, dark theme |
| Supabase (Free Tier) | Database backend untuk registrasi member |
| Lozza Engine | Engine catur untuk analisis & bot training — synchronous alpha-beta + heuristic eval |
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

### Divisi (`/divisi`)
- **Chess Division** — Leaderboard 40 pemain dengan rating, link ke profil Chess.com
- **MLBB Division** — Roster tim inti, status recruitment

### Arena Training (`/arena-training/*`)
Paket fitur latihan catur interaktif:

- **VS Bot** (`/arena-training/play`) — Main melawan 39 pemain TCO asli atau Lozza engine; depth adaptif berdasarkan Elo & mode waktu (bullet depth 2, blitz 3, rapid 4); timer countdown pause saat bot thinking; virtual coach; evaluation bar; export & analisis game
- **Game Analysis** (`/arena-training/analysis`) — Analisis permainan dari PGN, Chess.com, atau Lichess; auto-play moves; klasifikasi langkah (Best/Excellent/Mistake/Blunder)
- **Puzzle Academy** (`/arena-training/learn`) — Teka-teki taktik dengan tingkat kesulitan, hint system, skip button

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
│   └── lozza.ts              # LozzaEngine — synchronous alpha-beta + heuristic eval
├── public/engine/
│   └── lozza.js              # Lozza engine file
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
- [Lozza](https://github.com/op12no2/lozza) — Engine catur NNUE JavaScript oleh Colin Jenkins (referensi arsitektur)

---

© 2026 TCO Esports. All Rights Reserved. Powered by Gens Una Sumus.
