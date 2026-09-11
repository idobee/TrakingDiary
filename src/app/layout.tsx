'use client'

import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <title>함께쓰는 Tracking 일기 • 산행 추억 아카이브</title>
        <meta name="description" content="동호회 산행 모집, 구글 공유 드라이브 사진 연동, 월별 디지털 하드커버 단행본 서가 아카이빙 플랫폼" />
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-terracotta selection:text-white" suppressHydrationWarning>
        <I18nProvider defaultLocale="ko">
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
