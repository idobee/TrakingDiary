import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const clubId = searchParams.get('state') // state holds the club_id
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, req.url))
  }

  if (!code || !clubId) {
    return NextResponse.json({ error: 'Missing code or state(club_id)' }, { status: 400 })
  }

  const origin = req.nextUrl.origin

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.google_Autho_Client_Secret,
      `${origin}/api/drive/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const refreshToken = tokens.refresh_token

    // Prepare credentials json payload (we store this in the existing json column)
    const credentialsJson = JSON.stringify({
      refresh_token: refreshToken || '',
      access_token: tokens.access_token || '',
      expiry_date: tokens.expiry_date || 0,
      token_type: tokens.token_type || 'Bearer'
    })

    // Init Drive API to create root folder if needed
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // Initialize Supabase Admin Client to bypass RLS securely in background API
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    )

    // Check if club already has a folder
    const { data: club } = await supabaseAdmin.from('clubs').select('google_drive_folder_id, name').eq('id', clubId).single()

    let folderId = club?.google_drive_folder_id

    // Create root folder if missing
    if (!folderId) {
      const folderMetadata = {
        name: `TrackingDiary_${club?.name || clubId}`,
        mimeType: 'application/vnd.google-apps.folder',
      }
      const folderRes = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      })
      folderId = folderRes.data.id
    }

    // Save tokens and folderId to Supabase
    const { error: dbError } = await supabaseAdmin.from('clubs').update({
      google_drive_credentials_json: credentialsJson,
      google_drive_folder_id: folderId
    }).eq('id', clubId)

    if (dbError) {
      console.error("DB Update Error:", dbError)
      throw dbError
    }

    // Success, redirect back to root with success param
    return NextResponse.redirect(new URL(`/?drive_auth=success&club_id=${clubId}`, req.url))

  } catch (err: any) {
    console.error('Drive OAuth Callback Error:', err)
    return NextResponse.redirect(new URL(`/?drive_auth=error`, req.url))
  }
}
