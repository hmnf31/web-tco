import Link from "next/link"
import { Trophy, CalendarDays, ArrowLeft, TrendingUp, Users, Target } from "lucide-react"

const articles = [
  {
    title: "Juara 3 Arena Kings Mei 2026 — Podium Pertama TCO Esports!",
    date: "25 Mei 2026",
    icon: Target,
    content: [
      "Ini adalah momen yang dinanti-nantikan! Pada bulan Mei 2026, TCO Esports berhasil menembus posisi 3 besar Arena Kings Chess.com. Pencapaian ini menobatkan TCO sebagai salah satu klub catur online paling kompetitif di Indonesia di panggung global.",
      "Perjalanan menuju podium ini tidaklah mudah. TCO harus bersaing dengan klub-klub kuat dari berbagai negara. Namun, berkat kerja keras, dedikasi, dan strategi yang tepat, TCO berhasil mengamankan posisi ke-3 dengan selisih poin yang tipis.",
      "Keberhasilan ini disambut dengan antusiasme luar biasa oleh seluruh anggota TCO. Manajemen TCO mengucapkan terima kasih kepada setiap anggota yang telah berkontribusi, serta mengajak lebih banyak pemain untuk bergabung dan memperkuat tim menuju target berikutnya: Juara 1 Arena Kings!",
    ],
  },
  {
    title: "Juara 4 Arena Kings April 2026 — Satu Langkah Lebih Dekat ke Puncak",
    date: "20 April 2026",
    icon: TrendingUp,
    content: [
      "April 2026 mencatatkan peningkatan signifikan bagi TCO Esports di Arena Kings. Tim berhasil naik satu peringkat, mengamankan posisi ke-4 dengan perolehan poin yang lebih kompetitif dibanding bulan sebelumnya.",
      "Peningkatan ini didorong oleh strategi baru yang diterapkan oleh tim manajemen TCO, termasuk pembagian sesi latihan yang lebih terstruktur dan penggunaan engine analysis untuk evaluasi permainan. Anggota TCO semakin solid dalam mengumpulkan poin, dengan beberapa pemain baru yang bergabung dan langsung memberikan kontribusi berarti.",
      "Statistik bulan April menunjukkan peningkatan partisipasi sebesar 40% dibanding Maret. Hal ini membuktikan bahwa semangat kompetitif komunitas TCO terus tumbuh dan semakin matang dalam menghadapi turnamen global.",
    ],
  },
  {
    title: "Juara 5 Arena Kings Maret 2026 — Awal Perjalanan TCO di Panggung Global",
    date: "15 Maret 2026",
    icon: Trophy,
    content: [
      "Bulan Maret 2026 menjadi saksi sejarah pertama TCO Esports dalam mengikuti kompetisi global — Arena Kings di Chess.com. Dengan persiapan yang matang dan semangat juang yang tinggi, tim TCO berhasil menembus persaingan sengit dan mengamankan posisi ke-5 di klasemen akhir.",
      "Pencapaian ini merupakan hasil kerja keras seluruh anggota TCO yang berlomba-lomba mengumpulkan poin secara kolektif. Kapten tim, Teddy Sapta Prayoga, memimpin dengan skor tertinggi dan memberikan motivasi kepada seluruh anggota untuk terus berjuang di setiap sesi pertandingan.",
      "\"Ini baru permulaan,\" ujar perwakilan manajemen TCO. \"Kami bangga dengan perjuangan semua anggota. Posisi ini menjadi motivasi untuk terus meningkatkan performa di bulan-bulan berikutnya.\"",
    ],
  },
]

export default function ArtikelPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Berita & Artikel</h1>
        <p className="mt-2 text-white/50">Perjalanan TCO Esports menuju puncak klasemen global</p>
      </div>

      <div className="mt-12 space-y-8">
        {articles.map((article, idx) => {
          const Icon = article.icon
          return (
            <article
              key={idx}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-cyan-400/20"
            >
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white sm:text-xl">{article.title}</h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {article.date}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {article.content.map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-white/60">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
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
