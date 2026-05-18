"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Info } from "lucide-react"

type TourStep = {
  target: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "Beranda",
    title: "Beranda",
    description:
      "Halaman utama TCO Esports. Lihat hero section, tentang kami, agenda kegiatan, dinding prestasi, divisi catur & MLBB, serta kontak komunitas.",
  },
  {
    target: "Divisi",
    title: "Divisi",
    description:
      "TCO memiliki dua divisi: Chess Division dengan 80+ anggota dan MLBB Division dengan roster 5 pemain. Klik nama pemain untuk lihat statistik Chess.com mereka.",
  },
  {
    target: "Arena Training",
    title: "Arena Training",
    description:
      "Fitur latihan catur sedang dalam tahap pengembangan. Saat ini tersedia: bermain melawan bot anggota TCO, analisis game, puzzle taktik, dan latihan opening.",
  },
  {
    target: "Artikel",
    title: "Artikel",
    description:
      "Baca artikel terbaru seputar turnamen dan kegiatan TCO Esports, termasuk hasil Arena Kings dan event lainnya.",
  },
  {
    target: "Daftar Member",
    title: "Daftar Member",
    description:
      "Daftar menjadi member resmi klub TCO Esports melalui Google Form. Bergabunglah dengan komunitas catur online terbesar di TikTok Indonesia!",
  },
  {
    target: "Sponsorship",
    title: "Sponsorship",
    description:
      "Ajukan sponsorship untuk TCO Esports. Lihat berbagai manfaat partnership dan hubungi kami untuk kolaborasi.",
  },
]

const TOUR_KEY = "tco-site-tour-seen"

export default function SiteTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY)
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSkip = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true")
    setIsOpen(false)
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleSkip()
    }
  }, [currentStep, handleSkip])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [])

  const step = TOUR_STEPS[currentStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900 shadow-2xl shadow-cyan-500/10">
              <div
                className="absolute left-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />

              <button
                onClick={handleSkip}
                className="absolute right-3 top-3 rounded-full p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="px-6 pb-6 pt-8">
                <div className="mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-cyan-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/60">
                    Tour {currentStep + 1} / {TOUR_STEPS.length}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]">
                <button
                  onClick={handleSkip}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                >
                  Skip
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                  >
                    {currentStep < TOUR_STEPS.length - 1 ? (
                      <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                    ) : (
                      "Selesai"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
