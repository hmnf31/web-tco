import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Trophy, Swords, Music, MessageCircle, Shield, TrendingUp, Newspaper, Mail } from "lucide-react"
import JadwalCard from "@/components/JadwalCard"
import { getSupabase } from "@/lib/supabaseClient"

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function Home() {
  let latestArticles: {
    title: string
    slug: string
    excerpt: string
    published_at: string
    created_at: string
  }[] = []

  try {
    const supabase = getSupabase()
    const { data: rawLatestArticles } = await supabase
      .from("tco_articles")
      .select("title, slug, excerpt, published_at, created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(5)

    latestArticles = (rawLatestArticles || []) as typeof latestArticles
  } catch (err) {
    console.error("Failed to fetch latest articles:", err)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-0 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="pill self-start">
            <Shield className="h-3.5 w-3.5" />
            #TheGameHasChanged
          </div>

          <h1 className="display-xl mt-8 max-w-5xl text-4xl text-white sm:text-6xl lg:text-7xl">
            TCO ESPORTS:{" "}
            <span className="text-[#444748] transition-colors duration-500 hover:text-white">
              THE NEXT LEVEL OF DIGITAL COMPETITION
            </span>
          </h1>

          <div className="mt-10 grid grid-cols-1 items-end gap-8 border-t border-white/[0.08] pt-8 lg:grid-cols-12">
            <p className="max-w-2xl text-lg font-light leading-relaxed text-[#c4c7c8] lg:col-span-7 sm:text-xl">
              Rumah bagi para petarung otak dan strategi. Komunitas Catur Online terbesar di Tiktok Indonesia
            </p>

            <div className="flex flex-col items-start gap-4 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href="/register" className="btn-primary">
                DAFTAR MEMBER SEKARANG
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/6283878170957"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle className="h-4 w-4" />
                GABUNG GRUP WA KOMUNITAS
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 border border-white/[0.08] bg-[#0f0f10] sm:grid-cols-3">
            <div className="border-b border-white/[0.08] p-8 sm:border-b-0 sm:border-r">
              <span className="mono-label block text-[#444748]">[ Stat // 01 ]</span>
              <div className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">500+</div>
              <div className="mono-label mt-2 text-[#8e9192]">Anggota Terdaftar</div>
            </div>
            <div className="border-b border-white/[0.08] p-8 sm:border-b-0 sm:border-r">
              <span className="mono-label block text-[#444748]">[ Stat // 02 ]</span>
              <div className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">#1</div>
              <div className="mono-label mt-2 text-[#8e9192]">Top Klub Kreatif Indonesia</div>
            </div>
            <div className="p-8">
              <span className="mono-label block text-[#444748]">[ Stat // 03 ]</span>
              <div className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">2</div>
              <div className="mono-label mt-2 text-[#8e9192]">Divisi Kompetitif</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-b border-white/[0.08] bg-[#080808] py-24" id="tentang">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[#8e9192]">Tentang Kami</span>
            <span className="mono-label hidden text-[#444748] sm:block">TCO Esports // Indonesia</span>
          </div>

          <div className="mt-10 grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display-xl text-3xl text-white sm:text-5xl">
                Dari TikTok, Untuk Panggung Dunia!
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#c4c7c8] sm:text-lg">
                TCO (TikTok Chess Online) adalah klub catur online paling aktif di Indonesia yang lahir,
                tumbuh, dan bergerak bersama ekosistem TikTok. Kami bukan sekadar klub biasa; kami adalah
                gerakan komunitas yang memanfaatkan teknologi untuk menyatukan ribuan pecinta catur di
                seluruh penjuru negeri melalui turnamen harian, live streaming interaktif, dan edukasi
                taktik.
              </p>

              <div className="mt-8 hairline bg-[#0f0f10] p-6">
                <p className="mono-label-sm text-[#8e9192]">
                  <span className="font-medium text-white">Gens Una Sumus</span> — &quot;Kita Adalah
                  Satu Keluarga&quot;
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">
                  Klub bersifat UMUM dan TERBUKA untuk siapa saja — dari pemain kasual, pejuang rating,
                  hingga Master Catur bergelar resmi. Di sini, semua memiliki hak yang sama untuk
                  berkembang, bertanding, dan berprestasi.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="hairline overflow-hidden bg-[#161718]">
                <Image
                  src="https://i.ibb.co/6cWG2NZR/Gemini-Generated-Image-4o0n3p4o0n3p4o0n.png"
                  alt="TCO Esports Main"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover photo-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles / Berita Terbaru */}
      <section className="border-b border-white/[0.08] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="mono-label text-[#8e9192]">Artikel Terbaru</span>
              <h2 className="display-xl mt-4 text-3xl text-white sm:text-4xl">Berita &amp; Artikel</h2>
              <p className="mt-3 text-sm text-[#8e9192]">Simak perjalanan TCO Esports menuju puncak klasemen global</p>
            </div>
            <Link
              href="/artikel"
              className="mono-label-sm inline-flex items-center gap-2 text-white underline-offset-4 hover:underline"
            >
              Lihat Semua <span aria-hidden>-&gt;</span>
            </Link>
          </div>

            <div className="mt-2">
              {(!latestArticles || latestArticles.length === 0) ? (
                <div className="hairline mt-6 bg-[#0f0f10] p-10 text-center">
                  <Newspaper className="mx-auto h-8 w-8 text-[#444748]" />
                  <p className="mono-label-sm mt-3 text-[#8e9192]">Belum ada artikel. Pantau terus!</p>
                </div>
              ) : (
                latestArticles.map((a, i) => (
                  <Link
                    key={i}
                    href={`/artikel/${a.slug}`}
                    className="group flex items-center gap-5 border-b border-white/[0.08] px-1 py-5 transition-colors hover:bg-[#161718]"
                  >
                    <span className="mono-label hidden w-10 shrink-0 text-[#444748] sm:block">
                      {String(i + 1).padStart(3, "0")}
                    </span>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08]">
                      <Newspaper className="h-5 w-5 text-[#c4c7c8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-medium text-white transition-colors">{a.title}</h3>
                      <p className="mt-1 text-xs text-[#8e9192]">{a.excerpt?.substring(0, 100) || ""}</p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="mono-label-sm text-[#444748]">{formatDate(a.published_at || a.created_at)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#444748] transition-colors group-hover:text-white" />
                  </Link>
                ))
              )}
            </div>

          <div className="mt-8">
            <Link href="/artikel" className="btn-outline">
              Baca Artikel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Jadwal Kegiatan Section */}
      <section className="border-b border-white/[0.08] py-24" id="jadwal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="mono-label text-[#8e9192]">Agenda &amp; Kegiatan Aktif Bulanan</span>
              <h2 className="display-xl mt-4 text-3xl text-white sm:text-4xl">Our Timeline</h2>
              <p className="mt-3 text-sm text-[#8e9192]">Aktivitas rutin TCO setiap bulan</p>
            </div>
          </div>

          <div className="mt-10 grid gap-px border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
            {jadwalData.map((item) => (
              <JadwalCard key={item.fase} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="border-b border-white/[0.08] py-24" id="prestasi">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="mono-label text-[#8e9192]">Dinding Prestasi</span>
              <h2 className="display-xl mt-4 text-3xl text-white sm:text-4xl">Achievements Shield</h2>
            </div>
          </div>

           <div className="mt-8 border-t border-white/[0.08]">
             {[
                { place: "2", label: "Arena Kings Juni 2026" },
                { place: "3", label: "Arena Kings Mei 2026" },
                { place: "4", label: "Arena Kings April 2026" },
                { place: "5", label: "Arena Kings Maret 2026" },
              ].map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-5 border-b border-white/[0.08] px-1 py-5 transition-colors hover:bg-[#161718]"
              >
                <span className="mono-label w-16 shrink-0 text-[#444748]">{String(i + 1).padStart(3, "0")}</span>
                <Trophy className={`h-5 w-5 shrink-0 ${i === 0 ? "text-white" : "text-[#444748]"}`} />
                <span className="text-sm text-[#c4c7c8]">
                  Juara {a.place} — {a.label}
                </span>
              </div>
            ))}
           </div>

          <div className="mt-10 grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
            {[
              { icon: Users, label: "Anggota Terdaftar", value: "500+" },
              { icon: TrendingUp, label: "Platform Global", value: "Chess.com" },
              { icon: Trophy, label: "Top Klub Kreatif Indonesia", value: "#1" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#0f0f10] p-7 transition-colors hover:bg-[#161718]"
              >
                <item.icon className="h-6 w-6 text-[#8e9192]" />
                <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-white">{item.value}</div>
                <div className="mono-label mt-2 text-[#8e9192]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisi Chess Section */}
      <section className="border-b border-white/[0.08] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="mono-label text-[#8e9192]">Divisi Chess</span>
              <h2 className="display-xl mt-4 text-3xl text-white sm:text-4xl">
                Kompetisi Catur Online Level Global
              </h2>
              <p className="mt-6 max-w-2xl leading-relaxed text-[#c4c7c8]">
                Divisi Catur TCO berkompetisi di turnamen reguler Arena Kings dan Liga Komunitas Chess.com. 
                Kami memiliki lebih dari 70 pemain aktif yang siap bertanding di panggung global. 
                Bergabunglah dan buktikan kemampuan strategi Anda bersama keluarga besar TCO Esports!
              </p>
              <Link href="/divisi" className="btn-outline mt-8">
                Lihat Divisi Chess <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="lg:col-span-5">
              <div className="hairline bg-[#0f0f10] p-8">
                <Trophy className="h-10 w-10 text-white" />
                <div className="mt-6 font-display text-5xl font-bold tracking-tight text-white">#2</div>
                <div className="mono-label mt-2 text-[#8e9192]">Peringkat Global</div>
                <div className="mono-label-sm mt-4 border-t border-white/[0.08] pt-4 text-[#444748]">
                  Arena Kings Juni 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section className="border-b border-white/[0.08] py-24" id="sponsor">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-white/[0.08] pb-6">
            <span className="mono-label text-[#8e9192]">Ruang Kolaborasi</span>
            <h2 className="display-xl mt-4 max-w-3xl text-3xl text-white sm:text-4xl">
              Mari Bermitra dengan Komunitas Paling Dinamis!
            </h2>
            <p className="mt-6 max-w-3xl leading-relaxed text-[#c4c7c8]">
              Dengan basis massa yang masif, loyal, serta interaksi harian yang sangat tinggi melalui
              platform TikTok, TCO Esports menawarkan visibilitas brand yang unik dan berdampak luas di
              kalangan generasi muda (Gen-Z &amp; Milenial).
            </p>
          </div>

          <div className="mt-10 grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
            {[
              "Pendanaan hadiah turnamen berkala guna merangsang prestasi pemain",
              "Pembinaan talenta berbakat (atlet catur online dan pemain MLBB)",
              "Pengembangan fasilitas serta kualitas live streaming komunitas",
            ].map((text, i) => (
              <div
                key={i}
                className="bg-[#0f0f10] p-7 transition-colors hover:bg-[#161718]"
              >
                <div className="mono-label text-[#444748]">{String(i + 1).padStart(3, "0")}</div>
                <p className="mt-5 text-sm leading-relaxed text-[#c4c7c8]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-sm text-[#8e9192]">
              <Mail className="mr-1 inline h-4 w-4" /> Tertarik Menjadi Bagian dari Sejarah TCO? Hubungi Manajemen TCO Esports untuk proposal kerja sama:
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/6283878170957"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle className="h-4 w-4" />
                HUBUNGI VIA WHATSAPP : 083878170957
              </a>
              <a href="mailto:tco.chess@gmail.com" className="btn-primary">
                EMAIL MARKETING : tco.chess@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24" id="kontak">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-white/[0.08] pb-6">
            <span className="mono-label text-[#8e9192]">Kontak</span>
            <h2 className="display-xl mt-4 text-3xl text-white sm:text-4xl">Ikuti Kami</h2>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="https://www.tiktok.com/@tco.chess"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Music className="h-4 w-4" />
              @tco.chess
            </a>
            <a
              href="https://wa.me/6283878170957"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Komunitas
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
