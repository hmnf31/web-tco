# MEGA PROMPT: TCO LEAGUE INTERNAL CHESS MANAGEMENT PLATFORM

## 1. PROJECT OVERVIEW
Anda adalah seorang Principal Full-Stack Web Developer dan UI/UX Designer berpengalaman. Tugas Anda adalah membuat aplikasi web modern, responsif, dan dinamis untuk *TCO League (TikTok Chess Online)* — turnamen catur internal klub.

Sistem ini mengelola *4 Tingkatan Liga (Liga 1, Liga 2, Liga 3, Liga 4)* dengan sistem Promosi dan Degradasi antar season, integrasi API Chess.com, analisis Stockfish engine, serta ekspor data grafik dan CSV.

---

## 2. THEME & VISUAL IDENTITY (BASED ON REFERENCE IMAGES)
Desain harus bertema *Dark Futuristic Cyber-Sports* dengan aksen neon sesuai warna khusus di tiap tingkatan liga:

*   *Liga 1*: Cyber Blue / Electric Cyan (#00E5FF / #0066FF)
*   *Liga 2*: Neon Gold / Fire Amber (#FF9900 / #FFD700)
*   *Liga 3*: Electric Emerald Green (#00FF66 / #00CC44)
*   *Liga 4*: Cyber Magenta / Neon Pink (#FF007F / #E60073)
*   *Background Utama*: Dark Charcoal / Obsidian (#0B0E14 / #121824) dengan pola papan catur samar dan garis glowing modern.
*   *Logo Brand*: TCO (TikTok Chess Online) terpasang di Navbar & Hero section.

---

## 3. PAGE STRUCTURE & NAVIGATION
Web harus memiliki navigasi utama berikut:

### A. LANDING / HERO PAGE
*   *Header/Hero Banner*: Logo TCO, Judul Turnamen "TCO LEAGUE SEASON [X]", dan countdown ke pertandingan berikutnya.
*   *Live / Upcoming Match Highlights*: Menampilkan jadwal pertandingan terdekat dari SEMUA liga secara otomatis (diambil dari database).
*   *Quick Links*: Akses cepat menuju Liga 1, 2, 3, dan 4.

### B. LEAGUE PAGES (Tersedia untuk Liga 1, Liga 2, Liga 3, dan Liga 4)
Setiap halaman Liga memiliki identitas warna neon masing-masing dan terdiri dari *3 Tab / Sub-Halaman*:
1.  *Tab 1: STANDING (Klasemen)*
    *   Tabel Klasemen: Posisi, Foto Profil, Nama Pemain, Chess.com ID, Rating Blitz ELO, Main (MP), Menang (W), Remis (D), Kalah (L), Total Poin (PTS).
    *   *Indikator Promosi/Degradasi*:
        *   Baris teratas (misal Posisi 1-2): Diberi highlight hijau glow/panah naik (Zona Promosi ke Liga atasnya).
        *   Baris terbawah (misal Posisi 11-12): Diberi highlight merah glow/panah turun (Zona Degradasi ke Liga bawahnya).
    *   *Tombol Fitur*:
        *   Export to JPG (Mengunduh tampilan tabel klasemen menjadi gambar PNG/JPG berkualitas tinggi seperti grafis turnamen esports).
        *   Export CSV (Mengunduh data mentah klasemen format .csv).

2.  *Tab 2: COMING UP (Jadwal Pertandingan)*
    *   Daftar kartu pertandingan yang akan datang (Round/Pekan ke-x, Tanggal, Jam, Player White VS Player Black, Profil + Rating).
    *   *Tombol Fitur*: Export to JPG & Export CSV jadwal.

3.  *Tab 3: RESULTS (Hasil Pertandingan & Deep Analysis)*
    *   Daftar riwayat match yang sudah selesai beserta skor akhir (contoh: 1 - 0, 0.5 - 0.5, 0 - 1).
    *   *Tombol Fitur*: Export to JPG & Export CSV hasil match.
    *   *Papan Analisis PGN & Stockfish Engine (Cloud Stockfish)*:
        *   Setiap card hasil match memiliki tombol *"View Game / Analyze"*.
        *   Saat diklik, muncul modal/halaman dengan *Papan Catur Interaktif (Chessboard.js/react-chessboard)*.
        *   Memuat data PGN game yang dimasukkan admin.
        *   Integrated *Stockfish Cloud API / Web Worker*: Memiliki Evaluasi Bar (Eval Bar +1.5, -0.8, dll.), analisis akurasi per langkah, rekomendasi best move, serta riwayat notasi langkah catur ala Chess.com.

---

## 4. ADMIN PANEL / DASHBOARD (MANAGEMENT SYSTEM)
Sediakan halaman terproteksi (Admin Page) dengan fitur:

1.  *Pendaftaran & Input Peserta*:
    *   Input Field: Nama Lengkap, Username/ID Chess.com, Pilihan Liga (Liga 1, 2, 3, atau 4).
    *   *Auto-Fetch Chess.com API*:
        *   Ketika Username Chess.com diisi, sistem otomatis mengambil Profil Avatar (Photo) & Peak Rating / Current Rating *Blitz ELO* via Public API Chess.com (https://api.chess.com/pub/player/{username}).
        *   Fallback Mode: Jika API error atau user tidak ditemukan, sediakan field toggle untuk upload foto manual & input ELO Blitz secara manual.
    *   *Initial Placement Logic*: Penentuan awal Liga 1 sampai 4 disesuaikan berdasarkan Peak/Current Rating Blitz ELO peserta.

2.  *Koleksi Management Data*:
    *   *Edit & Hapus Data Peserta*: Mengubah liga, mengedit profil, atau menghapus player dari sistem.
    *   *Season Transition (Promosi/Degradasi)*: Tombol otomatis untuk memproses akhir season (2 player teratas naik liga, 2 teratas turun liga) untuk persiapan Season berikutnya.

3.  *Input Jadwal & Skor Pertandingan*:
    *   Form Penambahan Jadwal Match (Pilih Liga, Round/Pekan, Player 1, Player 2, Tanggal, Jam). Jadwal ini *otomatis tersinkronisasi* ke Hero Page & Tab Coming Up di Liga masing-masing.
    *   Form Pengisian Skor Manual (1-0, 0-1, 0.5-0.5).
    *   Form Input/Paste *PGN Catur* untuk analisis Stockfish di halaman Result.
    *   Setelah skor diisi, klasemen (Standing) otomatis ter-update (Poin +1 untuk menang, +0.5 untuk remis, +0 untuk kalah).

---

## 5. TECHNICAL STACK RECOMMENDATION
*   *Frontend*: React / Next.js / Tailwind CSS / Lucide Icons.
*   *Chess Rendering*: react-chessboard & chess.js untuk logika aturan catur.
*   *Engine Analysis*: Stockfish API / Stockfish.js web worker.
*   *Export Tools*: html2canvas (untuk Export JPG) & papaparse / custom blob generator (untuk Export CSV).
*   *Database*: Supabase / Firebase / PostgreSQL / LocalStorage (untuk prototype cepat).

---

## 6. INSTRUCTION FOR AI AGENT
1.  Mulai dengan merancang arsitektur komponen UI sesuai skema warna di gambar referensi.
2.  Pastikan tampilan Export to JPG mengambil styling card/tabel yang rapi, bergaya futuristik bak e-sports match graphic.
3.  Berikan struktur kode yang bersih, terbagi antara skema database/state, API handler (Chess.com & Stockfish), serta UI components.
4.  Buatlah prototipe halaman utama, halaman liga (Standing, Coming Up, Result + PGN Viewer), dan Admin Dashboard secara lengkap.