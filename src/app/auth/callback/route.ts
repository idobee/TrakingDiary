import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
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
      
      if (error) {
        return NextResponse.json({ error: 'Exchange code error', details: error.message }, { status: 500 })
      }

      if (user) {
        // Upsert user into public.users table for new social logins
        const provider = user.app_metadata?.provider || 'oauth'
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Trekker'
        const avatarUrl = user.user_metadata?.avatar_url || ''

        const { error: upsertError } = await supabase.from('users').upsert({
          id: user.id,
          email: user.email || '',
          nickname: name,
          avatar_url: avatarUrl,
          provider: provider === 'kakao' || provider === 'google' || provider === 'naver' ? provider : 'oauth',
        }, { onConflict: 'id' })
        
        if (upsertError) {
           return NextResponse.json({ error: 'User upsert error', details: upsertError.message }, { status: 500 })
        }
        
        const inviteClubId = searchParams.get('invite_club_id')
        const inviteRole = searchParams.get('invite_role')

        if (inviteClubId && inviteRole) {
          const clubIdNum = parseInt(inviteClubId, 10)
          
          if (isNaN(clubIdNum)) {
            return NextResponse.json({ error: 'Invalid invite_club_id', details: inviteClubId }, { status: 400 })
          }

          // Check if the user is already a member
          const { data: existingMember, error: selectError } = await supabase
            .from('club_members')
            .select('*')
            .eq('club_id', clubIdNum)
            .eq('user_id', user.id)
            .single()

          if (!existingMember) {
            // Add as approved member directly via invite link
            const { error: insertError } = await (supabase.from('club_members') as any).insert({
              club_id: clubIdNum,
              user_id: user.id,
              role: 'member',
              role_title: inviteRole === 'guest' ? '게스트' : '정회원',
              status: 'approved',
              approved_at: new Date().toISOString()
            })

            if (insertError) {
              return NextResponse.json({ error: 'Club member insert error', details: insertError.message }, { status: 500 })
            }
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err: any) {
      console.error('Auth Callback Exception:', err)
      return NextResponse.json({ error: 'Internal Exception', message: err?.message || String(err) }, { status: 500 })
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
