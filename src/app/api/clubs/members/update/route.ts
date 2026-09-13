import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This route requires the service_role key to bypass RLS for sys_admin updates
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { clubId, userId, updateData } = await request.json()

    if (!clubId || !userId || !updateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Verify caller's identity using standard client (cookie-based auth)
    const cookieStore = cookies()
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Read-only in route handler
          },
          remove(name: string, options: CookieOptions) {
            // Read-only in route handler
          },
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if caller is sys_admin or club admin
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('system_role')
      .eq('id', authUser.id)
      .single()

    let hasPermission = false

    if (userProfile?.system_role === 'admin' || userProfile?.system_role === 'sys_admin') {
      hasPermission = true
    } else {
      // Check club_members for owner/admin
      const { data: callerMember } = await supabaseAdmin
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', authUser.id)
        .single()
        
      if (callerMember && (callerMember.role === 'owner' || callerMember.role === 'admin')) {
        hasPermission = true
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Missing privileges' }, { status: 403 })
    }

    // 3. Perform the update bypassing RLS
    const { error: updateError } = await supabaseAdmin
      .from('club_members')
      .update(updateData)
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('clubId')
    const userId = searchParams.get('userId')

    if (!clubId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Verify caller's identity
    const cookieStore = cookies()
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Read-only in route handler
          },
          remove(name: string, options: CookieOptions) {
            // Read-only in route handler
          },
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if caller is sys_admin or club admin
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('system_role')
      .eq('id', authUser.id)
      .single()

    let hasPermission = false

    if (userProfile?.system_role === 'admin' || userProfile?.system_role === 'sys_admin') {
      hasPermission = true
    } else {
      const { data: callerMember } = await supabaseAdmin
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', authUser.id)
        .single()
        
      if (callerMember && (callerMember.role === 'owner' || callerMember.role === 'admin')) {
        hasPermission = true
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Missing privileges' }, { status: 403 })
    }

    // 3. Perform the delete bypassing RLS
    const { error: deleteError } = await supabaseAdmin
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
