"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import { Chess } from "chess.js"
import { LC, type GameResult, type Player, type Schedule } from "@/lib/league"
import { WorkerEngine } from "@/engine/worker-engine"

const INIT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

async function cloudEval(fen: string): Promise<{ cp: number; mate: number | null }> {
  const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Cloud eval unavailable")
  const data = await res.json()
  if (!data.pvs || data.pvs.length === 0) throw new Error("No evaluation data")
  const pv = data.pvs[0]
  if (pv.cp !== undefined) return { cp: pv.cp, mate: null }
  if (pv.mate !== undefined) return { cp: 0, mate: pv.mate }
  throw new Error("Unknown eval format")
}

function useStockfish() {
  const engineRef = useRef<WorkerEngine | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const eng = new WorkerEngine("/workers/chess-engine.worker.js")
    engineRef.current = eng
    eng.init().then(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true; eng.quit() }
  }, [])

  async function evaluate(fen: string): Promise<{ score: number; mate: number | null }> {
    try {
      const cloud = await cloudEval(fen)
      return {
        score: cloud.mate !== null ? (cloud.mate > 0 ? 99 : -99) : cloud.cp / 100,
        mate: cloud.mate,
      }
    } catch {
      if (engineRef.current) {
        const score = await engineRef.current.evaluatePosition(fen)
        return { score, mate: null }
      }
      return { score: 0, mate: null }
    }
  }

  return { ready, evaluate }
}

export default function LeagueAnalysisModal({
  schedule,
  result,
  players,
  onClose,
}: {
  schedule: Schedule
  result: GameResult
  players: Player[]
  onClose: () => void
}) {
  const p1 = players.find(p => p.id === schedule.player1_id)
  const p2 = players.find(p => p.id === schedule.player2_id)
  const color = LC[schedule.league]?.color || "#00d9ff"
  const soft = LC[schedule.league]?.soft || "rgba(0,217,255,.14)"

  const [moveIdx, setMoveIdx] = useState(-1)
  const [evalScore, setEvalScore] = useState(0)
  const [evalLoading, setEvalLoading] = useState(false)
  const cacheRef = useRef<Map<string, { score: number; mate: number | null }>>(new Map())
  const { evaluate } = useStockfish()
  const evalToken = useRef(0)

  const pgn = result.pgn
  const { positions, moveList } = useMemo(() => {
    if (!pgn) return { positions: [INIT_FEN], moveList: [] as string[] }
    try {
      const chess = new Chess()
      chess.loadPgn(pgn)
      const ml = chess.history()
      const pos = [INIT_FEN]
      const c = new Chess()
      ml.forEach(m => { c.move(m); pos.push(c.fen()) })
      return { positions: pos, moveList: ml }
    } catch {
      return { positions: [INIT_FEN], moveList: [] as string[] }
    }
  }, [pgn])

  const curFen = positions[Math.min(moveIdx + 1, positions.length - 1)] || positions[0]

  useEffect(() => {
    const token = ++evalToken.current
    const cached = cacheRef.current.get(curFen)
    if (cached) {
      setEvalScore(cached.score)
      setEvalLoading(false)
      return
    }
    setEvalLoading(true)
    evaluate(curFen).then(r => {
      if (evalToken.current !== token) return
      cacheRef.current.set(curFen, r)
      setEvalScore(r.score)
      setEvalLoading(false)
    }).catch(() => {
      if (evalToken.current !== token) return
      setEvalScore(0)
      setEvalLoading(false)
    })
  }, [curFen, evaluate])

  const evalPct = Math.max(5, Math.min(95, 50 - evalScore * 6))

  const nav = (dir: "first" | "prev" | "next" | "last") => {
    setMoveIdx(m => {
      if (dir === "first") return -1
      if (dir === "last") return moveList.length - 1
      if (dir === "prev") return Math.max(-1, m - 1)
      return Math.min(moveList.length - 1, m + 1)
    })
  }

  const evalDisplay = evalScore >= 99 ? "M# putih menang" : evalScore <= -99 ? "M# hitam menang" :
    evalScore > 1.5 ? "Putih unggul jelas" :
    evalScore > 0.5 ? "Putih unggul" :
    evalScore < -1.5 ? "Hitam unggul jelas" :
    evalScore < -0.5 ? "Hitam unggul" : "Posisi seimbang"

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="am2" onClick={e => e.stopPropagation()} style={{ "--league": color, "--league-soft": soft } as React.CSSProperties}>
        <button className="close" onClick={onClose}>×</button>
        <div className="am2-head">
          <p className="eyebrow" style={{ color }}>DEEP ANALYSIS · ROUND {String(schedule.round).padStart(2, "0")}</p>
          <h2>
            {p1?.name} <span style={{ color }}>{result.score1} — {result.score2}</span> {p2?.name}
          </h2>
          <small>@{p1?.username} vs @{p2?.username} · Blitz 5+0 · {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</small>
        </div>
        <div className="am2-body">
          <div className="am2-board-col">
            <div className="eval-bar" title={`Eval: ${evalScore > 0 ? "+" : ""}${evalScore}`}>
              <div className="eval-dark" style={{ height: `${evalPct}%` }} />
              <div className="eval-light" style={{ height: `${100 - evalPct}%` }} />
              <span className="eval-bar-num">{evalLoading ? "…" : `${evalScore > 0 ? "+" : ""}${evalScore}`}</span>
            </div>
            <div style={{ width: 320, lineHeight: 0 }}>
              <Chessboard
                options={{
                  position: curFen,
                  boardStyle: { width: "100%", borderRadius: 0 },
                  allowDragging: false,
                  animationDurationInMs: 200,
                  showAnimations: true,
                  darkSquareStyle: { backgroundColor: "#4b6a7c" },
                  lightSquareStyle: { backgroundColor: "#b8d0d9" },
                }}
              />
            </div>
          </div>
          <div className="am2-side">
            <div className="eval-info-row">
              <span className="eval-num">{evalScore > 0 ? "+" : ""}{evalScore}</span>
              <span className="eval-desc">
                {evalLoading ? <span className="eval-loading"><span />Engine menganalisis…</span> : evalDisplay}
              </span>
            </div>
            <div className="nav-btns">
              {(["first", "prev", "next", "last"] as const).map(d => (
                <button key={d} className="nav-btn" onClick={() => nav(d)}>
                  {d === "first" ? "⏮" : d === "prev" ? "◀" : d === "next" ? "▶" : "⏭"}
                </button>
              ))}
            </div>
            <div className="move-counter">
              {moveIdx === -1 ? "Posisi awal" : `Langkah ${moveIdx + 1} dari ${moveList.length}`}
            </div>
            <div className="ml-scroll">
              {moveList.length === 0 ? (
                <div className="pgn-placeholder">
                  <span>🔬</span>
                  <p>PGN belum tersedia. Admin dapat menginput PGN di halaman Admin → Skor &amp; PGN untuk mengaktifkan analisis papan.</p>
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveList.length / 2) }, (_, i) => (
                  <div key={i} className="ml-row">
                    <span className="ml-num">{i + 1}.</span>
                    <span className={`ml-move ${moveIdx === i * 2 ? "ml-cur" : ""}`} onClick={() => setMoveIdx(i * 2)}>
                      {moveList[i * 2]}
                    </span>
                    {moveList[i * 2 + 1] && (
                      <span className={`ml-move ${moveIdx === i * 2 + 1 ? "ml-cur" : ""}`} onClick={() => setMoveIdx(i * 2 + 1)}>
                        {moveList[i * 2 + 1]}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}