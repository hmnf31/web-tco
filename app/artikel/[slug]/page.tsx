import Link from "next/link"
import { CalendarDays, ArrowLeft } from "lucide-react"
import { getSupabase } from "@/lib/supabaseClient"
import { notFound } from "next/navigation"
import ArticleGameViewer from "@/components/chess/ArticleGameViewer"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return []
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function ArtikelDetailPage({ params }: PageProps) {
  const { slug } = await params

  let article: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    image_url: string
    watermarked_image_url: string
    published_at: string
    created_at: string
    author: string
    category: string
    games_json: string
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

  const paragraphs = article.content.split("\n\n").filter((p: string) => p.trim())

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
        </div>
      )}

      <div className="mt-8 space-y-6">
        {paragraphs.map((paragraph: string, i: number) => (
          <p key={i} className="text-sm leading-relaxed text-white/60">
            {paragraph}
          </p>
        ))}
      </div>

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
