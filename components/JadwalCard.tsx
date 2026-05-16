import { CalendarDays, Swords, Users, UserPlus } from "lucide-react"

interface JadwalCardProps {
  fase: string
  tanggal: string
  judul: string
  deskripsi: string
  icon: "swords" | "users" | "userplus"
}

const iconMap = {
  swords: Swords,
  users: Users,
  userplus: UserPlus,
}

export default function JadwalCard({ fase, tanggal, judul, deskripsi, icon }: JadwalCardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.06]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/10" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <span className="inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            {fase}
          </span>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
            <CalendarDays className="h-4 w-4" />
            <span>{tanggal}</span>
          </div>
          <h3 className="mt-1 text-lg font-bold text-white">{judul}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{deskripsi}</p>
        </div>
      </div>
    </div>
  )
}
