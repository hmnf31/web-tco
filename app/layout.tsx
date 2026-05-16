import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import MusicPlayer from "@/components/MusicPlayer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TCO Esports — The Next Level of Digital Competition",
  description:
    "Rumah bagi para petarung otak dan strategi. Komunitas Catur Online terbesar di Tiktok Indonesia. #TheGameHasChanged",
  openGraph: {
    title: "TCO Esports — The Next Level of Digital Competition",
    description: "Rumah bagi para petarung otak dan strategi. Komunitas Catur Online terbesar di Tiktok Indonesia",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MusicPlayer />
      </body>
    </html>
  )
}
