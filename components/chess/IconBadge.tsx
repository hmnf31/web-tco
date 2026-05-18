import type { ClassificationKey, ClassificationInfo } from "@/engine/classify-utils"
import { CLASSIFICATION_ICONS } from "@/engine/classify-utils"

export function getIconPath(key: ClassificationKey): string {
  return `/assets/32x/${CLASSIFICATION_ICONS[key]?.file ?? "best_32x.png"}`
}

export const SQUARE_BG_COLORS: Record<ClassificationKey, string> = {
  book: "rgba(139, 90, 43, 0.35)",
  brilliant: "rgba(0, 229, 255, 0.3)",
  great_find: "rgba(29, 78, 216, 0.35)",
  best: "rgba(21, 128, 61, 0.35)",
  excellent: "rgba(21, 128, 61, 0.25)",
  good: "rgba(34, 197, 94, 0.25)",
  forced: "rgba(234, 179, 8, 0.25)",
  inaccuracy: "rgba(254, 240, 138, 0.25)",
  mistake: "rgba(249, 115, 22, 0.3)",
  blunder: "rgba(220, 38, 38, 0.4)",
  mate: "rgba(220, 38, 38, 0.5)",
}

export const SQUARE_BORDER_COLORS: Record<ClassificationKey, string> = {
  book: "2px solid rgba(139, 90, 43, 0.5)",
  brilliant: "2px solid rgba(0, 229, 255, 0.5)",
  great_find: "2px solid rgba(29, 78, 216, 0.5)",
  best: "2px solid rgba(21, 128, 61, 0.5)",
  excellent: "2px solid rgba(21, 128, 61, 0.4)",
  good: "2px solid rgba(34, 197, 94, 0.4)",
  forced: "2px solid rgba(234, 179, 8, 0.4)",
  inaccuracy: "2px solid rgba(254, 240, 138, 0.4)",
  mistake: "2px solid rgba(249, 115, 22, 0.4)",
  blunder: "2px solid rgba(220, 38, 38, 0.5)",
  mate: "2px solid rgba(220, 38, 38, 0.5)",
}

export default function IconBadge({
  classification,
  size = 32,
  showLabel = false,
}: {
  classification: ClassificationInfo
  size?: number
  showLabel?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${classification.color}`}
      title={classification.label}
    >
      <span className="shrink-0" style={{ width: size, height: size }}>
        <img
          src={getIconPath(classification.key as ClassificationKey)}
          alt={classification.label}
          width={size}
          height={size}
          className="object-contain"
        />
      </span>
      {showLabel && <span className="text-[10px] font-semibold">{classification.label}</span>}
    </span>
  )
}

export function IconImg({ classification, size = 32 }: { classification: ClassificationInfo; size?: number }) {
  return (
    <span className="shrink-0" style={{ width: size, height: size }} title={classification.label}>
      <img
        src={getIconPath(classification.key as ClassificationKey)}
        alt={classification.label}
        width={size}
        height={size}
        className="object-contain"
      />
    </span>
  )
}
