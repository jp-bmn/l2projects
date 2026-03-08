import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let db = null

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or key is missing. Set VITE_SUPABASE_ANON_KEY (recommended) or VITE_SUPABASE_PUBLISHABLE_KEY.'
  )
} else {
  db = createClient(SUPABASE_URL, SUPABASE_KEY)
}

export { db }

