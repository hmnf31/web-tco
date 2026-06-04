import Link from "next/link"
import { CalendarDays, ArrowLeft, Newspaper } from "lucide-react"
import { getSupabase } from "@/lib/supabaseClient"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function ArtikelPage() {
  let articles: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    published_at: string
    created_at: string
    author: string
  }[] = []

  try {
    const supabase = getSupabase()
    const { data: rawArticles } = await supabase
      .from("tco_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    articles = (rawArticles || []) as typeof articles
  } catch (err) {
    console.error("Failed to fetch articles:", err)
  }

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
        {(!articles || articles.length === 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-4 text-sm text-white/40">Belum ada artikel. Pantau terus!</p>
          </div>
        )}

        {articles?.map((article) => {
          const paragraphs = article.content.split("\n\n").filter((p: string) => p.trim())
          return (
            <Link key={article.id} href={`/artikel/${article.slug}`}>
              <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-cyan-400/20">
                <div className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                      <Newspaper className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white sm:text-xl">{article.title}</h2>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(article.published_at || article.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {paragraphs.slice(0, 2).map((paragraph: string, i: number) => (
                      <p key={i} className="text-sm leading-relaxed text-white/60">
                        {paragraph}
                      </p>
                    ))}
                    {paragraphs.length > 2 && (
                      <p className="text-sm font-medium text-cyan-400">Baca selengkapnya...</p>
                    )}
                  </div>
                </div>
              </article>
            </Link>
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
