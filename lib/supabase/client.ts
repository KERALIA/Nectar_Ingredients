import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a dummy client during build time to prevent build failures
    return createBrowserClient('https://placeholder-url.supabase.co', 'placeholder-anon-key')
  }

  return createBrowserClient(url, key)
}
