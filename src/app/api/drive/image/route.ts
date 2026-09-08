import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return new NextResponse('Missing id parameter', { status: 400 })
  }

  try {
    const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${id}`
    
    // Fetch the image from Google Drive
    const response = await fetch(googleDriveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrakingDiaryBot/1.0)',
      },
      // Cache the image for 1 day to reduce load on Google Drive
      next: { revalidate: 86400 }
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image from Google Drive', { status: response.status })
    }

    // Get the image buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Return the image with inline disposition and proper caching headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Content-Disposition': 'inline', // Force browser to render inline instead of download
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
