'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { useAllClubs } from '@/hooks/useAllClubs'

interface ClubsPageProps {
  onOpenClubAdminModal: (clubId: number) => void
  onOpenClubCreateModal: () => void
}

export const ClubsPage: React.FC<ClubsPageProps> = ({
  onOpenClubAdminModal,
  onOpenClubCreateModal,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.system_role === 'admin'
  const { clubs, isLoading, updateClubStatus } = useAllClubs(isAdmin)

  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved')

  const approvedClubs = clubs.filter(c => c.status === 'approved')
  const pendingClubs = clubs.filter(c => c.status === 'pending')

  const [myClubIds, setMyClubIds] = useState<number[]>([])
  
  React.useEffect(() => {
    if (user) {
      const { createClient } = require('@/lib/supabase/client')
      const supabase = createClient()
      supabase.from('club_members')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .then(({ data }: { data: any }) => {
          if (data) setMyClubIds(data.map((d: any) => d.club_id))
        })
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-forest font-heading font-bold animate-pulse">Loading clubs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-md border border-paper-high">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-heading font-extrabold text-2xl text-forest">{t('clubs.sectionTitle')}</h2>
          </div>
          <p className="text-xs text-gray-600 font-body mt-1">
            {t('clubs.sectionDesc')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              onClick={() => setActiveTab(activeTab === 'approved' ? 'pending' : 'approved')}
              className={`font-heading font-bold text-xs px-4 py-2.5 rounded-full transition shadow flex items-center space-x-1.5 border border-sand/30 ${activeTab === 'pending' ? 'bg-forest text-paper' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <span>{activeTab === 'pending' ? t('clubs.toggleApproved') : t('clubs.togglePending')}</span>
              {pendingClubs.length > 0 && activeTab === 'approved' && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pendingClubs.length}</span>
              )}
            </button>
          )}

          <button
            onClick={onOpenClubCreateModal}
            className="bg-terracotta hover:bg-terracotta-dark text-white font-heading font-bold text-xs px-4 py-2.5 rounded-full transition shadow flex items-center space-x-1.5"
          >
            <span>{t('clubs.createBtn')}</span>
          </button>
        </div>
      </div>

      {/* Pending Clubs Grid (Admin Only) */}
      {isAdmin && activeTab === 'pending' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-forest border-b border-gray-200 pb-2">{t('clubs.pendingTitle', { count: pendingClubs.length })}</h3>
          {pendingClubs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 font-body text-sm border border-paper-high">
              {t('clubs.pendingEmpty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pendingClubs.map(club => (
                <div key={club.id} className="bg-orange-50/50 rounded-2xl p-6 shadow-md border border-orange-200 flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">{t('clubs.pendingBadge')}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-3 pt-2">
                      <div className="w-12 h-12 rounded-full bg-forest text-white font-heading font-bold text-xl flex items-center justify-center shadow">
                        🏕️
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-forest">{club.name}</h3>
                        <div className="flex items-center space-x-2">
                          <p className="text-[11px] text-gray-500 font-label">{t('clubs.pendingDate', { date: new Date(club.created_at).toLocaleDateString() })}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 p-3 rounded-xl border border-orange-200/50 space-y-1 mb-2">
                      <p className="text-xs text-forest font-bold">{t('clubs.pendingApplicant')} <span className="font-normal text-gray-700">{club.applicant_name || club.users?.nickname || 'Unknown'} </span></p>
                      {club.contact_phone && (
                        <p className="text-xs text-forest font-bold">{t('clubs.pendingContact')} <span className="font-normal text-gray-700">{club.contact_phone}</span></p>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 font-body leading-relaxed line-clamp-3">
                      {club.description}
                    </p>
                  </div>
                  <div className="flex space-x-2 pt-3 border-t border-orange-200/50">
                    <button
                      onClick={() => updateClubStatus(club.id, 'rejected')}
                      className="flex-1 bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 font-heading font-bold text-xs py-2 rounded-xl transition"
                    >
                      {t('clubs.pendingReject')}
                    </button>
                    <button
                      onClick={() => updateClubStatus(club.id, 'approved')}
                      className="flex-1 bg-forest hover:bg-forest-light text-white shadow-md font-heading font-bold text-xs py-2 rounded-xl transition"
                    >
                      {t('clubs.pendingApprove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Club Cards Grid */}
      {activeTab === 'approved' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedClubs.map(club => (
            <div key={club.id} className="bg-white rounded-2xl p-6 shadow-md border border-paper-high flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-end mb-3 h-6">
                  {user?.id === club.owner_id && (
                    <span className="bg-emerald-100 text-emerald-800 font-label text-[10px] px-2 py-0.5 rounded font-bold">{t('clubs.ownerBadge')}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-forest text-white font-heading font-bold text-xl flex items-center justify-center shadow">
                    🏕️
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-forest">{club.name}</h3>
                    <p className="text-[11px] text-gray-500 font-label">{t('clubs.since', { year: new Date(club.created_at).getFullYear() })}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-body leading-relaxed line-clamp-3">
                  {club.description}
                </p>
              </div>

              {(user?.id === club.owner_id || myClubIds.includes(club.id) || isAdmin) && (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onOpenClubAdminModal(club.id)}
                    className="w-full bg-paper-high hover:bg-forest hover:text-white text-forest font-heading font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <span>{user?.id === club.owner_id || isAdmin ? t('clubs.openAdminCenter') : t('clubs.openClub')}</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Create Card Placeholder */}
          <div
            onClick={onOpenClubCreateModal}
            className="bg-white rounded-2xl p-6 shadow-md border border-paper-high flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 hover:opacity-100 transition">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 font-heading font-bold text-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                +
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest">{t('clubs.createCardTitle')}</h3>
                <p className="text-xs text-gray-500 font-body mt-1">{t('clubs.createCardDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
