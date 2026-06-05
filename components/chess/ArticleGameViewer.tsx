"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Chess } from "chess.js"
import Chessground from "@react-chess/chessground"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Move } from "lucide-react"
import type { Key } from "chessground/types"
import "chessground/assets/chessground.base.css"
import "chessground/assets/chessground.brown.css"
import "chessground/assets/chessground.cburnett.css"

const BOARD_CSS = `
.board-viewer-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
.board-viewer-wrap > div:first-child {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
}
.board-viewer-wrap > div:first-child > div {
  height: 100% !important;
}
.board-viewer-wrap .cg-wrap {
  width: 100% !important;
  height: 100% !important;
}
.board-viewer-wrap .cg-board {
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.board-viewer-wrap .cg-board square.last-move {
  background-color: rgba(255, 255, 0, 0.16);
}
.board-viewer-wrap coords {
  font-size: 9px;
  font-weight: 600;
}
.board-viewer-wrap coords.ranks { right: -6px; }
.board-viewer-wrap coords.files { bottom: -6px; }
`

interface GameData {
  pgn: string
}

function parsePGN(game: GameData): { chess: Chess; moves: string[]; white?: string; black?: string; result?: string } | null {
  try {
    const chess = new Chess()
    chess.loadPgn(game.pgn)
    const moves = chess.history()
    const header = chess.header()
    return {
      chess,
      moves,
      white: header.White || undefined,
      black: header.Black || undefined,
      result: header.Result || undefined,
    }
  } catch {
    return null
  }
}

