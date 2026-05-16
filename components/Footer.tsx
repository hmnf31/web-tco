import Link from "next/link"
import { Music, MessageCircle, Globe, Castle } from "lucide-react"

const socialLinks = [
  { href: "https://www.tiktok.com/@tco.chess", label: "TikTok", icon: Music },
  { href: "https://wa.me/6283878170957", label: "WhatsApp", icon: MessageCircle },
  { href: "https://youtube.com/@tco.chess", label: "YouTube", icon: Globe },
  { href: "https://chess.com/club/tco", label: "Chess.com Club", icon: Castle },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-lg font-bold text-transparent">
              TCO ESPORTS
            </p>
            <p className="mt-1 text-sm text-white/50">— #TheGameHasChanged</p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-cyan-400/50 hover:text-cyan-400"
                aria-label={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-sm text-white/40">
          &copy; 2026 TCO Esports. All Rights Reserved. Powered by Gens Una Sumus.
        </div>
      </div>
    </footer>
  )
}
