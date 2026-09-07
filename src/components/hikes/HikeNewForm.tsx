import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HikeNewFormProps {
  clubId: number
  onSuccess?: () => void
}

export const HikeNewForm: React.FC<HikeNewFormProps> = ({ clubId, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [mountainName, setMountainName] = useState('')
  const [hikeDate, setHikeDate] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      let coverImageUrl = null
      let driveFolderId = null
      
      if (imageFile) {
        if (!hikeDate) {
          throw new Error('이미지를 업로드하려면 먼저 트레킹 일시를 입력해야 합니다.')
        }
        
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('club_id', String(clubId))
        formData.append('hike_date', hikeDate)

        const uploadRes = await fetch('/api/drive/upload', {
          method: 'POST',
          body: formData
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || '이미지 업로드에 실패했습니다.')
        }
        coverImageUrl = uploadData.webContentLink
        driveFolderId = uploadData.targetFolderId
      }

      // 1. Insert Hike
      const { data: newHike, error: hikeError } = await supabase
        .from('hikes')
        .insert({
          club_id: clubId,
          organizer_id: user.id,
          title,
          mountain_name: mountainName,
          hike_date: hikeDate,
          difficulty,
          description,
          cover_image_url: coverImageUrl,
          google_drive_folder_id: driveFolderId,
          status: 'recruiting'
        } as any)
        .select()
        .single()

      if (hikeError) throw hikeError

      // 2. Add organizer as member automatically
      if (newHike) {
        await (supabase.from('hike_members') as any).insert({
          hike_id: (newHike as any).id,
          user_id: user.id,
          role: 'organizer',
          status: 'approved'
        })
      }

      if (onSuccess) onSuccess()
      // reset form
      setTitle('')
      setMountainName('')
      setHikeDate('')
      setDescription('')
      setImageFile(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || '일정 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-heading font-bold text-2xl text-forest mb-4">새 트레킹 일정 등록</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">제목 (모임명)</label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition" 
            placeholder="예: 북한산 단풍 트레킹" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">대상 산 이름</label>
            <input 
              type="text" 
              required 
              value={mountainName}
              onChange={(e) => setMountainName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition" 
              placeholder="예: 북한산" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">상세 설명</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition" 
              placeholder="코스 설명, 준비물, 회비 등을 입력하세요." 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">커버 이미지 첨부 (선택)</label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0])
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition bg-gray-50 text-sm" 
            />
            <p className="text-xs text-gray-500 mt-1">이미지는 동호회의 구글 공유 드라이브 일정 폴더에 안전하게 업로드됩니다.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">트레킹 일시</label>
            <input 
              type="datetime-local" 
              required 
              value={hikeDate}
              onChange={(e) => setHikeDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">난이도</label>
            <div className="flex space-x-4 h-full items-center">
              {['easy', 'medium', 'hard', 'expert'].map((lvl) => (
                <label key={lvl} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="difficulty" 
                    value={lvl} 
                    checked={difficulty === lvl} 
                    onChange={() => setDifficulty(lvl as any)}
                    className="text-forest focus:ring-forest"
                  />
                  <span className="text-sm font-bold">
                    {lvl === 'easy' ? '하' : lvl === 'medium' ? '중' : lvl === 'hard' ? '상' : '최상'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>


        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-forest hover:bg-forest-light text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '일정 등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
