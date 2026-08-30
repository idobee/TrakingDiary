import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Upsert user into public.users table for new social logins
      const provider = user.app_metadata.provider
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Trekker'
      const avatarUrl = user.user_metadata?.avatar_url || ''

      // This uses service role conceptually if RLS restricts inserts, 
      // but assuming users can insert their own row on first login or RLS allows it.
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email || '',
        nickname: name,
        avatar_url: avatarUrl,
        provider: provider === 'kakao' || provider === 'google' || provider === 'naver' ? provider : 'oauth',
      }, { onConflict: 'id' })
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
