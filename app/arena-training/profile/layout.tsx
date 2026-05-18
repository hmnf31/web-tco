import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profil Pemain Catur - TCO Esports",
  description:
    "Lihat statistik permainan, riwayat teka-teki, dan hasil tes Turing Anda di TCO Esports. Pantau perkembangan skill catur online — platform tiktok chess Indonesia.",
  keywords: [
    "profil catur", "chess profile", "tco esports", "tiktok chess", "tiktok chess online",
    "statistik catur", "riwayat permainan", "skill catur Indonesia",
  ],
  openGraph: {
    title: "Profil Pemain Catur - TCO Esports",
    description: "Lihat statistik dan perkembangan skill catur Anda.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training/profile",
    siteName: "TCO Esports",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profil Pemain Catur - TCO Esports",
    description: "Pantau perkembangan skill catur Anda.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training/profile" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Profil Pemain Catur - TCO Esports",
  description: "Lihat statistik dan perkembangan skill catur Anda.",
  url: "https://web-tco.vercel.app/arena-training/profile",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  provider: { "@type": "Organization", name: "TCO Esports", url: "https://web-tco.vercel.app" },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
