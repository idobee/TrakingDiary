'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

const supabase = createClient()
import { useTranslation } from '@/lib/i18n'

import { useAuth } from '@/lib/auth'

interface GalleryPageProps {
  clubId: number | null
  initialHikeId?: number | null
}

export function GalleryPage({ clubId, initialHikeId }: GalleryPageProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [hikes, setHikes] = useState<any[]>([])
  const [myJoinedHikeIds, setMyJoinedHikeIds] = useState<number[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [filterHikeId, setFilterHikeId] = useState<string | number>(initialHikeId || 'all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  const [searchHikeText, setSearchHikeText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Instagram Share State
  const [showInstaModal, setShowInstaModal] = useState(false)
  const [selectedInstaPhoto, setSelectedInstaPhoto] = useState<any>(null)
  const [instaAiText, setInstaAiText] = useState('')
  const [isGeneratingInstaAi, setIsGeneratingInstaAi] = useState(false)

  useEffect(() => {
    if (initialHikeId) {
      setFilterHikeId(initialHikeId)
    }
  }, [initialHikeId])

  useEffect(() => {
    if (!clubId) return
    fetchData()
  }, [clubId, filterHikeId, filterStartDate, filterEndDate])

  const fetchData = async () => {
    if (!clubId) return
    setIsLoading(true)
    try {
      const { data: hikeData, error: hikeError } = await supabase
        .from('hikes')
        .select('id, title, hike_date, google_drive_folder_id')
        .eq('club_id', clubId)
        .order('hike_date', { ascending: false })

      if (hikeError) throw hikeError
      setHikes(hikeData || [])

      if (user) {
        const { data: members } = await supabase
          .from('hike_members')
          .select('hike_id')
          .eq('user_id', user.id)
        if (members) {
          setMyJoinedHikeIds(members.map(m => m.hike_id))
        }
      }

      const hikeIds = (hikeData || []).map((h: any) => h.id)

      if (hikeIds.length === 0) {
        setPhotos([])
        return
      }

      let query = supabase
        .from('photos')
        .select(`
          *,
          hikes ( title ),
          users ( nickname )
        `)
        .order('created_at', { ascending: false })

      if (filterHikeId === 'my_hikes') {
        const validHikeIds = hikeIds.filter((id: number) => myJoinedHikeIds.includes(id))
        query = query.in('hike_id', validHikeIds.length > 0 ? validHikeIds : [-1])
      } else if (filterHikeId !== 'all') {
        query = query.eq('hike_id', filterHikeId)
      } else {
        query = query.in('hike_id', hikeIds)
      }

      if (filterStartDate) {
        query = query.gte('created_at', filterStartDate + 'T00:00:00Z')
      }
      if (filterEndDate) {
        query = query.lte('created_at', filterEndDate + 'T23:59:59Z')
      }

      const { data: photoData, error: photoError } = await query
      if (photoError) throw photoError

      setPhotos(photoData || [])

    } catch (err) {
      console.error('Gallery Fetch Error:', err)
    } finally {
      setIsLoading(false)
    }
  }



  // --- 기존 인스타 공유 ---
  const handleOpenInstaModal = async (photo: any) => {
    setSelectedInstaPhoto(photo)
    setShowInstaModal(true)
    setInstaAiText('')
    setIsGeneratingInstaAi(true)

    const fallbackText = `⛰️ ${photo.hikes?.mountain_name || photo.hikes?.title || '행복한 산행'}\n\n도심을 벗어나 자연이 주는 여유와 위로를 듬뿍 받았던 하루 🍃\n함께라서 더 즐거웠어요!\n\n#등산스타그램 #산행기록 #자연이주는선물 #아웃도어라이프`

    try {
      const apiKey = localStorage.getItem('ai_api_key')
      if (!apiKey) {
        setInstaAiText(fallbackText)
        setIsGeneratingInstaAi(false)
        return
      }

      const prompt = `다음 정보를 바탕으로, 인스타그램에 올리기 좋은 감각적이고 트렌디한 이벤트 피드 글을 작성해줘. 첫 줄은 시선을 끄는 감성적인 문구로 시작하고, 본문에는 자연의 아름다움과 힐링을 강조해줘. 마지막엔 5~6개의 관련 해시태그를 꼭 포함해줘. (안내 멘트 없이 캡션 내용만 출력할 것)\n\n산/장소: ${photo.hikes?.mountain_name || '어느 아름다운 산'}\n산행 제목: ${photo.hikes?.title || '트레킹'}`

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: localStorage.getItem('ai_provider') || 'gemini',
          apiKey,
          prompt
        })
      })

      if (res.ok) {
        const data = await res.json()
        setInstaAiText(data.text)
      } else {
        setInstaAiText(fallbackText)
      }
    } catch (err) {
      setInstaAiText(fallbackText)
    } finally {
      setIsGeneratingInstaAi(false)
    }
  }

  const handleDownloadInstaShot = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const modalEl = document.querySelector('.max-w-lg')
      if (!modalEl) return
      const canvas = await html2canvas(modalEl as HTMLElement, { useCORS: true, scale: 2 })
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `Happic_인스타인증샷.jpg`
      a.click()
      alert('인스타 인증샷이 저장되었습니다!')
      setShowInstaModal(false)
    } catch (err) {
      alert('이미지 저장에 실패했습니다.')
    }
  }

  const handleResetFilters = () => {
    setFilterHikeId('all')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const handleTogglePublish = async (photoId: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/photos/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, isPublished: !currentStatus })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to toggle')
      }

      // Update local state
      setPhotos(photos.map(p => p.id === photoId ? { ...p, is_published: !currentStatus } : p))
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
      alert(t('gallery.toggleFail'))
    }
  }

  const handleUploadClick = () => {
    if (filterHikeId === 'all' || filterHikeId === 'my_hikes') {
      alert('사진을 올릴 단일 행사를 먼저 선택해주세요.')
      return
    }
    fileInputRef.current?.click()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user || filterHikeId === 'all') return
    const selectedHike = hikes.find(h => h.id === filterHikeId)
    if (!selectedHike) return
    
    const files = Array.from(e.target.files)
    setIsUploading(true)

    try {
      let successCount = 0
      for (const file of files) {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }
        const compressedFile = await imageCompression(file, options)
        const formData = new FormData()
        formData.append('file', compressedFile, file.name)
        formData.append('club_id', String(clubId))
        formData.append('hike_date', selectedHike.hike_date)
        formData.append('hike_id', String(selectedHike.id))
        formData.append('uploader_id', user.id)
        if (selectedHike.google_drive_folder_id) {
          formData.append('folder_id', selectedHike.google_drive_folder_id)
        }

        const uploadRes = await fetch('/api/drive/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadRes.ok) {
           console.error('Upload failed')
           continue
        }
        successCount++
      }
      
      if (successCount > 0) {
        alert(`${successCount}장의 사진이 성공적으로 업로드되었습니다!`)
        fetchData()
      } else {
        alert('사진 업로드에 실패했습니다.')
      }
    } catch (err: any) {
      alert('업로드 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-paper-high shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 gap-4 w-full">
        <div className="flex items-center space-x-3 truncate">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-forest truncate">{t('gallery.title')}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
          <button
            onClick={handleUploadClick}
            disabled={isUploading || !user}
            className="bg-forest text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-forest-light transition disabled:opacity-50 shadow-sm flex items-center gap-1"
          >
            <span>{isUploading ? '업로드 중...' : '+ 사진등록'}</span>
          </button>
        </div>
      </div>

      <div className="w-full xl:w-3/4 bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100 grid grid-cols-2 md:flex md:flex-row md:items-end gap-3 sm:gap-4">
        <div className="space-y-1 col-span-2 md:flex-1 md:min-w-[150px]">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500">{t('gallery.filterHike')}</label>
            <input 
              type="text" 
              placeholder="🔍 행사명 검색" 
              value={searchHikeText} 
              onChange={e => setSearchHikeText(e.target.value)} 
              className="text-[10px] sm:text-xs border-b border-gray-300 focus:outline-none focus:border-forest px-1 py-0.5 w-24 sm:w-32 bg-transparent text-right"
            />
          </div>
          <select
            value={filterHikeId}
            onChange={(e) => setFilterHikeId(e.target.value === 'all' || e.target.value === 'my_hikes' ? e.target.value : parseInt(e.target.value))}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          >
            <option value="all">{t('gallery.filterAllHikes')}</option>
            {myJoinedHikeIds.length > 0 && <option value="my_hikes">{t('gallery.filterMyHikes')}</option>}
            {(() => {
              const filteredHikes = searchHikeText ? hikes.filter(h => h.title.includes(searchHikeText)) : hikes
              const myHikes = filteredHikes.filter(h => myJoinedHikeIds.includes(h.id))
              const otherHikes = filteredHikes.filter(h => !myJoinedHikeIds.includes(h.id))
              return (
                <>
                  {myHikes.length > 0 && (
                    <optgroup label={t('gallery.optgroupMyHikes')}>
                      {myHikes.map(h => (
                        <option key={h.id} value={h.id}>{h.title} ({new Date(h.hike_date).toLocaleDateString()})</option>
                      ))}
                    </optgroup>
                  )}
                  {otherHikes.length > 0 && (
                    <optgroup label={t('gallery.optgroupOtherHikes')}>
                      {otherHikes.map(h => (
                        <option key={h.id} value={h.id}>{h.title} ({new Date(h.hike_date).toLocaleDateString()})</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )
            })()}
          </select>
        </div>

        <div className="space-y-1 col-span-1 md:w-[130px]">
          <label className="text-[10px] sm:text-xs font-bold text-gray-500">{t('gallery.filterStartDate')}</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <div className="space-y-1 col-span-1 md:w-[130px]">
          <label className="text-[10px] sm:text-xs font-bold text-gray-500">{t('gallery.filterEndDate')}</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <button
          onClick={handleResetFilters}
          className="col-span-2 md:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-lg hover:bg-gray-300 transition"
        >
          {t('gallery.resetFilters')}
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="text-forest animate-pulse font-bold">{t('gallery.loading')}</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <p className="text-gray-400 font-bold">{t('gallery.empty')}</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
          {photos.map(photo => {
            const fileId = photo.google_drive_file_id
            const imgSrc = `/api/drive/image?id=${fileId}`
            const isUploaderOrAdmin = user?.id === photo.uploader_id || user?.system_role === 'admin' || user?.system_role === 'sys_admin'

            return (
              <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                <a href={photo.google_drive_web_link || imgSrc} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                  <img src={photo.thumbnail_url || imgSrc} alt="Gallery Photo" loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" />
                </a>

                {/* Publish Toggle Button */}
                {isUploaderOrAdmin && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePublish(photo.id, photo.is_published); }}
                      className={`px-3 py-1 text-xs font-bold rounded-full shadow backdrop-blur-md border ${photo.is_published ? 'bg-forest/80 text-white border-forest' : 'bg-white/80 text-gray-600 border-gray-300 hover:bg-white'}`}
                    >
                      {photo.is_published ? t('gallery.published') : t('gallery.unpublished')}
                    </button>
                  </div>
                )}

                {/* Download Original Button & Insta Share Button */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  {photo.google_drive_web_link && (
                    <a
                      href={photo.google_drive_web_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-bold rounded-full shadow backdrop-blur-md border bg-white/80 text-gray-700 border-gray-300 hover:bg-white flex items-center justify-center space-x-1"
                      title="원본 사진 다운로드 (Google Drive)"
                    >
                      <span>⬇️</span>
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenInstaModal(photo); }}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-full shadow backdrop-blur-md border bg-gradient-to-tr from-pink-500 to-orange-400 text-white border-transparent hover:from-pink-600 hover:to-orange-500 flex items-center justify-center space-x-1"
                    title="인스타 인증샷 만들기"
                  >
                    <span>📸</span>
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3 pointer-events-none">
                  <span className="text-white font-bold text-xs line-clamp-1">{photo.hikes?.title}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-300 text-[10px]">{photo.users?.nickname}</span>
                    <span className="text-gray-300 text-[10px]">{new Date(photo.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Insta Share Modal */}
      {showInstaModal && selectedInstaPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-heading font-bold text-xl text-forest">📸 인스타 인증샷 만들기</h3>
              <button onClick={() => setShowInstaModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-inner relative bg-gray-100">
                <img
                  src={selectedInstaPhoto.thumbnail_url || `/api/drive/image?id=${selectedInstaPhoto.google_drive_file_id}`}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-body line-clamp-3 whitespace-pre-wrap drop-shadow-md">
                    {instaAiText || '생성 중...'}
                  </p>
                </div>
                <div className="absolute top-4 right-4 bg-forest text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow">
                  Happic
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                  <span>감성 멘트 수정</span>
                  {isGeneratingInstaAi && <span className="text-emerald-500 text-xs animate-pulse">AI가 작성 중...</span>}
                </label>
                <textarea
                  value={instaAiText}
                  onChange={(e) => setInstaAiText(e.target.value)}
                  placeholder="인스타그램에 올릴 멋진 멘트를 적어보세요!"
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  disabled={isGeneratingInstaAi}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowInstaModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl">취소</button>
              <button
                onClick={handleDownloadInstaShot}
                disabled={isGeneratingInstaAi}
                className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white px-6 py-2 rounded-xl text-sm font-bold hover:from-pink-600 hover:to-orange-500 transition shadow disabled:opacity-50"
              >
                📥 이미지 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Instagram Gallery Template for html2canvas */}
      {showInstaModal && selectedInstaPhoto && (
        <div id="instagram-gallery-template" style={{ display: 'none', width: '1080px', height: '1080px', position: 'relative', backgroundColor: '#fff', overflow: 'hidden' }}>
          <img
            src={`/api/drive/image?id=${selectedInstaPhoto.google_drive_file_id}`}
            alt="bg"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3))' }} />

          <div style={{ position: 'absolute', bottom: '100px', left: '100px', right: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1.4, marginBottom: '24px', textShadow: '2px 2px 8px rgba(0,0,0,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
              {instaAiText}
            </h1>
            <p style={{ fontSize: '28px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              ⛰️ {selectedInstaPhoto.hikes?.title || 'Traking Diary'}
            </p>
          </div>

          <div style={{ position: 'absolute', top: '80px', right: '80px', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#2d5a27', color: '#fff', padding: '16px 32px', borderRadius: '40px', fontSize: '32px', fontWeight: 'bold', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              Happic
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
