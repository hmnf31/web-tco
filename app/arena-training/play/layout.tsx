import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Latihan Vs Bot Catur - TCO Esports",
  description:
    "Latihan catur melawan bot dan anggota divisi TCO. Asah kemampuan melawan berbagai gaya permainan di platform TCO Esports — tiktok chess online terbaik.",
  keywords: [
    "latihan catur", "chess bot", "tco esports", "tiktok chess", "tiktok chess online",
    "chess vs computer", "bot catur", "latihan chess Indonesia",
  ],
  openGraph: {
    title: "Latihan Vs Bot Catur - TCO Esports",
    description: "Latihan catur melawan bot dan anggota divisi TCO. Asah kemampuan Anda!",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/play",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Latihan Vs Bot Catur - TCO Esports",
    description: "Latihan catur melawan bot TCO.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/play" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Latihan Vs Bot Catur - TCO Esports",
  description: "Latihan catur melawan bot dan anggota divisi TCO.",
  url: "https://web-tco.vercel.app/arena-training/play",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
