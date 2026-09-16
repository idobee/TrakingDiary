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
  const { activities, badges, episodes, clubs, isLoading, isSample, refetch } = useMyTrekking(user?.id)

  const earnedBadgesCount = badges.filter(b => !b.isLocked).length

  // Edit Episode State
  const [editingEpisode, setEditingEpisode] = useState<MyEpisode | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Blog Generation State
  const [isBlogMode, setIsBlogMode] = useState(false)
  const [selectedBlogEpisodes, setSelectedBlogEpisodes] = useState<number[]>([])
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [blogLength, setBlogLength] = useState('1000')
  const [generatedBlogHtml, setGeneratedBlogHtml] = useState('')
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false)

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

  const handleShareEpisode = async (ep: MyEpisode) => {
    // Check participation
    const isParticipant = activities.some(a => a.id === ep.hikeId)
    if (!isParticipant) {
      alert('참여한 산행의 에피소드만 공유할 수 있습니다.')
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: ep.title,
          text: `[TrakingDiary] ${ep.title} 에세이를 확인해보세요!`,
          url: `${window.location.origin}/diaries/${ep.hikeId}`
        })
      } catch (error) {
        console.log('공유 취소 또는 실패', error)
      }
    } else {
      alert('이 브라우저에서는 기본 공유 기능을 지원하지 않습니다.')
    }
  }

  const handleGenerateBlog = async () => {
    setIsGeneratingBlog(true)
    setGeneratedBlogHtml('')
    try {
      const selectedEps = episodes.filter(ep => selectedBlogEpisodes.includes(ep.id))
      const combinedText = selectedEps.map(ep => `제목: ${ep.title}\n내용: ${ep.content}`).join('\n\n')
      
      const apiKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('openai_api_key')
      if (!apiKey) {
        alert('AI 설정에서 API Key를 먼저 등록해 주세요.')
        setIsGeneratingBlog(false)
        return
      }
      
      const prompt = `다음은 사용자가 작성한 여러 트레킹 에피소드들입니다.\n\n${combinedText}\n\n위 내용들을 바탕으로, 네이버/티스토리 등 블로그에 바로 올릴 수 있는 트렌디하고 검색 최적화(SEO)된 멋진 블로그 포스팅 초안을 ${blogLength}자 내외로 작성해 주세요. 제목, 서론, 본론, 결론, 해시태그를 포함하세요. HTML 태그를 사용하지 말고 일반 텍스트 포맷으로 작성해주세요.`
      
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: localStorage.getItem('ai_provider') || 'gemini', apiKey, prompt })
      })
      
      if (res.ok) {
        const data = await res.json()
        setGeneratedBlogHtml(data.text)
      } else {
        throw new Error('블로그 생성 실패')
      }
    } catch (err) {
      console.error(err)
      alert('블로그 글 생성에 실패했습니다.')
    } finally {
      setIsGeneratingBlog(false)
    }
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

      {isSample && (
        <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sky-800 font-heading font-bold text-lg flex items-center gap-2">
              <span>👋</span> 환영합니다! 아래는 샘플 동호회 데이터입니다.
            </h3>
            <p className="text-sky-600 text-sm mt-1">지금 나만의 첫 동호회를 만들고 직접 산행 기록을 남겨보세요!</p>
          </div>
          <button 
            onClick={() => window.location.href = '/clubs/new'}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-6 rounded-full transition-colors whitespace-nowrap shadow-md flex items-center gap-2"
          >
            <span>➕</span> 나만의 동호회 만들기
          </button>
        </div>
      )}

      {/* 2-Column Layout for PC, Stacked for Mobile */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-6">
        
        {/* Left Column (Activities + Episodes) */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          
          {/* Activity Grid */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-lg text-forest">{t('my.activityTitle')}</h3>
              </div>
              <span className="font-label text-xs text-gray-500">{t('my.activityMeta', { count: activities.length })}</span>
            </div>

            {activities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <div key={activity.id} className="p-5 bg-paper-low rounded-2xl border-2 border-forest/20 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-forest text-white text-[10px] font-label font-bold px-2.5 py-0.5 rounded-full">
                        {new Date(activity.hikeDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-label text-gray-400 line-clamp-1">{activity.mountainName}</span>
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-forest flex items-center space-x-1.5">
                      <span>⛰️</span>
                      <span className="line-clamp-1">{activity.title}</span>
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

          {/* My Written Episodes List */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-paper-high space-y-5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-lg text-forest">{t('my.episodesTitle')}</h3>
                <span className="font-label text-xs text-gray-500">{t('my.episodesMeta', { count: episodes.length })}</span>
              </div>
              <div className="flex items-center gap-2">
                {!isBlogMode ? (
                  <button
                    onClick={() => {
                      setIsBlogMode(true)
                      setSelectedBlogEpisodes([])
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-sm"
                  >
                    블로그 글 만들기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsBlogMode(false)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition shadow-sm"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => setShowBlogModal(true)}
                      disabled={selectedBlogEpisodes.length === 0}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      블로그 생성 시작 ({selectedBlogEpisodes.length})
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isBlogMode && (
              <p className="text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded-lg text-center animate-pulse">
                블로그 글로 엮을 에피소드들을 선택하세요.
              </p>
            )}

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {episodes.map((ep) => (
                  <div key={ep.id} className={`relative bg-paper-low rounded-2xl p-5 border-2 ${selectedBlogEpisodes.includes(ep.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-forest/20'} shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3`}>
                    
                    {isBlogMode && (
                      <div className="absolute top-3 right-3 z-10 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedBlogEpisodes.includes(ep.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBlogEpisodes(prev => [...prev, ep.id])
                            else setSelectedBlogEpisodes(prev => prev.filter(id => id !== ep.id))
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    )}
                    
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
                        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-sand shadow-sm bg-gray-100 relative">
                          <div className="washi-tape-sm"></div>
                          <img src={ep.photoUrl || '/images/default_image.jpg'} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-600 font-body line-clamp-3 leading-relaxed">
                          {ep.content}
                        </p>
                      </div>
                    </div>
                    
                    {!isBlogMode && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleShareEpisode(ep)}
                          className="px-3 py-1 bg-yellow-400 text-black rounded-full text-xs font-bold hover:bg-yellow-500 transition shadow-sm flex items-center gap-1"
                        >
                          <span>📲</span> 카톡/공유
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 font-body text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                작성한 산행 일기가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Clubs + Badges) */}
        <div className="xl:col-span-1 space-y-6 flex flex-col">
          
          {/* My Clubs */}
          <div className="bg-gray-50/80 rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-lg text-forest">{t('my.clubsTitle')}</h3>
              </div>
            </div>

            {clubs && clubs.length > 0 ? (
              <div className="space-y-4">
                {clubs.map((club) => (
                  <div key={club.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center space-x-3 shadow-sm hover:shadow transition">
                    <div className="w-10 h-10 rounded-full bg-forest text-white font-heading font-bold text-base flex items-center justify-center shrink-0">
                      🏕️
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading font-bold text-sm text-forest line-clamp-1">{club.name}</h4>
                      <p className="text-[10px] text-gray-500 font-label mt-0.5 line-clamp-1">{club.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 font-body text-sm bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                {t('my.clubsEmpty')}
              </div>
            )}
          </div>

          {/* Badge Stamp Grid */}
          <div className="bg-gray-50/80 rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-lg text-forest">{t('my.badgesTitle')}</h3>
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

      {/* Blog Generation Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-bold text-xl text-blue-600 flex items-center gap-2">
                <span>📝</span> 블로그 글 생성기
              </h3>
              <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
              <div>
                <p className="text-sm font-bold text-gray-700">목표 글자 수 선택</p>
                <p className="text-xs text-gray-500">선택한 에피소드 {selectedBlogEpisodes.length}개를 엮어 블로그 글을 작성합니다.</p>
              </div>
              <select 
                value={blogLength} 
                onChange={(e) => setBlogLength(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1000">1000자 내외 (기본)</option>
                <option value="2000">2000자 내외 (상세)</option>
                <option value="3000">3000자 내외 (심층)</option>
              </select>
            </div>

            <div className="flex-1 min-h-[200px] max-h-[500px] overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 relative">
              {isGeneratingBlog ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                  <div className="text-4xl animate-spin mb-4">⚙️</div>
                  <p className="font-bold text-blue-600 animate-pulse">트렌디한 블로그 초안을 작성 중입니다...</p>
                </div>
              ) : generatedBlogHtml ? (
                <textarea 
                  value={generatedBlogHtml}
                  readOnly
                  className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm leading-loose text-gray-800"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                  아래 [생성하기] 버튼을 눌러주세요.
                </div>
              )}
            </div>

            <div className="pt-2 text-xs text-red-500 font-bold text-center">
              ⚠️ 생성된 글은 서버에 자동 저장되지 않습니다. 반드시 클립보드에 복사하여 블로그에 붙여넣기 하세요!
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  const blob = new Blob([generatedBlogHtml.replace(/\n/g, '<br/>')], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `blog_draft.html`
                  a.click()
                }} 
                disabled={!generatedBlogHtml || isGeneratingBlog}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-200 transition shadow-sm disabled:opacity-50"
              >
                HTML 다운로드
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedBlogHtml)
                  alert('클립보드에 복사되었습니다! 블로그 에디터에 붙여넣기 하세요.')
                }} 
                disabled={!generatedBlogHtml || isGeneratingBlog}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition shadow-sm disabled:opacity-50 flex items-center gap-1"
              >
                <span>📋</span> 클립보드 복사
              </button>
              <button 
                onClick={handleGenerateBlog} 
                disabled={isGeneratingBlog} 
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isGeneratingBlog ? '생성 중...' : (generatedBlogHtml ? '다시 생성하기' : '✨ 블로그 글 생성하기')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
