"use client"

import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { Chess } from "chess.js"
import { EngineManager } from "@/engine/engine-manager"

export type TimeMode = "bullet" | "blitz" | "rapid" | "custom" | "none"
export type PlayerColor = "white" | "black"

export const TIME_PRESETS: { mode: TimeMode; label: string; minutes: number }[] = [
  { mode: "bullet", label: "Bullet 1m", minutes: 1 },
  { mode: "blitz", label: "Blitz 3m", minutes: 3 },
  { mode: "rapid", label: "Rapid 10m", minutes: 10 },
  { mode: "custom", label: "Custom", minutes: 0 },
  { mode: "none", label: "No Time", minutes: 0 },
]

export type BotInfo = { name: string; rating: number; isEngine: boolean; style?: string }

export type GameResult = {
  winner: "white" | "black" | "draw" | null
  reason: string
}

type ChessContextType = {
  engine: EngineManager
  engineReady: boolean
  isFallback: boolean
  isStockfishReady: boolean
  game: Chess
  fen: string
  moves: string[]
  gameStarted: boolean
  gameOver: boolean
  gameResult: GameResult | null
  playerColor: PlayerColor
  evaluation: number
  mate: number | null
  lastMove: { from: string; to: string } | null
  selectedSquare: string | null
  legalSquares: string[]
  botThinking: boolean
  playerTime: number
  botTime: number
  timeMode: TimeMode
  customMinutes: number
  bot: BotInfo
  botElo: number
  activeElo: number
  commentary: string[]
  coachText: string
  setGame: (g: Chess) => void
  setFen: (f: string) => void
  setMoves: (m: string[]) => void
  setGameStarted: (v: boolean) => void
  setGameOver: (v: boolean) => void
  setGameResult: (r: GameResult | null) => void
  setPlayerColor: (c: PlayerColor) => void
  setEvaluation: (v: number) => void
  setMate: (m: number | null) => void
  setLastMove: (m: { from: string; to: string } | null) => void
  setSelectedSquare: (s: string | null) => void
  setLegalSquares: (s: string[]) => void
  setBotThinking: (v: boolean) => void
  setPlayerTime: (v: number | ((prev: number) => number)) => void
  setBotTime: (v: number | ((prev: number) => number)) => void
  setTimeMode: (m: TimeMode) => void
  setCustomMinutes: (m: number) => void
  setBot: (b: BotInfo) => void
  setBotElo: (e: number) => void
  setCommentary: (c: string[]) => void
  addCommentary: (line: string) => void
  setCoachText: (t: string) => void
  resetBoard: () => void
  formatTime: (seconds: number) => string
}

const ChessContext = createContext<ChessContextType | null>(null)

export function ChessProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [moves, setMoves] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [playerColor, setPlayerColor] = useState<PlayerColor>("white")
  const [evaluation, setEvaluation] = useState(0)
  const [mate, setMate] = useState<number | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalSquares, setLegalSquares] = useState<string[]>([])
  const [botThinking, setBotThinking] = useState(false)
  const [playerTime, setPlayerTime] = useState(0)
  const [botTime, setBotTime] = useState(0)
  const [timeMode, setTimeMode] = useState<TimeMode>("none")
  const [customMinutes, setCustomMinutes] = useState(5)
  const [bot, setBot] = useState<BotInfo>({ name: "BaldwinKingsIV", rating: 2100, isEngine: false, style: "positional" })
  const [botElo, setBotElo] = useState(1200)
  const [commentary, setCommentary] = useState<string[]>([])
  const [coachText, setCoachText] = useState("")
  const [engine] = useState(() => new EngineManager())
  const [engineReady, setEngineReady] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [isStockfishReady, setIsStockfishReady] = useState(false)
  const gameRef = useRef(game)

  useEffect(() => { gameRef.current = game }, [game])

  useEffect(() => {
    (async () => {
      await engine.init()
      setEngineReady(true)
      setIsFallback(engine.isFallback())
      setIsStockfishReady(engine.isStockfishReady())
    })()
    return () => engine.quit()
  }, [engine])

  const activeElo = bot.rating

  const addCommentary = useCallback((line: string) => {
    setCommentary((prev) => [...prev.slice(-29), line])
  }, [])

  const resetBoard = useCallback(() => {
    const fresh = new Chess()
    gameRef.current = fresh
    setGame(fresh)
    setFen(fresh.fen())
    setMoves([])
    setEvaluation(0)
    setMate(null)
    setCoachText("")
    setCommentary([])
    setLastMove(null)
    setLegalSquares([])
    setSelectedSquare(null)
    setGameStarted(false)
    setGameOver(false)
    setBotThinking(false)
    setGameResult(null)
    setPlayerTime(0)
    setBotTime(0)
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }, [])

  return (
    <ChessContext.Provider value={{
      engine, engineReady, isFallback, isStockfishReady,
      game, fen, moves, gameStarted, gameOver, gameResult, playerColor,
      evaluation, mate, lastMove, selectedSquare, legalSquares,
      botThinking, playerTime, botTime, timeMode, customMinutes,
      bot, botElo, activeElo, commentary, coachText,
      setGame, setFen, setMoves, setGameStarted, setGameOver, setGameResult,
      setPlayerColor, setEvaluation, setMate, setLastMove,
      setSelectedSquare, setLegalSquares, setBotThinking,
      setPlayerTime, setBotTime, setTimeMode, setCustomMinutes,
      setBot, setBotElo, setCommentary, addCommentary, setCoachText,
      resetBoard, formatTime,
    }}>
      {children}
    </ChessContext.Provider>
  )
}

export function useChessContext() {
  const ctx = useContext(ChessContext)
  if (!ctx) throw new Error("useChessContext must be used within ChessProvider")
  return ctx
}
