export type AnalysisMode = "quick" | "standard" | "deep"

export type ModeProfile = {
  id: AnalysisMode
  label: string
  depth: number
  summary: string
  cloudFirst: boolean
}

export const MODE_PROFILE: Record<AnalysisMode, ModeProfile> = {
  quick: { id: "quick", label: "Quick", depth: 12, summary: "Cepat - depth 12", cloudFirst: true },
  standard: { id: "standard", label: "Standard", depth: 16, summary: "Seimbang - depth 16", cloudFirst: false },
  deep: { id: "deep", label: "Deep", depth: 22, summary: "Mendalam - depth 22", cloudFirst: false },
}

export const MODE_ORDER: AnalysisMode[] = ["quick", "standard", "deep"]

export const ENGINE_ID = "stockfish-18-lite"

export type MoveThresholds = {
  best: number
  excellent: number
  good: number
  inaccuracy: number
  mistake: number
  blunder: number
}

export const DEFAULT_THRESHOLDS: MoveThresholds = {
  best: 10,
  excellent: 20,
  good: 40,
  inaccuracy: 80,
  mistake: 150,
  blunder: 300,
}

export type AnalysisConfig = {
  defaultMode: AnalysisMode
  thresholds: MoveThresholds
  accuracyK: number
  criticalSwing: number
  cloudEvalEnabled: boolean
}

export const DEFAULT_CONFIG: AnalysisConfig = {
  defaultMode: "standard",
  thresholds: { ...DEFAULT_THRESHOLDS },
  accuracyK: 0.004,
  criticalSwing: 1.5,
  cloudEvalEnabled: true,
}

export const STORAGE_KEY = "arena-analysis-config"
export const CONFIG_CHANGE_EVENT = "tco-analysis-config-change"

function notifyChange(): void {
  try {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CONFIG_CHANGE_EVENT))
  } catch { /* ignore */ }
}

let cached: AnalysisConfig | null = null

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function normalizeThresholds(raw: unknown): MoveThresholds {
  const source = (raw || {}) as Partial<MoveThresholds>
  return {
    best: clamp(Number(source.best), 0, 500, DEFAULT_THRESHOLDS.best),
    excellent: clamp(Number(source.excellent), 1, 600, DEFAULT_THRESHOLDS.excellent),
    good: clamp(Number(source.good), 1, 800, DEFAULT_THRESHOLDS.good),
    inaccuracy: clamp(Number(source.inaccuracy), 1, 1000, DEFAULT_THRESHOLDS.inaccuracy),
    mistake: clamp(Number(source.mistake), 1, 1500, DEFAULT_THRESHOLDS.mistake),
    blunder: clamp(Number(source.blunder), 1, 3000, DEFAULT_THRESHOLDS.blunder),
  }
}

export function loadConfig(): AnalysisConfig {
  if (cached) return cached
  let config: AnalysisConfig = { ...DEFAULT_CONFIG, thresholds: { ...DEFAULT_THRESHOLDS } }
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AnalysisConfig>
      config = {
        defaultMode: MODE_PROFILE[parsed.defaultMode as AnalysisMode] ? (parsed.defaultMode as AnalysisMode) : config.defaultMode,
        thresholds: normalizeThresholds(parsed.thresholds),
        accuracyK: clamp(Number(parsed.accuracyK), 0.0005, 0.05, DEFAULT_CONFIG.accuracyK),
        criticalSwing: clamp(Number(parsed.criticalSwing), 0.3, 6, DEFAULT_CONFIG.criticalSwing),
        cloudEvalEnabled: typeof parsed.cloudEvalEnabled === "boolean" ? parsed.cloudEvalEnabled : config.cloudEvalEnabled,
      }
    }
  } catch {
    config = { ...DEFAULT_CONFIG, thresholds: { ...DEFAULT_THRESHOLDS } }
  }
  cached = config
  return config
}

export function saveConfig(config: AnalysisConfig): AnalysisConfig {
  const next: AnalysisConfig = {
    defaultMode: MODE_PROFILE[config.defaultMode] ? config.defaultMode : DEFAULT_CONFIG.defaultMode,
    thresholds: normalizeThresholds(config.thresholds),
    accuracyK: clamp(Number(config.accuracyK), 0.0005, 0.05, DEFAULT_CONFIG.accuracyK),
    criticalSwing: clamp(Number(config.criticalSwing), 0.3, 6, DEFAULT_CONFIG.criticalSwing),
    cloudEvalEnabled: config.cloudEvalEnabled !== false,
  }
  cached = next
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage penuh / private mode */
  }
  notifyChange()
  return next
}

export function resetConfig(): AnalysisConfig {
  cached = null
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  notifyChange()
  return loadConfig()
}

export function getThresholds(): MoveThresholds {
  return loadConfig().thresholds
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent)
}

export function defaultModeForDevice(): AnalysisMode {
  return isMobileDevice() ? "quick" : loadConfig().defaultMode
}

export function accuracyFromAvgCpl(avgCpl: number, k: number): number {
  const value = Math.exp(-k * Math.max(0, avgCpl))
  return Math.round(Math.min(100, Math.max(0, value * 100)) * 10) / 10
}
