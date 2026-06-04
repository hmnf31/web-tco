"use client"

import { useState, useEffect } from "react"
import {
  Search, Download, Shield, Loader2, AlertCircle, LogOut, Plus,
  FileText, Users, Edit3, ExternalLink, CalendarDays, Trash2, Megaphone,
} from "lucide-react"
import { validateAdmin, type AdminUser } from "@/lib/admin-auth"
import TiptapEditor from "@/components/editor/TiptapEditor"
import ImageUpload from "@/components/editor/ImageUpload"

export const dynamic = "force-dynamic"

type Member = {
  id: string; created_at: string; full_name: string; whatsapp_number: string
  game_username: string; division: string; payment_info: string; status: string
}

type Article = {
  id: string; title: string; slug: string; content: string; excerpt: string
  image_url: string; image_caption?: string; language?: string
  published_at: string; created_at: string; author: string; is_published: boolean
  games_json?: string
}

type Announcement = {
  id: string; created_at: string; title: string; content: string
  start_date: string; end_date: string; is_active: boolean
  link_url?: string; link_text?: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<"members" | "articles" | "announcements">("members")

  // Members state
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  // Articles state
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState("")

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [announcementsError, setAnnouncementsError] = useState("")

  // Edit modal
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editImageCaption, setEditImageCaption] = useState("")
  const [editLanguage, setEditLanguage] = useState("id")
  const [editPublishDate, setEditPublishDate] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editPgn, setEditPgn] = useState("")
  const [optimizing, setOptimizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Announcement Form State
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annStartDate, setAnnStartDate] = useState("")
  const [annEndDate, setAnnEndDate] = useState("")
  const [annIsActive, setAnnIsActive] = useState(true)
  const [annLinkUrl, setAnnLinkUrl] = useState("")
  const [annLinkText, setAnnLinkText] = useState("")
  const [showAnnForm, setShowAnnForm] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const found = validateAdmin(loginUsername, loginPassword)
    if (found) { setUser(found); setLoginError("") }
    else { setLoginError("Username atau password salah") }
  }

  function handleLogout() { setUser(null); setLoginUsername(""); setLoginPassword("") }

  useEffect(() => {
    if (!user) return
    fetchMembers()
    fetchArticles()
    fetchAnnouncements()
  }, [user])

  async function fetchMembers() {
    setLoading(true); setError("")
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/members", { headers: { Authorization: `Bearer ${token}` } })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || "Gagal memuat data")
      setMembers(body.data || [])
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Gagal memuat data") }
    finally { setLoading(false) }
  }

  async function fetchArticles() {
    setArticlesLoading(true); setArticlesError("")
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/articles", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        console.error(`Fetch articles failed: ${res.status} ${res.statusText}`)
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}: Gagal memuat artikel`)
      }
      const body = await res.json()
      setArticles(body.data || [])
    } catch (err: unknown) {
      setArticlesError(err instanceof Error ? err.message : "Gagal memuat artikel")
    } finally {
      setArticlesLoading(false)
    }
  }

  async function fetchAnnouncements() {
    setAnnouncementsLoading(true); setAnnouncementsError("")
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/announcements", { headers: { Authorization: `Bearer ${token}` } })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || "Gagal memuat pengumuman")
      setAnnouncements(body.data || [])
    } catch (err: unknown) {
      setAnnouncementsError(err instanceof Error ? err.message : "Gagal memuat pengumuman")
    } finally {
      setAnnouncementsLoading(false)
    }
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
      if (!res.ok) {
        console.error(`Optimize failed: ${res.status}`)
        throw new Error("Gagal optimasi AI")
      }
      const data = await res.json()
      if (data.title) setEditTitle(data.title)
      if (data.content) setEditContent(data.content)
      if (data.slug) setEditSlug(data.slug)
    } catch (err) {
      console.error("Optimize error:", err)
      alert("Gagal mengoptimasi artikel dengan AI")
    } finally {
      setOptimizing(false)
    }
  }

  async function handleSaveArticle(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let gamesJson: any[] = []
      const pgnStr = String(editPgn || "").trim()

      if (pgnStr) {
        try { gamesJson = JSON.parse(pgnStr) }
        catch { gamesJson = [{ pgn: pgnStr }] }
      }
      const payload = {
        id: editingArticle?.id || null,
        title: editTitle,
        slug: editSlug,
        content: editContent,
        image_url: editImageUrl,
        image_caption: editImageCaption,
        language: editLanguage,
        published_at: editPublishDate ? new Date(editPublishDate).toISOString() : new Date().toISOString(),
        author: user?.name || "Admin TCO",
        games_json: gamesJson,
      }

      const token = btoa(`${user?.username}:${loginPassword}`)
      const endpoint = "/api/admin/articles"
      console.log(`Saving article to ${endpoint}...`)

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error(`Save failed: ${res.status} ${res.statusText}`)
        throw new Error(data.error || `Error ${res.status}: Gagal menyimpan`)
      }

      setShowForm(false); setEditingArticle(null)
      resetForm()
      fetchArticles()
    } catch (err: unknown) {
      console.error("Save article error:", err)
      alert(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteArticle(article: Article) {
    if (!confirm(`Hapus artikel "${article.title}"?`)) return
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: article.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menghapus")
      fetchArticles()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Gagal menghapus") }
  }

  async function handleSaveAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: editingAnnouncement?.id || null,
        title: annTitle,
        content: annContent,
        start_date: annStartDate ? new Date(annStartDate).toISOString() : new Date().toISOString(),
        end_date: annEndDate ? new Date(annEndDate).toISOString() : null,
        is_active: annIsActive,
        link_url: annLinkUrl,
        link_text: annLinkText,
      }

      if (!payload.end_date) throw new Error("Tanggal berakhir wajib diisi")

      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal menyimpan pengumuman")
      }

      setShowAnnForm(false); setEditingAnnouncement(null)
      fetchAnnouncements()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAnnouncement(ann: Announcement) {
    if (!confirm(`Hapus pengumuman "${ann.title}"?`)) return
    try {
      const token = btoa(`${user?.username}:${loginPassword}`)
      const res = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: ann.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal menghapus")
      }
      fetchAnnouncements()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Gagal menghapus") }
  }

  function resetForm() {
    setEditTitle(""); setEditContent(""); setEditImageUrl(""); setEditImageCaption("")
    setEditLanguage("id"); setEditPublishDate(""); setEditSlug(""); setEditPgn("")
  }

  function resetAnnForm() {
    setAnnTitle(""); setAnnContent(""); setAnnStartDate(""); setAnnEndDate("")
    setAnnIsActive(true); setAnnLinkUrl(""); setAnnLinkText("")
  }

  function openEdit(article: Article) {
    setEditingArticle(article)
    setEditTitle(article.title)
    setEditContent(article.content)
    setEditImageUrl(article.image_url || "")
    setEditImageCaption((article as any).image_caption || "")
    setEditLanguage((article as any).language || "id")
    setEditSlug(article.slug)
    setEditPublishDate(article.published_at?.substring(0, 16) || "")
    
    // Ensure PGN is always a string in the editor
    let pgnValue = (article as any).games_json || ""
    if (typeof pgnValue !== "string") {
      try { pgnValue = JSON.stringify(pgnValue, null, 2) }
      catch { pgnValue = "" }
    }
    setEditPgn(pgnValue)
    
    setShowForm(true)
  }

  function openEditAnn(ann: Announcement) {
    setEditingAnnouncement(ann)
    setAnnTitle(ann.title)
    setAnnContent(ann.content)
    setAnnStartDate(ann.start_date?.substring(0, 16) || "")
    setAnnEndDate(ann.end_date?.substring(0, 16) || "")
    setAnnIsActive(ann.is_active)
    setAnnLinkUrl(ann.link_url || "")
    setAnnLinkText(ann.link_text || "")
    setShowAnnForm(true)
  }

  function openNew() {
    setEditingArticle(null); resetForm()
    setEditPublishDate(new Date().toISOString().substring(0, 16))
    setShowForm(true)
  }

  function openNewAnn() {
    setEditingAnnouncement(null); resetAnnForm()
    setAnnStartDate(new Date().toISOString().substring(0, 16))
    // Default 1 week from now
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    setAnnEndDate(nextWeek.toISOString().substring(0, 16))
    setShowAnnForm(true)
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
    a.href = url; a.download = `tco_members_${new Date().toISOString().split("T")[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ── LOGIN ──
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

  // ── ARTICLE FORM ──
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
              <label className="mb-1.5 block text-sm text-white/60">Tanggal & Waktu Publikasi</label>
              <input type="datetime-local" value={editPublishDate} onChange={(e) => setEditPublishDate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Bahasa</label>
              <select value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 outline-none focus:border-cyan-400/50">
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div />
          </div>

          <ImageUpload
            imageUrl={editImageUrl}
            imageCaption={editImageCaption}
            onImageUrlChange={setEditImageUrl}
            onImageCaptionChange={setEditImageCaption}
          />

          <div>
            <label className="mb-1.5 block text-sm text-white/60">
              PGN Game{" "}
              <span className="text-white/30">(JSON array: [{`{"pgn": "1. e4 e5..."}`}] atau PGN mentah)</span>
            </label>
            <textarea
              rows={4}
              value={editPgn}
              onChange={(e) => setEditPgn(e.target.value)}
              placeholder='Contoh: [{&quot;pgn&quot;: &quot;1. e4 e5 2. Nf3 Nc6...&quot;}]
Atau paste PGN langsung (1 game per artikel)'
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 resize-y font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/60">Konten</label>
            <TiptapEditor
              content={editContent}
              onChange={setEditContent}
              onOptimize={handleOptimize}
              optimizing={optimizing}
            />
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

  // ── ANNOUNCEMENT FORM ──
  if (showAnnForm) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editingAnnouncement ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</h1>
          <button onClick={() => { setShowAnnForm(false); setEditingAnnouncement(null) }} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">Kembali</button>
        </div>
        <form onSubmit={handleSaveAnnouncement} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Judul Pengumuman (Singkat)</label>
            <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required placeholder="Contoh: Turnamen Blitz TCO Night" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/60">Isi Pengumuman (Running Text)</label>
            <textarea rows={3} value={annContent} onChange={(e) => setAnnContent(e.target.value)} required placeholder="Isi pesan yang akan tampil di running text..." className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 resize-y" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Waktu Mulai</label>
              <input type="datetime-local" value={annStartDate} onChange={(e) => setAnnStartDate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Waktu Berakhir (Expired)</label>
              <input type="datetime-local" value={annEndDate} onChange={(e) => setAnnEndDate(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Link URL (Opsional)</label>
              <input type="url" value={annLinkUrl} onChange={(e) => setAnnLinkUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Teks Link</label>
              <input type="text" value={annLinkText} onChange={(e) => setAnnLinkText(e.target.value)} placeholder="Contoh: Daftar Sekarang" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="annIsActive" checked={annIsActive} onChange={(e) => setAnnIsActive(e.target.checked)} className="h-4 w-4 rounded border-white/10 bg-white/[0.03] text-cyan-500" />
            <label htmlFor="annIsActive" className="text-sm text-white/70">Aktifkan Pengumuman</label>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] disabled:opacity-50">
              {saving ? "Menyimpan..." : editingAnnouncement ? "Update Pengumuman" : "Publikasikan"}
            </button>
            <button type="button" onClick={() => { setShowAnnForm(false); setEditingAnnouncement(null) }} className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 hover:text-white">Batal</button>
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

      <div className="mt-8 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <button onClick={() => setTab("members")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === "members" ? "bg-cyan-400/10 text-cyan-400" : "text-white/50 hover:text-white/80"}`}>
          <Users className="h-4 w-4" /> Member
        </button>
        <button onClick={() => setTab("articles")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === "articles" ? "bg-cyan-400/10 text-cyan-400" : "text-white/50 hover:text-white/80"}`}>
          <FileText className="h-4 w-4" /> Artikel
        </button>
        <button onClick={() => setTab("announcements")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === "announcements" ? "bg-cyan-400/10 text-cyan-400" : "text-white/50 hover:text-white/80"}`}>
          <Megaphone className="h-4 w-4" /> Pengumuman
        </button>
      </div>

      {/* MEMBERS */}
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

      {/* ARTICLES */}
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
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(a.published_at || a.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span>{a.author}</span>
                        {(a as any).language && <span className="uppercase">{(a as any).language}</span>}
                        <a href={`/artikel/${a.slug}`} target="_blank" className="flex items-center gap-1 text-cyan-400/60 hover:text-cyan-400">
                          <ExternalLink className="h-3 w-3" /> Lihat
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-cyan-400/30 hover:text-cyan-400">
                        <Edit3 className="mr-1 inline h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => handleDeleteArticle(a)} className="rounded-lg border border-red-400/20 px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:border-red-400/40 hover:text-red-400">
                        <Trash2 className="mr-1 inline h-3 w-3" /> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ANNOUNCEMENTS */}
      {tab === "announcements" && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/50">Total: {announcements.length} pengumuman</p>
            <button onClick={openNewAnn} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]">
              <Plus className="h-4 w-4" /> Tambah Pengumuman
            </button>
          </div>
          {announcementsLoading ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>
          ) : announcementsError ? (
            <div className="mt-10 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"><AlertCircle className="h-4 w-4" /> {announcementsError}</div>
          ) : (
            <div className="mt-4 space-y-3">
              {announcements.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                  <Megaphone className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm text-white/40">Belum ada pengumuman.</p>
                </div>
              ) : (
                announcements.map((ann) => {
                  const now = new Date()
                  const start = new Date(ann.start_date)
                  const end = new Date(ann.end_date)
                  const isExpired = end < now
                  const isUpcoming = start > now
                  const isActive = ann.is_active && !isExpired && !isUpcoming

                  return (
                    <div key={ann.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-cyan-400/20">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{ann.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive ? "bg-green-400/10 text-green-400" : isUpcoming ? "bg-blue-400/10 text-blue-400" : "bg-red-400/10 text-red-400"}`}>
                            {isActive ? "Active" : isUpcoming ? "Upcoming" : "Expired"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/40 line-clamp-1">{ann.content}</p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/30">
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Ends: {new Date(ann.end_date).toLocaleDateString("id-ID", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {ann.link_url && <span className="flex items-center gap-1 text-cyan-400/40"><ExternalLink className="h-3 w-3" /> {ann.link_text || "Link"}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditAnn(ann)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-cyan-400/30 hover:text-cyan-400">
                          <Edit3 className="mr-1 inline h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDeleteAnnouncement(ann)} className="rounded-lg border border-red-400/20 px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:border-red-400/40 hover:text-red-400">
                          <Trash2 className="mr-1 inline h-3 w-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
