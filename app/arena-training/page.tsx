import type { Metadata } from "next"
import ArenaGameViewer from "@/components/league/ArenaGameViewer"

export const metadata: Metadata = {
  title: "Arena Training TCO Esports",
  description: "Tonton dan analisis ulang setiap game Liga TCO langsung dari Chessigma. Buka game Liga TCO dan pelajari move demi move.",
  keywords: ["TCO Esports", "analisis catur", "chessigma", "Liga TCO", "blitz chess", "chess Indonesia", "arena training"],
  openGraph: {
    title: "Arena Training TCO Esports",
    description: "Analisis ulang game Liga TCO dari Chessigma.",
    type: "website",
    url: "https://web-tco.vercel.app/arena-training",
    siteName: "TCO Esports",
  },
  twitter: { card: "summary_large_image", title: "Arena Training TCO Esports", description: "Analisis ulang game Liga TCO dari Chessigma." },
  robots: "index, follow",
  alternates: { canonical: "https://web-tco.vercel.app/arena-training" },
}

export default function ArenaTrainingPage() {
  return <ArenaGameViewer />
}
