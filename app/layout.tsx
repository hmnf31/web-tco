import type { Metadata } from "next"
import { Inter, Syne, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import Navbar from "@/components/Navbar"
import AnnouncementBanner from "@/components/AnnouncementBanner"
import SiteTour from "@/components/SiteTour"
import Footer from "@/components/Footer"
import MusicPlayer from "@/components/MusicPlayer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
    <html lang="id" className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <AnnouncementBanner />
        <SiteTour />
        <main className="flex-1">{children}</main>
        <Footer />
        <MusicPlayer />
        <Analytics />
      </body>
    </html>
  )
}
