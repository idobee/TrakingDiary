import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { photoId, isPinned } = await req.json()

    if (photoId === undefined || isPinned === undefined) {
      return NextResponse.json({ error: 'photoId and isPinned are required' }, { status: 400 })
    }

    // DB의 is_bside 컬럼을 '핀 고정(선정)' 여부로 활용합니다 (true: 핀 고정)
    const { error } = await supabaseAdmin
      .from('photos')
      .update({ is_bside: Boolean(isPinned) })
      .eq('id', Number(photoId))

    if (error) {
      console.error('Failed to update photo pin status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, isPinned: Boolean(isPinned) })
  } catch (err: any) {
    console.error('API Error /api/photos/pin:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
