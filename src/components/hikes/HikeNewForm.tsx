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
  const [imageUrl, setImageUrl] = useState('')
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

      // 1. Insert Hike first (with image URL if provided, else without cover image)
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
          cover_image_url: imageUrl || null,
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

      // 3. Upload image if exists and update hike
      if (imageFile && newHike) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('club_id', String(clubId))
        formData.append('hike_date', hikeDate)
        formData.append('hike_id', String((newHike as any).id))
        formData.append('uploader_id', user.id)

        const uploadRes = await fetch('/api/drive/upload', {
          method: 'POST',
          body: formData
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || '이미지 업로드에 실패했습니다.')
        }

        // Update hike with image url and folder id
        await supabase.from('hikes').update({
          cover_image_url: uploadData.webContentLink,
          google_drive_folder_id: uploadData.targetFolderId
        }).eq('id', (newHike as any).id)
      }

      if (onSuccess) onSuccess()
      // reset form
      setTitle('')
      setMountainName('')
      setHikeDate('')
      setDescription('')
      setImageFile(null)
      setImageUrl('')
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
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-gray-700">커버 이미지 첨부 (선택)</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 mb-1 block">파일 직접 업로드 (구글 드라이브 저장)</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                      setImageUrl('')
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition bg-gray-50 text-sm" 
                />
              </div>
              <div className="flex items-center justify-center pt-5">
                <span className="text-gray-400 text-xs font-bold bg-white px-2">또는</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 mb-1 block">이미지 링크(URL) 입력</span>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    if (e.target.value) setImageFile(null)
                  }}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-forest focus:border-forest outline-none transition text-sm" 
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">파일을 직접 업로드하거나, 외부 이미지 링크(URL)를 복사해서 붙여넣을 수 있습니다.</p>
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
