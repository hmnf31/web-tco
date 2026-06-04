import { Pool, PoolClient } from "pg"

let pool: Pool | null = null

export function getPgPool(): Pool | null {
  if (pool) return pool

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const dbPassword = process.env.SUPABASE_DB_PASSWORD

  if (!supabaseUrl || !dbPassword) {
    return null
  }

  const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "")

  pool = new Pool({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    }
  })

  return pool
}

export async function executeRawSql(sql: string): Promise<{ success: boolean; error?: string }> {
  const pool = getPgPool()

  if (!pool) {
    return { success: false, error: "PostgreSQL client not available. Set SUPABASE_DB_PASSWORD environment variable." }
  }

  let client: PoolClient | null = null
  try {
    client = await pool.connect()
    await client.query(sql)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    client?.release()
  }
}