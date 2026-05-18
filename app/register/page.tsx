import type { Metadata } from "next"
import Link from "next/link"
import { Swords, Users, Trophy, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Pendaftaran Member TCO Esports",
  description: "Daftar member TCO Esports — pilih jalur pendaftaran Arena TCO untuk umum atau Member Internal & Ranking. Bergabung dengan komunitas chess e-sports Indonesia.",
  keywords: ["TCO Esports", "daftar member", "pendaftaran", "arena TCO", "chess", "esports Indonesia", "komunitas catur"],
  openGraph: {
    title: "Pendaftaran Member TCO Esports",
    description: "Bergabung dengan komunitas chess e-sports TCO Indonesia. Pilih Arena TCO atau Member Internal & Ranking.",
    type: "website",
    url: "https://web-tco.vercel.app/register",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pendaftaran Member TCO Esports",
    description: "Bergabung dengan komunitas chess e-sports TCO Indonesia.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/register" },
}

export default function RegisterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pendaftaran Member TCO Esports",
    description: "Halaman pendaftaran member TCO Esports — Arena TCO untuk umum dan Member Internal & Ranking.",
    url: "https://web-tco.vercel.app/register",
    provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
    about: {
      "@type": "Thing",
      name: "Pendaftaran Member TCO Esports",
      description: "Pendaftaran untuk turnamen Arena TCO dan keanggotaan internal TCO.",
    },
    hasPart: [
      { "@type": "WebPage", name: "Daftar Arena TCO", url: "https://web-tco.vercel.app/register/arena" },
      { "@type": "WebPage", name: "Daftar Member Internal & Ranking", url: "https://web-tco.vercel.app/register/internal" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center">
          <Swords className="mx-auto h-10 w-10 text-cyan-400" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-bold text-white">Pendaftaran Member</h1>
          <p className="mt-2 text-white/50">Pilih jenis pendaftaran yang sesuai dengan kebutuhan Anda</p>
        </header>

        <nav className="mt-10 grid gap-6 md:grid-cols-2" aria-label="Pilihan pendaftaran">
          <Link href="/register/arena"
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-cyan-400/30 hover:bg-white/[0.04]">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors" aria-hidden="true">
              <Users className="h-7 w-7 text-cyan-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Arena TCO</h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Daftar untuk mengikuti turnamen Arena TCO untuk umum. Ikuti kompetisi dan tingkatkan peringkat Anda!
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-cyan-400 group-hover:gap-2 transition-all">
              Daftar Sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>

          <Link href="/register/internal"
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-purple-400/30 hover:bg-white/[0.04]">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-400/10 group-hover:bg-purple-400/20 transition-colors" aria-hidden="true">
              <Trophy className="h-7 w-7 text-purple-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Member Internal &amp; Ranking</h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Pendaftaran untuk anggota internal TCO. Bergabung dengan tim dan akses sistem ranking eksklusif.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-purple-400 group-hover:gap-2 transition-all">
              Daftar Sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>
        </nav>
      </div>
    </>
  )
}
