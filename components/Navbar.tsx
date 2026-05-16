"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Brain } from "lucide-react"
import Image from "next/image"

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/divisi", label: "Divisi" },
  { href: "/arena-training/play", label: "Arena Training", icon: Brain },
  { href: "/artikel", label: "Artikel" },
  { href: "/register", label: "Daftar Member" },
  { href: "/sponsorship", label: "Sponsorship" },
  { href: "/admin/dashboard", label: "Admin" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://i.ibb.co/spQPFBSt/73aa2379-6078-438a-81df-424e9e261660-removalai-preview.png"
            alt="TCO Esports Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            TCO ESPORTS
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-cyan-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-white/70 hover:text-cyan-400 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400"
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
