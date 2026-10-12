'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-forest border-t border-forest-container text-paper py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center text-white text-xs font-bold">⛰️</div>
          <h3 className="font-heading font-extrabold text-base text-paper">{t('footer.title')}</h3>
        </div>
        <p className="text-xs text-sand/80 font-body">
          {t('footer.description')}
        </p>
        <div className="flex items-center justify-center space-x-3 text-[10px] font-label text-sand/60">
          <span>{t('footer.specCompliance')}</span>
          <span>•</span>
          <span>{t('footer.driveApi')}</span>
          <span>•</span>
          <span>{t('footer.geminiAi')}</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-[11px] font-label text-sand/80">
          <a href="/privacy" className="hover:text-terracotta underline-offset-2 hover:underline transition">{t('legal.footerPrivacy')}</a>
          <span>•</span>
          <a href="/terms" className="hover:text-terracotta underline-offset-2 hover:underline transition">{t('legal.footerTerms')}</a>
        </div>

        {/* 법적 고지 및 사업자 정보 */}
        <div className="pt-3 border-t border-forest-container/50 text-[11px] font-label text-sand/70 space-y-1">
          <p>
            {t('legal.companyInfo.companyName')} | {t('legal.companyInfo.representativeLabel')}{t('legal.companyInfo.representative')} | {t('legal.companyInfo.businessNumberLabel')}<span className="font-semibold text-sand">{t('legal.companyInfo.businessNumber')}</span>
          </p>
          <p>
            {t('legal.contactLabel')}: {t('legal.contactEmail')}
          </p>
          <p className="text-[10px] text-sand/50 pt-1">
            © 2026 HAPPIC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
