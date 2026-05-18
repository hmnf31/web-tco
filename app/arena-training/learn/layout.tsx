import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Teka-Teki Catur (Puzzle) - TCO Esports",
  description:
    "Asah taktik catur dengan teka-teki harian dari TCO Esports. Cocok untuk pemula hingga mahir. Latihan catur online gratis — komunitas tiktok chess Indonesia.",
  keywords: [
    "teka teki catur", "chess puzzle", "tco esports", "tiktok chess", "tiktok chess online",
    "belajar catur", "taktik catur", "chess tactics Indonesia",
  ],
  openGraph: {
    title: "Teka-Teki Catur (Puzzle) - TCO Esports",
    description: "Asah taktik catur dengan teka-teki harian. Gratis untuk semua level.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/learn",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teka-Teki Catur - TCO Esports",
    description: "Asah taktik catur dengan teka-teki harian.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/learn" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Teka-Teki Catur - TCO Esports",
  description: "Asah taktik catur dengan teka-teki harian gratis.",
  url: "https://web-tco.vercel.app/arena-training/learn",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
