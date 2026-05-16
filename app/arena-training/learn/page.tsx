"use client"

import { useState, useEffect, useCallback } from "react"
import { Chess, type Square } from "chess.js"
import { ChessboardProvider, Chessboard } from "react-chessboard"
import { Check, X, RefreshCw, Award, Brain, Loader2 } from "lucide-react"

type Puzzle = {
  fen: string
  moves: string[]
  rating: number
  themes: string[]
}

const MOCK_PUZZLES: Puzzle[] = [
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", moves: ["Nxe5", "Nxe5", "d4"], rating: 1200, themes: ["fork"] },
  { fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3", moves: ["Bxf7+", "Kxf7", "Ng5+"], rating: 1400, themes: ["sacrifice", "check"] },
  { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5", moves: ["d4"], rating: 1100, themes: ["center"] },
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 3", moves: ["Nxe5", "Nxe5", "d4"], rating: 1300, themes: ["development"] },
  { fen: "1k1r4/ppp2ppp/8/3q4/8/2N5/PPP2PPP/R3K3 w Q - 0 1", moves: ["Rd1"], rating: 1500, themes: ["pin"] },
  { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 5 5", moves: ["Bxf7+", "Rxf7", "Ng5"], rating: 1600, themes: ["sacrifice", "attack"] },
]

const difficultyMap = [
  { label: "Easy", min: 0, max: 1200 },
  { label: "Medium", min: 1201, max: 1600 },
  { label: "Hard", min: 1601, max: 3000 },
]

export default function LearnPage() {
  const [puzzles] = useState(MOCK_PUZZLES)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [fen, setFen] = useState("")
  const [moveIdx, setMoveIdx] = useState(0)
  const [solved, setSolved] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")
  const [message, setMessage] = useState("")
  const [selectedSq, setSelectedSq] = useState<string | null>(null)
  const [legalSqs, setLegalSqs] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  const filtered = puzzles.filter((p) => {
    const r = difficultyMap.find((d) => d.label === difficulty)
    return r ? p.rating >= r.min && p.rating <= r.max : true
  })

  const safeIdx = currentIdx < filtered.length ? currentIdx : 0

  const loadPuzzle = useCallback((index: number) => {
    const arr = filtered.length > 0 ? filtered : puzzles
    const p = arr[index % arr.length]
    if (!p) return
    const chess = new Chess(p.fen)
    setFen(chess.fen())
    setMoveIdx(0)
    setSolved(null)
    setShowHint(false)
    setMessage("")
    setSelectedSq(null)
    setLegalSqs([])
    setLastMove(null)
  }, [filtered, puzzles])

  useEffect(() => { if (filtered.length > 0) loadPuzzle(0) }, [filtered.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function onSquareClick({ square }: { square: string }) {
    if (solved !== null) return
    const p = filtered[safeIdx]
    if (!p) return

    const g = new Chess(fen)
    const piece = g.get(square as Square)

    if (selectedSq) {
      try {
        const move = g.move({ from: selectedSq, to: square, promotion: "q" })
        if (move) {
          setSelectedSq(null)
          setLegalSqs([])
          const expected = p.moves[moveIdx]
          if (move.san === expected) {
            setLastMove({ from: selectedSq, to: square })
            setFen(g.fen())
            if (moveIdx >= p.moves.length - 1) {
              setSolved(true)
              setScore((s) => s + 1)
              setTotal((t) => t + 1)
              setMessage("Correct! 🎉")
              return
            }
            setMoveIdx((i) => i + 1)
            setMessage("Benar! Lanjutkan...")
            // Bot response
            const nextMove = p.moves[moveIdx + 1]
            if (nextMove) {
              setTimeout(() => {
                const g2 = new Chess(g.fen())
                try {
                  g2.move(nextMove)
                  const from = nextMove.substring(0, 2)
                  const to = nextMove.substring(2, 4)
                  if (from.length === 2 && to.length === 2) setLastMove({ from, to })
                  setFen(g2.fen())
                  setMoveIdx((i) => i + 1)
                } catch { /* */ }
              }, 500)
            }
          } else {
            setMessage("Try Again!")
          }
          return
        }
      } catch { /* */ }

      if (piece && piece.color === "w") {
        setSelectedSq(square)
        setLegalSqs(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
      } else {
        setSelectedSq(null)
        setLegalSqs([])
      }
      return
    }

    if (piece && piece.color === "w") {
      setSelectedSq(square)
      setLegalSqs(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
    }
  }

  function nextPuzzle() {
    const n = (safeIdx + 1) % filtered.length
    setCurrentIdx(n)
    loadPuzzle(n)
  }

  function resetPuzzle() { loadPuzzle(safeIdx) }

  const sqStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    sqStyles[lastMove.from] = { backgroundColor: "rgba(255,255,0,0.25)", borderRadius: "4px" }
    sqStyles[lastMove.to] = { backgroundColor: "rgba(255,255,0,0.25)", borderRadius: "4px" }
  }
  if (selectedSq) {
    sqStyles[selectedSq] = { backgroundColor: "rgba(0,210,255,0.35)", borderRadius: "4px" }
  }
  for (const sq of legalSqs) {
    sqStyles[sq] = {
      background: "radial-gradient(circle, rgba(0,210,255,0.4) 25%, transparent 25%)",
      borderRadius: "50%",
    }
  }

  const boardOptions = {
    id: "puzzle-board",
    position: fen,
    boardOrientation: "white" as const,
    onSquareClick,
    boardStyle: { borderRadius: "12px", boxShadow: "0 0 30px rgba(0, 210, 255, 0.1)" },
    darkSquareStyle: { backgroundColor: "#1e293b" },
    lightSquareStyle: { backgroundColor: "#334155" },
    showNotation: true,
    squareStyles: sqStyles,
    allowDragging: false,
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Puzzle Academy</h1>
          <p className="text-sm text-white/50">Asah taktik catur</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-white/30">Score</p>
            <p className="text-lg font-bold text-cyan-400">{score}/{total}</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 p-1">
            {difficultyMap.map((d) => (
              <button key={d.label} onClick={() => setDifficulty(d.label as typeof difficulty)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${difficulty === d.label ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-white/40 hover:text-white/60"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ChessboardProvider options={boardOptions}>
            <div className="mx-auto max-w-[560px]"><Chessboard /></div>
          </ChessboardProvider>

          {message && (
            <div className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              solved === true ? "border-green-400/20 bg-green-400/5 text-green-400" : solved === false ? "border-red-400/20 bg-red-400/5 text-red-400" : "border-cyan-400/20 bg-cyan-400/5 text-cyan-400"
            }`}>
              {solved === true ? <Check className="h-4 w-4" /> : solved === false ? <X className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
              {message}
            </div>
          )}

          <div className="mt-4 flex justify-center gap-3">
            <button onClick={resetPuzzle}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
            <button onClick={() => { if (solved !== null) return; setTotal((t) => t + 1); setSolved(false); setMessage("Skipped"); setTimeout(nextPuzzle, 800) }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-orange-400/30 hover:text-orange-400">
              Skip
            </button>
            <button onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:border-yellow-400/30 hover:text-yellow-400">
              <Brain className="h-3.5 w-3.5" /> {showHint ? "Hide Hint" : "Hint"}
            </button>
            {solved === true && (
              <button onClick={nextPuzzle}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105">
                <Award className="h-3.5 w-3.5" /> Next Puzzle
              </button>
            )}
          </div>

          {showHint && filtered[safeIdx] && (
            <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.03] p-4">
              <p className="text-xs text-yellow-400/80">
                Petunjuk: Coba langkah <span className="font-bold text-white">{filtered[safeIdx].moves[0]}</span>
                {filtered[safeIdx].themes.length > 0 && (
                  <> — Tema: {filtered[safeIdx].themes.join(", ")}</>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Puzzle Info</h3>
              {filtered[safeIdx] ? (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-white/40">Rating</span><span className="text-white/80">{filtered[safeIdx].rating}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/40">Themes</span><span className="text-white/80">{filtered[safeIdx].themes.join(", ")}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/40">Moves</span><span className="text-white/80">{filtered[safeIdx].moves.length}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-white/40">Progress</span><span className="text-cyan-400">{moveIdx}/{filtered[safeIdx].moves.length}</span></div>
                </div>
              ) : <p className="mt-3 text-xs text-white/30">No puzzles</p>}
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Petunjuk Puzzle</h3>
              {filtered[safeIdx] ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">Giliran:</span>
                    <span className="font-medium text-white/80">{new Chess(filtered[safeIdx].fen).turn() === "w" ? "Putih melangkah" : "Hitam melangkah"}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Cari langkah terbaik untuk mendapatkan keuntungan. Tema: <span className="text-cyan-400">{filtered[safeIdx].themes.join(", ")}</span>
                  </p>
                </div>
              ) : <p className="mt-3 text-xs text-white/30">No puzzles</p>}
            </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Puzzle List</h3>
            <div className="mt-2 space-y-1">
              {filtered.map((p, i) => (
                <button key={i} onClick={() => { setCurrentIdx(i); loadPuzzle(i) }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${safeIdx === i ? "bg-cyan-400/10 text-cyan-400" : "text-white/40 hover:bg-white/[0.02]"}`}>
                  <span>Puzzle #{i + 1}</span>
                  <span className="text-white/30">{p.rating}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
