'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'

interface ClubsPageProps {
  onOpenClubAdminModal: () => void
  onOpenClubCreateModal: () => void
}

export const ClubsPage: React.FC<ClubsPageProps> = ({
  onOpenClubAdminModal,
  onOpenClubCreateModal,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-md border border-paper-high">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-heading font-extrabold text-2xl text-forest">{t('clubs.sectionTitle')}</h2>
            <span className="uc-tag">{t('clubs.ucTag')}</span>
          </div>
          <p className="text-xs text-gray-600 font-body mt-1">
            {t('clubs.sectionDesc')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenClubAdminModal}
            className="bg-forest hover:bg-forest-light text-paper font-heading font-bold text-xs px-4 py-2.5 rounded-full transition shadow flex items-center space-x-1.5 border border-sand/30"
          >
            <span>{t('clubs.adminBtn')}</span>
          </button>

          <button
            onClick={onOpenClubCreateModal}
            className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-4 py-2.5 rounded-full transition shadow flex items-center space-x-1.5"
          >
            <span>{t('clubs.createBtn')}</span>
          </button>
        </div>
      </div>

      {/* Club Cards Grid (UC14 동호회현황) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Club Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-forest text-white font-label text-[10px] px-2.5 py-1 rounded-full font-bold">{t('clubs.club1.category')}</span>
              <span className="bg-emerald-100 text-emerald-800 font-label text-[10px] px-2 py-0.5 rounded font-bold">{t('clubs.club1.role')}</span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-forest text-white font-heading font-bold text-xl flex items-center justify-center shadow">🌲</div>
              <div>
                <h3 className="font-heading font-bold text-lg text-forest">{t('clubs.club1.name')}</h3>
                <p className="text-[11px] text-gray-500 font-label">{t('clubs.club1.meta')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-body leading-relaxed">
              {t('clubs.club1.desc')}
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100">
            <button
              onClick={onOpenClubAdminModal}
              className="w-full bg-paper-high hover:bg-forest hover:text-white text-forest font-heading font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>{t('clubs.openAdminCenter')}</span>
            </button>
          </div>
        </div>

        {/* Club Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-forest text-white font-label text-[10px] px-2.5 py-1 rounded-full font-bold">{t('clubs.club2.category')}</span>
              <span className="bg-blue-100 text-blue-800 font-label text-[10px] px-2 py-0.5 rounded font-bold">{t('clubs.club2.role')}</span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-terracotta text-white font-heading font-bold text-xl flex items-center justify-center shadow">⛰️</div>
              <div>
                <h3 className="font-heading font-bold text-lg text-forest">{t('clubs.club2.name')}</h3>
                <p className="text-[11px] text-gray-500 font-label">{t('clubs.club2.meta')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-body leading-relaxed">
              {t('clubs.club2.desc')}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-label text-gray-500">
            <span>{t('clubs.club2.founder')}</span>
            <span className="text-forest font-bold">{t('clubs.club2.status')}</span>
          </div>
        </div>

        {/* Club Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-forest text-white font-label text-[10px] px-2.5 py-1 rounded-full font-bold">{t('clubs.club3.category')}</span>
              <span className="bg-amber-100 text-amber-800 font-label text-[10px] px-2 py-0.5 rounded font-bold">{t('clubs.club3.role')}</span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-heading font-bold text-xl flex items-center justify-center shadow">👟</div>
              <div>
                <h3 className="font-heading font-bold text-lg text-forest">{t('clubs.club3.name')}</h3>
                <p className="text-[11px] text-gray-500 font-label">{t('clubs.club3.meta')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-body leading-relaxed">
              {t('clubs.club3.desc')}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-label text-gray-500">
            <span>{t('clubs.club3.waitingLabel')}</span>
            <span className="text-amber-600 font-bold">{t('clubs.club3.status')}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
