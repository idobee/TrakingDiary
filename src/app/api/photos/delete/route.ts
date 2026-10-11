import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { photoId, photoIds } = await req.json()
    const targetIds: number[] = []

    if (photoId !== undefined) {
      targetIds.push(Number(photoId))
    }
    if (Array.isArray(photoIds)) {
      targetIds.push(...photoIds.map(Number))
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'No photo IDs provided' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('photos')
      .delete()
      .in('id', targetIds)

    if (error) {
      console.error('Failed to delete photos from DB:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: targetIds.length })
  } catch (err: any) {
    console.error('API Error /api/photos/delete:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
