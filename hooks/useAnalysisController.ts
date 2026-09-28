"use client"

import { useState, useRef, useEffect, useCallback, useMemo, useSyncExternalStore } from "react"
import { Chess } from "chess.js"
import { WorkerEngine } from "@/engine/worker-engine"
import {
  classifyMove, cpToWinrate, centipawnLossForMover, evalToCp,
  type ClassificationInfo, type EvalSnapshot,
} from "@/engine/classify-utils"
import { isBookPosition } from "@/engine/opening-book"
import {
  MODE_PROFILE, ENGINE_ID, CONFIG_CHANGE_EVENT, loadConfig, type AnalysisMode,
} from "@/lib/analysis/config"
import { buildGameReport, type GameReport, type ReportMove } from "@/lib/analysis/report"

const CACHE_PREFIX = "analysis_cache_"
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return "h" + Math.abs(hash).toString(36)
}

function cacheKey(pgn: string, depthKey: string): string {
  return CACHE_PREFIX + hashString(`${ENGINE_ID}|${depthKey}|${pgn}`)
}

function readCache(pgn: string, depthKey: string): MoveAnalysis[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(pgn, depthKey))
    if (raw) return JSON.parse(raw) as MoveAnalysis[]
  } catch { /* ignore */ }
  return null
}

function writeCache(pgn: string, depthKey: string, data: MoveAnalysis[]) {
  try {
    sessionStorage.setItem(cacheKey(pgn, depthKey), JSON.stringify(data))
  } catch { /* ignore */ }
}

async function cloudEvalPosition(fen: string): Promise<{ cp: number; mate: number | null }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error("Cloud eval unavailable")
    const data = await res.json()
    if (!data.pvs || data.pvs.length === 0) throw new Error("No evaluation data")
    const pv = data.pvs[0]
    if (pv.cp !== undefined) return { cp: pv.cp, mate: null }
    if (pv.mate !== undefined) return { cp: 0, mate: pv.mate }
    throw new Error("Unknown eval format")
  } finally {
    clearTimeout(timer)
  }
}

function engineToWhitePov(score: number, mate: number | null, fen: string): EvalSnapshot {
  const turn = fen.split(" ")[1]
  if (turn === "b") return { score: -score, mate: mate === null ? null : -mate }
  return { score, mate }
}

function winrateWhitePov(snapshot: EvalSnapshot): number {
  return cpToWinrate(evalToCp(snapshot))
}

export type TabType = "chesscom" | "lichess" | "pgn"

export type MoveAnalysis = {
  moveNumber: number
  san: string
  fen: string
  mover: "w" | "b"
  evaluationBefore: number
  evaluationAfter: number
  mateBefore: number | null
  mateAfter: number | null
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
  whiteElo?: string
  blackElo?: string
  timeControl?: string
}

function toReportMoves(list: MoveAnalysis[]): ReportMove[] {
  return list.map((a, i) => ({
    index: i,
    moveNumber: a.moveNumber,
    san: a.san,
    mover: a.mover,
    fen: a.fen,
    cpl: a.centipawnLoss,
    evalBefore: a.evaluationBefore,
    evalAfter: a.evaluationAfter,
    classificationKey: a.classification.key,
  }))
}

function subscribeAutoMode(cb: () => void): () => void {
  window.addEventListener("resize", cb)
  window.addEventListener(CONFIG_CHANGE_EVENT, cb)
  return () => {
    window.removeEventListener("resize", cb)
    window.removeEventListener(CONFIG_CHANGE_EVENT, cb)
  }
}

function getAutoModeSnapshot(): AnalysisMode {
  const mobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent)
  return mobile ? "quick" : loadConfig().defaultMode
}

function getAutoModeServerSnapshot(): AnalysisMode {
  return "standard"
}

