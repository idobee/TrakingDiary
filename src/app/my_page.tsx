'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useMyTrekking, Activity, BadgeItem, MyEpisode } from '@/hooks/useMyTrekking'
import { createClient } from '@/lib/supabase/client'

interface MyPageProps {
  user?: any
  onOpenEpisodeModal: (title: string, author: string, date: string, photo: string, content: string) => void
  onOpenBadgeGrantModal: (name: string) => void
}

export const MyPage: React.FC<MyPageProps> = ({
  user,
  onOpenEpisodeModal,
  onOpenBadgeGrantModal,
}) => {
  const { t } = useTranslation()
  const { activities, badges, episodes, isLoading, refetch } = useMyTrekking(user?.id)

  const earnedBadgesCount = badges.filter(b => !b.isLocked).length

  // Edit Episode State
  const [editingEpisode, setEditingEpisode] = useState<MyEpisode | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleUpdateEpisode = async () => {
    if (!editingEpisode) return
    setIsUpdating(true)
    try {
      const { error } = await supabase.from('episodes').update({
        title: editTitle,
        content: editContent,
      }).eq('id', editingEpisode.id)
      
      if (error) throw error
      setEditingEpisode(null)
      refetch()
    } catch (err) {
      console.error(err)
      alert('에피소드 수정에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteEpisode = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      const { error } = await supabase.from('episodes').delete().eq('id', id)
      if (error) throw error
      refetch()
    } catch (err) {
      console.error(err)
      alert('에피소드 삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-md border border-paper-high">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-heading font-extrabold text-2xl text-forest">{t('my.sectionTitle')}</h2>
          </div>
          <p className="text-xs text-gray-600 font-body mt-1">{t('my.sectionDesc')}</p>
        </div>
      </div>

      {/* Top Split Layout: Activities (Left 2/3) + Badges (Right 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Activity Grid (UC13 활동기록) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-lg text-forest">{t('my.activityTitle')}</h3>
              <span className="uc-tag">{t('my.activityUcTag')}</span>
            </div>
            <span className="font-label text-xs text-gray-500">{t('my.activityMeta')}</span>
          </div>

          {activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="p-5 bg-paper-low rounded-2xl border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-forest text-white text-[10px] font-label font-bold px-2.5 py-0.5 rounded-full">
                      {new Date(activity.hikeDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-label text-gray-400">{activity.mountainName}</span>
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-forest flex items-center space-x-1.5">
                    <span>⛰️</span>
                    <span>{activity.title}</span>
                  </h4>
                  <p className="text-xs text-gray-500 font-body mt-1 line-clamp-2">{activity.description}</p>
                </div>

                {/* Earned Badge Display */}
                {activity.earnedBadge && (
                  <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center font-heading font-bold text-xs shadow-sm">
                        {activity.earnedBadge.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-heading font-bold text-xs text-terracotta block">{activity.earnedBadge.name}</span>
                        <span className="text-[9px] font-label text-gray-400 block">{activity.earnedBadge.grantedBy}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-label font-bold px-2 py-0.5 rounded-full">{t('my.badgeGranted')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 font-body text-sm border-2 border-dashed border-gray-200 rounded-2xl">
            참여한 산행 기록이 없습니다.
          </div>
        )}
      </div>

      {/* Badge Stamp Grid (UC5 나의뱃지) */}
      <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-lg text-forest">{t('my.badgesTitle')}</h3>
              <span className="uc-tag">{t('my.badgesUcTag')}</span>
            </div>
          </div>

          {badges.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-[40px] gap-y-6 pt-4 pb-2">
              {badges.map((badge) => (
                badge.isLocked ? (
                  <div key={badge.id} className="bg-gray-50 p-2 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center">
                    <div className="w-10 h-10 rubber-stamp locked mb-1">
                      <span className="text-sm">{badge.icon_name || '🔒'}</span>
                    </div>
                    <h4 className="font-heading font-bold text-[10px] text-gray-400 line-clamp-1">{badge.name}</h4>
                  </div>
                ) : (
                  <div key={badge.id} className="bg-white p-2 rounded-xl border border-paper-high text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
                    <div className="w-10 h-10 rubber-stamp mb-1">
                      <span className="text-sm">{badge.icon_name || '🏔️'}</span>
                      <span className="text-[7px] font-bold mt-0.5 line-clamp-1">{badge.mountainName}</span>
                    </div>
                    <h4 className="font-heading font-bold text-[10px] text-forest line-clamp-1">{badge.name}</h4>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 font-body text-sm bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              등록된 뱃지가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* My Written Episodes List (UC10/UC11) */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-bold text-lg text-forest">{t('my.episodesTitle')}</h3>
          </div>
          <span className="font-label text-xs text-gray-500">{t('my.episodesMeta', { count: episodes.length })}</span>
        </div>

        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {episodes.map((ep) => (
              <div key={ep.id} className="bg-paper-low rounded-2xl p-5 border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-center border-b border-gray-200/70 pb-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-forest text-white font-label text-[9px] font-bold px-2 py-0.5 rounded-full">{ep.hikeName}</span>
                      <span className="text-[10px] text-gray-400 font-label">{new Date(ep.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setEditTitle(ep.title)
                          setEditContent(ep.content)
                          setEditingEpisode(ep)
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-forest transition"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <h4 
                    className="font-heading font-bold text-sm text-forest mb-2 cursor-pointer hover:underline flex items-center space-x-1.5"
                    onClick={() =>
                      onOpenEpisodeModal(
                        ep.title,
                        user?.user_metadata?.nickname || 'Me',
                        new Date(ep.createdAt).toLocaleDateString(),
                        ep.photoUrl || '',
                        ep.content
                      )
                    }
                    title={t('common.published')}
                  >
                    <span className="text-gray-400 text-xs">🌐</span>
                    <span className="line-clamp-1">{ep.title}</span>
                  </h4>
                  
                  <div className="flex space-x-3 items-start">
                    {ep.photoUrl && (
                      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-sand shadow-sm bg-gray-100 relative">
                        <div className="washi-tape-sm"></div>
                        <img src={ep.photoUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 font-body line-clamp-3 leading-relaxed">
                      {ep.content}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 font-body text-sm border-2 border-dashed border-gray-200 rounded-2xl">
            작성한 산행 일기가 없습니다.
          </div>
        )}
      </div>

      {/* Edit Episode Modal */}
      {editingEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-heading font-bold text-xl text-forest border-b border-gray-100 pb-3">에피소드 수정</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-heading text-sm text-forest focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="제목을 입력하세요"
              />
              <textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                rows={5} 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="내용을 입력하세요"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setEditingEpisode(null)} 
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
              >
                취소
              </button>
              <button 
                onClick={handleUpdateEpisode} 
                disabled={isUpdating} 
                className="px-6 py-2 bg-forest text-white rounded-xl text-xs font-bold shadow hover:bg-forest-light transition disabled:opacity-50"
              >
                {isUpdating ? '저장 중...' : '저장 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
