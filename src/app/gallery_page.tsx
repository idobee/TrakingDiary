'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import { useTranslation } from '@/lib/i18n'

interface GalleryPageProps {
  clubId: number | null
  initialHikeId?: number | null
}

export function GalleryPage({ clubId, initialHikeId }: GalleryPageProps) {
  const { t } = useTranslation()
  const [hikes, setHikes] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [filterHikeId, setFilterHikeId] = useState<string | number>(initialHikeId || 'all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

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
      // 1. 해당 동호회의 모든 트레킹(Hike) 조회
      const { data: hikeData, error: hikeError } = await supabase
        .from('hikes')
        .select('id, title, hike_date')
        .eq('club_id', clubId)
        .order('hike_date', { ascending: false })

      if (hikeError) throw hikeError
      setHikes(hikeData || [])

      const hikeIds = (hikeData || []).map((h: any) => h.id)

      if (hikeIds.length === 0) {
        setPhotos([])
        return
      }

      // 2. 조건에 맞는 사진 조회
      let query = supabase
        .from('photos')
        .select(`
          *,
          hikes ( title ),
          users ( nickname )
        `)
        .in('hike_id', hikeIds)
        .order('created_at', { ascending: false })

      if (filterHikeId !== 'all') {
        query = query.eq('hike_id', filterHikeId)
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

  const handleResetFilters = () => {
    setFilterHikeId('all')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-paper-high shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="font-heading font-extrabold text-2xl text-forest">사진첩</h2>
          <span className="bg-forest-light/20 text-forest text-xs font-bold px-2 py-1 rounded-full">UC9</span>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500">트레킹 다이어리</label>
          <select 
            value={filterHikeId} 
            onChange={(e) => setFilterHikeId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          >
            <option value="all">전체 트레킹</option>
            {hikes.map(h => (
              <option key={h.id} value={h.id}>{h.title} ({new Date(h.hike_date).toLocaleDateString()})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">기간 검색 (시작일)</label>
          <input 
            type="date" 
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">기간 검색 (종료일)</label>
          <input 
            type="date" 
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          />
        </div>

        <button 
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-300 transition"
        >
          초기화
        </button>
      </div>

      {/* 사진 갤러리 영역 (Masonry 스타일) */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <span className="text-forest animate-pulse font-bold">로딩 중...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <p className="text-gray-400 font-bold">조건에 맞는 사진이 없습니다.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map(photo => {
            const imgSrc = photo.thumbnail_url || `https://drive.google.com/thumbnail?id=${photo.google_drive_file_id}&sz=w800`
            return (
              <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                <img src={imgSrc} alt="Gallery Photo" className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" />
                
                {/* 메타데이터 오버레이 (Hover 시 표시) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
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
    </div>
  )
}