export function useAnalysisController() {
  const [tab, setTab] = useState<TabType>("chesscom")
  const [username, setUsername] = useState("")
  const [pgn, setPgn] = useState("")
  const [gameFen, setGameFen] = useState(INITIAL_FEN)
  const [moves, setMoves] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [gamesList, setGamesList] = useState<GameInfo[]>([])
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null)
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
  const autoMode = useSyncExternalStore(subscribeAutoMode, getAutoModeSnapshot, getAutoModeServerSnapshot)
  const [modeOverride, setModeOverride] = useState<AnalysisMode | null>(null)
  const mode = modeOverride ?? autoMode
  const [shareUrl, setShareUrl] = useState("")
  const abortRef = useRef(false)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisCurrentStep, setAnalysisCurrentStep] = useState(0)
  const [analysisTotalSteps, setAnalysisTotalSteps] = useState(0)

  const fenCacheRef = useRef<Map<string, EvalSnapshot>>(new Map())
  const currentPgnRef = useRef("")
  const startFenRef = useRef(INITIAL_FEN)
  const engineRef = useRef<WorkerEngine | null>(null)
  const engineInitRef = useRef<Promise<WorkerEngine | null> | null>(null)
  const modeRef = useRef<AnalysisMode>(mode)

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

  const ensureEngine = useCallback((): Promise<WorkerEngine | null> => {
    if (engineRef.current && engineRef.current.isReady()) return Promise.resolve(engineRef.current)
    if (engineInitRef.current) return engineInitRef.current
    engineInitRef.current = (async () => {
      try {
        const eng = new WorkerEngine("/workers/chess-engine.worker.js")
        engineRef.current = eng
        await eng.init()
        setEngineReady(eng.isReady())
        if (!eng.isReady()) {
          setWarning("Engine tidak tersedia. Coba Quick Analysis.")
          return null
        }
        return eng
      } catch {
        setWarning("Engine tidak tersedia. Coba Quick Analysis.")
        return null
      }
    })()
    return engineInitRef.current
  }, [])

  const setMode = useCallback((next: AnalysisMode) => {
    if (analyzing) return
    modeRef.current = next
    setModeOverride(next)
  }, [analyzing])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    initFromUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current = true
      if (engineRef.current) engineRef.current.quit()
      engineRef.current = null
      engineInitRef.current = null
    }
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

  const report = useMemo<GameReport | null>(
    () => (analysis.length > 0 ? buildGameReport(toReportMoves(analysis)) : null),
    [analysis],
  )

  const { accuracy, performanceElo, classificationCounts } = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of analysis) counts[a.classification.key] = (counts[a.classification.key] || 0) + 1
    return {
      accuracy: report ? report.overall.accuracy : 0,
      performanceElo: report ? report.overall.performanceElo : 0,
      classificationCounts: counts,
    }
  }, [analysis, report])

  function currentEvalOptions(): { preferCloud: boolean; depth: number } {
    const profile = MODE_PROFILE[modeRef.current]
    const config = loadConfig()
    return { preferCloud: profile.cloudFirst && config.cloudEvalEnabled, depth: profile.depth }
  }

  async function evalSingleFen(fen: string, opts = currentEvalOptions()): Promise<EvalSnapshot> {
    const key = `${fen}|${opts.preferCloud ? "cloud" : opts.depth}`
    const cached = fenCacheRef.current.get(key)
    if (cached) return cached

    const config = loadConfig()
    let snapshot: EvalSnapshot | null = null

    if (opts.preferCloud && config.cloudEvalEnabled) {
      try {
        const cloud = await cloudEvalPosition(fen)
        snapshot = { score: cloud.cp / 100, mate: cloud.mate }
      } catch { snapshot = null }
    }

    if (!snapshot) {
      const engine = await ensureEngine()
      if (engine) {
        const res = await engine.evaluateFenDepth(fen, opts.depth)
        if (res.ok) snapshot = engineToWhitePov(res.score, res.mate, fen)
        else setWarning("Browser terlalu berat untuk depth ini. Kurangi analysis depth.")
      }
      if (!snapshot && config.cloudEvalEnabled) {
        try {
          const cloud = await cloudEvalPosition(fen)
          snapshot = { score: cloud.cp / 100, mate: cloud.mate }
          if (!opts.preferCloud) setWarning("Engine tidak tersedia. Coba Quick Analysis.")
        } catch { snapshot = null }
      }
    }

    if (!snapshot) {
      setWarning("Engine tidak tersedia. Coba Quick Analysis.")
      snapshot = { score: 0, mate: null }
    }

    fenCacheRef.current.set(key, snapshot)
    return snapshot
  }

  function updateEval(fen: string) {
    evalSingleFen(fen).then((r) => { setEvaluation(r.score); setMate(r.mate) }).catch(() => setEvaluation(0))
  }

  const analyzeMoves = useCallback(async (moveList: string[]) => {
    if (moveList.length === 0) return
    const rawPgn = currentPgnRef.current
    const profile = MODE_PROFILE[modeRef.current]
    const depthKey = profile.cloudFirst ? `cloud-d${profile.depth}` : `d${profile.depth}`
    const evalOpts = currentEvalOptions()

    const cached = rawPgn ? readCache(rawPgn, depthKey) : null
    if (cached && cached.length === moveList.length) {
      setAnalysis(cached)
      setHasResults(true)
      setMoves(moveList)
      return
    }

    setAnalyzing(true)
    setHasResults(false)
    setWarning("")
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
      const mover: "w" | "b" = i % 2 === 0 ? "w" : "b"
      setAnalysisCurrentStep(i + 1)

      const evalBefore = await evalSingleFen(p.before, evalOpts)
      const evalAfter = await evalSingleFen(p.after, evalOpts)

      chess2.move(p.san)
      const cpl = centipawnLossForMover(evalBefore, evalAfter, mover)
      const wrBefore = winrateWhitePov(evalBefore)
      const wrAfter = winrateWhitePov(evalAfter)
      const improved = mover === "w" ? wrAfter >= wrBefore : wrAfter <= wrBefore
      const winrateLoss = mover === "w" ? wrBefore - wrAfter : wrAfter - wrBefore

      const legalMoves = chess2.moves({ verbose: true })
      const isForced = legalMoves.length === 1
      const isCheckmate = chess2.isCheckmate()
      const isBook = isBookPosition(moveList.slice(0, i))

      const classification = classifyMove(cpl.loss, isForced, isBook, isCheckmate, improved)

      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        san: p.san,
        fen: p.after,
        mover,
        evaluationBefore: evalBefore.score,
        evaluationAfter: evalAfter.score,
        mateBefore: evalBefore.mate,
        mateAfter: evalAfter.mate,
        centipawnLoss: cpl.loss,
        winrateBefore: wrBefore,
        winrateAfter: wrAfter,
        winrateLoss,
        classification,
      })

      setAnalysis(results.slice())
      setHasResults(true)
      const pct = Math.round(((i + 1) / total) * 100)
      setAnalysisProgress(pct)
    }

    setAnalysis(results.slice())
    setHasResults(results.length > 0)
    setAnalyzing(false)
    setMoves(moveList)

    if (rawPgn && results.length === total && total > 0) writeCache(rawPgn, depthKey, results)
    if (abortRef.current) setError("Analisis dihentikan. Hasil parsial yang tersedia tetap ditampilkan.")
  }, [])

  function loadPGN(pgnText: string, gameInfo?: GameInfo) {
    try {
      setError("")
      setWarning("")
      currentPgnRef.current = pgnText
      const chess = new Chess()
      chess.loadPgn(pgnText)
      const moveList = chess.history()
      if (moveList.length === 0) throw new Error("empty")
      movesRef.current = moveList
      startFenRef.current = INITIAL_FEN
      setGameFen(chess.fen())
      setMoves(moveList)
      setCurrentMoveIndex(-1)
      setSelectedGame(gameInfo || null)
      setHasResults(false)
      setAnalysis([])
      setPlayMode(false)
      setShareUrl(buildShareUrl(pgnText, INITIAL_FEN))
    } catch {
      setError("PGN tidak dapat diparse. Periksa: notasi langkah, header, dan result.")
    }
  }

  function startAnalysis() {
    if (movesRef.current.length === 0) return
    setHasResults(false)
    setAnalysis([])
    setCurrentMoveIndex(-1)
    setError("")
    setWarning("")
    fenCacheRef.current.clear()
    void ensureEngine()
    analyzeMoves(movesRef.current)
  }

  function cancelAnalysis() {
    abortRef.current = true
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
          return { ...h, pgn: g.pgn, white: info.White || "?", black: info.Black || "?", result: info.Result || "*", date: info.Date || "", whiteElo: info.WhiteElo || undefined, blackElo: info.BlackElo || undefined, timeControl: info.TimeControl || undefined }
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
      const games: GameInfo[] = pgns.map((pgn_, i) => {
        try {
          const c = new Chess(); c.loadPgn(pgn_)
          const info = c.header()
          return { pgn: pgn_, label: `${info.White || "?"} vs ${info.Black || "?"}`, white: info.White || "?", black: info.Black || "?", result: info.Result || "*", date: info.Date || "", whiteElo: info.WhiteElo || undefined, blackElo: info.BlackElo || undefined, timeControl: info.TimeControl || undefined }
        } catch { return { pgn: pgn_, label: `Game #${i + 1}` } }
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
    evalSingleFen(fen).then((r) => { setEvaluation(r.score); setMate(r.mate) }).catch(() => {})
    const hist = chess.history({ verbose: true })
    const lm = hist[hist.length - 1]
    if (lm) setLastMove({ from: lm.from, to: lm.to })
    if (analysis[index]) {
      const key = analysis[index].classification.key
      setCoachComment(COACH_ADVICE[key] || "")
    }
  }

  function goToCriticalMoment(index: number) {
    goToMove(index)
  }

  function togglePlay() {
    if (playMode) {
      setPlayMode(false)
    } else {
      if (currentMoveIndex >= moves.length - 1) goToMove(-1)
      setPlayMode(true)
    }
  }

  function buildShareUrl(pgnText: string, startFen: string): string {
    if (typeof window === "undefined") return ""
    const base = `${window.location.origin}${window.location.pathname}`
    if (pgnText) return `${base}?pgn=${encodeURIComponent(pgnText)}`
    if (startFen && startFen !== INITIAL_FEN) return `${base}?fen=${encodeURIComponent(startFen)}`
    return base
  }

  async function copyText(text: string): Promise<boolean> {
    if (!text) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  async function copyShareLink(): Promise<boolean> {
    const url = shareUrl || buildShareUrl(currentPgnRef.current, startFenRef.current)
    const ok = await copyText(url)
    setWarning(ok ? "" : "Tidak bisa menyalin link.")
    return ok
  }

  async function shareReport(): Promise<boolean> {
    const url = shareUrl || buildShareUrl(currentPgnRef.current, startFenRef.current)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "TCO Chess Report", text: `Accuracy ${accuracy}%`, url })
        return true
      } catch { /* user membatalkan */ }
    }
    return copyShareLink()
  }

  async function copyPgn(): Promise<boolean> {
    return copyText(currentPgnRef.current)
  }

  async function copyFen(): Promise<boolean> {
    return copyText(gameFen)
  }

  function downloadPgn() {
    const content = currentPgnRef.current
    if (!content) return
    const blob = new Blob([content], { type: "application/x-chess-pgn" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tco-analysis.pgn"
    link.click()
    URL.revokeObjectURL(url)
  }

  function initFromUrl() {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const pgnParam = params.get("pgn")
    const fenParam = params.get("fen")
    if (pgnParam) {
      const decoded = decodeURIComponent(pgnParam)
      setPgn(decoded)
      setTab("pgn")
      loadPGN(decoded)
      return
    }
    if (fenParam) {
      const decoded = decodeURIComponent(fenParam)
      try {
        const chess = new Chess(decoded)
        startFenRef.current = chess.fen()
        setGameFen(chess.fen())
        setShareUrl(buildShareUrl("", chess.fen()))
        updateEval(chess.fen())
      } catch {
        setError("FEN tidak valid.")
      }
    }
  }

  return {
    tab, setTab,
    username, setUsername,
    pgn, setPgn,
    gameFen, moves, currentMoveIndex, analysis, report,
    loading, analyzing, error, warning,
    gamesList, selectedGame,
    engineReady, evaluation, mate,
    hasResults, lastMove, playMode, coachComment,
    page, setPage, gamesPerPage,
    accuracy, performanceElo, classificationCounts, analysisProgress,
    analysisCurrentStep, analysisTotalSteps,
    mode, setMode,
    shareUrl, copyShareLink, shareReport, copyPgn, copyFen, downloadPgn,
    setError, setGamesList, setWarning,
    loadPGN, startAnalysis, cancelAnalysis, fetchChessCom, fetchLichess,
    goToMove, goToCriticalMoment, togglePlay, analyzeMoves,
    setGameFen, setMoves, setCurrentMoveIndex, setHasResults,
    setEvaluation, setMate, setLastMove, setAnalyzing,
  }
}
