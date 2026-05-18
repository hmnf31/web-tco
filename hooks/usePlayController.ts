"use client"

import { useCallback, useEffect, useRef } from "react"
import { Chess, type Square } from "chess.js"
import { useChessContext, type BotInfo, TIME_PRESETS, type TimeMode, type PlayerColor, type GameResult } from "@/contexts/ChessContext"

const COACH = [
  "Langkahmu kurang akurat! Coba perhatikan perwira yang tidak dijaga.",
  "Waspada! Lawan mengincar skakmat di sisi Raja.",
  "Bagus! Kendali pusat papan sangat penting.",
  "Jangan terburu-buru, evaluasi dulu semua kemungkinan.",
  "Coba pertimbangkan untuk mengembangkan perwira ringanmu.",
  "Perhatikan struktur pionmu!",
  "Kamu kehilangan materi, coba cari taktik untuk mengimbangi.",
  "Langkah yang solid! Pertahankan tekanan.",
  "Tekan lawan! Coba cari ancaman ganda.",
  "Jangan lupa castling untuk mengamankan Raja.",
]

function getBotDelayMs(timeMode: TimeMode, customMinutes: number): number {
  if (timeMode === "bullet") return 50
  if (timeMode === "blitz") return 100
  if (timeMode === "rapid") return 200
  if (timeMode === "custom") return Math.min(customMinutes * 30, 300)
  return 100
}

