"use client"

import { useEffect, useState } from "react"
import { Megaphone, ExternalLink, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react"

type Announcement = {
  id: string
  title: string
  content: string
  start_date: string
  end_date: string
  is_active: boolean
  link_url: string | null
  link_text: string | null
  created_at: string
}

type AnnouncementStatus = "active" | "completed" | "upcoming"

function getAnnouncementStatus(announcement: Announcement): AnnouncementStatus {
  const now = new Date()
  const start = new Date(announcement.start_date)
  const end = new Date(announcement.end_date)

  if (now < start) return "upcoming"
  if (now > end) return "completed"
  return "active"
}

function getStatusBadge(status: AnnouncementStatus) {
  switch (status) {
    case "active":
      return (
        <span className="rounded-full bg-green-400/10 px-2.5 py-0.5 text-[10px] font-medium text-green-400 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Aktif
        </span>
      )
    case "completed":
      return (
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/30 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Selesai
        </span>
      )
    case "upcoming":
      return (
        <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Mendatang
        </span>
      )
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements")
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setAnnouncements(json.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat pengumuman")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-white/50">Memuat pengumuman...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 ring-1 ring-yellow-400/20">
          <Megaphone className="h-7 w-7 text-yellow-400" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white">Pengumuman</h1>
        <p className="mt-1 text-sm text-white/50">Informasi terbaru seputar kegiatan TCO Esports</p>
      </div>

      <div className="mt-10 space-y-6">
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-sm text-white/30">Belum ada pengumuman.</p>
          </div>
) : (
           announcements.map((a) => {
             const status = getAnnouncementStatus(a)
             const isActive = status === "active"
             const linkUrl = (a.link_url ?? "").trim() !== "" ? (a.link_url ?? "") : null
             const linkText = (a.link_text ?? "") || "Lihat Detail"

             return (
               <div
                 key={a.id}
                 className={`rounded-2xl border bg-white/[0.03] p-6 transition-all ${
                   isActive
                     ? "border-yellow-400/20 shadow-lg shadow-yellow-400/5"
                     : "border-white/10 opacity-80"
                 }`}
               >
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2">
                       <h2 className="text-lg font-bold text-white">{a.title}</h2>
                       {getStatusBadge(status)}
                     </div>

                     <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                       <Calendar className="h-3.5 w-3.5" />
                       <span>
                         Mulai: {formatDate(a.start_date)} WIB
                       </span>
                       <span className="text-white/30">|</span>
                       <Clock className="h-3.5 w-3.5" />
                       <span>
                         Selesai: {formatDate(a.end_date)} WIB
                       </span>
                     </div>

                     <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/60">
                       {a.content}
                     </div>

                     {linkUrl && (
                       <a
                         href={linkUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                       >
                         {linkText} <ExternalLink className="h-3.5 w-3.5" />
                       </a>
                     )}
                   </div>
                 </div>
               </div>
             )
           })
         )}
      </div>
    </div>
  )
}