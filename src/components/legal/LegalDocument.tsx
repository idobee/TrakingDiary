'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useTranslation, LanguageSwitcher } from '@/lib/i18n'
import { Footer } from '@/components/ui/Footer'

type LegalDocumentType = 'privacy' | 'terms'

const SECTION_COUNT = 10

export const LegalDocument: React.FC<{ type: LegalDocumentType }> = ({ type }) => {
  const { t } = useTranslation()

  const title = t(`legal.${type}.title`)

  useEffect(() => {
    document.title = `${title} • ${t('header.appTitle')}`
  }, [title, t])

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-forest text-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-sm hover:text-terracotta transition">
            {t('legal.backHome')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <article className="bg-white rounded-3xl border border-sand shadow-sm p-6 sm:p-10 space-y-8">
          <div className="space-y-3 border-b border-gray-200 pb-6">
            <h1 className="font-heading font-extrabold text-3xl text-forest">{title}</h1>
            <p className="text-xs text-gray-500 font-label">{t('legal.effectiveDate')}</p>
            <p className="text-sm text-gray-700 font-body leading-relaxed">{t(`legal.${type}.intro`)}</p>
          </div>

          {Array.from({ length: SECTION_COUNT }, (_, i) => i + 1).map((n) => (
            <section key={n} className="space-y-2">
              <h2 className="font-heading font-bold text-lg text-forest">{t(`legal.${type}.sec${n}Title`)}</h2>
              <p className="text-sm text-gray-700 font-body leading-relaxed whitespace-pre-line break-words">
                {t(`legal.${type}.sec${n}Body`)}
              </p>
            </section>
          ))}

          <p className="text-sm font-body text-gray-700 border-t border-gray-200 pt-6">
            {t('legal.contactLabel')}:{' '}
            <a href={`mailto:${t('legal.contactEmail')}`} className="text-terracotta font-bold hover:underline">
              {t('legal.contactEmail')}
            </a>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
