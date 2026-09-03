import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './config'

let client = null

// Lazy singleton: only reads env vars (and throws if missing) the first time
// something actually needs Supabase, not at module load / app boot.
export function getSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseConfig()
    client = createClient(url, anonKey)
  }
  return client
}
