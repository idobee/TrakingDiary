import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { photoId, isPublished } = await req.json()
    
    if (photoId === undefined || isPublished === undefined) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('photos')
      .update({ is_published: isPublished })
      .eq('id', photoId)

    if (error) {
      console.error('Failed to update photos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error /api/photos/publish:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
