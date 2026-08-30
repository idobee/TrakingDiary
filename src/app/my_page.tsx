'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'

interface MyPageProps {
  onOpenEpisodeModal: (title: string, author: string, date: string, photo: string, content: string) => void
  onOpenBadgeGrantModal: (name: string) => void
}

export const MyPage: React.FC<MyPageProps> = ({
  onOpenEpisodeModal,
  onOpenBadgeGrantModal,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-md border border-paper-high">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-heading font-extrabold text-2xl text-forest">{t('my.sectionTitle')}</h2>
            <span className="uc-tag">{t('my.ucTag')}</span>
          </div>
          <p className="text-xs text-gray-600 font-body mt-1">{t('my.sectionDesc')}</p>
        </div>
        <div className="bg-paper-low border border-sand/40 px-4 py-2 rounded-xl text-xs font-label text-forest font-bold flex items-center space-x-2">
          <span>{t('my.badgeCountLabel')}</span>
          <span>•</span>
          <span>{t('my.stampCountLabel')}</span>
        </div>
      </div>

      {/* Activity Grid (UC13 활동기록 - 3열 그리드 & 획득 뱃지 표시) */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-bold text-lg text-forest">{t('my.activityTitle')}</h3>
            <span className="uc-tag">{t('my.activityUcTag')}</span>
          </div>
          <span className="font-label text-xs text-gray-500">{t('my.activityMeta')}</span>
        </div>

        {/* 3-Column Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Activity Card 1 */}
          <div className="p-5 bg-paper-low rounded-2xl border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="bg-forest text-white text-[10px] font-label font-bold px-2.5 py-0.5 rounded-full">{t('my.activity1.date')}</span>
                <span className="text-xs font-label text-gray-400">{t('my.activity1.distance')}</span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-forest flex items-center space-x-1.5">
                <span>{t('my.activity1.icon')}</span>
                <span>{t('my.activity1.title')}</span>
              </h4>
              <p className="text-xs text-gray-500 font-body mt-1">{t('my.activity1.desc')}</p>
            </div>

            {/* Earned Badge Display */}
            <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm">🏔️</div>
                <div>
                  <span className="font-heading font-bold text-xs text-terracotta block">{t('my.activity1.badgeName')}</span>
                  <span className="text-[9px] font-label text-gray-400 block">{t('my.activity1.grantedBy')}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('my.badgeGranted')}</span>
            </div>
          </div>

          {/* Activity Card 2 */}
          <div className="p-5 bg-paper-low rounded-2xl border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="bg-forest text-white text-[10px] font-label font-bold px-2.5 py-0.5 rounded-full">{t('my.activity2.date')}</span>
                <span className="text-xs font-label text-gray-400">{t('my.activity2.distance')}</span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-forest flex items-center space-x-1.5">
                <span>{t('my.activity2.icon')}</span>
                <span>{t('my.activity2.title')}</span>
              </h4>
              <p className="text-xs text-gray-500 font-body mt-1">{t('my.activity2.desc')}</p>
            </div>

            {/* Earned Badge Display */}
            <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm">⛰️</div>
                <div>
                  <span className="font-heading font-bold text-xs text-forest block">{t('my.activity2.badgeName')}</span>
                  <span className="text-[9px] font-label text-gray-400 block">{t('my.activity2.grantedBy')}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('my.badgeGranted')}</span>
            </div>
          </div>

          {/* Activity Card 3 */}
          <div className="p-5 bg-paper-low rounded-2xl border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="bg-forest text-white text-[10px] font-label font-bold px-2.5 py-0.5 rounded-full">{t('my.activity3.date')}</span>
                <span className="text-xs font-label text-gray-400">{t('my.activity3.distance')}</span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-forest flex items-center space-x-1.5">
                <span>{t('my.activity3.icon')}</span>
                <span>{t('my.activity3.title')}</span>
              </h4>
              <p className="text-xs text-gray-500 font-body mt-1">{t('my.activity3.desc')}</p>
            </div>

            {/* Earned Badge Display */}
            <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm">🌸</div>
                <div>
                  <span className="font-heading font-bold text-xs text-forest block">{t('my.activity3.badgeName')}</span>
                  <span className="text-[9px] font-label text-gray-400 block">{t('my.activity3.grantedBy')}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('my.badgeGranted')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Badge Stamp Grid (UC5 나의뱃지) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-bold text-xl text-forest">{t('my.badgesTitle')}</h3>
            <span className="uc-tag">{t('my.badgesUcTag')}</span>
          </div>
          <span className="font-label text-xs text-gray-500">{t('my.badgesCollectionRate')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Badge Item 1 (Earned) */}
          <div className="bg-white p-4 rounded-2xl border border-paper-high text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-20 h-20 rubber-stamp mb-3">
              <span className="text-xl">🏔️</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge1.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-forest">{t('my.badge1.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge1.earnedDate')}</p>
            <span className="text-[9px] bg-paper-high text-forest font-label px-2 py-0.5 rounded-full mt-2">{t('my.badge1.grantedBy')}</span>
          </div>

          {/* Badge Item 2 (Earned) */}
          <div className="bg-white p-4 rounded-2xl border border-paper-high text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-20 h-20 rubber-stamp mb-3" style={{ borderColor: '#012d1d', color: '#012d1d' }}>
              <span className="text-xl">⛰️</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge2.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-forest">{t('my.badge2.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge2.earnedDate')}</p>
            <span className="text-[9px] bg-paper-high text-forest font-label px-2 py-0.5 rounded-full mt-2">{t('my.badge2.grantedBy')}</span>
          </div>

          {/* Badge Item 3 (Earned) */}
          <div className="bg-white p-4 rounded-2xl border border-paper-high text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-20 h-20 rubber-stamp mb-3">
              <span className="text-xl">🌸</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge3.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-forest">{t('my.badge3.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge3.earnedDate')}</p>
            <span className="text-[9px] bg-paper-high text-forest font-label px-2 py-0.5 rounded-full mt-2">{t('my.badge3.grantedBy')}</span>
          </div>

          {/* Badge Item 4 (Locked) */}
          <div className="bg-white/60 p-4 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
            <div className="w-20 h-20 rubber-stamp locked mb-3">
              <span className="text-xl">🔒</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge4.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-gray-400">{t('my.badge4.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge4.locked')}</p>
          </div>

          {/* Badge Item 5 (Locked) */}
          <div className="bg-white/60 p-4 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
            <div className="w-20 h-20 rubber-stamp locked mb-3">
              <span className="text-xl">🔒</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge5.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-gray-400">{t('my.badge5.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge5.locked')}</p>
          </div>

          {/* Badge Item 6 (Locked) */}
          <div className="bg-white/60 p-4 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
            <div className="w-20 h-20 rubber-stamp locked mb-3">
              <span className="text-xl">🔒</span>
              <span className="text-[9px] font-bold mt-0.5">{t('my.badge6.mountain')}</span>
            </div>
            <h4 className="font-heading font-bold text-xs text-gray-400">{t('my.badge6.name')}</h4>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">{t('my.badge6.locked')}</p>
          </div>
        </div>
      </div>

      {/* My Written Episodes List (UC10/UC11 - 내가 작성한 에피소드 목록) */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-bold text-lg text-forest">{t('my.episodesTitle')}</h3>
            <span className="uc-tag">{t('my.episodesUcTag')}</span>
          </div>
          <span className="font-label text-xs text-gray-500">{t('my.episodesMeta')}</span>
        </div>

        {/* Episodes 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Written Episode Card 1 */}
          <div className="bg-paper-low rounded-2xl p-5 border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center border-b border-gray-200/70 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-forest text-white font-label text-[9px] font-bold px-2 py-0.5 rounded-full">{t('my.episode1.hikeName')}</span>
                  <span className="text-[10px] text-gray-400 font-label">{t('my.episode1.date')}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('common.published')}</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-forest mb-2">{t('my.episode1.title')}</h4>
              
              <div className="flex space-x-3 items-start">
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-sand shadow-sm bg-gray-100 relative">
                  <div className="washi-tape-sm"></div>
                  <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-600 font-body line-clamp-3 leading-relaxed">
                  {t('my.episode1.body')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between">
              <span className="text-[9px] font-label text-gray-400">❤️ {t('my.episode1.likes')}{t('common.count', { count: '' })} • 💬 {t('my.episode1.comments')}{t('common.count', { count: '' })}</span>
              <button
                onClick={() =>
                  onOpenEpisodeModal(
                    t('my.episode1.title'),
                    t('modal.demoData.episodeAuthor'),
                    t('modal.demoData.episodeTime1'),
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900',
                    t('my.episode1.fullContent'),
                  )
                }
                className="bg-forest text-white font-heading font-bold text-[10px] px-3 py-1.5 rounded-full hover:bg-forest-container transition shadow-sm"
              >
                {t('common.viewDetail')}
              </button>
            </div>
          </div>

          {/* Written Episode Card 2 */}
          <div className="bg-paper-low rounded-2xl p-5 border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center border-b border-gray-200/70 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-forest text-white font-label text-[9px] font-bold px-2 py-0.5 rounded-full">{t('my.episode2.hikeName')}</span>
                  <span className="text-[10px] text-gray-400 font-label">{t('my.episode2.date')}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('common.published')}</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-forest mb-2">{t('my.episode2.title')}</h4>
              
              <div className="flex space-x-3 items-start">
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-sand shadow-sm bg-gray-100 relative">
                  <div className="washi-tape-sm"></div>
                  <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-600 font-body line-clamp-3 leading-relaxed">
                  {t('my.episode2.body')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between">
              <span className="text-[9px] font-label text-gray-400">❤️ {t('my.episode2.likes')}{t('common.count', { count: '' })} • 💬 {t('my.episode2.comments')}{t('common.count', { count: '' })}</span>
              <button
                onClick={() =>
                  onOpenEpisodeModal(
                    t('my.episode2.title'),
                    t('modal.demoData.episodeAuthor'),
                    t('modal.demoData.episodeTime2'),
                    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900',
                    t('my.episode2.fullContent'),
                  )
                }
                className="bg-forest text-white font-heading font-bold text-[10px] px-3 py-1.5 rounded-full hover:bg-forest-container transition shadow-sm"
              >
                {t('common.viewDetail')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
