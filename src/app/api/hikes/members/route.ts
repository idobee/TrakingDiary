import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { insertData } = await req.json()
    
    if (!insertData || !Array.isArray(insertData)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('hike_members')
      .upsert(insertData)

    if (error) {
      console.error('Failed to insert hike_members:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error /api/hikes/members:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
