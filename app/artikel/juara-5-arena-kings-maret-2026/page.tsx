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
          Juara 5 Arena Kings Maret 2026 — Awal Perjalanan TCO di Panggung Global
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
          <CalendarDays className="h-4 w-4" />
          15 Maret 2026
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <p className="text-sm leading-relaxed text-white/60">
          Bulan Maret 2026 menjadi saksi sejarah pertama TCO Esports dalam mengikuti kompetisi global — Arena Kings di Chess.com. Dengan persiapan yang matang dan semangat juang yang tinggi, tim TCO berhasil menembus persaingan sengit dan mengamankan posisi ke-5 di klasemen akhir.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          Pencapaian ini merupakan hasil kerja keras seluruh anggota TCO yang berlomba-lomba mengumpulkan poin secara kolektif. Kapten tim, Teddy Sapta Prayoga, memimpin dengan skor tertinggi dan memberikan motivasi kepada seluruh anggota untuk terus berjuang di setiap sesi pertandingan.
        </p>
        <p className="text-sm leading-relaxed text-white/60">
          "\"Ini baru permulaan,\" ujar perwakilan manajemen TCO. \"Kami bangga dengan perjuangan semua anggota. Posisi ini menjadi motivasi untuk terus meningkatkan performa di bulan-bulan berikutnya.\""
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