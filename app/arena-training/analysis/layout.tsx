import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analisis Game Catur Online - TCO Esports",
  description:
    "Analisis game catur dari Chess.com & Lichess gratis. Evaluasi langkah, deteksi blunder, dan tingkatkan permainan catur online Anda bersama TCO Esports.",
  keywords: [
    "analisis catur", "chess analysis", "tco esports", "tiktok chess", "tiktok chess online",
    "analisa chess", "blunder detector", "chess evaluation", "catur online Indonesia",
  ],
  openGraph: {
    title: "Analisis Game Catur Online - TCO Esports",
    description: "Analisis game catur Chess.com & Lichess gratis dengan evaluasi engine dan deteksi blunder.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/analysis",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analisis Game Catur Online - TCO Esports",
    description: "Analisis game catur gratis dengan engine.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/analysis" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Analisis Game Catur Online - TCO Esports",
  description: "Analisis game catur dari Chess.com & Lichess dengan evaluasi engine dan deteksi blunder.",
  url: "https://web-tco.vercel.app/arena-training/analysis",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
