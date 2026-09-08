import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data: photos } = await supabase.from('photos').select('id, google_drive_file_id, hike_id')
  if (!photos) return

  for (const photo of photos) {
    try {
      // Get hike -> club -> credentials
      const { data: hike } = await supabase.from('hikes').select('club_id').eq('id', photo.hike_id).single()
      const { data: club } = await supabase.from('clubs').select('google_drive_credentials_json').eq('id', hike!.club_id).single()
      
      if (!club?.google_drive_credentials_json) {
         console.log(`Skip photo ${photo.id}: no credentials`)
         continue
      }
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.google_Autho_Client_Secret
      )
      oauth2Client.setCredentials(JSON.parse(club.google_drive_credentials_json))

      const drive = google.drive({ version: 'v3', auth: oauth2Client })

      await drive.permissions.create({
        fileId: photo.google_drive_file_id,
        requestBody: { role: 'reader', type: 'anyone' }
      })
      console.log(`Updated permissions for photo ${photo.id}`)
    } catch (e: any) {
      console.log(`Failed for photo ${photo.id}: ${e.message}`)
    }
  }
}
run()
