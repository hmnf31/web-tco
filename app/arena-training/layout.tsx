import Link from "next/link"
import { Swords, Brain, BookOpen, ChevronLeft } from "lucide-react"

const trainingLinks = [
  { href: "/arena-training/play", label: "VS Bot", icon: Swords },
  { href: "/arena-training/analysis", label: "Analysis", icon: Brain },
  { href: "/arena-training/learn", label: "Puzzle Academy", icon: BookOpen },
]

export default function ArenaTrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-white/40 transition-colors hover:text-cyan-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-sm font-semibold text-cyan-400">ARENA TRAINING</span>
          <div className="ml-auto flex gap-2">
            {trainingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
