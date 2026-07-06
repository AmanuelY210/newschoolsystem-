// Supabase Client Configuration - Full Authentication
// Project: https://dizrnigvikwfqjpgfvys.supabase.co

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dizrnigvikwfqjpgfvys.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ZH_Ag8QtWMQlSvt4m3Y9Zw_JkWvG7he'

// Server-side Supabase client (for API routes - no session persistence)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Client-side Supabase client (for browser - with session persistence)
let clientSideClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!clientSideClient) {
    clientSideClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return clientSideClient
}

// Supabase project config
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  projectRef: 'dizrnigvikwfqjpgfvys',
  anonKey: SUPABASE_ANON_KEY,
  restUrl: 'https://dizrnigvikwfqjpgfvys.supabase.co/rest/v1/',
  authUrl: 'https://dizrnigvikwfqjpgfvys.supabase.co/auth/v1',
  // PostgreSQL connection (needs password)
  databaseUrl: 'postgresql://postgres:[YOUR-PASSWORD]@db.dizrnigvikwfqjpgfvys.supabase.co:5432/postgres',
}

export default supabase
