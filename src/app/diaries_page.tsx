'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useHikes } from '@/hooks/useHikes'
import { isLightningHike, getHikeBookGradient } from '@/lib/hikes'

interface DiariesPageProps {
  clubId: number | null
  clubName?: string
  onOpenDiaryDetail: (hikeId: number) => void
}

export const DiariesPage: React.FC<DiariesPageProps> = ({ clubId, clubName, onOpenDiaryDetail }) => {
  const { t } = useTranslation()
  const { hikes, isLoading } = useHikes(clubId || undefined)
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'lightning'>('all')

  const completedHikes = hikes // 완주하지 않아도 모든 일정을 앨범에 표시

  const regularCount = completedHikes.filter((h) => !isLightningHike(h)).length
  const lightningCount = completedHikes.filter((h) => isLightningHike(h)).length

  const filteredHikes = completedHikes.filter((hike) => {
    if (filterType === 'all') return true
    const isLightning = isLightningHike(hike)
    return filterType === 'lightning' ? isLightning : !isLightning
  })

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-forest text-paper p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-forest-container">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terracotta text-white text-[11px] font-label font-bold px-3 py-1 rounded-full uppercase">{t('diaries.badgeLabel')}</span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[11px] font-label font-semibold px-2.5 py-0.5 rounded-full">
              👑 {t('diaries.regularBadge')} & ⚡ {t('diaries.lightningBadge')}
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl mt-2">{t('diaries.sectionTitle')}</h2>
          <p className="text-xs text-paper/80 font-body mt-1">{t('diaries.sectionDesc')}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2.5 flex-shrink-0">
          <a
            href="/guide.html#diaries"
            target="_blank"
            rel="noopener noreferrer"
            title="기억의 서가 사용법 가이드"
            className="inline-flex items-center justify-center gap-1.5 w-7 h-7 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-heading font-extrabold text-xs shadow-md border border-amber-200 transition transform hover:scale-105 self-end"
          >
            <span className="w-4 h-4 rounded-full bg-stone-900 text-amber-300 text-[10px] flex items-center justify-center font-bold flex-shrink-0">?</span>
            <span className="hidden sm:inline">사용법</span>
          </a>
          <div className="bg-paper-low/10 border border-sand/30 px-4 py-2 rounded-xl text-[11px] font-label text-sand flex items-center space-x-1.5">
            <span>{t('diaries.tipText')}</span>
          </div>
        </div>
      </div>

      {/* Real Wooden Bookshelf Frame Container */}
      <div className="bg-[#2a170a] p-5 sm:p-8 rounded-3xl border-4 border-[#1a0e05] shadow-2xl space-y-6 relative overflow-hidden">
        {/* Bookshelf Top Brass Header Plate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#5c3718] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-700/60 border border-amber-400/40 text-amber-200 flex items-center justify-center font-heading font-bold text-base shadow">🏛️</div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-amber-100 tracking-wide">{clubName ? `${clubName} 앨범` : t('diaries.shelfHeader')}</h3>
              <p className="text-[10px] text-amber-300/70 font-label">{t('diaries.shelfMeta')}</p>
            </div>
          </div>

          {/* Regular / Lightning Filter Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-[#170c04]/80 p-1.5 rounded-2xl border border-[#5c3718] shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition ${
                filterType === 'all'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
              }`}
            >
              {t('diaries.filterAll')} ({completedHikes.length})
            </button>
            <button
              onClick={() => setFilterType('regular')}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition flex items-center gap-1 ${
                filterType === 'regular'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md scale-105 border border-amber-300'
                  : 'text-amber-300/80 hover:text-amber-100 hover:bg-white/5'
              }`}
            >
              <span>👑 {t('diaries.filterRegular')}</span>
              <span className="text-[10px] opacity-80">({regularCount})</span>
            </button>
            <button
              onClick={() => setFilterType('lightning')}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition flex items-center gap-1 ${
                filterType === 'lightning'
                  ? 'bg-teal-400 text-stone-950 shadow-md scale-105 border border-teal-200'
                  : 'text-teal-200/80 hover:text-teal-100 hover:bg-white/5'
              }`}
            >
              <span>⚡ {t('diaries.filterLightning')}</span>
              <span className="text-[10px] opacity-80">({lightningCount})</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-amber-200/50 text-center py-12 font-body animate-pulse">앨범을 불러오는 중입니다...</div>
        ) : filteredHikes.length === 0 ? (
          <div className="text-amber-200/60 text-center py-14 font-body space-y-2">
            <p className="text-2xl">📚</p>
            <p className="text-sm font-semibold">{t('diaries.emptyFiltered')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-2">
            {filteredHikes.map((hike, index) => {
              const isLightning = isLightningHike(hike)
              const bgGradient = getHikeBookGradient(hike, index)
              const difficultyLabel =
                hike.difficulty === 'easy'
                  ? t('hikes.diffEasy')
                  : hike.difficulty === 'hard'
                  ? t('hikes.diffHard')
                  : hike.difficulty === 'expert'
                  ? t('hikes.diffExpert')
                  : t('hikes.diffMedium')

              return (
                <div
                  key={hike.id}
                  onClick={() => onOpenDiaryDetail(hike.id)}
                  className={`hardcover-book ${
                    isLightning ? 'book-lightning' : 'book-regular'
                  } bg-gradient-to-br ${bgGradient} p-5 sm:p-6 text-paper flex flex-col justify-between h-64 sm:h-84 group cursor-pointer relative overflow-hidden`}
                >
                  {/* Header: Volume Tag & Meetup Type Badge */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="font-label text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/95 text-stone-900 shadow-sm flex items-center gap-1">
                        {isLightning ? '⚡' : '👑'} Vol {index + 1}
                      </span>
                      <span className="text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {isLightning ? t('diaries.lightningBadge') : t('diaries.regularBadge')}
                      </span>
                    </div>

                    <div className="pt-1.5">
                      <h3 className="font-heading font-extrabold text-base sm:text-xl text-white group-hover:text-amber-100 transition mt-1 leading-tight sm:leading-snug line-clamp-2 drop-shadow-sm">
                        {hike.title}
                      </h3>
                      <p className="text-xs font-body mt-2 flex items-center gap-1.5 text-white/90 font-medium">
                        <span>⛰️ {hike.mountain_name}</span>
                        <span>•</span>
                        <span>📅 {new Date(hike.hike_date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Description Snippet & Open Action */}
                  <div className="space-y-2.5 sm:space-y-3 relative z-10">
                    <div className="p-2.5 rounded-xl bg-black/25 border border-white/20 text-[11px] text-white/95 font-body line-clamp-2 italic">
                      {hike.description || '산행 추억과 에피소드가 담겨 있는 앨범입니다.'}
                    </div>
                    <div className="pt-2.5 border-t border-white/25 flex justify-between items-center text-white">
                      <span className="font-heading font-extrabold text-xs sm:text-sm flex items-center gap-2 tracking-tight drop-shadow-sm">
                        <span className="bg-white/20 px-2 py-0.5 rounded-md border border-white/25">
                          {isLightning ? `⚡ ${t('hikes.typeLightningShort')}` : `👑 ${t('hikes.typeRegularShort')}`}
                        </span>
                        <span className="bg-black/25 px-2 py-0.5 rounded-md border border-white/20">
                          {t('hikes.difficulty')}: {difficultyLabel}
                        </span>
                      </span>
                      <button className="font-heading font-extrabold px-3 py-1 rounded-full shadow text-xs transition bg-white text-stone-900 group-hover:bg-amber-200 group-hover:scale-105">
                        {t('common.openBook')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Realistic 3D Wooden Shelf Ledge Bar */}
        <div className="wooden-shelf-ledge h-10 w-full rounded-xl flex items-center justify-between px-6 shadow-inner">
          <span className="font-label text-[10px] text-amber-200/80 font-bold">{t('diaries.shelfLedgeLabel')}</span>
          <span className="font-label text-[10px] text-amber-200/80">{t('diaries.shelfLedgeHint')}</span>
        </div>

      </div>
    </div>
  )
}
