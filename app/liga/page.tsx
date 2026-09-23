import type { Metadata } from "next"
import LeaguePage from "@/components/league/LeaguePage"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "TCO League — Ligatur Catur Internal",
  description:
    "TCO League (TikTok Chess Online) — kompetisi catur internal 4 kasta dengan sistem promosi & degradasi, analisis Stockfish, dan live standings.",
}

export default function Page() {
  return <LeaguePage />
}