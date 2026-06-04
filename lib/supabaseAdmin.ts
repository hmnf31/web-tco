import { createClient } from '@supabase/supabase-js'

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL and Service Role Key must be set in environment variables')
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdminInstance
}
