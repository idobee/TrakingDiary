'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useHikes } from '@/hooks/useHikes'

interface DiariesPageProps {
  clubId: number | null
  clubName?: string
  onOpenDiaryDetail: (hikeId: number) => void
}

export const DiariesPage: React.FC<DiariesPageProps> = ({ clubId, clubName, onOpenDiaryDetail }) => {
  const { t } = useTranslation()
  const { hikes, isLoading } = useHikes(clubId || undefined)

  const completedHikes = hikes // 완주하지 않아도 모든 일정을 앨범에 표시

  // Covers predefined colors for books
  const bookGradients = [
    'from-[#0a3a27] via-[#012d1d] to-[#001c12]', // Emerald
    'from-[#802410] via-[#500c00] to-[#360600]', // Terracotta
    'from-[#192b4d] via-[#0b172a] to-[#040914]', // Navy
    'from-[#4d3a19] via-[#2a1d0b] to-[#140d04]', // Bronze
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-forest text-paper p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-forest-container">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terracotta text-white text-[11px] font-label font-bold px-3 py-1 rounded-full uppercase">{t('diaries.badgeLabel')}</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl mt-2">{t('diaries.sectionTitle')}</h2>
          <p className="text-xs text-paper/80 font-body mt-1">{t('diaries.sectionDesc')}</p>
        </div>
        <div className="bg-paper-low/10 border border-sand/30 px-4 py-2 rounded-xl text-[11px] font-label text-sand flex items-center space-x-1.5">
          <span>{t('diaries.tipText')}</span>
        </div>
      </div>

      {/* Real Wooden Bookshelf Frame Container */}
      <div className="bg-[#2a170a] p-6 sm:p-8 rounded-3xl border-4 border-[#1a0e05] shadow-2xl space-y-6 relative overflow-hidden">
        {/* Bookshelf Top Brass Header Plate */}
        <div className="flex justify-between items-center border-b-2 border-[#5c3718] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-700/60 border border-amber-400/40 text-amber-200 flex items-center justify-center font-heading font-bold text-sm shadow">🏛️</div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-amber-100 tracking-wide">{clubName ? `${clubName} 앨범` : t('diaries.shelfHeader')}</h3>
              <p className="text-[10px] text-amber-300/70 font-label">{t('diaries.shelfMeta')}</p>
            </div>
          </div>
          <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 font-label text-[10px] font-bold px-3 py-1 rounded-full shadow">
            {t('diaries.shelfSeasonBadge')}
          </span>
        </div>

        {isLoading ? (
          <div className="text-amber-200/50 text-center py-10 font-body">앨범을 불러오는 중입니다...</div>
        ) : completedHikes.length === 0 ? (
          <div className="text-amber-200/50 text-center py-10 font-body">아직 완성된 트레킹 앨범이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-2">
            {completedHikes.map((hike, index) => {
              const bgGradient = bookGradients[index % bookGradients.length]
              return (
                <div
                  key={hike.id}
                  onClick={() => onOpenDiaryDetail(hike.id)}
                  className={`hardcover-book bg-gradient-to-br ${bgGradient} p-6 text-paper flex flex-col justify-between h-80 group cursor-pointer`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-sand/30 pb-2">
                      <span className="font-label text-xs text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">Vol {index + 1}</span>
                      <span className="text-xs text-amber-200">단행본</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] font-label text-sand/70 block uppercase tracking-wider">{t('common.scrapbookHardcover')}</span>
                      <h3 className="font-heading font-extrabold text-xl text-amber-100 group-hover:text-white transition mt-1 leading-snug">
                        {hike.title}
                      </h3>
                      <p className="text-[11px] text-sand/80 font-body mt-2">{hike.mountain_name} • {new Date(hike.hike_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 bg-black/30 rounded-xl border border-sand/20 text-[10px] text-amber-100/90 font-body line-clamp-2 italic">
                      {hike.description}
                    </div>
                    <div className="pt-2 border-t border-sand/20 flex justify-between items-center text-[10px] font-label text-amber-300">
                      <span className="font-bold">{hike.mountain_name}</span>
                      <span className="bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full shadow text-[9px] group-hover:bg-white transition">{t('common.openBook')}</span>
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
