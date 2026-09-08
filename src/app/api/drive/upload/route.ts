import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
import stream from 'stream'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const clubId = formData.get('club_id') as string | null
    const hikeDate = formData.get('hike_date') as string | null
    const hikeId = formData.get('hike_id') as string | null
    const uploaderId = formData.get('uploader_id') as string | null

    if (!file || !clubId || !hikeDate || !hikeId || !uploaderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize Supabase Admin Client to bypass RLS for fetching credentials
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )

    // Fetch Club's Google Drive credentials
    const { data: club, error: clubError } = await supabaseAdmin
      .from('clubs')
      .select('google_drive_folder_id, google_drive_credentials_json')
      .eq('id', clubId)
      .single()

    if (clubError || !club) {
      return NextResponse.json({ error: 'Failed to fetch club Google Drive settings' }, { status: 404 })
    }

    if (!club.google_drive_credentials_json || !club.google_drive_folder_id) {
      return NextResponse.json({ error: 'Google Drive credentials are not configured for this club' }, { status: 400 })
    }

    // Parse Credentials
    let credentials
    try {
      credentials = JSON.parse(club.google_drive_credentials_json)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Google Drive credentials JSON format' }, { status: 400 })
    }

    // Initialize Google Drive API via OAuth2
    const origin = req.nextUrl.origin
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.google_Autho_Client_Secret,
      `${origin}/api/drive/callback`
    )
    
    // Set credentials which includes the refresh_token. 
    // The OAuth2Client will automatically refresh the access token if needed.
    oauth2Client.setCredentials(credentials)

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const mainFolderId = club.google_drive_folder_id

    // Check DB first for existing folder ID to prevent race conditions or missing state
    let targetFolderId = formData.get('folder_id') as string | null
    if (!targetFolderId && hikeId) {
      const { data: hikeData } = await supabaseAdmin.from('hikes').select('google_drive_folder_id').eq('id', parseInt(hikeId)).single()
      if (hikeData?.google_drive_folder_id) {
        targetFolderId = hikeData.google_drive_folder_id
      }
    }

    if (!targetFolderId) {
      const baseFolderName = hikeDate.split('T')[0] // Safely extract date part

      const folderQuery = `name = '${baseFolderName}' and '${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      const folderRes = await drive.files.list({
        q: folderQuery,
        fields: 'files(id, name)',
        spaces: 'drive'
      })

      const exactMatch = folderRes.data.files?.find(f => f.name === baseFolderName)
      
      if (exactMatch) {
        targetFolderId = exactMatch.id!
      } else {
        // Create subfolder
        const folderMetadata = {
          name: baseFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [mainFolderId]
        }
        const createRes = await drive.files.create({
          requestBody: folderMetadata,
          fields: 'id'
        })
        targetFolderId = createRes.data.id!
      }

      // Save the folder ID to the hike record so future uploads reuse it
      if (hikeId) {
        const { error: updateErr } = await supabaseAdmin.from('hikes').update({ google_drive_folder_id: targetFolderId }).eq('id', parseInt(hikeId))
        if (updateErr) {
          console.error('Failed to update hike google_drive_folder_id:', updateErr)
        }
      }
    }

    // Prepare file stream
    const buffer = await file.arrayBuffer()
    const bufferStream = new stream.PassThrough()
    bufferStream.end(Buffer.from(buffer))

    // Upload File
    const fileMetadata = {
      name: file.name,
      parents: [targetFolderId]
    }
    const media = {
      mimeType: file.type,
      body: bufferStream
    }

    const uploadRes = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webContentLink, webViewLink, thumbnailLink'
    })

    // Make the file publicly readable so it can be rendered on the web
    await drive.permissions.create({
      fileId: uploadRes.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    const webContentLink = uploadRes.data.webContentLink || uploadRes.data.webViewLink || ''
    const webViewLink = uploadRes.data.webViewLink || ''

    // 2. Insert into Supabase photos table securely
    const { error: dbError } = await supabaseAdmin.from('photos').insert({
      hike_id: parseInt(hikeId),
      uploader_id: uploaderId,
      google_drive_file_id: uploadRes.data.id,
      google_drive_web_link: webContentLink,
      thumbnail_url: uploadRes.data.thumbnailLink || `https://drive.google.com/thumbnail?id=${uploadRes.data.id}&sz=w800`
    })

    if (dbError) {
      console.error("Failed to save photo to DB:", dbError)
      // Even if DB fails, file is uploaded, but we return error so frontend knows
      return NextResponse.json({ error: '파일은 업로드되었으나 DB 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileId: uploadRes.data.id,
      webContentLink,
      webViewLink,
      targetFolderId
    })

  } catch (error: any) {
    console.error('Google Drive Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
