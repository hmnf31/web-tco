import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pengaturan Catur - TCO Esports",
  description:
    "Atur preferensi papan catur, tema, bidak, dan suara di platform TCO Esports. Kostumisasi pengalaman catur online Anda — tiktok chess Indonesia.",
  keywords: [
    "pengaturan catur", "chess settings", "tco esports", "tiktok chess", "tiktok chess online",
    "tema papan catur", "custom chess board", "setting chess Indonesia",
  ],
  openGraph: {
    title: "Pengaturan Catur - TCO Esports",
    description: "Atur tema papan, bidak, dan suara sesuai keinginan Anda.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/settings",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pengaturan Catur - TCO Esports",
    description: "Kostumisasi pengalaman catur online Anda.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/settings" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pengaturan Catur - TCO Esports",
  description: "Atur preferensi papan catur, tema, bidak, dan suara.",
  url: "https://web-tco.vercel.app/arena-training/settings",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
