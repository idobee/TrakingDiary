'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-forest border-t border-forest-container text-paper py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2 sm:space-y-2.5">
        {/* 1line: 타이틀 */}
        <p className="font-heading font-extrabold text-sm sm:text-base text-paper tracking-tight">
          {t('footer.title')}
        </p>

        {/* 2line: 개인정보 처리방침 • 서비스 약관 */}
        <div className="flex items-center justify-center space-x-2 text-xs font-label text-sand/80">
          <Link
            href="/privacy"
            className="hover:text-terracotta underline-offset-2 hover:underline transition"
          >
            {t('legal.footerPrivacy')}
          </Link>
          <span>•</span>
          <Link
            href="/terms"
            className="hover:text-terracotta underline-offset-2 hover:underline transition"
          >
            {t('legal.footerTerms')}
          </Link>
        </div>

        {/* 3line: 사업자 정보 및 문의 */}
        <p className="text-[11px] sm:text-xs font-label text-sand/70 leading-relaxed">
          <span>{t('legal.companyInfo.companyName')}</span>
          <span className="mx-1.5 opacity-60">|</span>
          <span>{t('legal.companyInfo.representativeLabel')}</span>
          <span className="mx-1.5 opacity-60">|</span>
          <span>{t('legal.companyInfo.businessNumberLabel')} {t('legal.companyInfo.businessNumber')}</span>
          <span className="ml-2 sm:ml-3">
            {t('legal.contactLabel')}:{' '}
            <a
              href={`mailto:${t('legal.contactEmail')}`}
              className="hover:text-terracotta underline-offset-2 hover:underline transition"
            >
              {t('legal.contactEmail')}
            </a>
          </span>
        </p>

        {/* 4line: 카피라이트 */}
        <p className="text-[10px] sm:text-[11px] font-label text-sand/50">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  )
}
