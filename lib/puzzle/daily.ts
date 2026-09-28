export function dateKey(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function dailyIndex(seed: string, count: number): number {
  if (count <= 0) return 0
  return hashSeed(seed) % count
}

export type DailyRecord = {
  solved: boolean
  userRating: number
  puzzleRating: number
}

const DAILY_KEY = "arena-daily-puzzles"

export function loadDailyRecords(): Record<string, DailyRecord> {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(DAILY_KEY) : null
    if (raw) return JSON.parse(raw) as Record<string, DailyRecord>
  } catch { /* ignore */ }
  return {}
}

export function saveDailyRecord(date: string, record: DailyRecord): Record<string, DailyRecord> {
  const records = loadDailyRecords()
  records[date] = record
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(DAILY_KEY, JSON.stringify(records))
  } catch { /* ignore */ }
  return records
}
