import Link from "next/link"
import { Swords, Brain, BookOpen, ChevronLeft, Settings, Shuffle, User, Bot } from "lucide-react"
import { ChessProvider } from "@/contexts/ChessContext"
import "chessground/assets/chessground.base.css"
import "chessground/assets/chessground.brown.css"
import "chessground/assets/chessground.cburnett.css"

const BOARD_CSS = `
.board-custom-wrap {
  position: relative;
  width: 100%;
  max-width: 560px;
}
.board-custom-wrap > div:first-child {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
}
.board-custom-wrap > div:first-child > div {
  height: 100% !important;
}
.board-custom-wrap .cg-wrap {
  width: 100% !important;
  height: 100% !important;
}
.board-custom-wrap .cg-board {
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0, 210, 255, 0.1);
}
.board-custom-wrap .cg-board square.last-move {
  background-color: rgba(255, 255, 0, 0.16);
}
.board-custom-wrap .cg-board square.selected {
  background-color: rgba(0, 210, 255, 0.35);
}
.board-custom-wrap .cg-board square.check {
  background: radial-gradient(ellipse at center, rgba(255, 0, 0, 0.6) 0%, rgba(200, 0, 0, 0.3) 40%, transparent 60%);
}
.board-custom-wrap coords {
  font-size: 10px;
  font-weight: 600;
}
.board-custom-wrap coords.ranks {
  right: -8px;
}
.board-custom-wrap coords.files {
  bottom: -8px;
}
.board-custom-wrap .cg-board square {
  cursor: pointer;
}
.board-custom-wrap .cg-board square.move-dest {
  background: rgba(0, 210, 255, 0.15);
}
.board-custom-wrap .cg-board square.move-dest:hover {
  background: rgba(0, 210, 255, 0.3);
}
.board-custom-wrap .cg-board square.premove-dest {
  background: rgba(0, 210, 255, 0.1);
}
.board-custom-wrap .cg-board square.move-dest::after,
.board-custom-wrap .cg-board square.premove-dest::after {
  background: rgba(0, 210, 255, 0.4);
}
`

const trainingLinks = [
  { href: "/arena-training/analysis", label: "Analysis", icon: Brain },
  { href: "/arena-training/play", label: "Play", icon: Swords },
  { href: "/arena-training/learn", label: "Puzzles", icon: BookOpen },
  { href: "/arena-training/openings", label: "Openings", icon: Shuffle },
  { href: "/arena-training/turing", label: "Bot or Not", icon: Bot },
  { href: "/arena-training/settings", label: "Settings", icon: Settings },
  { href: "/arena-training/profile", label: "Profile", icon: User },
]

export default function ArenaTrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <style dangerouslySetInnerHTML={{ __html: BOARD_CSS }} />
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-4 lg:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 text-xs text-white/40 transition-colors hover:text-cyan-400"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <span className="text-white/20 shrink-0">|</span>
          <span className="shrink-0 text-xs font-semibold text-cyan-400">ARENA</span>
          <div className="flex gap-1 overflow-x-auto ml-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {trainingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
              >
                <link.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <ChessProvider>
          {children}
        </ChessProvider>
      </div>
    </div>
  )
}
