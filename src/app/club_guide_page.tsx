'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'

interface ClubGuidePageProps {
  onNavigateTab: (tab: string) => void
}

export const ClubGuidePage: React.FC<ClubGuidePageProps> = ({ onNavigateTab }) => {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-md border border-paper-high mt-4 mb-12">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest">{t('clubGuide.title')}</h2>
      </div>

      <div className="space-y-6 font-body text-gray-700 leading-relaxed text-lg">
        <div className="flex items-start space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 text-lg">1</div>
          <p className="mt-1.5">{t('clubGuide.step1')}</p>
        </div>
        <div className="flex items-start space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 text-lg">2</div>
          <p className="mt-1.5">{t('clubGuide.step2')}</p>
        </div>
        <div className="flex items-start space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 text-lg">3</div>
          <p className="mt-1.5">{t('clubGuide.step3')}</p>
        </div>
        <div className="flex items-start space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 text-lg">4</div>
          <p className="mt-1.5">{t('clubGuide.step4')}</p>
        </div>
        <div className="flex items-start space-x-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold shrink-0 text-lg">5</div>
          <p className="mt-1.5">{t('clubGuide.step5')}</p>
        </div>
      </div>

      <div className="pt-10 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => onNavigateTab('clubs')}
          className="bg-forest hover:bg-forest-light text-white font-heading font-bold px-8 py-4 rounded-full transition shadow-lg text-center"
        >
          {t('clubGuide.linkLounge')}
        </button>
        <button
          onClick={() => onNavigateTab('diaries')}
          className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold px-8 py-4 rounded-full transition shadow-lg text-center"
        >
          {t('clubGuide.linkDiaries')}
        </button>
      </div>
    </div>
  )
}
