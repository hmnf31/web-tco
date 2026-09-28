export type PuzzleRatingState = {
  rating: number
  games: number
}

export const DEFAULT_PUZZLE_RATING = 1200
export const RATING_K = 32

const STORAGE_KEY = "arena-puzzle-rating"

export function loadPuzzleRating(): PuzzleRatingState {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PuzzleRatingState>
      const rating = Number(parsed.rating)
      if (Number.isFinite(rating)) {
        return { rating: Math.round(rating), games: Number(parsed.games) || 0 }
      }
    }
  } catch { /* ignore */ }
  return { rating: DEFAULT_PUZZLE_RATING, games: 0 }
}

export function savePuzzleRating(state: PuzzleRatingState): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  } catch { /* ignore */ }
}

export function expectedScore(userRating: number, puzzleRating: number): number {
  return 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400))
}

export type RatingUpdate = {
  state: PuzzleRatingState
  delta: number
}

export function updatePuzzleRating(
  current: PuzzleRatingState,
  puzzleRating: number,
  correct: boolean,
  k: number = RATING_K,
): RatingUpdate {
  const expected = expectedScore(current.rating, puzzleRating)
  const actual = correct ? 1 : 0
  const delta = Math.round(k * (actual - expected))
  return {
    state: { rating: Math.max(100, current.rating + delta), games: current.games + 1 },
    delta,
  }
}
