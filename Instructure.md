You are an expert full-stack developer specializing in Next.js Lastest Version (App Router), Tailwind CSS, TypeScript, and Supabase. You are building a professional Esports Club Website for "TCO Esports" (Tiktok Chess Online & Mobile Legends Community).

The project will be deployed on Vercel (Free Tier) and uses Supabase (Free Tier) as the database. Code must be production-ready, clean, modular, responsive, and type-safe.

---
PROJECT THEME & BRANDING (Tailwind CSS)
- Theme: Premium Esports, Futuristic, High-Tech.
- Colors: Dark background (slate-950/black), Electric Blue (#00D2FF or similar cyan/blue), Gold (#FFD700), and White.
- Fonts: Sans-serif modern (Inter / Sans-serif).

---
CORE PAGES & STRUCTURE (Next.js App Router)
Create the following pages with a shared modern Navigation Bar and Footer:

1. Landing Page (`app/page.tsx`)
   - Hero Section: Large TCO Esports branding, tagline: "The Ultimate Tiktok Chess & Mobile Legends Community", CTA buttons ("Join Turnamen", "Daftar Member",).

   - Tentang Tiktok Chess Online 

   - Jadwal Kegiatan Section: Display a clean timeline/card grid layout based on this monthly schedule:
     * Tanggal 1-10: Fokus ArenaKings (Chess)
     * Tanggal 10-25: Fokus Turnamen Beregu (Chess / MLBB)
     * Tanggal 25-Akhir Bulan: Recruitment Member & TCO Internal
   - Prestasi Section: Showcase recent achievements (e.g., "Juara 3 Arena Kings Mei 2026").

   - Kontak 
   * Tiktok : @tco.chess
   * Whatsapp : 

2. Registrasi Member Page (`app/register/page.tsx`)
   - A clean multi-step or single-page form for member enrollment.
   - Fields: Full Name, WhatsApp Number, In-Game Username (Chess.com Username OR Mobile Legends ID/Server), Main Division (Dropdown: Chess / Mobile Legends / Both), Payment Details (E-Wallet/Bank Account for prize distribution).
   - Form Validation: Use Zod and React Hook Form (or native validation if simplified) to ensure fields are populated correctly.

3. Divisi & Leaderboard Page (`app/divisi/page.tsx`)
   - Split view or tabs for: "Chess Division" and "Mobile Legends Division".
   - Display placeholder rosters or a simple leaderboard component showing Top Players (Rank, Username, Score/Rank MLBB).

4. Admin Dashboard Page (`app/admin/dashboard/page.tsx`)
   - A protected route or simple password-protected view for Coach/Admin to see all registered members.
   - Features: A clean HTML Table displaying data from Supabase, a search bar to filter usernames, and an "Export to CSV/Excel" placeholder or direct function.
   - or Link Google Drive
---
DATABASE SCHEMA (Supabase PostgreSQL)
Generate the SQL script to create the tables in Supabase:
- Table Name: `tco_members`
  * `id`: uuid, primary key, default: gen_random_uuid()
  * `created_at`: timestamp with time zone, default: now()
  * `full_name`: text
  * `whatsapp_number`: text
  * `game_username`: text (Chess.com username or MLBB ID)
  * `division`: text (Chess / MLBB / Both)
  * `payment_info`: text
  * `status`: text (default: 'Pending/Active')

---
TECHNICAL REQUIREMENTS & INTEGRATION
1. Supabase Client: Set up `lib/supabaseClient.ts` using `@supabase/supabase-js`. Use environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. API Route for Registration: Create `app/api/register/route.ts` to securely handle POST requests from the registration form and insert data into Supabase.
3. Vercel Readiness: Ensure no hardcoded API keys are used. Use standard `process.env`. Do not use experimental features that break Vercel deployment.
4. UI Components: Use Lucide Icons (`lucide-react`) for clean gaming/esports icons. Use smooth hover transitions for all buttons and interactive cards.

---
INSTRUCTIONS FOR THE AI AGENT:
1. Start by initializing the project structure, creating components (`Navbar`, `Footer`, `JadwalCard`), and setting up the Supabase Client configuration.
2. Write the SQL DDL script for Supabase so I can run it in my Supabase SQL Editor.
3. Create the API Route and the Frontend Forms with absolute styling precision using Tailwind CSS.
4. Output the complete code file-by-file. Avoid using placeholders like "// add remaining code here". Provide the full implementation so the project runs immediately without compile errors.

Let's begin coding!

🛠️ Struktur Halaman Website TCO
1. Landing Page (Halaman Utama)

Halaman pertama yang dilihat pengunjung. Tujuannya adalah memberikan kesan pertama yang keren (hype) dan profesional.

    Bagian Atas (Hero Section): Banner besar dengan logo TCO ESPORTS (menggunakan logo baru yang ada kuda catur dan nuansa MLBB). Berikan slogan besar, misalnya: "The Ultimate Tiktok Chess & Mobile Legends Community." ditambah tombol besar (CTA) "GABUNG SEKARANG".

    Tentang Kami (Short About): Penjelasan singkat bahwa TCO adalah wadah komunitas kompetitif.

    Jadwal Kegiatan Bulanan: Pasang gambar infografis jadwal kegiatan (Tanggal 1-10 ArenaKings, dst.) yang sudah kita buat sebelumnya agar member langsung tahu agenda bulan ini.

    Prestasi Terakhir: Teks berjalan atau dokumentasi saat TCO berhasil menembus Juara 3 Arena Kings Mei.


Berikut adalah draf lengkap teks konten (copywriting) untuk seluruh bagian Landing Page website resmi TCO Esports. Format teks ini sudah dirancang dengan gaya bahasa yang hype, profesional, mudah dipahami publik, serta memikat bagi calon sponsor.

🏆 DRAFT KONTEN LANDING PAGE TCO ESPORTS
1. BAGIAN UTAMA (HERO SECTION)

    Judul Utama (Headline): TCO ESPORTS: THE NEXT LEVEL OF DIGITAL COMPETITION

    Sub-Judul (Sub-headline): Rumah bagi para petarung otak dan strategi. Komunitas Catur Online terbesar berbasis TikTok yang kini siap menaklukkan Land of Dawn!

    Tombol Aksi (Call to Action - CTA):

        🔴 [DAFTAR MEMBER SEKARANG] (Link ke halaman Registrasi)

        🤝 [GABUNG GRUP WA KOMUNITAS]

2. TENTANG KAMI (ABOUT TCO)

    Dari TikTok, Untuk Panggung Dunia!

    TCO (Tiktok Chess Online) adalah klub catur online paling aktif di Indonesia yang lahir, tumbuh, dan bergerak bersama ekosistem TikTok. Kami bukan sekadar klub biasa; kami adalah gerakan komunitas yang memanfaatkan teknologi untuk menyatukan ribuan pecinta catur di seluruh penjuru negeri melalui turnamen harian, live streaming interaktif, dan edukasi taktik.
    Klub Terbuka & Bersifat Umum

    TCO berkomitmen penuh pada asas Gens Una Sumus (Kita Adalah Satu Keluarga). Klub ini bersifat UMUM dan TERBUKA untuk siapa saja — mulai dari pemain kasual yang baru belajar melangkah, pejuang rating papan atas, hingga Master Catur bergelar resmi. Di sini, semua memiliki hak yang sama untuk berkembang, bertanding, dan berprestasi.

3. AGENDA & KEGIATAN AKTIF BULANAN (OUR TIMELINE)

Bagian ini akan divisualisasikan dalam bentuk grafik lini masa (timeline) tiga fase utama:

    🎯 Fase 1: TANGGAL 1 - 10 | FOKUS ARENA KINGS

        Deskripsi: Minggu tempur garis depan! Seluruh energi tim TCO dikerahkan penuh untuk bertanding di turnamen resmi global Arena Kings di Chess.com. Kami berjuang secara kolektif mengumpulkan poin demi membawa lambang TCO menembus podium tertinggi klasemen dunia.
    ⚔️ Fase 2: TANGGAL 10 - 25 | FOKUS TURNAMEN BEREGU

        Deskripsi: Saatnya kerja sama tim diuji. Di fase ini, TCO berfokus pada Turnamen Beregu, Liga Komunitas, serta pertandingan persahabatan (scrimmage) antar-klub/klan, baik untuk divisi Catur maupun ekspansi terbaru kami di divisi Mobile Legends: Bang Bang.
    🤝 Fase 3: TANGGAL 25 - AKHIR BULAN | RECRUITMENT & INTERNAL

        Deskripsi: Evaluasi dan regenerasi. Kami membuka pintu selebar-lebarnya bagi talenta baru untuk bergabung. Di fase ini pula, turnamen TCO Internal diadakan sebagai ajang pemanasan, silaturahmi, sekaligus bagi-bagi apresiasi (reward) kopi antar-anggota aktif.

4. RUANG KOLABORASI: SPONSOR & DONATUR (SPONSORSHIP CALL)

    Mari Bermitra dengan Komunitas Paling Dinamis!

    Dengan basis massa yang masif, loyal, serta interaksi harian yang sangat tinggi melalui platform TikTok, TCO Esports menawarkan visibilitas brand yang unik dan berdampak luas di kalangan generasi muda (Gen-Z & Milenial).

    Kami membuka peluang kerja sama yang luas bagi para Sponsor, Perusahaan, dan Donatur yang ingin mendukung perkembangan ekosistem catur digital serta industri esports tanah air. Setiap dukungan Anda akan dialokasikan secara transparan untuk:

        Pendanaan hadiah turnamen berkala guna merangsang prestasi pemain.

        Pembinaan talenta berbakat (atlet catur online dan pemain MLBB).

        Pengembangan fasilitas serta kualitas live streaming komunitas.

    📩 Tertarik Menjadi Bagian dari Sejarah TCO?
    Hubungi Manajemen TCO Esports untuk proposal kerja sama:

        [HUBUNGI VIA WHATSAPP] / [EMAIL MARKETING]

5. DINDING PRESTASI (ACHIEVEMENTS SHIELD)

    Prestasi Terbaru: 🥉 Juara 3 Arena Kings Mei 2026

    Statistik Klub: * 👥 1.000+ Anggota Terdaftar

        🌐 Beroperasi di Platform Global (Chess.com & MLBB)

        📈 Top 3 Klub Catur Berbasis Komunitas Kreatif di Indonesia.

6. BAGIAN BAWAH (FOOTER)

    Slogan Akhir: TCO Esports — #TheGameHasChanged

    Hak Cipta: © 2026 TCO Esports. All Rights Reserved. Powered by Gens Una Sumus.

    Ikon Sosial Media: TikTok | WhatsApp | YouTube | Chess.com Club


2. Page: Divisi & Turnamen (Divisions)

Halaman khusus yang memperkenalkan lini fokus TCO.

    Sub-Page Catur (TCO Chess): Informasi mengenai turnamen reguler, link klub Chess.com resmi, dan rekapitulasi Top Player TCO.

    Sub-Page Mobile Legends (TCO MLBB): Informasi roster tim inti TCO, prestasi di Land of Dawn, dan status rekrutmen (Open/Closed).

3. Page: Registrasi & Validasi (Registration)

Halaman paling krusial untuk menggantikan fungsi Google Form manual.

    Formulir Integrasi: Form daring tempat member memasukkan Username Chess.com/ID MLBB, Nama Asli, Nomor WhatsApp, dan Nomor Rekening/E-Wallet untuk pencairan hadiah.

    Syarat & Ketentuan (S&K): Aturan tegas mengenai anti-cheating, kewajiban masuk grup WA, dan sistem Transfer Otomatis.

4. Page: Galeri & Berita (Media/Blog)

Tempat arsip konten untuk bahan promosi di TikTok.

    Review Game: Tempat membagikan analisis game epik (seperti ulasan game FajarSadChess yang kita bahas kemarin).

    Dokumentasi Juara: Foto/video keseruan saat live streaming atau turnamen internal.

✍️ Cara Mengisi & Mengelola Konten Website TCO

Agar website tidak terlihat seperti "situs mati", Coach dan tim admin bisa membagi tugas pengisian konten seperti ini:
A. Konten Bulanan (Wajib Update)

    Update Klasemen & Hadiah (Setiap tanggal 6-10): Setelah Arena Kings selesai, admin langsung memposting teks rekapitulasi pemenang (seperti format teks Top 30 yang saya buatkan kemarin) di halaman utama atau berita.

    Kalender Kegiatan: Setiap awal bulan, ganti banner jadwal sesuai bulan berjalan.

B. Konten Mingguan (Untuk Edukasi & Trafik)

    Artikel Taktik (Seksi Catur): Tulis ulasan pendek atau buat diagram catur interaktif dari game member TCO yang bagus. Ini sangat bagus untuk meningkatkan skill member lain.

    Jadwal Scrim (Seksi MLBB): Update hasil latih tanding tim MLBB TCO melawan klan atau tim esport lain.

C. Konten Otomatis (Sistem Data)

    Database Member: Hubungkan form registrasi di website langsung ke Google Sheets admin. Jadi, setiap kali ada member baru yang mendaftar di website, datanya otomatis rapi di laptop/Drive Google Admin


Source Image 
Logo : [img]https://i.ibb.co/spQPFBSt/73aa2379-6078-438a-81df-424e9e261660-removalai-preview.png[/img]
TCO Main : [img]https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png[/img]
