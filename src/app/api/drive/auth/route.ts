import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const clubId = searchParams.get('club_id')

  if (!clubId) {
    return NextResponse.json({ error: 'club_id is required' }, { status: 400 })
  }

  // origin을 동적으로 가져옵니다 (로컬호스트나 실제 배포 도메인 모두 대응)
  const origin = req.nextUrl.origin
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.google_Autho_Client_Secret,
    `${origin}/api/drive/callback`
  )

  const scopes = [
    'https://www.googleapis.com/auth/drive.file' // 우리가 생성한 파일/폴더만 접근 권한
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // refresh_token 발급 필수
    prompt: 'consent', // 항상 동의 화면을 띄워서 refresh_token을 확실하게 받아옴
    scope: scopes,
    state: clubId // 콜백에서 어느 동호회인지 식별하기 위해 상태로 넘김
  })

  return NextResponse.redirect(authUrl)
}
