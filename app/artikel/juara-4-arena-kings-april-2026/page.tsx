import Link from "next/link"
import { TrendingUp, CalendarDays, ArrowLeft } from "lucide-react"

export default function ArtikelDetail() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/artikel"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Artikel
      </Link>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Juara 4 Arena Kings April 2026 — Satu Langkah Lebih Dekat ke Puncak
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
          <CalendarDays className="h-4 w-4" />
          20 April 2026
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <p className="text-sm leading-relaxed text-white/60">
          April 2026 mencatatkan peningkatan signifikan bagi TCO Esports di Arena Kings. Tim berhasil naik satu peringkat, mengamankan posisi ke-4 dengan perolehan poin yang lebih kompetitif dibanding bulan sebelumnya.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Peningkatan ini didorong oleh strategi baru yang diterapkan oleh tim manajemen TCO, termasuk pembagian sesi latihan yang lebih terstruktur dan penggunaan engine analysis untuk evaluasi permainan. Anggota TCO semakin solid dalam mengumpulkan poin, dengan beberapa pemain baru yang bergabung dan langsung memberikan kontribusi berarti.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Statistik bulan April menunjukkan peningkatan partisipasi sebesar 40% dibanding Maret. Hal ini membuktikan bahwa semangat kompetitif komunitas TCO terus tumbuh dan semakin matang dalam menghadapi turnamen global.
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
        >
          Bergabung dengan TCO Sekarang
        </Link>
      </div>
    </div>
  )
}