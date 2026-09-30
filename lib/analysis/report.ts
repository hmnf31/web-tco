import { accuracyFromAvgCpl, loadConfig } from "./config"
import { detectOpening, type OpeningMatch } from "./openings"

export type ReportMove = {
  index: number
  moveNumber: number
  san: string
  mover: "w" | "b"
  fen: string
  cpl: number
  evalBefore: number
  evalAfter: number
  classificationKey: string
}

export type SideReport = {
  color: "w" | "b"
  moves: number
  avgCpl: number
  accuracy: number
  performanceElo: number
  counts: Record<string, number>
  blunders: number
  mistakes: number
  inaccuracies: number
}

export type CriticalMoment = {
  index: number
  moveNumber: number
  san: string
  mover: "w" | "b"
  swing: number
  cpl: number
  classificationKey: string
  label: string
}

export type PhaseKey = "opening" | "middlegame" | "endgame"

export type PhaseReport = {
  phase: PhaseKey
  label: string
  range: string
  moves: number
  errors: number
  avgSwing: number
}

export type TrainingRec = {
  title: string
  detail: string
  topics: string[]
  href: string
}

export type GameReport = {
  opening: OpeningMatch | null
  white: SideReport
  black: SideReport
  overall: { accuracy: number; avgCpl: number; performanceElo: number; moves: number }
  criticalMoments: CriticalMoment[]
  phases: PhaseReport[]
  training: TrainingRec[]
}

export function performanceEstimate(accuracy: number): number {
  return Math.round(600 + accuracy * 15)
}

