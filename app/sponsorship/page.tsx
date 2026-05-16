"use client"

import Link from "next/link"
import { MessageCircle, Phone, ArrowRight, Calendar } from "lucide-react"
import { useState } from "react"

export default function Sponsorship() {
  const [form, setForm] = useState({ nama: "", perusahaan: "", reservasi: "", wa: "", pesan: "" })
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,210,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,215,0,0.05),transparent_50%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 lg:px-8 lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-sm text-cyan-400">
            <MessageCircle className="h-4 w-4" />
            Sponsorship & Partnership
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Mitrakan Visibilitas Brandmu dengan
            <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              Komunitas Catur Terbesar Indonesia
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            Basis komunitas TCO yang aktif, loyal, dan sangat interaktif melalui platform TikTok memberikan peluang unik untuk merekam brand Anda di kalangan Gen-Z dan Milenial yang semakin meningkat setiap harinya.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/6283878170957"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              Hubungi Sekarang via WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="mailto:tco.chess@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <Phone className="h-4 w-4" />
              Email Marketing: tco.chess@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              Mengapa Bekerjasama dengan TCO?
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Manfaat Partnership</p>
            <p className="mt-2 text-white/50">Peluk kesempatan untuk tumbuh bersama komunitas yang dinamis dan berkontribusi pada pembudayaan catur di Indonesia</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "users",
                label: "Jangkauan Masif",
                value: "500+ Anggota Aktif",
                desc: "Komunitas TCO terdiri dari berbagai latar belakang dengan minat yang sama terhadap catur dan kompetisi digital."
              },
              {
                icon: "trending-up",
                label: "Engagement Tinggi",
                value: "Interaksi Harian melalui TikTok",
                desc: "Konten kami menghasilkan tingkat engagement yang di atas rata-rata platform media sosial biasa."
              },
              {
                icon: "shield",
                label: "Target Audience Spesifik",
                value: "Gen-Z & Milenial",
                desc: "Jangkau demografi produktif yang aktif dalam konsumsi konten danPartisipasi dalam aktivitas komunitas."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition-all hover:border-cyan-400/20"
              >
                <div className="flex items-center justify-center mb-4 h-12 w-12 rounded-xl bg-cyan-400/10">
                  {item.icon === "users" && <div className="text-cyan-400">👥</div>}
                  {item.icon === "trending-up" && <div className="text-cyan-400">📈</div>}
                  {item.icon === "shield" && <div className="text-cyan-400">🛡️</div>}
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{item.label}</h3>
                <p className="mt-2 text-xs text-white/50">{item.value}</p>
                <p className="mt-2 text-xs text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Opportunities Section */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              Kesempatan Partnership
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Berkolaborasi Sesuai Kebutuhan Brandmu</p>
            <p className="mt-2 text-white/50">TCO menawarkan berbagai bentuk kolaborasi yang dapat disesuaikan dengan tujuan marketing dan visibilitas brand Anda</p>
          </div>

          <div className="mt-12 space-y-6">
            {[
              {
                title: "Pendanaan Hadiah Turnamen",
                desc: "Dukung kompetisi berkala TCO dengan menyediakan hadiah untuk menambah prestisi dan motivasi peserta.",
                icon: "trophy"
              },
              {
                title: "Pembinaan Talenta Bercakap",
                desc: "Berpartisipasi dalam program pengembangan skill anggota TCO melalui pelatihan, workshop, dan mentoring.",
                icon: "users"
              },
              {
                title: "Pengembangan Fasilitas Streaming",
                desc: "Bantu meningkatkan kualitas produksi konten TCO untuk reach dan engagement yang lebih baik.",
                icon: "video"
              },
              {
                title: "Brand Integration dalam Konten",
                desc: " Tampilkan produk atau layanan brand Anda secara organik dalam konten rutin TCO di berbagai platform.",
                icon: "brand-watermark"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-cyan-400/20"
              >
                <div className="flex-shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  {item.icon === "trophy" && <div className="text-cyan-400">🏆</div>}
                  {item.icon === "users" && <div className="text-cyan-400">👥</div>}
                  {item.icon === "video" && <div className="text-cyan-400">🎥</div>}
                  {item.icon === "brand-watermark" && <div className="text-cyan-400">🏷️</div>}
                </div>
                <div>
                  <h3 className="mt-1 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="https://wa.me/6283878170957"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              Mulai Kerja Sama Sekarang
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="inline-block rounded-full bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-400">
              Formulir Kerja Sama
            </h2>
            <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">Ajukan Proposal Partnership</p>
            <p className="mt-2 text-white/50">Isi formulir di bawah ini untuk memulai percakapan tentang kolaborasi dengan TCO Esports</p>
          </div>

          <form className="mt-12 space-y-6 max-w-md mx-auto" onSubmit={(e) => {
            e.preventDefault();
            const msg = `*Proposal Kerja Sama TCO*
Nama: ${form.nama}
Perusahaan: ${form.perusahaan}
Reservasi: ${form.reservasi}
WhatsApp: ${form.wa}

*Pesan:*
${form.pesan}`;
            window.open(`https://wa.me/6283878170957?text=${encodeURIComponent(msg)}`, "_blank");
          }}>
            <div className="space-y-3">
              <label htmlFor="nama" className="block text-sm font-medium text-white/70">
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/[0.05] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="perusahaan" className="block text-sm font-medium text-white/70">
                Nama Perusahaan / Brand
              </label>
              <input
                id="perusahaan"
                type="text"
                required
                value={form.perusahaan}
                onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/[0.05] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Masukkan nama perusahaan atau brand Anda"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="reservasi" className="block text-sm font-medium text-white/70">
                Tanggal Reservasi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="reservasi"
                  type="date"
                  value={form.reservasi}
                  onChange={(e) => setForm({ ...form, reservasi: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/[0.05] text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="wa" className="block text-sm font-medium text-white/70">
                Nomor WhatsApp
              </label>
              <input
                id="wa"
                type="tel"
                required
                value={form.wa}
                onChange={(e) => setForm({ ...form, wa: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/[0.05] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Masukkan nomor WhatsApp aktif Anda"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="pesan" className="block text-sm font-medium text-white/70">
                Pesan / Proposal Kerja Sama
              </label>
              <textarea
                id="pesan"
                rows={4}
                required
                value={form.pesan}
                onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/[0.05] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Jelaskan proposta kerja sama yang Anda inginkan"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            >
              Kirim Pesan ke WhatsApp TCO
            </button>
          </form>
        </div>
      </section>
    </>
  )
}