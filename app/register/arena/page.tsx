import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Daftar Arena TCO — TCO Esports",
  description: "Daftar turnamen Arena TCO untuk umum. Ikuti kompetisi catur e-sports TCO Esports Indonesia dan tingkatkan peringkat Anda.",
  keywords: ["TCO Esports", "daftar arena TCO", "turnamen catur", "esports Indonesia", "kompetisi catur online"],
  openGraph: {
    title: "Daftar Arena TCO — TCO Esports",
    description: "Daftar turnamen Arena TCO untuk umum. Ikuti kompetisi dan tingkatkan peringkat Anda!",
    type: "website",
    url: "https://web-tco.vercel.app/register/arena",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daftar Arena TCO — TCO Esports",
    description: "Daftar turnamen Arena TCO untuk umum.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/register/arena" },
}

export default function RegisterArenaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Daftar Arena TCO",
    description: "Halaman pendaftaran turnamen Arena TCO untuk umum.",
    url: "https://web-tco.vercel.app/register/arena",
    provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
    about: { "@type": "Event", name: "Arena TCO Tournament", description: "Turnamen catur Arena TCO" },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/register" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-cyan-400 transition-colors mb-6">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Kembali
        </Link>

        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10" aria-hidden="true">
            <Users className="h-6 w-6 text-cyan-400" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Daftar Arena TCO</h1>
          <p className="mt-2 text-white/50">Isi form di bawah untuk mendaftar turnamen Arena TCO</p>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10" aria-label="Form pendaftaran Arena TCO">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdDksXEPyEG3BGtixLQZmubXhXtqL2adnUShq23d2eOwZDMmQ/viewform?embedded=true"
            width="100%"
            height="2800"
            className="w-full"
            style={{ minHeight: "2800px" }}
            title="Form Pendaftaran Arena TCO"
          >
            Loading…
          </iframe>
        </section>
      </div>
    </>
  )
}
