"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone } from "lucide-react"
import { getActiveAnnouncements } from "@/data/announcements"

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [announcements, setAnnouncements] = useState<ReturnType<typeof getActiveAnnouncements>>([])

  useEffect(() => {
    setAnnouncements(getActiveAnnouncements())
    const interval = setInterval(() => {
      setAnnouncements(getActiveAnnouncements())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (announcements.length === 0 || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-b border-yellow-400/20"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <Megaphone className="h-4 w-4 shrink-0 text-yellow-400" />
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-6 animate-marquee">
              {announcements.map((a) => (
                <span key={a.id} className="whitespace-nowrap text-xs text-yellow-200/90">
                  {a.title}
                  {a.link && (
                    <a
                      href={a.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline underline-offset-2 hover:text-yellow-300"
                    >
                      {a.link.text}
                    </a>
                  )}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1 text-yellow-400/60 transition-colors hover:bg-yellow-400/10 hover:text-yellow-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
