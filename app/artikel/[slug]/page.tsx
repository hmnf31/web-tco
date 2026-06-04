import Link from "next/link"
import { CalendarDays, ArrowLeft } from "lucide-react"
import { getSupabase } from "@/lib/supabaseClient"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ArticleGameViewer from "@/components/chess/ArticleGameViewer"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = getSupabase()
    const { data: raw } = await supabase
      .from("tco_articles")
      .select("title, excerpt, image_url, watermarked_image_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    const article = raw as any
    if (!article) return {}

    const imageUrl = article.watermarked_image_url || article.image_url || ""

    return {
      title: article.title,
      description: article.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160) || "Baca artikel terbaru dari TCO Esports",
      openGraph: {
        title: article.title,
        description: article.excerpt?.replace(/<[^>]*>/g, "").slice(0, 200) || "Baca artikel terbaru dari TCO Esports",
        type: "article",
        url: `https://website-tco.vercel.app/artikel/${slug}`,
        ...(imageUrl ? {
          images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
        } : {}),
        siteName: "TCO Esports",
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.excerpt?.replace(/<[^>]*>/g, "").slice(0, 200) || "Baca artikel terbaru dari TCO Esports",
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export async function generateStaticParams() {
  return []
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export default async function ArtikelDetailPage({ params }: PageProps) {
  const { slug } = await params

  let article: {
    id: string; title: string; slug: string; content: string; excerpt: string
    image_url: string; watermarked_image_url: string; image_caption?: string
    published_at: string; created_at: string; author: string; category: string
    games_json: string; language?: string
  } | null = null

  try {
    const supabase = getSupabase()
    const { data: rawArticle } = await supabase
      .from("tco_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    article = rawArticle as any
  } catch (err) {
    console.error("Failed to fetch article:", err)
  }

  if (!article) {
    notFound()
  }

  let games: { pgn: string }[] = []
  try {
    const parsed = JSON.parse(article.games_json || "[]")
    if (Array.isArray(parsed)) games = parsed
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/artikel"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Artikel
      </Link>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">{article.title}</h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-white/40">
          <CalendarDays className="h-4 w-4" />
          {formatDate(article.published_at || article.created_at)}
          {article.language && (
            <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase">{article.language}</span>
          )}
        </div>
        <div className="mt-1 text-xs text-white/30">{article.author}</div>
      </div>

      {(article.watermarked_image_url || article.image_url) && (
        <div className="mt-8 overflow-hidden rounded-2xl">
          <img
            src={article.watermarked_image_url || article.image_url}
            alt={article.title}
            className="w-full object-cover"
          />
          {article.image_caption && (
            <p className="mt-2 text-center text-xs text-white/30 italic">{article.image_caption}</p>
          )}
        </div>
      )}

      <div
        className="mt-8 prose prose-invert max-w-none text-sm leading-relaxed text-white/60
          prose-headings:text-white prose-headings:font-bold
          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white/80 prose-code:text-cyan-300
          prose-img:rounded-xl prose-img:my-4
          prose-table:border-collapse prose-table:border prose-table:border-white/10
          prose-th:border prose-th:border-white/10 prose-th:bg-white/[0.03] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-white/70
          prose-td:border prose-td:border-white/10 prose-td:px-4 prose-td:py-2 prose-td:text-white/60
          prose-hr:border-white/10
        "
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {games.length > 0 && (
        <ArticleGameViewer games={games} />
      )}

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
