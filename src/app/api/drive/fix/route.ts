import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}'),
      scopes: ['https://www.googleapis.com/auth/drive']
    })
    const drive = google.drive({ version: 'v3', auth })

    const { data: photos } = await supabaseAdmin.from('photos').select('id, google_drive_file_id')
    
    if (!photos) {
      return NextResponse.json({ message: "No photos found" })
    }

    let successCount = 0
    for (const photo of photos) {
      try {
        await drive.permissions.create({
          fileId: photo.google_drive_file_id,
          requestBody: { role: 'reader', type: 'anyone' }
        })
        successCount++
      } catch (e: any) {
        console.error(`Failed for photo ${photo.id}:`, e.message)
      }
    }

    return NextResponse.json({ message: `Updated permissions for ${successCount} photos.` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
