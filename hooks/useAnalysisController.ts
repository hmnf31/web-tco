"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Chess } from "chess.js"
import { StockfishEngine } from "@/engine/stockfish-engine"
import { classifyMove, cpToWinrate } from "@/engine/classify-utils"

export type TabType = "chesscom" | "lichess" | "pgn"

export type MoveAnalysis = {
  moveNumber: number
  san: string
  fen: string
  evaluationBefore: number
  evaluationAfter: number
  centipawnLoss: number
  winrateBefore: number
  winrateAfter: number
  winrateLoss: number
  classification: ReturnType<typeof classifyMove>
}

export type GameInfo = {
  pgn: string
  label: string
  white?: string
  black?: string
  result?: string
  date?: string
  url?: string
}

export type AnalysisState = {
  tab: TabType
  username: string
  pgn: string
  gameFen: string
  moves: string[]
  currentMoveIndex: number
  analysis: MoveAnalysis[]
  loading: boolean
  analyzing: boolean
  error: string
  gamesList: GameInfo[]
  selectedGame: GameInfo | null
  engineReady: boolean
  evaluation: number
  mate: number | null
  hasResults: boolean
  lastMove: { from: string; to: string } | null
  playMode: boolean
  coachComment: string
  page: number
  gamesPerPage: number
  accuracy: number
  performanceElo: number
  classificationCounts: Record<string, number>
}

