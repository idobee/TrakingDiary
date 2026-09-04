'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

interface LoginPageProps {
  inviteClubId?: number | null
  inviteRole?: string | null
}

export const LoginPage: React.FC<LoginPageProps> = ({ inviteClubId, inviteRole }) => {
  const { t } = useTranslation()
  const { signInWithProvider } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLogin = async (provider: 'kakao' | 'google') => {
    try {
      setIsRedirecting(true)
      await signInWithProvider(provider, inviteClubId, inviteRole)
    } catch (error) {
      console.error('Login error:', error)
      setIsRedirecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest flex flex-col items-center justify-center relative overflow-hidden text-paper p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-terracotta/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-forest-container text-center space-y-8">
        
        {/* Branding & Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-terracotta flex items-center justify-center text-white text-4xl shadow-lg border-4 border-white">
            {inviteClubId ? '✉️' : '⛰️'}
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-forest tracking-tight">
              {inviteClubId ? '동호회 초대 수락' : t('header.appTitle')}
            </h1>
            <p className="text-sm text-gray-500 font-body mt-2 font-medium">
              {inviteClubId 
                ? '가입을 완료하려면 아래 소셜 계정으로 3초 만에 로그인해 주세요.'
                : t('auth.loginSubtitle')}
            </p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4 pt-4">
          {/* Kakao Button */}
          <button
            onClick={() => handleLogin('kakao')}
            disabled={isRedirecting}
            className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] font-heading font-bold text-sm px-6 py-4 rounded-2xl transition shadow flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            <span className="text-xl">💬</span>
            <span>{isRedirecting ? t('auth.redirecting') : t('auth.loginWithKakao')}</span>
          </button>

          {/* Google Button */}
          <button
            onClick={() => handleLogin('google')}
            disabled={isRedirecting}
            className="w-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-gray-800 font-heading font-bold text-sm px-6 py-4 rounded-2xl transition shadow-sm flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            <span className="text-xl">G</span>
            <span>{isRedirecting ? t('auth.redirecting') : t('auth.loginWithGoogle')}</span>
          </button>

          <p className="text-[10px] text-gray-400 font-label pt-4">
            {t('auth.socialOnlyNotice')}
          </p>
        </div>

      </div>
    </div>
  )
}
