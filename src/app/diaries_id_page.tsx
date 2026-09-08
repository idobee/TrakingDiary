'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth'

const supabase = createClient()

interface DiariesIdPageProps {
  hikeId: number
  onBack: () => void
  onOpenGallery?: (hikeId: number) => void
}

export default function DiariesIdPage({ hikeId, onBack, onOpenGallery }: DiariesIdPageProps) {
  const { user } = useAuth()
  const isAdmin = user?.system_role === 'admin'

  const [hike, setHike] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [episodes, setEpisodes] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(true)

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Episode Form State
  const [showEpisodeForm, setShowEpisodeForm] = useState(false)
  const [episodeTitle, setEpisodeTitle] = useState('')
  const [episodeContent, setEpisodeContent] = useState('')
  const [episodeType, setEpisodeType] = useState('general')
  const [isPublished, setIsPublished] = useState(true)
  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([])

  // Badge Modal State
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [hikeId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Hike
      const { data: hikeData } = await supabase.from('hikes').select('*').eq('id', hikeId).single()
      const hikeAny = hikeData as any
      setHike(hikeAny)

      // 2. Fetch Participants
      const { data: memberData } = await supabase
        .from('hike_members')
        .select(`
          user_id,
          role,
          status,
          users ( id, nickname, avatar_url )
        `)
        .eq('hike_id', hikeId)
        .neq('status', 'rejected')
      setParticipants(memberData || [])

      // 3. Fetch Photos
      const { data: photoData } = await supabase.from('photos').select('*').eq('hike_id', hikeId).order('created_at', { ascending: false })
      setPhotos(photoData || [])

      // 4. Fetch Episodes
      const { data: epData } = await supabase.from('episodes').select(`
        id, title, content, created_at, photo_urls, episode_type,
        users ( nickname, avatar_url )
      `).eq('hike_id', hikeId).order('created_at', { ascending: false })
      setEpisodes(epData || [])

      // 5. Fetch Badges
      if (hikeAny?.club_id) {
        const { data: badgeData } = await supabase.from('badges').select('*').or(`club_id.is.null,club_id.eq.${hikeAny.club_id}`)
        setBadges(badgeData || [])
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user || !hike) return
    const files = Array.from(e.target.files)
    setIsUploading(true)

    try {
      let successCount = 0
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('club_id', String(hike.club_id))
        formData.append('hike_date', hike.hike_date)
        formData.append('hike_id', String(hike.id))
        formData.append('uploader_id', user.id)
        if (hike.google_drive_folder_id) {
          formData.append('folder_id', hike.google_drive_folder_id)
        }

        const uploadRes = await fetch('/api/drive/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        
        if (!uploadRes.ok) {
          console.error('Upload failed for a file:', uploadData.error)
          continue
        }
        successCount++
      }

      alert(`${successCount}장의 사진이 추가되었습니다.`)
      fetchData() // refresh
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmitEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !hike) return

    const selectedPhotoUrls = photos
      .filter(p => selectedPhotoIds.includes(p.id))
      .map(p => {
        const fileId = p.google_drive_file_id
        return `/api/drive/image?id=${fileId}`
      })

    try {
      if (editingEpisodeId) {
        const { error } = await (supabase as any).from('episodes').update({
          title: episodeTitle,
          content: episodeContent,
          episode_type: episodeType,
          is_published: isPublished,
          photo_urls: selectedPhotoUrls.length > 0 ? selectedPhotoUrls : null
        }).eq('id', editingEpisodeId)
        if (error) throw error
      } else {
        const { error } = await (supabase as any).from('episodes').insert({
          hike_id: hike.id,
          author_id: user.id,
          title: episodeTitle,
          content: episodeContent,
          episode_type: episodeType,
          is_published: isPublished,
          photo_urls: selectedPhotoUrls.length > 0 ? selectedPhotoUrls : null
        })
        if (error) throw error
      }
      setShowEpisodeForm(false)
      setEpisodeTitle('')
      setEpisodeContent('')
      setEpisodeType('general')
      setIsPublished(true)
      setEditingEpisodeId(null)
      setSelectedPhotoIds([])
      fetchData()
    } catch (err) {
      console.error(err)
      alert('에피소드 저장에 실패했습니다.')
    }
  }

  const handleEditEpisode = (ep: any) => {
    setEpisodeTitle(ep.title)
    setEpisodeContent(ep.content)
    setEpisodeType(ep.episode_type || 'general')
    setIsPublished(ep.is_published ?? true)
    setEditingEpisodeId(ep.id)
    setShowEpisodeForm(true)
  }

  const handleDeleteEpisode = async (epId: number) => {
    if (!confirm('정말 이 에피소드를 삭제하시겠습니까?')) return
    try {
      const { error } = await supabase.from('episodes').delete().eq('id', epId)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error(err)
      alert('에피소드 삭제에 실패했습니다.')
    }
  }

  const handleToggleComplete = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'approved' : 'completed'
    try {
      const { error } = await (supabase as any)
        .from('hike_members')
        .update({ status: newStatus })
        .eq('hike_id', hikeId)
        .eq('user_id', userId)

      if (error) throw error
      fetchData()
    } catch (err) {
      console.error(err)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handleGrantBadge = async (badgeId: number) => {
    if (!user || !selectedParticipantId) return
    try {
      const { error } = await supabase.from('user_badges').insert({
        user_id: selectedParticipantId,
        badge_id: badgeId,
        hike_id: hikeId,
        granted_by: user.id
      } as any)

      if (error) throw error
      alert('뱃지가 수여되었습니다!')
      setShowBadgeModal(false)
      setSelectedParticipantId(null)
    } catch (err) {
      console.error(err)
      alert('뱃지 수여 중 오류가 발생했거나 이미 수여된 뱃지입니다.')
    }
  }

  if (isLoading) return <div className="p-10 text-center text-forest font-heading font-bold animate-pulse">Loading Diary...</div>
  if (!hike) return <div className="p-10 text-center">Data not found.</div>

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-paper-high">
      {/* Header */}
      <div className="relative h-64 bg-forest overflow-hidden">
        {hike.cover_image_url && (
          <img src={hike.cover_image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-4 left-4">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/40 text-white p-2 px-4 text-sm font-bold rounded-full backdrop-blur-sm transition">
            ← 돌아가기
          </button>
        </div>
        <div className="absolute bottom-6 left-8 right-8">
          <span className="text-terracotta font-bold text-xs bg-white px-2 py-1 rounded-sm uppercase tracking-wide">Vol {hikeId}</span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mt-2 drop-shadow-md">{hike.title}</h1>
          <p className="text-paper/80 font-body text-sm mt-2 flex items-center space-x-3">
            <span>⛰️ {hike.mountain_name}</span>
            <span>•</span>
            <span>📅 {new Date(hike.hike_date).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      <div className="p-8 space-y-12">
        
        {/* Participants & Badges (UC6) */}
        <section className="space-y-4 border-b border-gray-100 pb-8">
          <h2 className="font-heading font-bold text-xl text-forest flex items-center justify-between">
            <span>참가자 명단</span>
            {isAdmin && <span className="text-[10px] text-gray-400 font-normal">* 관리자는 완주 처리 및 뱃지를 수여할 수 있습니다.</span>}
          </h2>
          <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 pb-2">
            {participants.length === 0 && <div className="text-sm text-gray-500">참가자가 없습니다.</div>}
            {participants.map((p: any) => (
              <div 
                key={p.user_id} 
                className="flex flex-col items-center flex-shrink-0 min-w-[70px] space-y-1 group relative pb-4"
              >
                <div className="w-14 h-14 rounded-full bg-forest-container text-white overflow-hidden border-2 border-transparent transition shadow-sm relative">
                  {p.users.avatar_url ? (
                    <img src={p.users.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl">{p.users.nickname?.[0]}</div>
                  )}
                  {p.status === 'completed' && (
                    <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <span className="text-xs font-label text-gray-600 font-bold text-center w-full truncate">{p.users.nickname}</span>
                {isAdmin && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition absolute bottom-0 z-10 bg-white shadow-md p-1 rounded-md border border-gray-100">
                    <button 
                      onClick={() => handleToggleComplete(p.user_id, p.status)} 
                      className={`text-[9px] px-1.5 py-1 rounded font-bold whitespace-nowrap ${p.status === 'completed' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                      {p.status === 'completed' ? '취소' : '완주'}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedParticipantId(p.user_id)
                        setShowBadgeModal(true)
                      }}
                      className="bg-terracotta text-white text-[9px] px-1.5 py-1 rounded font-bold hover:bg-terracotta-dark whitespace-nowrap"
                    >
                      뱃지
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Photo Gallery (UC9) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="font-heading font-bold text-xl text-forest flex items-center space-x-2">
              <span>📷 사진첩</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Google Drive 연동됨</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onOpenGallery && onOpenGallery(hike.id)}
                className="text-gray-500 hover:text-forest text-xs font-bold transition mr-2"
              >
                전체보기 &gt;
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-forest text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-forest-light transition disabled:opacity-50"
              >
                {isUploading ? '업로드 중...' : '+ 사진 등록하기'}
              </button>
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="bg-paper p-8 rounded-2xl text-center text-gray-500 text-sm font-body border border-dashed border-gray-300">
              아직 등록된 사진이 없습니다. 첫 번째 사진을 올려보세요!
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {photos.slice(0, 5).map((photo) => {
                const fileId = photo.google_drive_file_id
                const imgSrc = `/api/drive/image?id=${fileId}`
                return (
                  <div key={photo.id} className="w-full aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-200">
                    <img src={imgSrc} alt="Hike Photo" className="w-full h-full object-cover" />
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Episodes (UC10/UC11) */}
        <section className="space-y-6 pt-8 border-t border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="font-heading font-bold text-xl text-forest">📝 에피소드</h2>
            {!showEpisodeForm && (
              <button 
                onClick={() => {
                  setEpisodeTitle('')
                  setEpisodeContent('')
                  setEpisodeType('general')
                  setIsPublished(true)
                  setEditingEpisodeId(null)
                  setSelectedPhotoIds([])
                  setShowEpisodeForm(true)
                }}
                className="bg-terracotta text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-terracotta-dark transition shadow-sm"
              >
                + 에피소드 남기기
              </button>
            )}
          </div>

          {showEpisodeForm && (
            <form onSubmit={handleSubmitEpisode} className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4">
              {isAdmin && (
                <div className="flex gap-4 pb-2 border-b border-orange-200/50 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="general" checked={episodeType === 'general'} onChange={() => setEpisodeType('general')} className="text-forest focus:ring-forest" />
                    <span className="text-sm font-bold text-forest">일반 에피소드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="notice" checked={episodeType === 'notice'} onChange={() => setEpisodeType('notice')} className="text-terracotta focus:ring-terracotta" />
                    <span className="text-sm font-bold text-terracotta">공지 / 감사의 글</span>
                  </label>
                </div>
              )}
              <input
                type="text"
                required
                placeholder="에피소드 제목"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-heading text-sm text-forest focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={episodeTitle}
                onChange={e => setEpisodeTitle(e.target.value)}
              />
              <textarea
                required
                placeholder="이번 산행에서 무슨 일이 있었나요?"
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={episodeContent}
                onChange={e => setEpisodeContent(e.target.value)}
              />

              {/* Photo Selector for Episode */}
              {photos.length > 0 && (
                <div className="space-y-2 pb-2">
                  <span className="text-sm font-bold text-forest block">사진 첨부 (선택)</span>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {photos.map(photo => {
                      const isSelected = selectedPhotoIds.includes(photo.id)
                      const fileId = photo.google_drive_file_id
                      const imgSrc = `/api/drive/image?id=${fileId}`
                      return (
                        <div 
                          key={photo.id} 
                          className={`flex-none w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition ${isSelected ? 'border-terracotta ring-2 ring-terracotta ring-opacity-50' : 'border-transparent'}`}
                          onClick={() => {
                            if (isSelected) setSelectedPhotoIds(prev => prev.filter(id => id !== photo.id))
                            else setSelectedPhotoIds(prev => [...prev, photo.id])
                          }}
                        >
                          <img src={imgSrc} className="w-full h-full object-cover" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPublished} 
                    onChange={(e) => setIsPublished(e.target.checked)} 
                    className="w-4 h-4 text-forest rounded border-gray-300 focus:ring-forest"
                  />
                  <span className="text-xs font-bold text-gray-700">전체 공유 (대시보드 노출)</span>
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowEpisodeForm(false); setEditingEpisodeId(null); setEpisodeTitle(''); setEpisodeContent(''); setEpisodeType('general'); setIsPublished(true); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700">취소</button>
                  <button type="submit" className="bg-forest text-white px-6 py-2 rounded-xl text-xs font-bold shadow hover:bg-forest-light">{editingEpisodeId ? '수정 완료' : '등록 완료'}</button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {episodes.filter(ep => !ep.episode_type || ep.episode_type === 'general').length === 0 && !showEpisodeForm && (
                <div className="text-center text-gray-500 text-sm py-8 font-body">등록된 일반 에피소드가 없습니다.</div>
              )}
              {episodes.filter(ep => !ep.episode_type || ep.episode_type === 'general').map(ep => (
                <div key={ep.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 relative hover:shadow-md transition">
                  <h3 className="font-heading font-extrabold text-lg text-forest">{ep.title}</h3>
                  <p className="text-sm text-gray-700 font-body whitespace-pre-line leading-relaxed">{ep.content}</p>
                  {ep.photo_urls && ep.photo_urls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ep.photo_urls.map((url: string, idx: number) => (
                        <div key={idx} className="rounded-xl overflow-hidden aspect-square border border-gray-200">
                          <img src={url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-4 mt-2 border-t border-gray-50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        {ep.users?.avatar_url ? (
                          <img src={ep.users.avatar_url} className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">{ep.users?.nickname?.[0]}</div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-bold">{ep.users?.nickname || 'Unknown'}</span>
                      <span className="text-[10px] text-gray-400 font-label ml-2">{new Date(ep.created_at).toLocaleString()}</span>
                    </div>
                    {user?.id === ep.author_id && (
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleEditEpisode(ep)} className="text-[10px] text-gray-400 hover:text-forest transition font-bold">수정</button>
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="text-[10px] text-gray-400 hover:text-red-500 transition font-bold">삭제</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-heading font-bold text-lg text-forest flex items-center space-x-2 border-b border-gray-100 pb-2">
                <span>📌 공지 / 감사의 글</span>
              </h3>
              <div className="max-h-[600px] overflow-y-auto hide-scrollbar space-y-4 pb-4">
                {episodes.filter(ep => ep.episode_type === 'notice').length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-8 font-body">아직 등록된 공지가 없습니다.</div>
                ) : (
                  episodes.filter(ep => ep.episode_type === 'notice').map(ep => (
                    <div key={ep.id} className="bg-yellow-100/80 p-5 rounded-lg shadow-sm border border-yellow-200/50 space-y-2 relative rotate-1 hover:rotate-0 hover:shadow-md transition duration-300">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-red-400/20 backdrop-blur-sm shadow-sm rounded-sm z-10" />
                      <h4 className="font-heading font-extrabold text-sm text-amber-900">{ep.title}</h4>
                      <p className="text-xs text-amber-900/80 font-body whitespace-pre-line leading-relaxed">{ep.content}</p>
                      {ep.photo_urls && ep.photo_urls.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {ep.photo_urls.map((url: string, idx: number) => (
                            <div key={idx} className="rounded-lg overflow-hidden aspect-square border border-yellow-200/50 shadow-sm">
                              <img src={url} className="w-full h-full object-cover opacity-90" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-amber-900/10 flex items-center justify-between">
                        <span className="text-[10px] text-amber-800/60 font-bold">{ep.users?.nickname || '관리자'}</span>
                        {user?.id === ep.author_id && (
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleEditEpisode(ep)} className="text-[10px] text-amber-800/40 hover:text-amber-800 transition font-bold">수정</button>
                            <button onClick={() => handleDeleteEpisode(ep.id)} className="text-[10px] text-amber-800/40 hover:text-red-500 transition font-bold">삭제</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Badge Grant Modal */}
      {showBadgeModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6">
            <h3 className="font-heading font-bold text-xl text-forest border-b border-gray-100 pb-3">뱃지 수여하기</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {badges.length === 0 ? (
                <p className="text-sm text-gray-500 text-center font-body py-4">부여할 수 있는 뱃지가 없습니다.<br/>동호회 관리 센터에서 뱃지를 생성해주세요.</p>
              ) : (
                badges.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleGrantBadge(b.id)}
                    className="w-full text-left flex items-center space-x-3 p-3 rounded-xl border border-gray-100 hover:bg-forest hover:text-white transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{b.icon_name}</span>
                    <div>
                      <p className="font-bold text-forest group-hover:text-white text-sm">{b.name}</p>
                      <p className="text-[10px] text-gray-500 group-hover:text-gray-200 line-clamp-1">{b.description}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button onClick={() => setShowBadgeModal(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition">닫기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
