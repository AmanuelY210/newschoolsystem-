// Supabase Client Configuration
// Project: https://dizrnigvikwfqjpgfvys.supabase.co

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dizrnigvikwfqjpgfvys.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ZH_Ag8QtWMQlSvt4m3Y9Zw_JkWvG7he'

// Server-side Supabase client (for API routes)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Client-side Supabase client (for browser components)
export function createClientSide() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Supabase project info
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  projectRef: 'dizrnigvikwfqjpgfvys',
  anonKey: SUPABASE_ANON_KEY,
  // PostgreSQL connection string (replace YOUR-PASSWORD with your database password)
  databaseUrl: 'postgresql://postgres:[YOUR-PASSWORD]@db.dizrnigvikwfqjpgfvys.supabase.co:5432/postgres',
}

export default supabase
