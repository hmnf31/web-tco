import Link from "next/link"

const socialLinks = [
  { href: "https://www.tiktok.com/@tco.chess", label: "TikTok" },
  { href: "https://wa.me/6283878170957", label: "WhatsApp" },
  { href: "https://youtube.com/@tco.chess", label: "YouTube" },
  { href: "https://chess.com/club/tco", label: "Chess.com Club" },
]

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-semibold uppercase tracking-tight text-white">
              TCO Esports
            </p>
            <p className="mono-label-sm mt-3 max-w-xs text-[#8e9192]">
              — #TheGameHasChanged
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="mono-label text-[#444748]">Sosial</p>
            <ul className="mt-4 space-y-2">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono-label-sm inline-flex items-center gap-2 text-[#c4c7c8] transition-colors hover:text-white"
                  >
                    {item.label}
                    <span aria-hidden className="text-[#444748]">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="mono-label text-[#444748]">Legal</p>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="mono-label-sm text-[#c4c7c8] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-label-sm text-[#8e9192]">
            © 2026 TCO Esports. All Rights Reserved. Powered by TCO.
          </p>
          <p className="mono-label-sm text-[#444748]">#TheGameHasChanged</p>
        </div>
      </div>
    </footer>
  )
}
