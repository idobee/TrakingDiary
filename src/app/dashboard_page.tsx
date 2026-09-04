'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { Hike } from '@/hooks/useHikes'

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void
  onOpenScheduleModal: (title: string) => void
  hikes: Hike[]
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenScheduleModal,
  hikes,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-forest via-forest-light to-forest-container text-paper p-8 rounded-3xl shadow-xl overflow-hidden border-2 border-forest-container">
        <div className="absolute right-0 top-0 opacity-10 font-heading font-black text-9xl select-none">
          {t('dashboard.watermark')}
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-terracotta text-white px-3 py-1 rounded-full text-xs font-label font-bold uppercase">
            <span>{t('dashboard.heroBadge')}</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-paper leading-tight">
            {t('dashboard.heroTitleLine1')}<br />
            {t('dashboard.heroTitleLine2')}
          </h2>
          <p className="text-sand text-sm font-body leading-relaxed">
            {t('dashboard.heroDescription')}
          </p>
          
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('hikes')}
              className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md flex items-center space-x-1.5"
            >
              <span>{t('dashboard.heroCtaHikes')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('diaries')}
              className="bg-paper-low/20 hover:bg-paper-low/30 text-sand border border-sand/40 font-heading font-bold text-xs px-5 py-2.5 rounded-full transition flex items-center space-x-1.5"
            >
              <span>{t('dashboard.heroCtaDiaries')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-paper-high shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-container text-amber-300 flex items-center justify-center font-heading font-bold text-xl shadow">
            🗓️
          </div>
          <div>
            <span className="text-[10px] font-label text-gray-500 uppercase block">{t('dashboard.metricsUpcomingLabel')}</span>
            <span className="font-heading font-extrabold text-xl text-forest">{t('dashboard.metricsUpcomingValue')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-high shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/20 text-terracotta flex items-center justify-center font-heading font-bold text-xl shadow">
            📖
          </div>
          <div>
            <span className="text-[10px] font-label text-gray-500 uppercase block">{t('dashboard.metricsDiariesLabel')}</span>
            <span className="font-heading font-extrabold text-xl text-forest">{t('dashboard.metricsDiariesValue')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-high shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-heading font-bold text-xl shadow">
            📸
          </div>
          <div>
            <span className="text-[10px] font-label text-gray-500 uppercase block">{t('dashboard.metricsPhotosLabel')}</span>
            <span className="font-heading font-extrabold text-xl text-forest">{t('dashboard.metricsPhotosValue')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-paper-high shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center font-heading font-bold text-xl shadow">
            🏅
          </div>
          <div>
            <span className="text-[10px] font-label text-gray-500 uppercase block">{t('dashboard.metricsBadgesLabel')}</span>
            <span className="font-heading font-extrabold text-xl text-forest">{t('dashboard.metricsBadgesValue')}</span>
          </div>
        </div>
      </div>

      {/* Feature Teasers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Hikes Preview Card */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-lg text-forest">{t('dashboard.recentHikesTitle')}</h3>
              <span className="uc-tag">{t('dashboard.recentHikesUc')}</span>
            </div>
            <button onClick={() => onNavigateTab('hikes')} className="text-xs font-label text-terracotta hover:underline font-bold">
              {t('common.viewAll')} &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {hikes.length > 0 ? (
              hikes.slice(0, 3).map((hike) => (
                <div
                  key={hike.id}
                  onClick={() => onOpenScheduleModal(hike.title)}
                  className="p-4 bg-paper-low hover:bg-sand-light/50 rounded-2xl border border-paper-high transition cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="bg-forest text-white text-[10px] font-label font-bold px-2 py-0.5 rounded-full">
                      {new Date(hike.hike_date).toLocaleDateString()}
                    </span>
                    <h4 className="font-heading font-bold text-base text-forest mt-1">{hike.title}</h4>
                    <p className="text-xs text-gray-500 font-body">{hike.description}</p>
                  </div>
                  <span className="bg-terracotta text-white font-label text-[10px] px-3 py-1 rounded-full font-bold">
                    {hike.status === 'recruiting' ? t('common.apply') : t('common.viewDetail')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 font-body">
                모집 중인 산행이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Bookshelf Preview Card */}
        <div className="bg-[#2a170a] p-6 rounded-3xl border-2 border-[#1a0e05] text-amber-100 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#5c3718] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-amber-300 font-heading font-bold text-lg">{t('dashboard.bookshelfTitle')}</span>
                <span className="uc-tag">{t('dashboard.bookshelfUc')}</span>
              </div>
              <span className="text-xs font-label text-amber-300">{t('dashboard.bookshelfVol')}</span>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#0a3a27] to-[#001c12] border-l-8 border-amber-950 text-paper space-y-2 shadow">
              <span className="text-[10px] font-label text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded">{t('dashboard.bookshelfVolLabel')}</span>
              <h4 className="font-heading font-extrabold text-lg text-amber-100">{t('dashboard.bookshelfBookTitle')}</h4>
              <p className="text-xs text-sand/80 font-body">{t('dashboard.bookshelfBookMeta')}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('diaries')}
            className="w-full mt-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-bold text-xs py-2.5 rounded-full transition shadow"
          >
            {t('dashboard.bookshelfCtaBrowse')}
          </button>
        </div>
      </div>
    </div>
  )
}
