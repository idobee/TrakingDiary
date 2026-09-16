'use client'

import React from 'react'
import { useTranslation, LanguageSwitcher } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { Club } from '@/hooks/useClubs'

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedClubId: number | null
  setSelectedClubId: (id: number) => void
  clubs: Club[]
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedClubId,
  setSelectedClubId,
  clubs,
}) => {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  const tabIds = ['dashboard', 'hikes', 'diaries', 'gallery', 'my', 'clubs'] as const

  const tabs = tabIds.map((id) => ({
    id,
    label: t(`header.tabs.${id}`),
  }))

  return (
    <header className="bg-forest border-b border-forest-container sticky top-0 z-40 text-paper shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
          
          {/* Top Row on Mobile, Left Side on PC */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] overflow-hidden shadow-md border border-white/20 flex-shrink-0">
                <img src="/logo.png" alt="Happic Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-paper leading-tight">
                    {t('header.appTitle')}
                  </h1>
                </div>
                <p className="hidden sm:block font-label text-xs text-sand/80 font-medium">{t('header.appSubtitle')}</p>
              </div>
            </div>

            {/* Mobile-only right side controls (Language & Profile) */}
            <div className="flex sm:hidden items-center space-x-2">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={() => setActiveTab('my')}
                  className="flex items-center space-x-1.5 bg-forest-container hover:bg-forest-surface px-2 py-1.5 rounded-full border border-sand/30 transition shadow-sm"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-6 h-6 rounded-full border border-paper" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-heading font-bold text-[10px] flex items-center justify-center border border-paper">
                      {user.nickname ? user.nickname[0] : t('header.profileInitial')}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      signOut()
                    }}
                    className="bg-terracotta hover:bg-terracotta-dark text-white font-label font-bold text-[9px] px-1.5 py-0.5 rounded"
                  >
                    {t('auth.logout')}
                  </button>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-3 py-1.5 rounded-full shadow-sm"
                >
                  {t('auth.loginBtn')}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row on Mobile, Right Side on PC */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="relative inline-block text-left w-full sm:w-auto">
              <select
                id="clubSelect"
                value={selectedClubId || ''}
                onChange={(e) => setSelectedClubId(Number(e.target.value))}
                className="w-full sm:w-auto bg-forest-container text-paper text-sm font-body font-medium rounded-full px-4 py-2 border border-forest-surface focus:outline-none focus:ring-2 focus:ring-terracotta cursor-pointer"
              >
                {clubs.length > 0 ? (
                  clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))
                ) : (
                  <option value="" disabled>소속 동호회 없음</option>
                )}
              </select>
            </div>

            {/* PC-only right side controls */}
            <div className="hidden sm:flex items-center space-x-3 ml-4">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={() => setActiveTab('my')}
                  className="flex items-center space-x-2 bg-forest-container hover:bg-forest-surface px-3 py-1.5 rounded-full border border-sand/30 transition shadow-sm"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-7 h-7 rounded-full border border-paper" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-heading font-bold text-xs flex items-center justify-center border border-paper">
                      {user.nickname ? user.nickname[0] : t('header.profileInitial')}
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <p className="font-heading font-bold text-xs text-paper leading-none">
                      {t('auth.greeting', { nickname: user.nickname || t('header.profileName') })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      signOut()
                    }}
                    className="bg-terracotta hover:bg-terracotta-dark text-white font-label font-bold text-[9px] px-2 py-0.5 rounded ml-2"
                  >
                    {t('auth.logout')}
                  </button>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-4 py-2 rounded-full shadow-sm"
                >
                  {t('auth.loginBtn')}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex flex-wrap justify-center sm:justify-start gap-2 border-t border-forest-container py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-terracotta text-white shadow-md'
                    : 'text-sand/90 hover:bg-forest-container hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

      </div>
    </header>
  )
}