export default function ArticleGameViewer({ games }: { games: GameData[] }) {
  const [gameIndex, setGameIndex] = useState(0)
  const [moveIndex, setMoveIndex] = useState(-1)

  const parsed = useMemo(() => games.map(parsePGN), [games])

  const current = parsed[gameIndex]
  const totalMoves = current?.moves.length || 0

  const fen = useMemo(() => {
    if (!current || moveIndex < 0) return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const chess = new Chess()
    for (let i = 0; i <= moveIndex && i < current.moves.length; i++) {
      chess.move(current.moves[i])
    }
    return chess.fen()
  }, [current, moveIndex])

  const lastMove = useMemo<[Key, Key] | undefined>(() => {
    if (!current || moveIndex < 0) return undefined
    const chess = new Chess()
    for (let i = 0; i <= moveIndex && i < current.moves.length; i++) {
      chess.move(current.moves[i])
    }
    const hist = chess.history({ verbose: true })
    if (hist.length > 0) {
      const m = hist[hist.length - 1]
      return [m.from as Key, m.to as Key]
    }
    return undefined
  }, [current, moveIndex])

  const moveList = useMemo(() => {
    if (!current) return []
    const result: { num: number; white?: string; black?: string }[] = []
    for (let i = 0; i < current.moves.length; i += 2) {
      result.push({
        num: Math.floor(i / 2) + 1,
        white: current.moves[i],
        black: current.moves[i + 1],
      })
    }
    return result
  }, [current])

  const turn = useMemo(() => {
    if (!current) return "Putih"
    const chess = new Chess()
    for (let i = 0; i <= moveIndex && i < current.moves.length; i++) {
      chess.move(current.moves[i])
    }
    return chess.turn() === "w" ? "Putih" : "Hitam"
  }, [current, moveIndex])

  const goToFirst = useCallback(() => setMoveIndex(-1), [])
  const goToPrev = useCallback(() => setMoveIndex((i) => Math.max(-1, i - 1)), [])
  const goToNext = useCallback(() => setMoveIndex((i) => Math.min(totalMoves - 1, i + 1)), [totalMoves])
  const goToLast = useCallback(() => setMoveIndex(totalMoves - 1), [totalMoves])

  const moveListRef = useRef<HTMLDivElement>(null)

  const scrollToActive = useCallback((idx: number) => {
    if (!moveListRef.current) return
    const el = moveListRef.current.querySelector(`[data-move-idx="${idx}"]`)
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [])

  const goToMove = useCallback((idx: number) => {
    setMoveIndex(idx)
    scrollToActive(idx)
  }, [scrollToActive])

  useEffect(() => {
    if (moveIndex >= 0) scrollToActive(moveIndex)
  }, [moveIndex, scrollToActive])

  if (!games.length || parsed.every((p) => !p)) {
    return null
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <style dangerouslySetInnerHTML={{ __html: BOARD_CSS }} />
      <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
        <Move className="h-5 w-5 text-cyan-400" /> Partai Catur
      </h3>

      {/* Game Selector */}
      {games.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {games.map((g, i) => {
            const p = parsed[i]
            const label = p ? `${p.white || "?"} vs ${p.black || "?"}${p.result ? ` (${p.result})` : ""}` : `Game ${i + 1}`
            return (
              <button
                key={i}
                onClick={() => { setGameIndex(i); setMoveIndex(-1) }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  gameIndex === i
                    ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30"
                    : "bg-white/[0.04] text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Solo game label */}
      {games.length === 1 && current && (
        <div className="mb-3 text-xs text-white/40">
          {current.white} vs {current.black} — {current.result || "*"}
        </div>
      )}

      {/* Board + Move List */}
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="board-viewer-wrap w-full max-w-[400px]">
          <Chessground
            config={{
              fen,
              orientation: games.length === 1 && parsed[0]?.black === "Carlsen" ? "black" : "white",
              lastMove,
              movable: { free: false },
              draggable: { enabled: false },
              selectable: { enabled: false },
              highlight: { lastMove: true, check: true },
            }}
          />
        </div>

        {/* Move list */}
        <div className="w-full max-w-[280px]">
          <div className="mb-2 flex items-center justify-center gap-1">
            <button onClick={goToFirst} disabled={moveIndex <= -1} className="rounded p-1.5 text-white/40 hover:text-white disabled:opacity-20 transition-all" title="Awal"><SkipBack className="h-4 w-4" /></button>
            <button onClick={goToPrev} disabled={moveIndex <= -1} className="rounded p-1.5 text-white/40 hover:text-white disabled:opacity-20 transition-all" title="Mundur"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-[80px] text-center text-xs text-white/50">
              {moveIndex < 0 ? "Posisi awal" : `Langkah ${Math.ceil((moveIndex + 1) / 2)}${moveIndex % 2 === 0 ? ".w" : ".b"}`}
            </span>
            <button onClick={goToNext} disabled={moveIndex >= totalMoves - 1} className="rounded p-1.5 text-white/40 hover:text-white disabled:opacity-20 transition-all" title="Maju"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={goToLast} disabled={moveIndex >= totalMoves - 1} className="rounded p-1.5 text-white/40 hover:text-white disabled:opacity-20 transition-all" title="Akhir"><SkipForward className="h-4 w-4" /></button>
          </div>
          <div ref={moveListRef} className="max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2" style={{ scrollbarWidth: "thin" }}>
            <table className="w-full text-xs">
              <tbody>
                {moveList.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/5 last:border-0">
                    <td className="w-8 py-1 text-center text-white/30">{row.num}.</td>
                    <td className="py-1">
                      <button
                        data-move-idx={ri * 2}
                        onClick={() => goToMove(ri * 2)}
                        className={`w-full rounded px-1.5 py-0.5 text-left transition-all ${
                          moveIndex === ri * 2 ? "bg-cyan-400/15 text-cyan-300" : "text-white/60 hover:bg-white/[0.04]"
                        }`}
                      >
                        {row.white}
                      </button>
                    </td>
                    <td className="py-1">
                      {row.black && (
                        <button
                          data-move-idx={ri * 2 + 1}
                          onClick={() => goToMove(ri * 2 + 1)}
                          className={`w-full rounded px-1.5 py-0.5 text-left transition-all ${
                            moveIndex === ri * 2 + 1 ? "bg-cyan-400/15 text-cyan-300" : "text-white/60 hover:bg-white/[0.04]"
                          }`}
                        >
                          {row.black}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
