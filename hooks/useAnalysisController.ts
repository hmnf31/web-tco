"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Chess } from "chess.js"
import { WorkerEngine } from "@/engine/worker-engine"
import { classifyMove, cpToWinrate, CLASSIFICATION_ICONS, type ClassificationInfo } from "@/engine/classify-utils"
import { getIconPath } from "@/components/chess/IconBadge"

const CACHE_PREFIX = "analysis_cache_"

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return "h" + Math.abs(hash).toString(36)
}

function readCache(pgn: string): MoveAnalysis[] | null {
  try {
    const key = CACHE_PREFIX + hashString(pgn)
    const raw = sessionStorage.getItem(key)
    if (raw) return JSON.parse(raw) as MoveAnalysis[]
  } catch { /* ignore */ }
  return null
}

function writeCache(pgn: string, data: MoveAnalysis[]) {
  try {
    const key = CACHE_PREFIX + hashString(pgn)
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore */ }
}

async function cloudEvalPosition(fen: string): Promise<{ cp: number; mate: number | null }> {
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
  classification: ClassificationInfo
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

export function useAnalysisController() {
  const [tab, setTab] = useState<TabType>("chesscom")
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
  const fallbackEngineRef = useRef<WorkerEngine | null>(null)
  const movesRef = useRef<string[]>([])
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
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisCurrentStep, setAnalysisCurrentStep] = useState(0)
  const [analysisTotalSteps, setAnalysisTotalSteps] = useState(0)
  const [classificationCounts, setClassificationCounts] = useState<Record<string, number>>({})

  const fenCacheRef = useRef<Map<string, { score: number; mate: number | null }>>(new Map())
  const currentPgnRef = useRef("")

  const COACH_ADVICE: Record<string, string> = {
    book: "Langkah buku theory. Solid!",
    brilliant: "Brilliant! Langkah terbaik yang sulit ditemukan!",
    great_find: "Great find! Langkah kuat dan kreatif.",
    best: "Langkah terbaik! Maintain tekanan.",
    excellent: "Langkah hampir sempurna!",
    good: "Langkah solid, pertahankan.",
    forced: "Satu-satunya langkah yang masuk akal.",
    inaccuracy: "Kurang akurat. Coba cari alternatif yang lebih baik.",
    mistake: "Kesalahan! Perhatikan kalkulasi dengan lebih teliti.",
    blunder: "Blunder! Kamu kehilangan materi atau posisi.",
    mate: "Skakmat ditemukan! Lawan tidak bisa menghindar.",
  }

  useEffect(() => {
    const eng = new WorkerEngine("/workers/chess-engine.worker.js")
    fallbackEngineRef.current = eng
    eng.init().then(() => setEngineReady(true))
    return () => { eng.quit(); abortRef.current = true }
  }, [])

  useEffect(() => {
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
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

  async function evalSingleFen(fen: string): Promise<{ score: number; mate: number | null }> {
    const cached = fenCacheRef.current.get(fen)
    if (cached) return cached
    try {
      const result = await cloudEvalPosition(fen)
      const score = result.mate !== null ? (result.mate > 0 ? 999 : -999) : result.cp / 100
      const entry = { score, mate: result.mate }
      fenCacheRef.current.set(fen, entry)
      return entry
    } catch {
      if (fallbackEngineRef.current) {
        const score = await fallbackEngineRef.current.evaluatePosition(fen)
        const entry = { score, mate: null }
        fenCacheRef.current.set(fen, entry)
        return entry
      }
      return { score: 0, mate: null }
    }
  }

  function updateEval(fen: string) {
    evalSingleFen(fen).then((r) => { setEvaluation(r.score); setMate(r.mate) }).catch(() => setEvaluation(0))
  }

  const analyzeMoves = useCallback(async (moveList: string[]) => {
    if (moveList.length === 0) return
    const rawPgn = currentPgnRef.current
    const cached = rawPgn ? readCache(rawPgn) : null
    if (cached && cached.length === moveList.length) {
      setAnalysis(cached)
      setHasResults(true)
      setMoves(moveList)
      const counts: Record<string, number> = {}
      const weights: Record<string, number> = { book: 1, brilliant: 1, great_find: 0.95, best: 1, excellent: 0.8, good: 0.6, forced: 0.5, inaccuracy: 0.4, mistake: 0.2, blunder: 0, mate: 1 }
      let totalScore = 0
      for (const a of cached) {
        const key = a.classification.key
        counts[key] = (counts[key] || 0) + 1
        totalScore += weights[key] || 0
      }
      setAccuracy(cached.length > 0 ? Math.round((totalScore / cached.length) * 100) : 0)
      setPerformanceElo(Math.round((totalScore / cached.length) * 20 + 500))
      setClassificationCounts(counts)
      return
    }

    setAnalyzing(true)
    setHasResults(false)
    setCurrentMoveIndex(-1)
    setAnalysisProgress(0)
    setAnalysisCurrentStep(0)
    setPlayMode(false)
    abortRef.current = false
    fenCacheRef.current.clear()

    const chess = new Chess()
    setGameFen(chess.fen())

    const fenPairs: { before: string; after: string; san: string }[] = []
    for (let i = 0; i < moveList.length; i++) {
      if (abortRef.current) break
      const fenBefore = chess.fen()
      chess.move(moveList[i])
      const fenAfter = chess.fen()
      fenPairs.push({ before: fenBefore, after: fenAfter, san: moveList[i] })
    }

    const total = fenPairs.length
    setAnalysisTotalSteps(total)
    setAnalysisProgress(2)

    const results: MoveAnalysis[] = []
    const chess2 = new Chess()

    for (let i = 0; i < total; i++) {
      if (abortRef.current) break
      const p = fenPairs[i]
      setAnalysisCurrentStep(i + 1)

      const evalBefore = await evalSingleFen(p.before)
      await new Promise((resolve) => setTimeout(resolve, 50))
      const evalAfter = await evalSingleFen(p.after)

      chess2.move(p.san)
      const winrateBefore = cpToWinrate(evalBefore.score * 100)
      const winrateAfter = cpToWinrate(evalAfter.score * 100)
      const centipawnLoss = Math.abs(evalAfter.score - evalBefore.score) * 100
      const winrateLoss = winrateAfter - winrateBefore

      const legalMoves = chess2.moves({ verbose: true })
      const isForced = legalMoves.length === 1 && i === total - 1
      const isCheckmate = chess2.isCheckmate()
      const isBook = i < 4
      const winrateImproved = winrateAfter > winrateBefore

      const classification = classifyMove(centipawnLoss, isForced, isBook, isCheckmate, winrateImproved)

      const pct = Math.round(((i + 1) / total) * 100)
      setAnalysisProgress(pct)

      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        san: p.san,
        fen: p.after,
        evaluationBefore: evalBefore.score,
        evaluationAfter: evalAfter.score,
        centipawnLoss,
        winrateBefore,
        winrateAfter,
        winrateLoss,
        classification,
      })
    }

    setAnalysis(results)
    setHasResults(true)
    setAnalyzing(false)
    setMoves(moveList)

    if (rawPgn) writeCache(rawPgn, results)

    const counts: Record<string, number> = {}
    const weights: Record<string, number> = { book: 1, brilliant: 1, great_find: 0.95, best: 1, excellent: 0.8, good: 0.6, forced: 0.5, inaccuracy: 0.4, mistake: 0.2, blunder: 0, mate: 1 }
    let totalScore = 0
    for (const a of results) {
      const key = a.classification.key
      counts[key] = (counts[key] || 0) + 1
      totalScore += weights[key] || 0
    }
    const acc = results.length > 0 ? Math.round((totalScore / results.length) * 100) : 0
    setAccuracy(acc)
    setPerformanceElo(Math.round(acc * 20 + 500))
    setClassificationCounts(counts)
  }, [])

  function loadPGN(pgnText: string, gameInfo?: GameInfo) {
    try {
      setError("")
      currentPgnRef.current = pgnText
      const chess = new Chess()
      chess.loadPgn(pgnText)
      const moveList = chess.history()
      movesRef.current = moveList
      setGameFen(chess.fen())
      setMoves(moveList)
      setCurrentMoveIndex(-1)
      setSelectedGame(gameInfo || null)
      setHasResults(false)
      setAnalysis([])
      setPlayMode(false)
    } catch {
      setError("PGN tidak valid. Periksa format PGN.")
    }
  }

  function startAnalysis() {
    if (movesRef.current.length === 0) return
    setHasResults(false)
    setAnalysis([])
    setCurrentMoveIndex(-1)
    fenCacheRef.current.clear()
    analyzeMoves(movesRef.current)
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
    const fen = chess.fen()
    setGameFen(fen)
    if (!fenCacheRef.current.has(fen)) {
      evalSingleFen(fen).then((r) => { setEvaluation(r.score); setMate(r.mate) }).catch(() => {})
    } else {
      updateEval(fen)
    }
    const hist = chess.history({ verbose: true })
    const lm = hist[hist.length - 1]
    if (lm) setLastMove({ from: lm.from, to: lm.to })
    if (analysis[index]) {
      const key = analysis[index].classification.key
      setCoachComment(COACH_ADVICE[key] || "")
    }
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
    accuracy, performanceElo, classificationCounts, analysisProgress,
    analysisCurrentStep, analysisTotalSteps,
    setError, setGamesList,
    loadPGN, startAnalysis, fetchChessCom, fetchLichess, goToMove, togglePlay, analyzeMoves,
    setGameFen, setMoves, setCurrentMoveIndex, setHasResults,
    setEvaluation, setMate, setLastMove, setAnalyzing,
  }
}
