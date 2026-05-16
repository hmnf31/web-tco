interface EvaluationBarProps {
  evaluation: number
  mate: number | null
  playerColor?: "white" | "black"
}

export default function EvaluationBar({ evaluation, mate, playerColor = "white" }: EvaluationBarProps) {
  const totalBars = 40
  const normalized = Math.max(-10, Math.min(10, evaluation))
  const whiteHeight = Math.round(((normalized + 10) / 20) * totalBars)
  const blackHeight = totalBars - whiteHeight
  const flip = playerColor === "black"

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-white/50">{flip ? "BLACK" : "WHITE"}</span>
      <div className="flex h-80 w-8 flex-col-reverse overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {flip ? (
          <>
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${(blackHeight / totalBars) * 100}%`, backgroundColor: "#1a1a1a" }}
            />
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${(whiteHeight / totalBars) * 100}%`, backgroundColor: "#f3f3f3" }}
            />
          </>
        ) : (
          <>
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${(whiteHeight / totalBars) * 100}%`, backgroundColor: "#f3f3f3" }}
            />
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${(blackHeight / totalBars) * 100}%`, backgroundColor: "#1a1a1a" }}
            />
          </>
        )}
      </div>
      <span className="text-xs font-bold text-white/50">{flip ? "WHITE" : "BLACK"}</span>
      <div className="mt-1 text-center">
        {mate !== null ? (
          <span className="text-sm font-bold text-yellow-400">
            {mate > 0 ? `M${mate}` : mate < 0 ? `-M${Math.abs(mate)}` : "M0"}
          </span>
        ) : (
          <span className={`text-sm font-bold ${evaluation > 0 ? "text-white" : evaluation < 0 ? "text-gray-400" : "text-yellow-400"}`}>
            {evaluation > 0 ? "+" : ""}
            {evaluation.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  )
}
