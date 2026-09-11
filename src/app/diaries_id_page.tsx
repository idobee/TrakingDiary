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

  // AI Book Feature State
  const [showAiKeyModal, setShowAiKeyModal] = useState(false)
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini')
  const [aiKeyInput, setAiKeyInput] = useState('')
  const [isGeneratingBook, setIsGeneratingBook] = useState(false)
  const [aiBookContent, setAiBookContent] = useState<string | null>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<number, boolean>>({})
  const [showAiEpisodeSelectModal, setShowAiEpisodeSelectModal] = useState(false)
  const [selectedAiEpisodes, setSelectedAiEpisodes] = useState<number[]>([])

  useEffect(() => {
    fetchData()
    const savedProvider = localStorage.getItem('ai_provider') as any || 'gemini'
    setAiProvider(savedProvider)
    const savedKey = localStorage.getItem(`${savedProvider}_api_key`)
    if (savedKey) setAiKeyInput(savedKey)
  }, [hikeId])

  useEffect(() => {
    // 제공자가 변경될 때마다 해당 키를 로드
    const savedKey = localStorage.getItem(`${aiProvider}_api_key`)
    setAiKeyInput(savedKey || '')
  }, [aiProvider])

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

  // --- AI Book Generation Logic ---
  const handleGenerateBookClick = () => {
    const existingAiBook = episodes.find(ep => ep.episode_type === 'ai_book')
    if (existingAiBook) {
      setAiBookContent(existingAiBook.content)
      setShowBookModal(true)
      return
    }

    const validEpisodes = episodes.filter(ep => ep.episode_type === 'general' || !ep.episode_type)
    if (validEpisodes.length === 0) {
      return alert('에피소드가 하나 이상 작성되어야 단행본을 만들 수 있습니다.')
    }

    if (confirm('전체 에피소드를 단행본 생성에 사용하시겠습니까?\n(취소를 누르면 포함할 에피소드를 직접 선택할 수 있습니다)')) {
      const allIds = validEpisodes.map(ep => ep.id)
      setSelectedAiEpisodes(allIds)
      proceedWithGeneration(allIds)
    } else {
      setSelectedAiEpisodes(validEpisodes.map(ep => ep.id)) // 기본적으로 전체 선택 상태로 시작
      setShowAiEpisodeSelectModal(true)
    }
  }

  const proceedWithGeneration = (selectedIds: number[]) => {
    const savedKey = localStorage.getItem(`${aiProvider}_api_key`)
    if (!savedKey) {
      setShowAiKeyModal(true)
    } else {
      generateBook(aiProvider, savedKey, selectedIds)
    }
  }

  const saveAiKeyAndGenerate = () => {
    if (!aiKeyInput.trim()) return alert('키를 입력해주세요.')
    localStorage.setItem('ai_provider', aiProvider)
    localStorage.setItem(`${aiProvider}_api_key`, aiKeyInput.trim())
    setShowAiKeyModal(false)
    generateBook(aiProvider, aiKeyInput.trim(), selectedAiEpisodes)
  }

  const generateBook = async (provider: string, apiKey: string, selectedIds?: number[]) => {
    setIsGeneratingBook(true)
    setAiBookContent(null)
    setShowBookModal(true)

    try {
      const hikeDate = new Date(hike.hike_date).toLocaleDateString()
      let prompt = `다음은 '${hike.title}' (${hike.mountain_name}, ${hikeDate}) 트레킹에 참가한 크루들이 남긴 짧은 에피소드 조각들입니다.\n\n`
      
      const targetIds = selectedIds || selectedAiEpisodes
      
      episodes.forEach(ep => {
        if ((ep.episode_type === 'general' || !ep.episode_type) && targetIds.includes(ep.id)) {
          prompt += `[작성자: ${ep.users?.nickname || '익명'}]\n제목: ${ep.title}\n내용: ${ep.content}\n\n`
        }
      })

      prompt += `위 내용들을 바탕으로, 감각적인 여행 매거진(잡지)의 한 페이지처럼 유려하고 세련된 에세이로 전체 글을 재작성해 주세요. 
각자의 시선이 하나로 어우러지는 기승전결이 있는 에세이 톤으로 작성해 주시고, 
글의 흐름에 맞게 특정 장소나 순간을 묘사하는 문단 바로 옆에 사진이 배치될 수 있도록, 적절한 위치에 "[PHOTO_1]", "[PHOTO_2]" 와 같이 사진 플레이스홀더를 넣어주세요 (최대 8개). 
마치 잡지의 다단 레이아웃처럼, 짧고 임팩트 있는 소제목들을 적극 활용해 주세요.
답변은 Markdown 포맷(적절한 제목, 문단 구분)으로 작성해 주시고, 각 사진 플레이스홀더는 반드시 문단과 문단 사이의 별도의 줄에 작성해주세요.`

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, prompt })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '생성 실패')
      const aiContent = data.text
      setAiBookContent(aiContent)
    } catch (err: any) {
      console.error(err)
      alert(err.message || '단행본 생성 중 오류가 발생했습니다.')
      setShowBookModal(false)
      localStorage.removeItem(`${provider}_api_key`)
      setAiKeyInput('')
      setShowAiKeyModal(true)
    } finally {
      setIsGeneratingBook(false)
    }
  }

  const handleDownloadHtml = () => {
    const article = document.getElementById('book-article')
    if (!article) return
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${hike?.title} - AI 에세이</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Be+Vietnam+Pro:wght@400;700&display=swap');
          body { font-family: 'Be Vietnam Pro', sans-serif; background: white; padding: 40px; }
          h1, h2, h3 { font-family: 'Bricolage Grotesque', sans-serif; }
          /* Ensure images don't float and stay centered in print/pdf */
          @media print {
            .md\\:float-right, .md\\:float-left { float: none !important; margin: 0 auto !important; }
          }
        </style>
      </head>
      <body>
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h1 class="text-5xl font-extrabold text-[#2d5a27] mb-4">${hike?.title}</h1>
            <p class="text-gray-500">${hike?.mountain_name} • ${new Date(hike?.hike_date).toLocaleDateString()}</p>
          </div>
          <article class="prose-p:text-black prose-p:leading-loose text-lg font-body">
            ${article.innerHTML.replace(/src="\//g, `src="${window.location.origin}/`)}
          </article>
        </div>
      </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${hike?.title}_에세이.html`
    a.click()
  }

  const handleSaveAsEpisode = async () => {
    if (!user || !hike || !aiBookContent) return
    if (!confirm('현재 작성된 단행본 내용을 새로운 에피소드로 등록하시겠습니까?')) return
    
    try {
      const { error } = await supabase.from('episodes').insert({
        hike_id: hike.id,
        author_id: user.id,
        title: 'AI가 작성한 여행 에세이 🤖',
        content: aiBookContent,
        episode_type: 'ai_book',
        is_published: true
      })
      if (error) {
        console.error(error)
        alert('에피소드 등록에 실패했습니다. (DB 오류: ' + error.message + ')')
        return
      }
      alert('새로운 에피소드로 등록되었습니다!')
      fetchData()
    } catch (err) {
      console.error(err)
      alert('에피소드 등록에 실패했습니다.')
    }
  }

  const renderBookContent = () => {
    if (!aiBookContent) return null
    const parts = aiBookContent.split(/(\[PHOTO_\d+\])/g)
    let photoIndex = 0
    
    return (
      <div className="max-w-4xl mx-auto font-body text-black leading-[2.2] text-lg print:text-black print:leading-[2.0] flow-root">
        {parts.map((part, index) => {
          if (part.match(/\[PHOTO_\d+\]/)) {
            if (photoIndex < photos.length) {
              const photo = photos[photoIndex]
              const isEven = photoIndex % 2 === 0
              photoIndex++
              const imgSrc = `/api/drive/image?id=${photo.google_drive_file_id}`
              return (
                <div key={index} className={`w-full md:w-5/12 mb-8 break-inside-avoid ${isEven ? 'md:float-right md:ml-10' : 'md:float-left md:mr-10'} print:float-none print:mx-auto print:w-3/4`}>
                  <div className="p-3 bg-white rounded-xl shadow-xl border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300 print:shadow-none print:border-none print:transform-none">
                    <img src={imgSrc} alt="Magazine Photo" className="w-full h-auto object-cover rounded-lg aspect-square md:aspect-[4/5] object-center" />
                  </div>
                </div>
              )
            }
            return null
          }
          
          // Mini Markdown Parser for Text Parts
          return (
            <div key={index} className="mb-4">
              {part.split('\n').map((line, i) => {
                const tLine = line.trim()
                if (tLine.startsWith('### ')) {
                  return <h3 key={i} className="font-heading text-xl text-forest font-bold mt-8 mb-4 uppercase tracking-wider">{tLine.replace('### ', '')}</h3>
                } else if (tLine.startsWith('## ')) {
                  return <h2 key={i} className="font-heading text-2xl text-forest font-bold mt-10 mb-6 uppercase tracking-wider">{tLine.replace('## ', '')}</h2>
                } else if (tLine.startsWith('# ')) {
                  return <h1 key={i} className="font-heading text-3xl text-forest font-extrabold mt-12 mb-8 uppercase tracking-widest">{tLine.replace('# ', '')}</h1>
                } else if (tLine === '') {
                  return <br key={i} />
                } else {
                  const boldParts = tLine.split(/(\*\*.*?\*\*)/g)
                  return (
                    <p key={i} className="mb-4">
                      {boldParts.map((p, j) => 
                        p.startsWith('**') && p.endsWith('**') ? 
                        <strong key={j} className="text-forest font-bold">{p.slice(2, -2)}</strong> : 
                        p
                      )}
                    </p>
                  )
                }
              })}
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) return <div className="p-10 text-center text-forest font-heading font-bold animate-pulse print:hidden">Loading Diary...</div>
  if (!hike) return <div className="p-10 text-center print:hidden">Data not found.</div>

  return (
    <>
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-paper-high print:hidden">
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
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAiKeyModal(true)} className="bg-gray-100 text-gray-500 hover:bg-gray-200 p-3 rounded-xl transition shadow-sm" title="AI 설정">
                ⚙️
              </button>
              <button onClick={handleGenerateBookClick} className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md flex items-center gap-2">
                <span>🤖</span> 단행본 만들기
              </button>
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
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {episodes.filter(ep => ep.episode_type === 'general' || !ep.episode_type).length === 0 && !showEpisodeForm && (
                <div className="md:col-span-2 text-center text-gray-500 text-sm py-8 font-body">등록된 에피소드가 없습니다.</div>
              )}
              {episodes.map(ep => {
                const isAiBook = ep.episode_type === 'ai_book'
                if (ep.episode_type !== 'general' && !ep.episode_type && !isAiBook) return null;
                
                return (
                <div key={ep.id} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 relative hover:shadow-md transition ${isAiBook ? 'md:col-span-2' : ''}`}>
                  {isAiBook ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                      <div className="text-4xl animate-pulse">🤖📚</div>
                      <div>
                        <h3 className="font-heading font-extrabold text-lg text-forest">{ep.title}</h3>
                        <p className="text-xs text-gray-500 font-body mt-1">AI 작가가 크루들의 에피소드를 모아 작성한 특별한 단행본입니다.</p>
                      </div>
                      <button 
                        onClick={() => { setAiBookContent(ep.content); setShowBookModal(true); }} 
                        className="px-6 py-2.5 mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                      >
                        단행본 열어보기 &gt;
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-heading font-extrabold text-lg text-forest">{ep.title}</h3>
                      <div className={`text-sm text-gray-700 font-body whitespace-pre-line leading-relaxed ${expandedEpisodes[ep.id] ? '' : 'line-clamp-3'}`}>
                        {ep.content}
                      </div>
                      {ep.content.length > 150 && (
                        <button onClick={() => setExpandedEpisodes(prev => ({...prev, [ep.id]: !prev[ep.id]}))} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
                          {expandedEpisodes[ep.id] ? '접기 ▲' : '더보기 ▼'}
                        </button>
                      )}
                      {ep.photo_urls && ep.photo_urls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {ep.photo_urls.map((url: string, idx: number) => (
                            <div key={idx} className="rounded-xl overflow-hidden aspect-square border border-gray-200">
                              <img src={url} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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
                    {(user?.id === ep.author_id || user?.id === hike?.organizer_id) && (
                      <div className="flex items-center space-x-3">
                        {!isAiBook && user?.id === ep.author_id && (
                          <button onClick={() => handleEditEpisode(ep)} className="text-[10px] text-gray-400 hover:text-forest transition font-bold">수정</button>
                        )}
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="text-[10px] text-gray-400 hover:text-red-500 transition font-bold">삭제</button>
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
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
                        {(user?.id === ep.author_id || user?.id === hike?.organizer_id) && (
                          <div className="flex items-center space-x-2">
                            {user?.id === ep.author_id && (
                              <button onClick={() => handleEditEpisode(ep)} className="text-[10px] text-amber-800/40 hover:text-amber-800 transition font-bold">수정</button>
                            )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
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

      {/* AI Episode Select Modal */}
      {showAiEpisodeSelectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6 border border-gray-100">
            <div>
              <h3 className="font-heading font-extrabold text-2xl text-forest mb-2">📑 에피소드 선택</h3>
              <p className="text-sm text-gray-500 font-body leading-relaxed">
                단행본에 포함할 에피소드를 선택해주세요.
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {episodes.filter(ep => ep.episode_type === 'general' || !ep.episode_type).map(ep => (
                <label key={ep.id} className="flex items-start space-x-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                  <input 
                    type="checkbox" 
                    checked={selectedAiEpisodes.includes(ep.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAiEpisodes(prev => [...prev, ep.id])
                      } else {
                        setSelectedAiEpisodes(prev => prev.filter(id => id !== ep.id))
                      }
                    }}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{ep.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ep.content}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">작성자: {ep.users?.nickname || '익명'}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer pl-1 mt-2">
                <input 
                  type="checkbox" 
                  checked={selectedAiEpisodes.length === episodes.filter(ep => ep.episode_type === 'general' || !ep.episode_type).length && selectedAiEpisodes.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAiEpisodes(episodes.filter(ep => ep.episode_type === 'general' || !ep.episode_type).map(ep => ep.id))
                    } else {
                      setSelectedAiEpisodes([])
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="font-bold">전체 선택</span>
              </label>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setShowAiEpisodeSelectModal(false)} 
                  className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (selectedAiEpisodes.length === 0) {
                      alert('최소 1개의 에피소드를 선택해주세요.')
                      return
                    }
                    if (!confirm('선택한 에피소드로 AI 단행본 생성을 진행하시겠습니까?')) {
                      return;
                    }
                    setShowAiEpisodeSelectModal(false)
                    proceedWithGeneration(selectedAiEpisodes)
                  }} 
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  선택 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Provider & Key Input Modal */}
      {showAiKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 border border-gray-100">
            <div>
              <h3 className="font-heading font-extrabold text-2xl text-forest mb-2">🔑 AI 단행본 만들기</h3>
              <p className="text-sm text-gray-500 font-body leading-relaxed">
                단행본을 작성할 AI 모델을 선택하고 해당 API Key를 입력해주세요. 입력하신 키는 서버 데이터베이스에 전송 및 저장되지 않으며, 편의를 위해 사용자 브라우저 안전 영역(Local Storage)에만 보관됩니다.
              </p>
            </div>
            
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setAiProvider('gemini')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${aiProvider === 'gemini' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Google Gemini
              </button>
              <button 
                onClick={() => setAiProvider('openai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${aiProvider === 'openai' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                ChatGPT
              </button>
              <button 
                onClick={() => setAiProvider('claude')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${aiProvider === 'claude' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Claude
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-forest">
                {aiProvider === 'gemini' && 'Gemini API Key'}
                {aiProvider === 'openai' && 'OpenAI API Key'}
                {aiProvider === 'claude' && 'Anthropic API Key'}
              </label>
              <input 
                type="password"
                value={aiKeyInput}
                onChange={(e) => setAiKeyInput(e.target.value)}
                placeholder={
                  aiProvider === 'gemini' ? 'AIzaSy...' :
                  aiProvider === 'openai' ? 'sk-proj-...' : 'sk-ant-...'
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-[11px] text-gray-500 font-body mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {aiProvider === 'gemini' && (
                  <>
                    <p className="font-bold text-gray-700 mb-1">💡 Gemini API Key 발급 방법</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Google AI Studio (링크)</a>에 로그인합니다.</li>
                      <li>'Get API key' 또는 'Create API key' 버튼을 클릭합니다.</li>
                      <li>프로젝트를 선택하여 키를 생성하고 복사합니다. (현재 무료 티어 제공)</li>
                    </ol>
                  </>
                )}
                {aiProvider === 'openai' && (
                  <>
                    <p className="font-bold text-gray-700 mb-1">💡 OpenAI API Key 발급 방법</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">OpenAI Platform (링크)</a>에 로그인합니다.</li>
                      <li>좌측 'API keys' 메뉴에서 'Create new secret key'를 클릭합니다.</li>
                      <li>생성된 키를 복사합니다. (사용을 위해 결제 수단 등록 필요)</li>
                    </ol>
                  </>
                )}
                {aiProvider === 'claude' && (
                  <>
                    <p className="font-bold text-gray-700 mb-1">💡 Anthropic Claude API Key 발급 방법</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Anthropic Console (링크)</a>에 로그인합니다.</li>
                      <li>우측 상단 프로필에서 Settings ➔ 'API Keys'로 이동합니다.</li>
                      <li>'Create Key'를 눌러 키를 생성하고 복사합니다.</li>
                    </ol>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAiKeyModal(false)} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition">취소</button>
              <button onClick={saveAiKeyAndGenerate} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
                저장 및 단행본 생성
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    
    {/* Book Viewer Modal (Rendered outside the main hidden wrapper for print) */}
    {showBookModal && (
      <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md overflow-y-auto print:static print:bg-white print:backdrop-blur-none print:block print:p-0">
        <style>{`
          @media print {
            html, body { 
              background: white !important; 
              background-image: none !important; 
            }
            * { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              box-shadow: none !important;
            }
          }
        `}</style>
        <div className="w-full max-w-5xl mx-auto bg-white min-h-screen my-0 md:my-8 p-8 md:p-20 shadow-2xl relative border-t-8 border-forest print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white">
          
          {/* Actions - Hidden on print */}
          <div className="absolute top-8 right-8 flex gap-2 flex-wrap justify-end print:hidden max-w-lg">
            {!episodes.some(ep => ep.episode_type === 'ai_book') && (
              <button 
                onClick={handleSaveAsEpisode} 
                className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition shadow-md flex items-center gap-2"
                disabled={isGeneratingBook}
              >
                <span>💾</span> 에피소드로 등록
              </button>
            )}
            <button 
              onClick={handleDownloadHtml} 
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2"
              disabled={isGeneratingBook}
            >
              <span>🌐</span> HTML 저장
            </button>
            <button 
              onClick={() => window.print()} 
              className="bg-terracotta text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-terracotta-dark transition shadow-md flex items-center gap-2"
              disabled={isGeneratingBook}
            >
              <span>🖨️</span> PDF 저장
            </button>
            <button 
              onClick={() => setShowBookModal(false)} 
              className="bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition shadow-sm"
            >
              닫기
            </button>
          </div>

          <div className="space-y-12">
            {/* Book Cover Header */}
            <div className="text-center space-y-6 pb-12 border-b-2 border-forest/20 mt-12 print:mt-0">
              <div className="text-terracotta font-bold tracking-[0.2em] text-sm uppercase">Traking Diary Vol. {hikeId}</div>
              <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-forest drop-shadow-sm leading-tight">
                {hike?.title}
              </h1>
              <p className="text-gray-500 font-body text-lg md:text-xl flex items-center justify-center gap-4">
                <span>⛰️ {hike?.mountain_name}</span>
                <span>•</span>
                <span>📅 {new Date(hike?.hike_date).toLocaleDateString()}</span>
              </p>
            </div>

            {/* Book Content */}
            <div className="px-4 md:px-12 py-8">
              {isGeneratingBook ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6 print:hidden">
                  <div className="text-6xl animate-bounce">🤖</div>
                  <h3 className="font-heading font-extrabold text-2xl text-forest">AI 작가님이 에세이를 집필 중입니다...</h3>
                  <p className="text-gray-500 font-body text-sm mb-4">크루들의 추억을 모아 멋진 글로 다듬고 있어요. (최대 30초 소요)</p>
                  <button 
                    onClick={() => {
                      setIsGeneratingBook(false)
                      setShowBookModal(false)
                    }}
                    className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-bold transition border border-gray-300"
                  >
                    집필 취소하기
                  </button>
                </div>
              ) : (
                <article id="book-article" className="prose-h2:font-heading prose-h2:text-3xl prose-h2:text-forest prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-strong:text-forest prose-strong:font-bold prose-p:text-black prose-p:leading-loose">
                  {renderBookContent()}
                </article>
              )}
            </div>

            {/* Book Footer */}
            {!isGeneratingBook && (
              <div className="pt-20 pb-8 text-center text-gray-400 font-label text-sm border-t border-gray-200 mt-20">
                Created with 🤖 {aiProvider === 'gemini' ? 'Google Gemini' : aiProvider === 'openai' ? 'OpenAI ChatGPT' : 'Anthropic Claude'} & TrakingDiary
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
