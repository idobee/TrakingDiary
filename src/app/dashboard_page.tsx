'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { Hike } from '@/hooks/useHikes'
import { Club } from '@/hooks/useClubs'

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void
  onOpenScheduleModal: (title: string) => void
  hikes: Hike[]
  clubs?: Club[]
  allClubs?: Club[]
  publicEpisodes?: any[]
  publicPhotos?: any[]
  user?: any
  onOpenDiaryDetail?: (hikeId: number) => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenScheduleModal,
  hikes,
  clubs = [],
  allClubs = [],
  publicEpisodes = [],
  publicPhotos = [],
  user = null,
  onOpenDiaryDetail
}) => {
  const { t } = useTranslation()

  const now = new Date()
  const sixDaysAgo = new Date()
  sixDaysAgo.setDate(now.getDate() - 6)

  const recentHikes = hikes.filter(hike => {
    const hikeDate = new Date(hike.hike_date)
    return hike.status === 'recruiting' || (hikeDate >= sixDaysAgo && hikeDate <= now)
  }).slice(0, 3)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column (2/3) - Public / Promotional Content */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Hero Banner (Promotional) */}
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
                onClick={() => onNavigateTab('intro')}
                className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md flex items-center space-x-1.5"
              >
                <span>{t('dashboard.heroCtaHikes')}</span>
              </button>
              <button
                onClick={() => onNavigateTab('intro')}
                className="bg-paper-low/20 hover:bg-paper-low/30 text-sand border border-sand/40 font-heading font-bold text-xs px-5 py-2.5 rounded-full transition flex items-center space-x-1.5"
              >
                <span>{t('dashboard.heroCtaDiaries')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Public Episodes Section */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-lg text-forest">{t('dashboard.publicEpisodesTitle')}</h3>
            </div>
            <button onClick={() => onNavigateTab('diaries')} className="text-xs font-label text-terracotta hover:underline font-bold">
              {t('common.viewAll')} &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicEpisodes.length > 0 ? (
              publicEpisodes.map(ep => {
                const hasPhoto = ep.photo_urls && ep.photo_urls.length > 0
                return (
                  <div key={ep.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center space-x-2 mb-2">
                      {ep.users?.avatar_url ? (
                        <img src={ep.users.avatar_url} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center">
                          {ep.users?.nickname?.[0]}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-700">{ep.users?.nickname}</span>
                      <span className="text-[10px] text-gray-400">{new Date(ep.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-heading font-bold text-forest text-sm line-clamp-1">{ep.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ep.content}</p>
                    {hasPhoto && (
                      <div className="mt-2 h-20 overflow-hidden rounded-xl border border-gray-200">
                        <img src={ep.photo_urls[0]} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-400 font-body text-center col-span-2 py-4">
                {t('dashboard.publicEpisodesEmpty')}
              </p>
            )}
          </div>
        </div>

        {/* Public Photos Gallery */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading font-bold text-lg text-forest">{t('dashboard.publicPhotosTitle')}</h3>
            <button onClick={() => onNavigateTab('gallery')} className="text-xs font-label text-terracotta hover:underline font-bold">
              {t('common.viewAll')} &rarr;
            </button>
          </div>
          
          {publicPhotos.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {publicPhotos.map(photo => {
                const fileId = photo.google_drive_file_id
                const imgSrc = `/api/drive/image?id=${fileId}`
                return (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative group">
                    <img src={imgSrc} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                      <span className="text-[9px] text-white font-bold line-clamp-1">{photo.hikes?.title}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-body text-center py-4">
              {t('dashboard.publicPhotosEmpty')}
            </p>
          )}
        </div>

      </div>


      {/* Right Column (1/3) - Joined Clubs or Login Prompt */}
      <div className="lg:col-span-1 space-y-6">
        
        {user ? (
          <div className="bg-paper-low border-2 border-forest-container p-6 rounded-3xl shadow-md sticky top-24">
            <h3 className="font-heading font-extrabold text-xl text-forest mb-4 border-b border-forest-surface pb-3">
              {t('dashboard.joinedClubsTitle')}
            </h3>
            
            <div className="space-y-3">
              {clubs.length > 0 ? (
                clubs.map(club => (
                  <div 
                    key={club.id} 
                    onClick={() => onNavigateTab('clubs')}
                    className="p-3 bg-white rounded-2xl border border-paper-high hover:border-terracotta hover:shadow transition cursor-pointer flex items-center space-x-3"
                  >
                    {club.logo_url ? (
                      <img src={club.logo_url} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-forest-container text-terracotta flex items-center justify-center font-bold text-lg">
                        {club.name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading font-bold text-sm text-forest">{club.name}</h4>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-bold uppercase">
                        {club.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 font-body px-4">{t('dashboard.joinedClubsEmpty')}</p>
                  <button onClick={() => onNavigateTab('clubs')} className="mt-3 text-xs font-bold text-terracotta hover:underline">
                    동호회 찾기 &rarr;
                  </button>
                </div>
              )}
            </div>
            
            {/* Quick Metrics */}
            <div className="mt-6 pt-4 border-t border-forest-surface grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 block">{t('dashboard.metricsUpcomingLabel')}</span>
                <span className="text-lg font-heading font-extrabold text-forest">{hikes.filter(h => h.status==='recruiting').length}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 block">{t('dashboard.metricsDiariesLabel')}</span>
                <span className="text-lg font-heading font-extrabold text-terracotta">{publicEpisodes.length}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-forest text-paper p-6 rounded-3xl shadow-xl sticky top-24 border border-forest-surface text-center space-y-4">
            <div className="w-16 h-16 bg-terracotta text-white rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner">
              🏔️
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white leading-tight">
                {t('dashboard.loginPromptTitle')}
              </h3>
              <p className="text-xs text-sand/80 font-body mt-2">
                {t('dashboard.loginPromptDesc')}
              </p>
            </div>
            <button 
              onClick={() => onNavigateTab('login')}
              className="w-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-bold text-sm py-3 rounded-full transition shadow mt-2"
            >
              {t('dashboard.loginButton')}
            </button>
          </div>
        )}

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
            {recentHikes.length > 0 ? (
              recentHikes.map((hike) => {
                const hikeDate = new Date(hike.hike_date)
                const isPast = hikeDate < now
                
                return (
                  <div
                    key={hike.id}
                    onClick={() => {
                      if (isPast) {
                        if (onOpenDiaryDetail) onOpenDiaryDetail(hike.id)
                      } else {
                        onNavigateTab('hikes')
                      }
                    }}
                    className="p-4 bg-paper-low hover:bg-sand-light/50 rounded-2xl border border-paper-high transition cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <span className="bg-forest text-white text-[10px] font-label font-bold px-2 py-0.5 rounded-full">
                        {hikeDate.toLocaleDateString()}
                      </span>
                      <h4 className="font-heading font-bold text-base text-forest mt-1">{hike.title}</h4>
                      <p className="text-xs text-gray-500 font-body line-clamp-1">{hike.description}</p>
                    </div>
                    <span className="bg-terracotta text-white font-label text-[10px] px-3 py-1 rounded-full font-bold ml-2 shrink-0">
                      {isPast ? t('common.viewDetail') : t('common.apply')}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 font-body">
                모집 중인 산행이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* All Clubs List Card */}
        <div className="bg-white p-6 rounded-3xl border border-paper-high shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading font-bold text-lg text-forest">{t('dashboard.allClubsTitle')}</h3>
            <button onClick={() => onNavigateTab('clubs')} className="text-xs font-label text-terracotta hover:underline font-bold">
              {t('common.viewAll')} &rarr;
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {allClubs.length > 0 ? (
              allClubs.map(club => (
                <div 
                  key={club.id} 
                  onClick={() => onNavigateTab('clubs')}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-forest/30 hover:shadow transition cursor-pointer flex flex-col items-center text-center space-y-2"
                >
                  {club.logo_url ? (
                    <img src={club.logo_url} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-forest-container text-terracotta flex items-center justify-center font-bold text-base">
                      {club.name[0]}
                    </div>
                  )}
                  <div className="w-full">
                    <h4 className="font-heading font-bold text-[10px] text-gray-800 line-clamp-1">{club.name}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-body px-4">{t('dashboard.allClubsEmpty')}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
