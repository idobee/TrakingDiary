'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import koMessages from '@/locales/ko.json'
import enMessages from '@/locales/en.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Locale = 'ko' | 'en'

type Messages = Record<string, unknown>

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// ---------------------------------------------------------------------------
// Message Map
// ---------------------------------------------------------------------------
const messagesMap: Record<Locale, Messages> = {
  ko: koMessages as unknown as Messages,
  en: enMessages as unknown as Messages,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * dot-notation 키("header.tabs.dashboard")를 사용하여 중첩 JSON 값에 접근합니다.
 * 키가 없으면 키 문자열 자체를 반환합니다.
 */
function getNestedValue(obj: Messages, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj

  for (const k of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path // fallback: return the key itself
    }
    current = (current as Record<string, unknown>)[k]
  }

  if (typeof current === 'string') {
    return current
  }

  return path // fallback
}

/**
 * 문자열 내의 {{variable}} 패턴을 params 값으로 치환합니다.
 * 예: "{{count}}건 모집중", { count: 3 } → "3건 모집중"
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`
  })
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const I18nContext = createContext<I18nContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface I18nProviderProps {
  defaultLocale?: Locale
  children: React.ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  defaultLocale = 'ko',
  children,
}) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const raw = getNestedValue(messagesMap[locale], key)
      return interpolate(raw, params)
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * 모든 컴포넌트에서 사용할 수 있는 다국어 번역 훅.
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale } = useTranslation()
 * <h1>{t('header.appTitle')}</h1>
 * <span>{t('dashboard.metricsUpcomingValue', { count: 3 })}</span>
 * ```
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error(
      'useTranslation() must be used within an <I18nProvider>. ' +
        'Ensure <I18nProvider> wraps your component tree in layout.tsx.',
    )
  }
  return context
}

// ---------------------------------------------------------------------------
// LanguageSwitcher Component
// ---------------------------------------------------------------------------

/**
 * 🇰🇷/🇺🇸 토글 버튼. Header에 배치하여 실시간 언어 전환을 제공합니다.
 */
export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation()

  const toggleLocale = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko')
  }

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center space-x-1.5 bg-forest-container hover:bg-forest-surface px-3 py-1.5 rounded-full border border-sand/30 transition shadow-sm text-xs font-label font-bold text-paper"
      aria-label="Switch language"
      title={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <span className="text-sm">{locale === 'ko' ? '🇰🇷' : '🇺🇸'}</span>
      <span>{locale === 'ko' ? '한국어' : 'English'}</span>
      <span className="opacity-60">→</span>
      <span className="text-sm">{locale === 'ko' ? '🇺🇸' : '🇰🇷'}</span>
    </button>
  )
}