function nonPawnMaterial(fen: string): number {
  const board = fen.split(" ")[0]
  let count = 0
  for (const ch of board) {
    if (ch === "/" || (ch >= "1" && ch <= "8")) continue
    const lower = ch.toLowerCase()
    if (lower === "p" || lower === "k") continue
    count++
  }
  return count
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function sideReport(moves: ReportMove[], color: "w" | "b", accuracyK: number): SideReport {
  const own = moves.filter((m) => m.mover === color)
  const avgCpl = average(own.map((m) => m.cpl))
  const accuracy = accuracyFromAvgCpl(avgCpl, accuracyK)
  const counts: Record<string, number> = {}
  for (const move of own) {
    counts[move.classificationKey] = (counts[move.classificationKey] || 0) + 1
  }
  return {
    color,
    moves: own.length,
    avgCpl: Math.round(avgCpl),
    accuracy,
    performanceElo: performanceEstimate(accuracy),
    counts,
    blunders: counts.blunder || 0,
    mistakes: (counts.mistake || 0) + (counts.inaccuracy || 0),
    inaccuracies: counts.inaccuracy || 0,
  }
}

function findCriticalMoments(moves: ReportMove[], threshold: number): CriticalMoment[] {
  return moves
    .map((move) => {
      const swing = Math.abs(move.evalAfter - move.evalBefore)
      return { move, swing }
    })
    .filter((entry) => entry.swing >= threshold)
    .sort((a, b) => b.swing - a.swing)
    .slice(0, 8)
    .sort((a, b) => a.move.index - b.move.index)
    .map(({ move, swing }) => ({
      index: move.index,
      moveNumber: move.moveNumber,
      san: move.san,
      mover: move.mover,
      swing: Math.round(swing * 10) / 10,
      cpl: Math.round(move.cpl),
      classificationKey: move.classificationKey,
      label: `CRITICAL MOMENT ${move.moveNumber}${move.mover === "b" ? "..." : "."}?`,
    }))
}

function phaseReports(moves: ReportMove[], opening: OpeningMatch | null): PhaseReport[] {
  if (moves.length === 0) return []
  const openingEnd = Math.min(opening && opening.matchedPlies > 0 ? opening.matchedPlies : 10, 24)
  let endgameStart = moves.length
  for (const move of moves) {
    if (move.index < openingEnd) continue
    if (nonPawnMaterial(move.fen) <= 6) {
      endgameStart = move.index
      break
    }
  }

  const ranges: { phase: PhaseKey; label: string; from: number; to: number }[] = [
    { phase: "opening", label: "Opening", from: 0, to: openingEnd },
    { phase: "middlegame", label: "Middlegame", from: openingEnd, to: endgameStart },
    { phase: "endgame", label: "Endgame", from: endgameStart, to: moves.length },
  ]

  return ranges
    .map((range) => {
      const slice = moves.filter((m) => m.index >= range.from && m.index < range.to)
      if (slice.length === 0) return null
      const errors = slice.filter((m) =>
        m.classificationKey === "inaccuracy" || m.classificationKey === "mistake" || m.classificationKey === "blunder",
      ).length
      const avgSwing = average(slice.map((m) => Math.abs(m.evalAfter - m.evalBefore)))
      return {
        phase: range.phase,
        label: range.label,
        range: `${Math.floor(range.from / 2) + 1}. - ${Math.max(Math.floor((range.to - 1) / 2) + 1, 1)}`,
        moves: slice.length,
        errors,
        avgSwing: Math.round(avgSwing * 100) / 100,
      } satisfies PhaseReport
    })
    .filter((phase): phase is PhaseReport => phase !== null)
}

function trainingRecommendations(
  white: SideReport,
  black: SideReport,
  phases: PhaseReport[],
  opening: OpeningMatch | null,
  criticalCount: number,
): TrainingRec[] {
  const recs: TrainingRec[] = []
  const worst = white.accuracy <= black.accuracy ? white : black
  const worstLabel = worst.color === "w" ? "Putih" : "Hitam"

  if (worst.blunders >= 3) {
    recs.push({
      title: "Kurangi Blunder",
      detail: `${worst.blunders} blunder sebagai ${worstLabel}. Latih motif pertahanan dan cek ulang langkah sebelum mengeluarkan piece.`,
      topics: ["defense", "hanging-piece", "taktik"],
      href: "/arena-training/learn",
    })
  }
  if (worst.inaccuracies >= 4) {
    recs.push({
      title: "Akurasi Kalkulasi",
      detail: `${worst.inaccuracies} inaccuracy dari sisi ${worstLabel}. Latih kalkulasi variatif 2-3 langkah.`,
      topics: ["calculation", "taktik"],
      href: "/arena-training/learn",
    })
  }
  if (opening && opening.matchedPlies < 6 && opening.matchedPlies > 0) {
    recs.push({
      title: "Teori Pembukaan",
      detail: `Keluar dari buku pada langkah ${opening.matchedPlies + 1} (${opening.name}). Perdalam repertoire pembukaan.`,
      topics: [opening.name, "repertoire"],
      href: "/arena-training/openings",
    })
  }
  const endgame = phases.find((p) => p.phase === "endgame")
  if (endgame && endgame.errors > 0) {
    recs.push({
      title: "Teknik Endgame",
      detail: `${endgame.errors} kesalahan di fase endgame. Latih konversi keunggulan dan teknik posisi akhir.`,
      topics: ["endgame", "conversion"],
      href: "/arena-training/learn",
    })
  }
  if (criticalCount >= 3) {
    recs.push({
      title: "Titik Balik",
      detail: `${criticalCount} critical moment dengan swing besar. Latih deteksi ancaman sebelum mengubah rencana.`,
      topics: ["critical-moment", "kalkulasi"],
      href: "/arena-training",
    })
  }
  return recs.slice(0, 4)
}

export function buildGameReport(moves: ReportMove[]): GameReport | null {
  if (moves.length === 0) return null
  const config = loadConfig()
  const sans = moves.map((m) => m.san)
  const opening = detectOpening(sans)
  const white = sideReport(moves, "w", config.accuracyK)
  const black = sideReport(moves, "b", config.accuracyK)
  const avgCpl = average(moves.map((m) => m.cpl))
  const accuracy = accuracyFromAvgCpl(avgCpl, config.accuracyK)
  const criticalMoments = findCriticalMoments(moves, config.criticalSwing)
  const phases = phaseReports(moves, opening)

  return {
    opening,
    white,
    black,
    overall: {
      accuracy,
      avgCpl: Math.round(avgCpl),
      performanceElo: performanceEstimate(accuracy),
      moves: moves.length,
    },
    criticalMoments,
    phases,
    training: trainingRecommendations(white, black, phases, opening, criticalMoments.length),
  }
}
