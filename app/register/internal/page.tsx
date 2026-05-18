import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Daftar Member Internal & Ranking — TCO Esports",
  description: "Pendaftaran anggota internal TCO Esports. Bergabung dengan tim dan akses sistem ranking eksklusif untuk pemain catur Indonesia.",
  keywords: ["TCO Esports", "daftar member internal", "ranking TCO", "anggota TCO", "tim catur Indonesia", "esports Indonesia"],
  openGraph: {
    title: "Daftar Member Internal & Ranking — TCO Esports",
    description: "Pendaftaran anggota internal TCO. Bergabung dengan tim dan akses sistem ranking eksklusif.",
    type: "website",
    url: "https://web-tco.vercel.app/register/internal",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daftar Member Internal & Ranking — TCO Esports",
    description: "Pendaftaran anggota internal TCO.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/register/internal" },
}

export default function RegisterInternalPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Daftar Member Internal & Ranking TCO",
    description: "Halaman pendaftaran anggota internal dan ranking TCO Esports.",
    url: "https://web-tco.vercel.app/register/internal",
    provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
    about: { "@type": "Thing", name: "Keanggotaan Internal TCO", description: "Pendaftaran anggota internal TCO Esports" },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/register" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-cyan-400 transition-colors mb-6">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Kembali
        </Link>

        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10" aria-hidden="true">
            <Trophy className="h-6 w-6 text-purple-400" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Daftar Member Internal &amp; Ranking</h1>
          <p className="mt-2 text-white/50">Isi form di bawah untuk mendaftar sebagai anggota internal TCO</p>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10" aria-label="Form pendaftaran member internal">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSft-tE8--EubDcuxKXGTou6P5TSYPTephDJrIY2t6oVAcsvxw/viewform?embedded=true"
            width="100%"
            height="2800"
            className="w-full"
            style={{ minHeight: "2800px" }}
            title="Form Pendaftaran Member Internal & Ranking TCO"
          >
            Loading…
          </iframe>
        </section>
      </div>
    </>
  )
}
