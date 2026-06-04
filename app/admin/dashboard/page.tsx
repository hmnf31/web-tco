"use client"

import { useState, useEffect } from "react"
import { Search, Download, Shield, Loader2, AlertCircle, LogOut, Plus, FileText, Users, Edit3, ExternalLink, Eye, CalendarDays, Image, Sparkles } from "lucide-react"
import { validateAdmin, type AdminUser } from "@/lib/admin-auth"

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

type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image_url: string
  published_at: string
  created_at: string
  author: string
  is_published: boolean
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<"members" | "articles">("members")

  // Members state
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  // Articles state
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState("")

  // Edit modal
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editPublishDate, setEditPublishDate] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [optimizing, setOptimizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const found = validateAdmin(loginUsername, loginPassword)
    if (found) {
      setUser(found)
      setLoginError("")
    } else {
      setLoginError("Username atau password salah")
    }
  }

  function handleLogout() {
    setUser(null)
    setLoginUsername("")
    setLoginPassword("")
  }

  useEffect(() => {
    if (!user) return
    fetchMembers()
    fetchArticles()
  }, [user])

  async function fetchMembers() {
    setLoading(true)
    setError("")
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/members", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || "Gagal memuat data")
      setMembers(body.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data")
    } finally { setLoading(false) }
  }

  async function fetchArticles() {
    setArticlesLoading(true)
    setArticlesError("")
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/articles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || "Gagal memuat artikel")
      setArticles(body.data || [])
    } catch (err: unknown) {
      setArticlesError(err instanceof Error ? err.message : "Gagal memuat artikel")
    } finally { setArticlesLoading(false) }
  }

  async function handleOptimize() {
    if (!editTitle && !editContent) return
    setOptimizing(true)
    try {
      const res = await fetch("/api/admin/optimize-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      })
      const data = await res.json()
      if (data.title) setEditTitle(data.title)
      if (data.content) setEditContent(data.content)
      if (data.slug) setEditSlug(data.slug)
    } catch (err) {
      console.error("Optimize error:", err)
    } finally { setOptimizing(false) }
  }

  async function handleSaveArticle(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: editingArticle?.id || null,
        title: editTitle,
        slug: editSlug,
        content: editContent,
        image_url: editImageUrl,
        published_at: editPublishDate || new Date().toISOString(),
        author: user?.name || "Admin TCO",
      }

      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan")

      setShowForm(false)
      setEditingArticle(null)
      resetForm()
      fetchArticles()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally { setSaving(false) }
  }

  function resetForm() {
    setEditTitle("")
    setEditContent("")
    setEditImageUrl("")
    setEditPublishDate("")
    setEditSlug("")
  }

  function openEdit(article: Article) {
    setEditingArticle(article)
    setEditTitle(article.title)
    setEditContent(article.content)
    setEditImageUrl(article.image_url || "")
    setEditSlug(article.slug)
    setEditPublishDate(article.published_at?.split("T")[0] || "")
    setShowForm(true)
  }

  function openNew() {
    setEditingArticle(null)
    resetForm()
    setEditPublishDate(new Date().toISOString().split("T")[0])
    setShowForm(true)
  }

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.game_username.toLowerCase().includes(search.toLowerCase()) ||
    m.whatsapp_number.includes(search)
  )

  function exportCSV() {
    const header = "Nama Lengkap,WhatsApp,Username Game,Divisi,Info Pembayaran,Status,Tanggal Daftar"
    const rows = filteredMembers.map((m) =>
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

  // ── LOGIN FORM ──
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <Shield className="mx-auto h-10 w-10 text-cyan-400" />
            <h1 className="mt-4 text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-white/50">Masuk dengan akun admin TCO</p>
          </div>
          {loginError && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" /> {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input type="text" value={loginUsername} onChange={(e) => { setLoginUsername(e.target.value); setLoginError("") }} placeholder="Username" className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20" />
            <input type="password" value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError("") }} placeholder="Password" className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20" />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">Masuk Dashboard</button>
          </form>
        </div>
      </div>
    )
  }

  // ── ARTICLE FORM MODAL ──
  if (showForm) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editingArticle ? "Edit Artikel" : "Buat Artikel Baru"}</h1>
          <button onClick={() => { setShowForm(false); setEditingArticle(null) }} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">Kembali</button>
        </div>
        <form onSubmit={handleSaveArticle} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Judul Artikel</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Slug (URL)</label>
              <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="Auto-generated" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60 outline-none focus:border-cyan-400/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Tanggal Publikasi</label>
              <input type="date" value={editPublishDate} onChange={(e) => setEditPublishDate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">URL Gambar</label>
            <input type="url" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm text-white/60">Konten</label>
              <button type="button" onClick={handleOptimize} disabled={optimizing} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/20 bg-purple-400/5 px-3 py-1.5 text-xs font-medium text-purple-400 transition-all hover:bg-purple-400/10 disabled:opacity-50">
                <Sparkles className="h-3.5 w-3.5" /> {optimizing ? "Mengoptimasi..." : "Optimasi dengan AI"}
              </button>
            </div>
            <textarea rows={14} value={editContent} onChange={(e) => setEditContent(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 resize-y" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] disabled:opacity-50">
              {saving ? "Menyimpan..." : editingArticle ? "Update Artikel" : "Publikasikan Artikel"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingArticle(null) }} className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 hover:text-white">Batal</button>
          </div>
        </form>
      </div>
    )
  }

  // ── MAIN DASHBOARD ──
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <span className="rounded-full bg-cyan-400/10 px-3 py-0.5 text-xs text-cyan-400">{user.name}</span>
            <button onClick={handleLogout} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/40 hover:text-white/80">
              <LogOut className="mr-1 inline h-3 w-3" /> Keluar
            </button>
          </div>
        </div>
        {tab === "members" && (
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-cyan-400/30 hover:text-cyan-400">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="mt-8 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <button onClick={() => setTab("members")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === "members" ? "bg-cyan-400/10 text-cyan-400" : "text-white/50 hover:text-white/80"}`}>
          <Users className="h-4 w-4" /> Member
        </button>
        <button onClick={() => setTab("articles")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === "articles" ? "bg-cyan-400/10 text-cyan-400" : "text-white/50 hover:text-white/80"}`}>
          <FileText className="h-4 w-4" /> Artikel
        </button>
      </div>

      {/* ── MEMBERS TAB ── */}
      {tab === "members" && (
        <>
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, username, atau no. WhatsApp..." className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50" />
          </div>
          {loading ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /> Memuat data...</div>
          ) : error ? (
            <div className="mt-10 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"><AlertCircle className="h-4 w-4" /> {error}</div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-4 py-3 font-medium text-white/50">No</th>
                    <th className="px-4 py-3 font-medium text-white/50">Nama</th>
                    <th className="px-4 py-3 font-medium text-white/50">WhatsApp</th>
                    <th className="px-4 py-3 font-medium text-white/50">Username</th>
                    <th className="px-4 py-3 font-medium text-white/50">Divisi</th>
                    <th className="px-4 py-3 font-medium text-white/50">Status</th>
                    <th className="px-4 py-3 font-medium text-white/50">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-white/30">Tidak ada data</td></tr>
                  ) : (
                    filteredMembers.map((m, i) => (
                      <tr key={m.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white/40">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-white/80">{m.full_name}</td>
                        <td className="px-4 py-3 text-white/60">{m.whatsapp_number}</td>
                        <td className="px-4 py-3 text-white/60">{m.game_username}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${m.division === "Chess" ? "bg-cyan-400/10 text-cyan-400" : m.division === "MLBB" ? "bg-yellow-400/10 text-yellow-400" : "bg-purple-400/10 text-purple-400"}`}>{m.division}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${m.status === "Active" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>{m.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/40">{new Date(m.created_at).toLocaleDateString("id-ID")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── ARTICLES TAB ── */}
      {tab === "articles" && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/50">Total: {articles.length} artikel</p>
            <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
              <Plus className="h-4 w-4" /> Buat Artikel
            </button>
          </div>
          {articlesLoading ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /> Memuat artikel...</div>
          ) : articlesError ? (
            <div className="mt-10 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"><AlertCircle className="h-4 w-4" /> {articlesError}</div>
          ) : (
            <div className="mt-4 space-y-3">
              {articles.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                  <FileText className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm text-white/40">Belum ada artikel. klik &quot;Buat Artikel&quot; untuk mulai.</p>
                </div>
              ) : (
                articles.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-400/20">
                    {a.image_url && (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <img src={a.image_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{a.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(a.published_at || a.created_at).toLocaleDateString("id-ID")}</span>
                        <span>{a.author}</span>
                        <a href={`/artikel/${a.slug}`} target="_blank" className="flex items-center gap-1 text-cyan-400/60 hover:text-cyan-400">
                          <ExternalLink className="h-3 w-3" /> Lihat
                        </a>
                      </div>
                    </div>
                    <button onClick={() => openEdit(a)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-cyan-400/30 hover:text-cyan-400">
                      <Edit3 className="mr-1 inline h-3 w-3" /> Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
