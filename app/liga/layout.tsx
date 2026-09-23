import type { Metadata } from "next"
import { Oxanium, Chakra_Petch } from "next/font/google"
import "./liga.css"

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
})

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
})

export const metadata: Metadata = {
  title: "TCO League — Ligatur Catur Internal",
  description:
    "TCO League (TikTok Chess Online) — kompetisi catur internal 4 kasta dengan sistem promosi & degradasi, analisis Stockfish, dan live standings.",
  openGraph: {
    title: "TCO League — Ligatur Catur Internal",
    description:
      "Kompetisi internal TCO Esports: 4 tingkatan liga, round robin, promosi & degradasi.",
    type: "website",
  },
}

export default function LigaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${oxanium.variable} ${chakra.variable}`}>{children}</div>
}