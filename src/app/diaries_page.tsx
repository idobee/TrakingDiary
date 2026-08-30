'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'

interface DiariesPageProps {
  onOpenDiaryDetail: (title: string) => void
}

export const DiariesPage: React.FC<DiariesPageProps> = ({ onOpenDiaryDetail }) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-forest text-paper p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-forest-container">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terracotta text-white text-[11px] font-label font-bold px-3 py-1 rounded-full uppercase">{t('diaries.badgeLabel')}</span>
            <span className="uc-tag">{t('diaries.ucTag')}</span>
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
              <h3 className="font-heading font-extrabold text-lg text-amber-100 tracking-wide">{t('diaries.shelfHeader')}</h3>
              <p className="text-[10px] text-amber-300/70 font-label">{t('diaries.shelfMeta')}</p>
            </div>
          </div>
          <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 font-label text-[10px] font-bold px-3 py-1 rounded-full shadow">
            {t('diaries.shelfSeasonBadge')}
          </span>
        </div>

        {/* 3D Books Grid Standing on Shelf */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-2">
          
          {/* Hardcover Book 1 (Emerald Leather Cover - Vol 12) */}
          <div
            onClick={() => onOpenDiaryDetail(t('diaries.book1.label'))}
            className="hardcover-book bg-gradient-to-br from-[#0a3a27] via-[#012d1d] to-[#001c12] p-6 text-paper flex flex-col justify-between h-80 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-sand/30 pb-2">
                <span className="font-label text-xs text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">{t('diaries.book1.vol')}</span>
                <span className="text-xs text-amber-200">{t('diaries.book1.type')}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-label text-sand/70 block uppercase tracking-wider">{t('common.scrapbookHardcover')}</span>
                <h3 className="font-heading font-extrabold text-xl text-amber-100 group-hover:text-white transition mt-1 leading-snug">
                  {t('diaries.book1.titleLine1')}<br />{t('diaries.book1.titleLine2')}
                </h3>
                <p className="text-[11px] text-sand/80 font-body mt-2">{t('diaries.book1.meta')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-black/30 rounded-xl border border-sand/20 text-[10px] text-amber-100/90 font-body line-clamp-2 italic">
                {t('diaries.book1.quote')}
              </div>
              <div className="pt-2 border-t border-sand/20 flex justify-between items-center text-[10px] font-label text-amber-300">
                <span className="font-bold">{t('diaries.book1.label')}</span>
                <span className="bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full shadow text-[9px] group-hover:bg-white transition">{t('common.openBook')}</span>
              </div>
            </div>
          </div>

          {/* Hardcover Book 2 (Terracotta Leather Cover - Vol 11) */}
          <div
            onClick={() => onOpenDiaryDetail(t('diaries.book2.label'))}
            className="hardcover-book bg-gradient-to-br from-[#802410] via-[#500c00] to-[#360600] p-6 text-paper flex flex-col justify-between h-80 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-sand/30 pb-2">
                <span className="font-label text-xs text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">{t('diaries.book2.vol')}</span>
                <span className="text-xs text-amber-200">{t('diaries.book2.type')}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-label text-sand/70 block uppercase tracking-wider">{t('common.scrapbookHardcover')}</span>
                <h3 className="font-heading font-extrabold text-xl text-amber-100 group-hover:text-white transition mt-1 leading-snug">
                  {t('diaries.book2.titleLine1')}<br />{t('diaries.book2.titleLine2')}
                </h3>
                <p className="text-[11px] text-sand/80 font-body mt-2">{t('diaries.book2.meta')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-black/30 rounded-xl border border-sand/20 text-[10px] text-amber-100/90 font-body line-clamp-2 italic">
                {t('diaries.book2.quote')}
              </div>
              <div className="pt-2 border-t border-sand/20 flex justify-between items-center text-[10px] font-label text-amber-300">
                <span className="font-bold">{t('diaries.book2.label')}</span>
                <span className="bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full shadow text-[9px] group-hover:bg-white transition">{t('common.openBook')}</span>
              </div>
            </div>
          </div>

          {/* Hardcover Book 3 (Mahogany Oak Cover - Vol 10) */}
          <div
            onClick={() => onOpenDiaryDetail(t('diaries.book3.label'))}
            className="hardcover-book bg-gradient-to-br from-[#2d3a2f] via-[#152417] to-[#0a140b] p-6 text-paper flex flex-col justify-between h-80 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-sand/30 pb-2">
                <span className="font-label text-xs text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">{t('diaries.book3.vol')}</span>
                <span className="text-xs text-amber-200">{t('diaries.book3.type')}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-label text-sand/70 block uppercase tracking-wider">{t('common.scrapbookHardcover')}</span>
                <h3 className="font-heading font-extrabold text-xl text-amber-100 group-hover:text-white transition mt-1 leading-snug">
                  {t('diaries.book3.titleLine1')}<br />{t('diaries.book3.titleLine2')}
                </h3>
                <p className="text-[11px] text-sand/80 font-body mt-2">{t('diaries.book3.meta')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-black/30 rounded-xl border border-sand/20 text-[10px] text-amber-100/90 font-body line-clamp-2 italic">
                {t('diaries.book3.quote')}
              </div>
              <div className="pt-2 border-t border-sand/20 flex justify-between items-center text-[10px] font-label text-amber-300">
                <span className="font-bold">{t('diaries.book3.label')}</span>
                <span className="bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full shadow text-[9px] group-hover:bg-white transition">{t('common.openBook')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Realistic 3D Wooden Shelf Ledge Bar */}
        <div className="wooden-shelf-ledge h-10 w-full rounded-xl flex items-center justify-between px-6 shadow-inner">
          <span className="font-label text-[10px] text-amber-200/80 font-bold">{t('diaries.shelfLedgeLabel')}</span>
          <span className="font-label text-[10px] text-amber-200/80">{t('diaries.shelfLedgeHint')}</span>
        </div>

      </div>
    </div>
  )
}
