import React from 'react'
import { useTranslation } from '@/lib/i18n'

interface IntroPageProps {
  onNavigateTab?: (tab: string) => void
}

export const IntroPage: React.FC<IntroPageProps> = ({ onNavigateTab }) => {
  const { t } = useTranslation()

  const handleCardClick = (tab: string) => {
    if (onNavigateTab) {
      if (tab === 'episode_modal') {
        alert("에피소드 AI 감성 윤색 기능은 일기 상세 페이지에서 제공됩니다!");
      } else {
        onNavigateTab(tab);
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center space-y-4 py-12">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest">{t('intro.heroTitle')}</h1>
        <p className="text-gray-500 font-body text-base max-w-2xl mx-auto leading-relaxed">
          {t('intro.heroDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Feature 1 */}
        <div 
          onClick={() => handleCardClick('clubs')}
          className="bg-white p-8 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition cursor-pointer hover:border-forest-surface"
        >
          <div className="w-14 h-14 bg-forest text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
            🧑‍🤝‍🧑
          </div>
          <h3 className="font-heading font-bold text-xl text-forest mb-4">{t('intro.feature1.title')}</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-body leading-relaxed list-disc list-inside">
            <li>{t('intro.feature1.desc1')}</li>
            <li>{t('intro.feature1.desc2')}</li>
            <li>{t('intro.feature1.desc3')}</li>
          </ul>
        </div>

        {/* Feature 2 */}
        <div 
          onClick={() => handleCardClick('hikes')}
          className="bg-white p-8 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition cursor-pointer hover:border-terracotta/40"
        >
          <div className="w-14 h-14 bg-terracotta text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
            📅
          </div>
          <h3 className="font-heading font-bold text-xl text-forest mb-4">{t('intro.feature2.title')}</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-body leading-relaxed list-disc list-inside">
            <li>{t('intro.feature2.desc1')}</li>
            <li>{t('intro.feature2.desc2')}</li>
            <li>{t('intro.feature2.desc3')}</li>
            <li>{t('intro.feature2.desc4')}</li>
          </ul>
        </div>

        {/* Feature 3 */}
        <div 
          onClick={() => handleCardClick('gallery')}
          className="bg-white p-8 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition cursor-pointer hover:border-amber-500/40"
        >
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
            ☁️
          </div>
          <h3 className="font-heading font-bold text-xl text-forest mb-4">{t('intro.feature3.title')}</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-body leading-relaxed list-disc list-inside">
            <li>{t('intro.feature3.desc1')}</li>
            <li>{t('intro.feature3.desc2')}</li>
            <li>{t('intro.feature3.desc3')}</li>
          </ul>
        </div>

        {/* Feature 4 */}
        <div 
          onClick={() => handleCardClick('episode_modal')}
          className="bg-white p-8 rounded-3xl border border-paper-high shadow-sm hover:shadow-md transition cursor-pointer hover:border-emerald-600/40"
        >
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
            🤖
          </div>
          <h3 className="font-heading font-bold text-xl text-forest mb-4">{t('intro.feature4.title')}</h3>
          <ul className="space-y-2 text-sm text-gray-600 font-body leading-relaxed list-disc list-inside">
            <li>{t('intro.feature4.desc1')}</li>
            <li>{t('intro.feature4.desc2')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