export function useAnalysisController() {
  const [tab, setTab] = useState<TabType>("pgn")
  const [username, setUsername] = useState("")
  const [pgn, setPgn] = useState("")
  const [gameFen, setGameFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  const [moves, setMoves] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [gamesList, setGamesList] = useState<GameInfo[]>([])
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null)
  const [engine] = useState(() => new StockfishEngine())
  const [engineReady, setEngineReady] = useState(false)
  const [evaluation, setEvaluation] = useState(0)
  const [mate, setMate] = useState<number | null>(null)
  const [hasResults, setHasResults] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [playMode, setPlayMode] = useState(false)
  const [coachComment, setCoachComment] = useState("")
  const [page, setPage] = useState(0)
  const [gamesPerPage] = useState(5)
  const abortRef = useRef(false)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [accuracy, setAccuracy] = useState(0)
  const [performanceElo, setPerformanceElo] = useState(0)
  const [classificationCounts, setClassificationCounts] = useState<Record<string, number>>({})

  const COACH_ADVICE: Record<string, string> = {
    Best: "Langkah terbaik! Maintain tekanan.",
    Excellent: "Langkah hampir sempurna!",
    Good: "Langkah solid, pertahankan.",
    Inaccuracy: "Kurang akurat. Coba cari alternatif yang lebih baik.",
    Mistake: "Kesalahan! Perhatikan kalkulasi dengan lebih teliti.",
    Blunder: "Blunder! Kamu kehilangan materi atau posisi.",
  }

  useEffect(() => {
    async function init() { await engine.init(); setEngineReady(true) }
    init()
    return () => { engine.quit(); abortRef.current = true }
  }, [engine])

  useEffect(() => {
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("analysisPgn")
      if (stored) {
        localStorage.removeItem("analysisPgn")
        loadPGN(stored)
      }
    }
  }, [])

  useEffect(() => {
    if (!playMode) return
    playIntervalRef.current = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        const next = prev + 1
        if (next >= moves.length) { setPlayMode(false); return prev }
        const chess = new Chess()
        for (let i = 0; i <= next; i++) chess.move(moves[i])
        setGameFen(chess.fen())
        updateEval(chess.fen())
        const hist = chess.history({ verbose: true })
        const lm = hist[hist.length - 1]
        if (lm) setLastMove({ from: lm.from, to: lm.to })
        return next
      })
    }, 1200)
    return () => { if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null } }
  }, [playMode, moves])

  function updateEval(fen: string) {
    engine.evaluatePosition(fen).then(setEvaluation).catch(() => setEvaluation(0))
    setMate(null)
  }

  const analyzeMoves = useCallback(async (moveList: string[]) => {
    if (!engineReady || moveList.length === 0) return
    setAnalyzing(true)
    setHasResults(false)
    setCurrentMoveIndex(-1)
    setPlayMode(false)
    abortRef.current = false

    const results: MoveAnalysis[] = []
    const chess = new Chess()
    setGameFen(chess.fen())

    for (let i = 0; i < moveList.length; i++) {
      if (abortRef.current) break
      const evalBefore = await engine.evaluatePosition(chess.fen())
      const winrateBefore = cpToWinrate(evalBefore * 100)

      chess.move(moveList[i])

      const evalAfter = await engine.evaluatePosition(chess.fen())
      const winrateAfter = cpToWinrate(evalAfter * 100)
      const centipawnLoss = Math.abs(evalAfter - evalBefore) * 100
      const winrateLoss = winrateAfter - winrateBefore

      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        san: moveList[i],
        fen: chess.fen(),
        evaluationBefore: evalBefore,
        evaluationAfter: evalAfter,
        centipawnLoss,
        winrateBefore,
        winrateAfter,
        winrateLoss,
        classification: classifyMove(centipawnLoss),
      })
    }

    setAnalysis(results)
    setHasResults(true)
    setAnalyzing(false)
    setMoves(moveList)

    const counts: Record<string, number> = {}
    const weights: Record<string, number> = { Best: 1, Excellent: 0.8, Good: 0.6, Inaccuracy: 0.4, Mistake: 0.2, Blunder: 0 }
    let totalScore = 0
    for (const a of results) {
      counts[a.classification.label] = (counts[a.classification.label] || 0) + 1
      totalScore += weights[a.classification.label] || 0
    }
    const acc = results.length > 0 ? Math.round((totalScore / results.length) * 100) : 0
    setAccuracy(acc)
    setPerformanceElo(Math.round(acc * 20 + 500))
    setClassificationCounts(counts)
  }, [engine, engineReady])

  function loadPGN(pgnText: string, gameInfo?: GameInfo) {
    try {
      setError("")
      const chess = new Chess()
      chess.loadPgn(pgnText)
      const moveList = chess.history()
      setGameFen(chess.fen())
      updateEval(chess.fen())
      setSelectedGame(gameInfo || null)
      analyzeMoves(moveList)
    } catch {
      setError("PGN tidak valid. Periksa format PGN.")
    }
  }

  async function fetchChessCom(username_: string) {
    setLoading(true); setError(""); setGamesList([]); setHasResults(false)
    setSelectedGame(null); setPage(0)
    try {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const year = now.getFullYear()
      const res = await fetch(`https://api.chess.com/pub/player/${username_}/games/${year}/${month}`)
      if (!res.ok) throw new Error("Gagal mengambil data. Cek username.")
      const data = await res.json()
      const games: GameInfo[] = (data.games || []).map((g: { pgn: string; url: string }) => {
        const h = { pgn: g.pgn, label: g.url ? g.url.split("/").pop() || "Game" : "Game", url: g.url }
        try {
          const c = new Chess(); c.loadPgn(g.pgn)
          const info = c.header()
          return { ...h, pgn: g.pgn, white: info.White || "?", black: info.Black || "?", result: info.Result || "*", date: info.Date || "" }
        } catch { return { ...h, pgn: g.pgn } }
      })
      if (games.length === 0) throw new Error("Tidak ada game untuk bulan ini")
      setGamesList(games)
      if (games[0]) loadPGN(games[0].pgn, games[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal fetch Chess.com")
    } finally { setLoading(false) }
  }

  async function fetchLichess(username_: string) {
    setLoading(true); setError(""); setGamesList([]); setHasResults(false)
    setSelectedGame(null); setPage(0)
    try {
      const res = await fetch(`https://lichess.org/api/games/user/${username_}?max=50`)
      if (!res.ok) throw new Error("Gagal mengambil data. Cek username.")
      const text = await res.text()
      const pgns = text.split("\n\n\n").filter(Boolean)
      const games: GameInfo[] = pgns.map((pgn, i) => {
        try {
          const c = new Chess(); c.loadPgn(pgn)
          const info = c.header()
          return { pgn, label: `${info.White || "?"} vs ${info.Black || "?"}`, white: info.White || "?", black: info.Black || "?", result: info.Result || "*", date: info.Date || "" }
        } catch { return { pgn, label: `Game #${i + 1}` } }
      })
      if (games.length === 0) throw new Error("Tidak ada game ditemukan")
      setGamesList(games)
      if (games[0]) loadPGN(games[0].pgn, games[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal fetch Lichess")
    } finally { setLoading(false) }
  }

  function goToMove(index: number) {
    setPlayMode(false)
    setCurrentMoveIndex(index)
    if (index === -1) {
      const c = new Chess()
      setGameFen(c.fen())
      setEvaluation(0)
      setLastMove(null)
      setCoachComment("")
      return
    }
    const chess = new Chess()
    for (let i = 0; i <= index; i++) chess.move(moves[i])
    setGameFen(chess.fen())
    updateEval(chess.fen())
    const hist = chess.history({ verbose: true })
    const lm = hist[hist.length - 1]
    if (lm) setLastMove({ from: lm.from, to: lm.to })
    if (analysis[index]) setCoachComment(COACH_ADVICE[analysis[index].classification.label] || "")
  }

  function togglePlay() {
    if (playMode) {
      setPlayMode(false)
    } else {
      if (currentMoveIndex >= moves.length - 1) goToMove(-1)
      setPlayMode(true)
    }
  }

  return {
    tab, setTab,
    username, setUsername,
    pgn, setPgn,
    gameFen, moves, currentMoveIndex, analysis,
    loading, analyzing, error,
    gamesList, selectedGame,
    engineReady, evaluation, mate,
    hasResults, lastMove, playMode, coachComment,
    page, setPage, gamesPerPage,
    accuracy, performanceElo, classificationCounts,
    setError, setGamesList,
    loadPGN, fetchChessCom, fetchLichess, goToMove, togglePlay, analyzeMoves,
    setGameFen, setMoves, setCurrentMoveIndex, setHasResults,
    setEvaluation, setMate, setLastMove, setAnalyzing,
  }
}
