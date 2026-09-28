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
    <div className="group relative bg-[#0f0f10] p-7 transition-colors duration-200 hover:bg-[#161718]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08] text-[#c4c7c8]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <span className="mono-label text-[#8e9192]">{fase}</span>
          <div className="mono-label-sm mt-2 flex items-center gap-2 text-[#444748]">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{tanggal}</span>
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold uppercase tracking-tight text-white">{judul}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">{deskripsi}</p>
        </div>
      </div>
    </div>
  )
}