export function usePlayController() {
  const ctx = useChessContext()
  const gameRef = useRef(ctx.game)
  const thinkingRef = useRef(false)
  const botMovePendingRef = useRef(false)

  useEffect(() => { gameRef.current = ctx.game }, [ctx.game])

  const isBotTurn = useCallback(() => {
    const c = new Chess(gameRef.current.fen())
    return ctx.playerColor === "white" ? c.turn() === "b" : c.turn() === "w"
  }, [ctx.playerColor])

  const doBotMove = useCallback(async () => {
    if (thinkingRef.current || ctx.gameOver || botMovePendingRef.current) return
    if (!isBotTurn()) return

    botMovePendingRef.current = true
    thinkingRef.current = true
    ctx.setBotThinking(true)

    const delay = getBotDelayMs(ctx.timeMode, ctx.customMinutes)

    const result = await ctx.engine.getBestMove(gameRef.current.fen(), 150)

    setTimeout(() => {
      if (!result.bestmove) {
        thinkingRef.current = false
        botMovePendingRef.current = false
        ctx.setBotThinking(false)
        return
      }

      const g = new Chess(gameRef.current.fen())
      try {
        const fr = result.from || result.bestmove.substring(0, 2)
        const t = result.to || result.bestmove.substring(2, 4)
        const promo = result.bestmove.length > 4 ? result.bestmove[4] as any : undefined
        g.move({ from: fr as any, to: t as any, promotion: promo })
        const h = g.history()
        const last = h[h.length - 1]
        gameRef.current = g
        ctx.setGame(g)
        ctx.setFen(g.fen())
        ctx.setMoves(h)
        ctx.setLastMove({ from: fr, to: t })
        ctx.setCoachText(COACH[Math.floor(Math.random() * COACH.length)])
        ctx.addCommentary(`Bot (${ctx.bot.name}): ${last}`)

        if (g.isGameOver()) {
          ctx.setGameOver(true)
          let result: GameResult
          if (g.isCheckmate()) {
            const winner = g.turn() === "w" ? "black" : "white"
            result = { winner, reason: "Checkmate" }
          } else if (g.isDraw()) {
            result = { winner: "draw", reason: "Draw" }
          } else {
            result = { winner: null, reason: "Game Over" }
          }
          ctx.setGameResult(result)
          ctx.addCommentary(
            result.winner === "draw" ? "Game berakhir draw."
              : result.winner === "white" ? "Putih menang! Checkmate."
                : result.winner === "black" ? "Hitam menang! Checkmate."
                  : "Game Over"
          )
        } else if (g.isCheck()) {
          ctx.addCommentary("Check!")
        }
      } catch { /* ignore */ }

      thinkingRef.current = false
      botMovePendingRef.current = false
      ctx.setBotThinking(false)
    }, delay)
  }, [ctx.engine, ctx.gameOver, ctx.activeElo, ctx.timeMode, ctx.customMinutes, ctx.bot.name, isBotTurn, ctx.moves])

  useEffect(() => {
    if (!ctx.gameStarted || ctx.gameOver) return
    const timer = setTimeout(() => {
      if (isBotTurn()) doBotMove()
    }, 600)
    return () => clearTimeout(timer)
  }, [ctx.gameStarted, ctx.gameOver, isBotTurn, doBotMove])

  useEffect(() => {
    if (!ctx.gameStarted || ctx.gameOver || ctx.timeMode === "none") return
    const interval = setInterval(() => {
      const g = gameRef.current
      if (g.turn() === "w") {
        ctx.setPlayerTime((t: number) => Math.max(0, t - 1))
      } else {
        ctx.setBotTime((t: number) => Math.max(0, t - 1))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [ctx.gameStarted, ctx.gameOver, ctx.timeMode, ctx.playerColor])

  useEffect(() => {
    if (!ctx.gameStarted || ctx.gameOver || ctx.timeMode === "none") return
    if (ctx.playerTime <= 0 && gameRef.current.turn() === (ctx.playerColor === "white" ? "w" : "b")) {
      ctx.setGameOver(true)
      ctx.setGameResult({ winner: ctx.playerColor === "white" ? "black" : "white", reason: "Timeout" })
      ctx.addCommentary("Time's up! Kamu kehabisan waktu!")
    }
    if (ctx.botTime <= 0 && gameRef.current.turn() === (ctx.playerColor === "white" ? "b" : "w")) {
      ctx.setGameOver(true)
      ctx.setGameResult({ winner: ctx.playerColor, reason: "Timeout" })
      ctx.addCommentary("Bot kehabisan waktu! Kamu menang!")
    }
  }, [ctx.playerTime, ctx.botTime, ctx.gameStarted, ctx.gameOver, ctx.timeMode, ctx.playerColor])

  useEffect(() => {
    if (!ctx.gameStarted || ctx.gameOver) return
    let lastFen = ""
    const interval = setInterval(async () => {
      if (thinkingRef.current || botMovePendingRef.current) return
      const curFen = gameRef.current.fen()
      if (curFen === lastFen) return
      lastFen = curFen
      const eval_ = await ctx.engine.evaluatePositionAsync(curFen)
      ctx.setEvaluation(eval_)
    }, 1000)
    return () => clearInterval(interval)
  }, [ctx.gameStarted, ctx.gameOver, ctx.engine])

  function startGame(color: PlayerColor, skillLevel = 10) {
    if (!ctx.engineReady) return
    ctx.engine.configure({ threads: 1, hash: 16, skillLevel })
    const fresh = new Chess()
    const secs = getTimeInSeconds(ctx.timeMode, ctx.customMinutes)
    gameRef.current = fresh
    ctx.resetBoard()
    ctx.setGame(fresh)
    ctx.setFen(fresh.fen())
    ctx.setMoves([])
    ctx.setEvaluation(0)
    ctx.setCoachText("")
    ctx.setCommentary([])
    ctx.setLastMove(null)
    ctx.setPlayerColor(color)
    ctx.setGameStarted(true)
    ctx.setGameOver(false)
    ctx.setBotThinking(false)
    ctx.setGameResult(null)
    ctx.setPlayerTime(secs)
    ctx.setBotTime(secs)
  }

  function resetGame() {
    ctx.resetBoard()
  }

  function applyPlayerMove(from: string, to: string, promo?: string): boolean {
    if (!ctx.gameStarted || ctx.gameOver || isBotTurn() || ctx.botThinking) return false
    const g = new Chess(gameRef.current.fen())
    try {
      const move = g.move({ from: from as Square, to: to as Square, promotion: promo || "q" })
      if (!move) return false
      ctx.setLegalSquares([])
      ctx.setSelectedSquare(null)
      ctx.setLastMove({ from, to })
      gameRef.current = g
      ctx.setGame(g)
      ctx.setFen(g.fen())
      ctx.setMoves(g.history())
      ctx.addCommentary(`Kamu (${ctx.playerColor === "white" ? "Putih" : "Hitam"}): ${move.san}`)

      if (g.isGameOver()) {
        ctx.setGameOver(true)
        let result: GameResult
        if (g.isCheckmate()) {
          const winner = g.turn() === "w" ? "black" : "white"
          result = { winner, reason: "Checkmate" }
        } else if (g.isDraw()) {
          result = { winner: "draw", reason: "Draw" }
        } else {
          result = { winner: null, reason: "Game Over" }
        }
        ctx.setGameResult(result)
        ctx.addCommentary(
          result.winner === "draw" ? "Game berakhir draw."
            : result.winner === "white" ? "Putih menang!"
              : result.winner === "black" ? "Hitam menang!" : "Game Over"
        )
        return true
      }

      if (g.isCheck()) ctx.addCommentary("Check!")

      doBotMove()
      return true
    } catch { return false }
  }

  function onSquareClick({ square }: { square: string }) {
    if (!ctx.gameStarted || ctx.gameOver || isBotTurn() || ctx.botThinking) return
    const g = new Chess(gameRef.current.fen())
    const piece = g.get(square as Square)

    if (ctx.selectedSquare) {
      if (applyPlayerMove(ctx.selectedSquare, square)) return
      if (piece && piece.color === (ctx.playerColor === "white" ? "w" : "b")) {
        ctx.setSelectedSquare(square)
        ctx.setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
        return
      }
      ctx.setSelectedSquare(null)
      ctx.setLegalSquares([])
      return
    }

    if (piece && piece.color === (ctx.playerColor === "white" ? "w" : "b")) {
      ctx.setSelectedSquare(square)
      ctx.setLegalSquares(g.moves({ square: square as Square, verbose: true }).map((m) => m.to))
    }
  }

  function onPieceDrop(args: { sourceSquare?: string | null; targetSquare?: string | null }): boolean {
    if (!args.sourceSquare || !args.targetSquare) return false
    return applyPlayerMove(args.sourceSquare, args.targetSquare)
  }

  return {
    startGame,
    resetGame,
    onSquareClick,
    onPieceDrop,
    isBotTurn,
    applyPlayerMove,
  }
}

function getTimeInSeconds(mode: TimeMode, custom: number): number {
  if (mode === "none") return 0
  if (mode === "custom") return custom * 60
  const p = TIME_PRESETS.find((t) => t.mode === mode)
  return (p?.minutes || 0) * 60
}
