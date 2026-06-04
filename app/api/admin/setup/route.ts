import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getPgPool, executeRawSql } from "@/lib/pgClient"

const CRON_SECRET = process.env.CRON_SECRET

async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', table)
      .eq('column_name', column)
      .limit(1)

    return !error && data && data.length > 0
  } catch {
    return false
  }
}

async function checkTableExists(table: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1)

    return !error
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || ""

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && authHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: { table: string; status: string; error?: string; sql?: string }[] = []
  const pgPool = getPgPool()

  const tableExists = await checkTableExists("tco_announcements")

  if (!tableExists) {
    const createTableSql = `
CREATE TABLE IF NOT EXISTS tco_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  link_url TEXT NOT NULL DEFAULT '',
  link_text TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tco_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow anonymous select announcements" ON tco_announcements
  FOR SELECT
  TO anon
  USING (is_active = true AND now() BETWEEN start_date AND COALESCE(end_date, now()));

CREATE POLICY IF NOT EXISTS "Allow service role all announcements" ON tco_announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tco_announcements_is_active ON tco_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_tco_announcements_start_date ON tco_announcements(start_date);
CREATE INDEX IF NOT EXISTS idx_tco_announcements_end_date ON tco_announcements(end_date);
`

    if (pgPool) {
      const execResult = await executeRawSql(createTableSql)
      if (execResult.success) {
        results.push({ table: "tco_announcements", status: "created" })
      } else {
        results.push({
          table: "tco_announcements",
          status: "missing",
          error: execResult.error || "Failed to create table",
          sql: createTableSql.trim()
        })
      }
    } else {
      results.push({
        table: "tco_announcements",
        status: "missing",
        error: "Table tco_announcements does not exist. Set SUPABASE_DB_PASSWORD to auto-execute or run manually in Supabase SQL Editor.",
        sql: createTableSql.trim()
      })
    }
  } else {
    results.push({ table: "tco_announcements", status: "exists" })
  }

  const columnsToAdd = [
    { name: "language", type: "TEXT DEFAULT 'id'" },
    { name: "games_json", type: "TEXT DEFAULT '[]'" },
    { name: "image_caption", type: "TEXT DEFAULT ''" }
  ]

  for (const col of columnsToAdd) {
    const exists = await checkColumnExists("tco_articles", col.name)

    if (!exists) {
      const alterSql = `ALTER TABLE tco_articles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
      if (pgPool) {
        const execResult = await executeRawSql(alterSql)
        if (execResult.success) {
          results.push({ table: "tco_articles", status: `column ${col.name} added` })
        } else {
          results.push({
            table: "tco_articles",
            status: `column ${col.name} missing`,
            error: execResult.error || `Failed to add column ${col.name}`,
            sql: alterSql
          })
        }
      } else {
        results.push({
          table: "tco_articles",
          status: `column ${col.name} missing`,
          error: `Column ${col.name} does not exist. Set SUPABASE_DB_PASSWORD to auto-execute or run manually in Supabase SQL Editor.`,
          sql: alterSql
        })
      }
    } else {
      results.push({ table: "tco_articles", status: `column ${col.name} exists` })
    }
  }

  const hasErrors = results.some(r => r.status === "missing" || r.status === "error")

  return NextResponse.json({
    success: !hasErrors,
    results
  }, { status: hasErrors ? 400 : 200 })
}