import Link from "next/link"
import { Trophy, CalendarDays, ArrowLeft } from "lucide-react"

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
          Juara 3 Arena Kings Mei 2026 — Podium Pertama TCO Esports!
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
          <CalendarDays className="h-4 w-4" />
          18 Mei 2026
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <p className="text-sm leading-relaxed text-white/60">
          Mei 2026 menjadi bulan bersejarah bagi TCO Esports. Untuk pertama kalinya, tim berhasil menembus posisi 3 besar Arena Kings, turnamen catur online global terbesar di Chess.com. Prestasi ini menandai babak baru dalam perjalanan kompetitif TCO.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Keberhasilan ini tidak lepas dari kerja keras seluruh anggota TCO yang semakin solid dalam mengumpulkan poin. Strategi latihan yang diterapkan sejak bulan sebelumnya mulai membuahkan hasil, dengan peningkatan kualitas permainan yang signifikan dari para pemain andalan TCO.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Partisipasi anggota TCO di Arena Kings bulan ini mencapai rekor tertinggi. Banyak anggota baru yang turut berkontribusi, menunjukkan bahwa ekosistem pembinaan talenta TCO berjalan dengan efektif. Peringkat ke-3 ini menjadi bukti bahwa TCO layak diperhitungkan di panggung catur online global.
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
