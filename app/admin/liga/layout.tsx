import type { Metadata } from "next"
import { Oxanium, Chakra_Petch } from "next/font/google"
import "../../liga/liga.css"

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
  title: "Admin Liga — TCO League",
  description: "Panel manajemen TCO League: peserta, jadwal, skor & PGN, transisi season.",
}

export default function AdminLigaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${oxanium.variable} ${chakra.variable}`}>{children}</div>
}