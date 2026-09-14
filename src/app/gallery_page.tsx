'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

  const handleTogglePublish = async (photoId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_published: !currentStatus })
        .eq('id', photoId)

      if (error) throw error

      // Update local state
      setPhotos(photos.map(p => p.id === photoId ? { ...p, is_published: !currentStatus } : p))
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
      alert(t('gallery.toggleFail'))
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-paper-high shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="font-heading font-extrabold text-2xl text-forest">{t('gallery.title')}</h2>
        </div>
      </div>

      <div className="w-full xl:w-3/4 bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100 grid grid-cols-2 md:flex md:flex-row md:items-end gap-3 sm:gap-4">
        <div className="space-y-1 col-span-2 md:flex-1 md:min-w-[150px]">
          <label className="text-[10px] sm:text-xs font-bold text-gray-500">{t('gallery.filterHike')}</label>
          <select
            value={filterHikeId}
            onChange={(e) => setFilterHikeId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
          >
            <option value="all">{t('gallery.filterAllHikes')}</option>
            {hikes.map(h => (
              <option key={h.id} value={h.id}>{h.title} ({new Date(h.hike_date).toLocaleDateString()})</option>
            ))}
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
                <img src={photo.thumbnail_url || imgSrc} alt="Gallery Photo" loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" />

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

                {/* Download Original Button */}
                {photo.google_drive_web_link && (
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={photo.google_drive_web_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-bold rounded-full shadow backdrop-blur-md border bg-white/80 text-gray-700 border-gray-300 hover:bg-white flex items-center space-x-1"
                      title="원본 사진 다운로드 (Google Drive)"
                    >
                      <span>⬇️</span>
                    </a>
                  </div>
                )}

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
    </div>
  )
}
