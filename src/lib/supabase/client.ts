import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

const DUMMY_URL = 'https://placeholder.supabase.co'
const DUMMY_KEY = 'placeholder-key-anon'

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DUMMY_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || DUMMY_KEY
    _client = createBrowserClient(url, key)
  }
  return _client
}
