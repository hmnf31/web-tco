import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Arena Training TCO Esports",
  description: "Platform analisis dan latihan catur online TCO Esports. Analisis game Chess.com & Lichess, teka-teki, pembukaan, dan tes Turing.",
  keywords: ["TCO Esports", "analisis catur", "latihan catur", "chess online", "tiktok chess", "chess Indonesia", "arena training"],
  openGraph: {
    title: "Arena Training TCO Esports",
    description: "Platform analisis dan latihan catur online TCO Esports.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training",
    siteName: "TCO Esports",
  },
  twitter: { card: "summary_large_image", title: "Arena Training TCO Esports", description: "Platform latihan catur online TCO." },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training" },
}

export default function ArenaTrainingPage() {
  redirect("/arena-training/analysis")
}
