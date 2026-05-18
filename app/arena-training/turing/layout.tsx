import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tes Turing Catur (Bot or Not) - TCO Esports",
  description:
    "Tebak apakah langkah catur dibuat oleh manusia atau engine AI. Uji intuisi Anda dengan Turing test catur online di TCO Esports — komunitas tiktok chess Indonesia.",
  keywords: [
    "turing test catur", "bot or not", "tco esports", "tiktok chess", "tiktok chess online",
    "chess turing test", "AI catur", "tebak engine catur",
  ],
  openGraph: {
    title: "Tes Turing Catur (Bot or Not) - TCO Esports",
    description: "Tebak apakah langkah catur dibuat oleh manusia atau AI. Uji intuisi Anda!",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/turing",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tes Turing Catur - TCO Esports",
    description: "Tebak manusia atau AI? Uji intuisi catur Anda.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/turing" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tes Turing Catur - TCO Esports",
  description: "Tebak apakah langkah catur dibuat oleh manusia atau engine AI.",
  url: "https://web-tco.vercel.app/arena-training/turing",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function TuringLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
