"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone } from "lucide-react"

type Announcement = {
  id: string
  title: string
  content: string
  link_url?: string
  link_text?: string
  start_date: string
  end_date: string
}

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements")
        if (!res.ok) return
        const body = await res.json()
        setAnnouncements(body.data || [])
      } catch (err) {
        console.error("Failed to fetch announcements:", err)
      }
    }

    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 60000)
    return () => clearInterval(interval)
  }, [])

  const now = new Date()
  const activeAnnouncements = announcements.filter(a => {
    const start = new Date(a.start_date)
    const end = new Date(a.end_date)
    return start <= now && end >= now
  })

  if (activeAnnouncements.length === 0 || dismissed) return null

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
            <div className="flex gap-12 animate-marquee">
              {/* Double mapping for seamless marquee loop */}
              {[...activeAnnouncements, ...activeAnnouncements].map((a, i) => (
                <span key={`${a.id}-${i}`} className="whitespace-nowrap text-xs font-medium text-yellow-200/90">
                  {a.title}: {a.content}
                  {a.link_url && (
                    <a
                      href={a.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 rounded bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-400 underline underline-offset-2 hover:bg-yellow-400/20 hover:text-yellow-300"
                    >
                      {a.link_text || "Lihat Detail"}
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
