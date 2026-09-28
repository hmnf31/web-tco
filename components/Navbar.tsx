"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Brain, User } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/divisi", label: "Divisi" },
  { href: "/arena-training/play", label: "Arena Training", icon: Brain },
  { href: "/liga", label: "Liga" },
  { href: "/artikel", label: "Artikel" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/register", label: "Daftar Member" },
  { href: "/sponsorship", label: "Sponsorship" },
  { href: "/admin/dashboard", label: "Admin" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0, 2).join("/"))

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#131313]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://i.ibb.co/spQPFBSt/73aa2379-6078-438a-81df-424e9e261660-removalai-preview.png"
            alt="TCO Esports Logo"
            width={36}
            height={36}
            className="h-8 w-8 object-contain photo-mono"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold uppercase tracking-tight text-white">
              TCO Esports
            </span>
            <span className="mono-label mt-1 text-[#8e9192]">Archive // 2026</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mono-label-sm transition-colors ${
                isActive(link.href)
                  ? "font-medium text-white"
                  : "text-[#c4c7c8] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          <Link href="/register" className="btn-primary !px-6 !py-2.5">
            Daftar [↗]
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <User className="h-4 w-4 text-[#080808]" />
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-white/70 hover:text-white xl:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.08] bg-[#0f0f10] xl:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`mono-label-sm px-3 py-2.5 transition-colors hover:bg-[#161718] hover:text-white ${
                  isActive(link.href) ? "text-white" : "text-[#c4c7c8]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
