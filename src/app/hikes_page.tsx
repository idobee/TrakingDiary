'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { HikeNewForm } from '@/components/hikes/HikeNewForm'

export default function HikesPage() {
  const { t } = useTranslation()
  const supabase = createClient()
  const [hikes, setHikes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userClubId, setUserClubId] = useState<number | null>(null)

  useEffect(() => {
    const fetchHikesAndPermissions = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Find if user is admin in any club
        const { data: memberData } = await supabase
          .from('club_members')
          .select('club_id, role')
          .eq('user_id', user.id)
          .in('role', ['owner', 'admin'])
          .limit(1)
          .single()
        
        if (memberData) {
          setIsAdmin(true)
          setUserClubId((memberData as any).club_id)
        }
      }

      const { data: hikesData } = await supabase
        .from('hikes')
        .select(`
          id, title, mountain_name, hike_date, difficulty, status,
          clubs(name),
          users!hikes_organizer_id_fkey(nickname)
        `)
        .order('hike_date', { ascending: true })

      if (hikesData) {
        setHikes(hikesData)
      }
      setIsLoading(false)
    }

    fetchHikesAndPermissions()
  }, [supabase])

  const handleHikeCreated = () => {
    setShowNewForm(false)
    // Reload hikes
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-heading font-extrabold text-2xl text-forest">트레킹 모집</h1>
          {isAdmin && (
            <button 
              onClick={() => setShowNewForm(!showNewForm)}
              className="bg-terracotta hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm transition shadow-sm"
            >
              {showNewForm ? '목록으로 돌아가기' : '⛰️ 트레킹 일정 등록'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {showNewForm && userClubId ? (
          <div className="mb-8 max-w-2xl mx-auto">
            <HikeNewForm clubId={userClubId} onSuccess={handleHikeCreated} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-heading font-bold text-xl text-gray-800">다가오는 트레킹 일정</h2>
                <p className="text-gray-500 text-sm mt-1">함께 발맞춰 걸을 트레킹 메이트를 찾아보세요.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-bold animate-pulse">일정을 불러오는 중...</p>
              </div>
            ) : hikes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                <span className="text-5xl mb-4 block">🏔️</span>
                <p className="text-gray-600 font-bold text-lg">아직 등록된 트레킹 일정이 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">새로운 일정을 기다려주세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hikes.map(hike => (
                  <div key={hike.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        hike.status === 'recruiting' ? 'bg-green-100 text-green-700' :
                        hike.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {hike.status === 'recruiting' ? '모집중' : hike.status === 'completed' ? '완료됨' : '취소됨'}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        hike.difficulty === 'easy' ? 'bg-blue-50 text-blue-600' :
                        hike.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                        hike.difficulty === 'hard' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {hike.difficulty === 'easy' ? '하' : hike.difficulty === 'medium' ? '중' : hike.difficulty === 'hard' ? '상' : '최상'}
                      </span>
                    </div>
                    
                    <h3 className="font-heading font-bold text-xl text-forest mb-2 line-clamp-2 group-hover:text-terracotta transition">
                      {hike.title}
                    </h3>
                    
                    <div className="space-y-2 mt-4 text-sm text-gray-600">
                      <p className="flex items-center"><span className="w-5">📍</span> {hike.mountain_name}</p>
                      <p className="flex items-center"><span className="w-5">🗓️</span> {new Date(hike.hike_date).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="flex items-center"><span className="w-5">👥</span> 주최: {hike.users?.nickname || 'Unknown'} {hike.clubs?.name ? `(${hike.clubs.name})` : ''}</p>
                    </div>

                    <button className="w-full mt-6 bg-forest-container hover:bg-forest text-forest-dark hover:text-white font-bold py-3 rounded-xl transition">
                      자세히 보기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
