import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Trophy, Swords, Music, MessageCircle, Shield, TrendingUp, Newspaper } from "lucide-react"
import JadwalCard from "@/components/JadwalCard"

export const metadata: Metadata = {
  title: "TCO Esports — Komunitas Catur Online TikTok Indonesia #1",
  description:
    "TCO Esports (TikTok Chess Online): komunitas catur online terbesar di TikTok Indonesia. Bergabung dengan 500+ anggota, ikuti turnamen Arena Kings, dan naikkan peringkat Anda. Rumah bagi petarung otak dan strategi — The Next Level of Digital Competition.",
  keywords: [
    "TCO Esports", "tiktok chess", "tiktok chess online", "komunitas catur", "catur online Indonesia",
    "TCO", "arena kings", "turnamen catur", "chess community Indonesia", "catur tiktok",
    "TCO klub catur", "chess online Indonesia", "genz catur", "main catur online",
  ],
  openGraph: {
    title: "TCO Esports — Komunitas Catur Online TikTok Indonesia #1",
    description:
      "Rumah bagi petarung otak dan strategi. Komunitas Catur Online terbesar di TikTok Indonesia. Daftar sekarang!",
    type: "website",
    url: "https://web-tco.vercel.app",
    siteName: "TCO Esports",
    locale: "id_ID",
    images: [{ url: "https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png", width: 600, height: 400, alt: "TCO Esports" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TCO Esports — Komunitas Catur Online TikTok Indonesia",
    description: "Rumah bagi petarung otak dan strategi. Daftar member sekarang!",
    images: ["https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png"],
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app" },
}

const jadwalData = [
  {
    fase: "Fase 1",
    tanggal: "Awal Bulan",
    judul: "ARENA KINGS",
    deskripsi:
      "Acara Bulanan TCO untuk tempur di garis depan! Seluruh energi tim TCO dikerahkan penuh untuk bertanding di turnamen resmi global Arena Kings di Chess.com. Kami berjuang secara kolektif mengumpulkan poin demi membawa lambang TCO menembus podium tertinggi klasemen dunia.",
    icon: "swords" as const,
  },
  {
    fase: "Fase 2",
    tanggal: "Pertengahan Bulan",
    judul: "TURNAMEN BEREGU",
    deskripsi:
      "Saatnya kerja sama tim diuji. Di fase ini, TCO berfokus pada Turnamen Harian atau Mingguan atau Turnamen lainnya, Liga Komunitas, serta pertandingan persahabatan (scrimmage) antar-klub.",
    icon: "users" as const,
  },
  {
    fase: "Fase 3",
    tanggal: "Akhir Bulan",
    judul: "Streaming Platform",
    deskripsi:
      "Evaluasi dan regenerasi. Kami membuka pintu selebar-lebarnya bagi talenta baru untuk bergabung. Di fase ini pula, turnamen TCO Internal diadakan sebagai ajang pemanasan, silaturahmi, sekaligus bagi-bagi apresiasi (reward) kopi antar-anggota aktif.",
    icon: "userplus" as const,
  },
]

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://web-tco.vercel.app/#website",
      url: "https://web-tco.vercel.app",
      name: "TCO Esports",
      description: "Komunitas Catur Online TikTok Indonesia — The Next Level of Digital Competition",
      inLanguage: "id",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://web-tco.vercel.app/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://web-tco.vercel.app/#organization",
      name: "TCO Esports",
      url: "https://web-tco.vercel.app",
      description: "Komunitas Catur Online terbesar di TikTok Indonesia.",
      logo: "https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png",
      sameAs: [
        "https://www.tiktok.com/@tco.chess",
        "https://wa.me/6283878170957",
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://web-tco.vercel.app/#webpage",
      url: "https://web-tco.vercel.app",
      name: "TCO Esports — Komunitas Catur Online TikTok Indonesia #1",
      description: "Rumah bagi petarung otak dan strategi. Komunitas Catur Online terbesar di TikTok Indonesia.",
      isPartOf: { "@id": "https://web-tco.vercel.app/#website" },
      about: { "@id": "https://web-tco.vercel.app/#organization" },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,210,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,215,0,0.05),transparent_50%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 lg:px-8 lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-sm text-cyan-400">
            <Shield className="h-4 w-4" />
            #TheGameHasChanged
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            TCO ESPORTS:{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              THE NEXT LEVEL OF DIGITAL COMPETITION
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            Rumah bagi para petarung otak dan strategi. Komunitas Catur Online terbesar di Tiktok Indonesia
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              DAFTAR MEMBER SEKARANG
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/6283878170957"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <MessageCircle className="h-4 w-4" />
              GABUNG GRUP WA KOMUNITAS
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-white sm:text-4xl">500+</div>
              <div className="mt-1 text-sm text-white/50">Anggota Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 sm:text-4xl">#1</div>
              <div className="mt-1 text-sm text-white/50">Top Klub Kreatif Indonesia</div>
            </div>
            <div className="col-span-2 text-center sm:col-span-1">
              <div className="text-3xl font-bold text-yellow-400 sm:text-4xl">2</div>
              <div className="mt-1 text-sm text-white/50">Divisi Kompetitif</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-b border-white/5 py-20" id="tentang">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              TENTANG KAMI
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Dari TikTok, Untuk Panggung Dunia!
            </p>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png"
                alt="TCO Esports Main"
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-base leading-relaxed text-white/60 sm:text-lg">
                TCO (TikTok Chess Online) adalah klub catur online paling aktif di Indonesia yang lahir,
                tumbuh, dan bergerak bersama ekosistem TikTok. Kami bukan sekadar klub biasa; kami adalah
                gerakan komunitas yang memanfaatkan teknologi untuk menyatukan ribuan pecinta catur di
                seluruh penjuru negeri melalui turnamen harian, live streaming interaktif, dan edukasi
                taktik.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm italic text-white/50">
                  <span className="font-semibold text-yellow-400">Gens Una Sumus</span> — &quot;Kita Adalah
                  Satu Keluarga&quot;
                </p>
                <p className="mt-2 text-sm text-white/50">
                  Klub bersifat UMUM dan TERBUKA untuk siapa saja — dari pemain kasual, pejuang rating,
                  hingga Master Catur bergelar resmi. Di sini, semua memiliki hak yang sama untuk
                  berkembang, bertanding, dan berprestasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles / Berita Terbaru */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              ARTIKEL TERBARU
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Berita & Artikel</p>
            <p className="mt-2 text-white/50">Simak perjalanan TCO Esports menuju puncak klasemen global</p>
          </div>

           <div className="mt-10 space-y-4">
              {[
                { title: "Juara 3 Arena Kings Mei 2026", desc: "Podium Pertama TCO Esports! — TCO menembus posisi 3 besar Arena Kings Chess.com.", href: "/artikel/juara-3-arena-kings-mei-2026", date: "18 Mei 2026" },
                { title: "Juara 4 Arena Kings April 2026", desc: "Satu Langkah Lebih Dekat ke Puncak — TCO naik satu peringkat dengan peningkatan partisipasi 40%.", href: "/artikel/juara-4-arena-kings-april-2026", date: "20 April 2026" },
                { title: "Juara 5 Arena Kings Maret 2026", desc: "Awal Perjalanan TCO di Panggung Global — TCO berhasil mengamankan posisi ke-5 di Arena Kings Maret 2026.", href: "/artikel/juara-5-arena-kings-maret-2026", date: "15 Maret 2026" },
              ].map((a, i) => (
               <Link key={i} href={a.href} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-400/20 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Newspaper className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{a.title}</h3>
                    <p className="mt-1 text-xs text-white/50">{a.desc}</p>
                  </div>
                  <div className="hidden sm:block shrink-0 text-right">
                    <p className="text-xs text-white/40">{a.date}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/20 group-hover:text-cyan-400 transition-colors" />
               </Link>
              ))}
            </div>

          <div className="mt-8 text-center">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              Baca Artikel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Jadwal Kegiatan Section */}
      <section className="border-b border-white/5 py-20" id="jadwal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              AGENDA & KEGIATAN AKTIF BULANAN
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Our Timeline</p>
            <p className="mt-2 text-white/50">Aktivitas rutin TCO setiap bulan</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {jadwalData.map((item) => (
              <JadwalCard key={item.fase} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="border-b border-white/5 py-20" id="prestasi">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-400">
              DINDING PRESTASI
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Achievements Shield</p>
          </div>

           <div className="mt-10 space-y-3">
             {[
               { place: "3", label: "Arena Kings Mei 2026" },
               { place: "4", label: "Arena Kings April 2026" },
               { place: "5", label: "Arena Kings Maret 2026" },
             ].map((a, i) => (
               <div
                 key={i}
                 className="flex items-center gap-4 rounded-xl border border-yellow-400/20 bg-gradient-to-r from-yellow-400/5 to-transparent px-6 py-4"
               >
                 <Trophy className={`h-6 w-6 shrink-0 ${i === 0 ? "text-yellow-400" : "text-white/40"}`} />
                 <span className="text-sm font-medium text-white/80">
                   Juara {a.place} — {a.label}
                 </span>
               </div>
             ))}
           </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Users, label: "Anggota Terdaftar", value: "500+" },
              { icon: TrendingUp, label: "Platform Global", value: "Chess.com" },
              { icon: Trophy, label: "Top Klub Kreatif Indonesia", value: "#1" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition-all hover:border-cyan-400/20"
              >
                <item.icon className="mx-auto h-8 w-8 text-cyan-400" />
                <div className="mt-3 text-2xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-white/50">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisi Chess Section */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
                DIVISI CHESS
              </h2>
              <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Kompetisi Catur Online Level Global
              </p>
              <p className="mt-4 text-white/60">
                Divisi Catur TCO berkompetisi di turnamen reguler Arena Kings dan Liga Komunitas Chess.com. 
                Kami memiliki lebih dari 70 pemain aktif yang siap bertanding di panggung global. 
                Bergabunglah dan buktikan kemampuan strategi Anda bersama keluarga besar TCO Esports!
              </p>
              <Link
                href="/divisi"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
              >
                Lihat Divisi Chess <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 to-transparent p-8 text-center">
                <Trophy className="mx-auto h-16 w-16 text-yellow-400" />
                <div className="mt-4 text-4xl font-bold text-white">#3</div>
                <div className="text-sm text-white/50">Peringkat Global</div>
                <div className="mt-2 text-xs text-cyan-400">Arena Kings Mei 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section className="border-b border-white/5 py-20" id="sponsor">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              RUANG KOLABORASI
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Mari Bermitra dengan Komunitas Paling Dinamis!
            </p>
            <p className="mt-4 text-white/60">
              Dengan basis massa yang masif, loyal, serta interaksi harian yang sangat tinggi melalui
              platform TikTok, TCO Esports menawarkan visibilitas brand yang unik dan berdampak luas di
              kalangan generasi muda (Gen-Z & Milenial).
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              "Pendanaan hadiah turnamen berkala guna merangsang prestasi pemain",
              "Pembinaan talenta berbakat (atlet catur online dan pemain MLBB)",
              "Pengembangan fasilitas serta kualitas live streaming komunitas",
            ].map((text, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-yellow-400/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  {i + 1}
                </div>
                <p className="mt-4 text-sm text-white/60">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-white/50">
              📩 Tertarik Menjadi Bagian dari Sejarah TCO? Hubungi Manajemen TCO Esports untuk proposal kerja sama:
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/6283878170957"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-green-400/30 hover:text-green-400"
              >
                <MessageCircle className="h-4 w-4" />
                HUBUNGI VIA WHATSAPP : 083878170957
              </a>
              <a
                href="mailto:tco.chess@gmail.com"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
              >
                EMAIL MARKETING : tco.chess@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20" id="kontak">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              KONTAK
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Ikuti Kami</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://www.tiktok.com/@tco.chess"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-6 py-3 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <Music className="h-5 w-5" />
              <span className="text-sm font-medium">@tco.chess</span>
            </a>
            <a
              href="https://wa.me/6283878170957"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-6 py-3 transition-all hover:border-green-400/30 hover:text-green-400"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">WhatsApp Komunitas</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
