"use client"

import { useEffect, useState } from "react"
import { Search, Download, Shield, Loader2, AlertCircle } from "lucide-react"
import { getSupabase } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

type Member = {
  id: string
  created_at: string
  full_name: string
  whatsapp_number: string
  game_username: string
  division: string
  payment_info: string
  status: string
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "tcoadmin123"

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      setError("Password salah")
    }
  }

  useEffect(() => {
    if (!authenticated) return
    async function fetchMembers() {
      setLoading(true)
      setError("")
      try {
        const supabase = getSupabase()
        const { data, error: err } = await supabase
          .from("tco_members")
          .select("*")
          .order("created_at", { ascending: false })

        if (err) throw err
        setMembers(data || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [authenticated])

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.game_username.toLowerCase().includes(search.toLowerCase()) ||
      m.whatsapp_number.includes(search)
  )

  function exportCSV() {
    const header = "Nama Lengkap,WhatsApp,Username Game,Divisi,Info Pembayaran,Status,Tanggal Daftar"
    const rows = filtered.map(
      (m) =>
        `"${m.full_name}","${m.whatsapp_number}","${m.game_username}","${m.division}","${m.payment_info}","${m.status}","${new Date(m.created_at).toLocaleDateString("id-ID")}"`
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tco_members_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <Shield className="mx-auto h-10 w-10 text-cyan-400" />
            <h1 className="mt-4 text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-white/50">Masukkan password untuk mengakses dashboard</p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Masukkan password admin"
              className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-white/50">
            Total Member: {members.length} | Tampil: {filtered.length}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, username, atau no. WhatsApp..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
        />
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat data...
        </div>
      ) : error ? (
        <div className="mt-10 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-3 font-medium text-white/50">No</th>
                <th className="px-4 py-3 font-medium text-white/50">Nama</th>
                <th className="px-4 py-3 font-medium text-white/50">WhatsApp</th>
                <th className="px-4 py-3 font-medium text-white/50">Username Game</th>
                <th className="px-4 py-3 font-medium text-white/50">Divisi</th>
                <th className="px-4 py-3 font-medium text-white/50">Status</th>
                <th className="px-4 py-3 font-medium text-white/50">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/30">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <tr key={m.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/40">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white/80">{m.full_name}</td>
                    <td className="px-4 py-3 text-white/60">{m.whatsapp_number}</td>
                    <td className="px-4 py-3 text-white/60">{m.game_username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.division === "Chess"
                            ? "bg-cyan-400/10 text-cyan-400"
                            : m.division === "MLBB"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-purple-400/10 text-purple-400"
                        }`}
                      >
                        {m.division}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.status === "Active"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {new Date(m.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
