import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Prevent open redirect security vulnerability by ensuring "next" is relative
      const isRelative = next.startsWith('/') && !next.startsWith('//')
      const targetUrl = isRelative ? `${origin}${next}` : `${origin}/`
      return NextResponse.redirect(targetUrl)
    }
  }

  // Return the user to home page on error
  return NextResponse.redirect(`${origin}/`)
}
