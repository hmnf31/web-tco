import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pembukaan Catur (Openings) - TCO Esports",
  description:
    "Pelajari pembukaan catur dari Italian Game hingga Sicilian Defense. Panduan lengkap pembukaan catur untuk pemula dan lanjutan di TCO Esports — tiktok chess online.",
  keywords: [
    "pembukaan catur", "chess openings", "tco esports", "tiktok chess", "tiktok chess online",
    "italian game", "sicilian defense", "ruy lopez", "belajar pembukaan catur",
  ],
  openGraph: {
    title: "Pembukaan Catur (Openings) - TCO Esports",
    description: "Pelajari pembukaan catur dari Italian Game hingga Sicilian Defense. Lengkap untuk semua level.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/openings",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pembukaan Catur - TCO Esports",
    description: "Pelajari pembukaan catur untuk semua level.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/openings" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pembukaan Catur - TCO Esports",
  description: "Pelajari pembukaan catur dari Italian Game hingga Sicilian Defense.",
  url: "https://web-tco.vercel.app/arena-training/openings",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function OpeningsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
