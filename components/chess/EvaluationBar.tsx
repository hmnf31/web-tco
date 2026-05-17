import { cpToWinrate } from "@/engine/classify-utils"

interface EvaluationBarProps {
  evaluation: number
  mate: number | null
  playerColor?: "white" | "black"
}

export default function EvaluationBar({ evaluation, mate, playerColor = "white" }: EvaluationBarProps) {
  const winrate = mate !== null
    ? (mate > 0 ? 1 : 0)
    : cpToWinrate(evaluation * 100)

  const whitePct = Math.max(0, Math.min(100, Math.round(winrate * 100)))
  const blackPct = 100 - whitePct

  const flip = playerColor === "black"

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold text-white/50">{flip ? "BLACK" : "WHITE"}</span>
      <div className="relative flex h-60 w-8 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <div
          className="w-full transition-all duration-300"
          style={{ height: `${whitePct}%`, backgroundColor: "#f3f3f3" }}
        />
        <div
          className="w-full transition-all duration-300"
          style={{ height: `${blackPct}%`, backgroundColor: "#1a1a1a" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white/80 drop-shadow-sm">
            {mate !== null
              ? `M${Math.abs(mate)}`
              : `${whitePct}%`
            }
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-white/50">{flip ? "WHITE" : "BLACK"}</span>
    </div>
  )
}
