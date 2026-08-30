'use client'

import React from 'react'
import { useTranslation, LanguageSwitcher } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedClub: string
  setSelectedClub: (club: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedClub,
  setSelectedClub,
}) => {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  const tabIds = ['dashboard', 'hikes', 'diaries', 'gallery', 'my', 'clubs'] as const

  const tabs = tabIds.map((id) => ({
    id,
    label: t(`header.tabs.${id}`),
    uc: t(`header.tabUcCodes.${id}`),
  }))

  return (
    <header className="bg-forest border-b border-forest-container sticky top-0 z-40 text-paper shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-inner">
              ⛰️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-paper leading-tight">
                  {t('header.appTitle')}
                </h1>
                <span className="uc-tag">{t('header.ucDashboardRoot')}</span>
              </div>
              <p className="font-label text-xs text-sand/80 font-medium">{t('header.appSubtitle')}</p>
            </div>
          </div>

          {/* Club Selector Dropdown, Language Switcher & Profile */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <div className="relative inline-block text-left">
              <select
                id="clubSelect"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="bg-forest-container text-paper text-xs sm:text-sm font-body font-medium rounded-full px-4 py-2 border border-forest-surface focus:outline-none focus:ring-2 focus:ring-terracotta cursor-pointer"
              >
                <option value="국립공원 산악회">{t('header.clubs.nationalPark')}</option>
                <option value="한라산 종주 클럽">{t('header.clubs.hallaClub')}</option>
                <option value="주말 힐링 트레킹">{t('header.clubs.weekendHealing')}</option>
              </select>
            </div>

            {/* Profile Badge Button / Login Button */}
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
                  <p className="font-label text-[9px] text-sand leading-none mt-0.5">{t('header.profileUc')}</p>
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
                onClick={() => setActiveTab('dashboard')} // Usually would open login modal, but handled by page.tsx redirect
                className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-4 py-2 rounded-full shadow-sm"
              >
                {t('auth.loginBtn')}
              </button>
            )}
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-forest-container overflow-x-auto py-2 scrollbar-none">
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
                <span className="text-[9px] opacity-75 font-label">{tab.uc}</span>
              </button>
            )
          })}
        </nav>

      </div>
    </header>
  )
}
