import { getAllAnnouncements, isAnnouncementActive } from "@/data/announcements"
import { Megaphone, ExternalLink, Clock } from "lucide-react"

export default function PengumumanPage() {
  const announcements = getAllAnnouncements()

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
            const active = isAnnouncementActive(a)
            return (
              <div
                key={a.id}
                className={`rounded-2xl border bg-white/[0.03] p-6 transition-all ${
                  active
                    ? "border-yellow-400/20 shadow-lg shadow-yellow-400/5"
                    : "border-white/10 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{a.title}</h2>
                      {active ? (
                        <span className="rounded-full bg-green-400/10 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/30">
                          Selesai
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(a.eventDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </span>
                    </div>

                    <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/60">
                      {a.content}
                    </div>

                    {a.link && (
                      <a
                        href={a.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                      >
                        {a.link.text} <ExternalLink className="h-3.5 w-3.5" />
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
