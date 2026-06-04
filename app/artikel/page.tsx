import Link from "next/link"
import { CalendarDays, ArrowLeft, Newspaper, ChevronLeft, ChevronRight } from "lucide-react"
import { getSupabase } from "@/lib/supabaseClient"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

interface ArtikelPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ArtikelPage({ searchParams }: ArtikelPageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || "1")
  const limit = 10
  const from = (currentPage - 1) * limit
  const to = from + limit - 1

  let articles: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    image_url: string
    published_at: string
    created_at: string
    author: string
  }[] = []
  
  let totalCount = 0

  try {
    const supabase = getSupabase()
    
    // Get total count
    const { count } = await supabase
      .from("tco_articles")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
    
    totalCount = count || 0

    // Get paginated articles
    const { data: rawArticles } = await supabase
      .from("tco_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(from, to)

    articles = (rawArticles || []) as typeof articles
  } catch (err) {
    console.error("Failed to fetch articles:", err)
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
      </Link>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Berita & Artikel</h1>
        <p className="mt-2 text-white/50">Perjalanan TCO Esports menuju puncak klasemen global</p>
        {totalCount > 0 && (
          <p className="mt-2 text-xs text-white/30">Menampilkan {from + 1}-{Math.min(to + 1, totalCount)} dari {totalCount} artikel</p>
        )}
      </div>

      <div className="mt-12 space-y-12">
        {(!articles || articles.length === 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-4 text-sm text-white/40">Belum ada artikel. Pantau terus!</p>
          </div>
        )}

        {articles?.map((article) => {
          // Remove HTML tags for preview and limit to 300 words
          const cleanText = article.content.replace(/<[^>]*>/g, " ")
          const words = cleanText.split(/\s+/).filter(w => w.length > 0)
          const preview = words.slice(0, 300).join(" ") + (words.length > 300 ? "..." : "")

          return (
            <article key={article.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-cyan-400/20 group">
              <div className="flex flex-col md:flex-row">
                {article.image_url && (
                  <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-72">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(article.published_at || article.created_at)}
                    <span className="mx-1">•</span>
                    <span>{article.author || "TCO Official"}</span>
                  </div>
                  
                  <h2 className="mt-3 text-xl font-bold text-white transition-colors group-hover:text-cyan-400 sm:text-2xl">
                    <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                  </h2>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60 line-clamp-4">
                    {preview}
                  </p>

                  <div className="mt-6">
                    <Link
                      href={`/artikel/${article.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-all hover:gap-3"
                    >
                      Baca selengkapnya
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-4">
          <Link
            href={`/artikel?page=${currentPage - 1}`}
            className={`flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${
              currentPage <= 1 ? "pointer-events-none opacity-20" : ""
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Link>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              // Show max 5 page numbers or current page +/- 2
              if (
                totalPages > 7 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                (pageNum < currentPage - 1 || pageNum > currentPage + 1)
              ) {
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-white/20">...</span>
                }
                return null
              }

              return (
                <Link
                  key={pageNum}
                  href={`/artikel?page=${pageNum}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                      : "border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>

          <Link
            href={`/artikel?page=${currentPage + 1}`}
            className={`flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition-all hover:border-cyan-400/30 hover:text-cyan-400 ${
              currentPage >= totalPages ? "pointer-events-none opacity-20" : ""
            }`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mt-16 text-center">
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
