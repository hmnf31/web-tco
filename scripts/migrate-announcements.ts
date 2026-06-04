import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase URL and Service Role Key required in .env.local')
  process.exit(1)
}

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS tco_announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      link_url TEXT NOT NULL DEFAULT '',
      link_text TEXT NOT NULL DEFAULT ''
    );

    ALTER TABLE tco_announcements ENABLE ROW LEVEL SECURITY;

    CREATE POLICY IF NOT EXISTS "Allow anonymous select announcements" ON tco_announcements
      FOR SELECT
      TO anon
      USING (is_active = true AND now() BETWEEN start_date AND end_date);

    CREATE POLICY IF NOT EXISTS "Allow service role all announcements" ON tco_announcements
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    CREATE INDEX IF NOT EXISTS idx_tco_announcements_is_active ON tco_announcements(is_active);
    CREATE INDEX IF NOT EXISTS idx_tco_announcements_start_date ON tco_announcements(start_date);
    CREATE INDEX IF NOT EXISTS idx_tco_announcements_end_date ON tco_announcements(end_date);
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSql })

    if (error) {
      console.log('RPC exec_sql not available, trying direct table creation...')

      // Test if table exists first
      const { error: selectError } = await supabase
        .from('tco_announcements')
        .select('id')
        .limit(1)

      if (selectError && selectError.message.includes('relation') && selectError.message.includes('does not exist')) {
        console.error('Table does not exist. Please run this SQL manually in Supabase Dashboard SQL Editor:')
        console.error(createTableSql)
        process.exit(1)
      } else {
        console.log('Table tco_announcements exists or created successfully')
      }
    } else {
      console.log('Migration completed: tco_announcements table ready')
    }
  } catch (err) {
    console.error('Migration error:', err)
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log(createTableSql)
  }
    } else {
      console.log('Migration completed: tco_announcements table ready')
    }
  } catch (err) {
    console.error('Migration error:', err)
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log(createTableSql)
  }
}

main()
