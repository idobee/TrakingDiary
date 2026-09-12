'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { HikeNewForm } from '@/components/hikes/HikeNewForm'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HikesPage({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const { t } = useTranslation()
  const supabase = createClient()
  const [hikes, setHikes] = useState<any[]>([])
  const [joinedHikeIds, setJoinedHikeIds] = useState<Set<number>>(new Set())
  const [selectedHikeToJoin, setSelectedHikeToJoin] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userClubId, setUserClubId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState(new Date())

  const fetchHikesAndPermissions = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    setCurrentUserId(user.id)

    // 1. Fetch user's joined clubs
    const { data: userClubsData } = await supabase
      .from('club_members')
      .select('club_id, role')
      .eq('user_id', user.id)
      .in('status', ['approved'])

    const clubIds = userClubsData ? userClubsData.map((c: any) => c.club_id) : []

    // Check if user is admin in any of these clubs
    const adminClub = userClubsData?.find((c: any) => c.role === 'owner' || c.role === 'admin')
    if (adminClub) {
      setIsAdmin(true)
      setUserClubId((adminClub as any).club_id)
    }

    // 2. Fetch hikes for these clubs that are recruiting
    if (clubIds.length > 0) {
      const { data: hikesData } = await supabase
        .from('hikes')
        .select(`
          id, title, mountain_name, hike_date, difficulty, status, organizer_id, description, cover_image_url,
          clubs(name),
          users!hikes_organizer_id_fkey(nickname)
        `)
        .in('club_id', clubIds)
        .eq('status', 'recruiting')
        .order('hike_date', { ascending: false })

      if (hikesData) {
        setHikes(hikesData)
      }

      // 3. Fetch user's joined hikes
      const hikeIds = hikesData ? hikesData.map((h: any) => h.id) : []
      if (hikeIds.length > 0) {
        const { data: myHikesData } = await supabase
          .from('hike_members')
          .select('hike_id')
          .eq('user_id', user.id)
          .in('hike_id', hikeIds)

        if (myHikesData) {
          setJoinedHikeIds(new Set(myHikesData.map((h: any) => h.hike_id)))
        }
      }
    } else {
      setHikes([])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchHikesAndPermissions()
  }, [supabase])

  useEffect(() => {
    const fetchParticipants = async () => {
      if (selectedHikeToJoin) {
        const { data } = await supabase
          .from('hike_members')
          .select('role, users!hike_members_user_id_fkey(nickname, avatar_url)')
          .eq('hike_id', selectedHikeToJoin.id)
          .eq('status', 'approved')

        if (data) {
          setParticipants(data)
        }
      } else {
        setParticipants([])
      }
    }
    fetchParticipants()
  }, [selectedHikeToJoin, supabase])

  const handleHikeCreated = () => {
    setShowNewForm(false)
    fetchHikesAndPermissions()
  }

  const handleJoinHike = async (hikeId: number) => {
    if (!currentUserId) return

    const { error } = await (supabase.from('hike_members') as any).insert({
      hike_id: hikeId,
      user_id: currentUserId,
      role: 'member',
      status: 'approved' // 즉시 승인
    })

    if (error) {
      alert(t('hikes.alertJoinFail') + error.message)
    } else {
      alert(t('hikes.alertJoinSuccess'))
      setSelectedHikeToJoin(null)
      fetchHikesAndPermissions()
    }
  }

  const handleLeaveHike = async (hikeId: number) => {
    if (!currentUserId) return

    if (!window.confirm(t('hikes.confirmLeave'))) return

    const { error } = await supabase
      .from('hike_members')
      .delete()
      .eq('hike_id', hikeId)
      .eq('user_id', currentUserId)

    if (error) {
      alert(t('hikes.alertLeaveFail') + error.message)
    } else {
      alert(t('hikes.alertLeaveSuccess'))
      setSelectedHikeToJoin(null)
      fetchHikesAndPermissions()
    }
  }

  // --- Calendar Helpers ---
  const formatDateMMDD = (d: Date) => {
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`
  }

  const getDayOfWeek = (dateString: string) => {
    const days = t('hikes.days').split(',')
    return days[new Date(dateString).getDay()]
  }

  const getWeeksOfMonth = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const weeks = []
    let currentStart = new Date(firstDay)
    let weekNum = 1

    while (currentStart <= lastDay && weekNum <= 5) {
      const currentEnd = new Date(currentStart)
      currentEnd.setDate(currentStart.getDate() + 6)
      const end = currentEnd > lastDay ? lastDay : currentEnd

      weeks.push({
        weekNum,
        start: new Date(currentStart),
        end: new Date(end)
      })

      currentStart.setDate(currentStart.getDate() + 7)
      weekNum++
    }
    return weeks
  }

  const monthWeeks = getWeeksOfMonth().map(w => {
    const weekHikes = hikes.filter(h => {
      const d = new Date(h.hike_date)
      const hDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const sDate = new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate())
      const eDate = new Date(w.end.getFullYear(), w.end.getMonth(), w.end.getDate())
      return hDate >= sDate && hDate <= eDate
    })
    return { ...w, hikes: weekHikes }
  })

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-forest">{t('hikes.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('hikes.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-terracotta hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm transition shadow-md"
          >
            {showNewForm ? t('hikes.backToList') : t('hikes.createNew')}
          </button>
        )}
      </div>

      <div>
        {showNewForm && userClubId ? (
          <div className="mb-8 max-w-2xl mx-auto">
            <HikeNewForm clubId={userClubId} onSuccess={handleHikeCreated} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Hike Cards */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-heading font-bold text-xl text-gray-800">{t('hikes.upcomingTitle')}</h2>
                  <p className="text-gray-500 text-sm mt-1">{t('hikes.subtitle')}</p>
                </div>
              </div>

              {isLoading ? (
                <div className="py-20 text-center">
                  <p className="text-gray-400 font-bold animate-pulse">{t('hikes.loading')}</p>
                </div>
              ) : hikes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <span className="text-5xl mb-4 block">🏔️</span>
                  <p className="text-gray-600 font-bold text-lg">{t('hikes.emptyTitle')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('hikes.emptyDesc')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {hikes.map(hike => {
                    const isOrganizer = hike.organizer_id === currentUserId
                    const isJoined = joinedHikeIds.has(hike.id)

                    return (
                      <div key={hike.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            {new Date(hike.hike_date) >= new Date(new Date().setHours(0,0,0,0)) && (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                {t('hikes.recruitingBadge')}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${hike.difficulty === 'easy' ? 'bg-blue-50 text-blue-600' :
                                hike.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                  hike.difficulty === 'hard' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                              }`}>
                              {t('hikes.difficulty')}: {hike.difficulty === 'easy' ? t('hikes.diffEasy') : hike.difficulty === 'medium' ? t('hikes.diffMedium') : hike.difficulty === 'hard' ? t('hikes.diffHard') : t('hikes.diffExpert')}
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedHikeToJoin(hike)}
                            className="font-heading font-bold text-xl text-forest hover:text-forest-light text-left mb-2 line-clamp-2 transition hover:underline"
                          >
                            {hike.title}
                          </button>

                          <div className="space-y-2 mt-4 text-sm text-gray-600">
                            <p className="flex items-center"><span className="w-5">📍</span> {hike.mountain_name}</p>
                            <p className="flex items-center"><span className="w-5">🗓️</span> {new Date(hike.hike_date).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="flex items-center"><span className="w-5">👥</span> {t('hikes.hostPrefix')} {hike.users?.nickname || t('hikes.unknown')} {hike.clubs?.name ? `(${hike.clubs.name})` : ''}</p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col space-y-2">
                          {new Date(hike.hike_date) < new Date(new Date().setHours(0,0,0,0)) || hike.status === 'completed' ? (
                            <button
                              onClick={() => {
                                if (onNavigateTab) onNavigateTab('diaries')
                              }}
                              className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                            >
                              {t('hikes.viewAlbum')}
                            </button>
                          ) : isOrganizer ? (
                            <div className="text-center py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 font-bold text-sm">
                              {t('hikes.myHostedHike')}
                            </div>
                          ) : isJoined ? (
                            <button
                              onClick={() => handleLeaveHike(hike.id)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition border border-red-200"
                            >
                              {t('hikes.cancelJoin')}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedHikeToJoin(hike)}
                              className="w-full bg-forest hover:bg-forest-light text-white font-bold py-3 rounded-xl transition shadow-md"
                            >
                              {t('hikes.join')}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Weekly Schedule Calendar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h3 className="font-heading font-extrabold text-lg text-forest">
                    {t('hikes.calendarTitle', { year: calendarDate.getFullYear(), month: calendarDate.getMonth() + 1 })}
                  </h3>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div className="space-y-5">
                  {monthWeeks.map((week, index) => (
                    <div key={index} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="text-xs font-bold text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg inline-block">
                        {t('hikes.weekNum', { week: week.weekNum })} <span className="font-normal text-gray-400 ml-1">({formatDateMMDD(week.start)} ~ {formatDateMMDD(week.end)})</span>
                      </div>
                      {week.hikes.length > 0 ? (
                        <ul className="space-y-3">
                          {week.hikes.map((hike: any) => (
                            <li key={hike.id} className="text-sm flex items-start">
                              <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded text-[10px] mt-0.5 mr-2 shrink-0">
                                {getDayOfWeek(hike.hike_date)}
                              </span>
                              <button
                                onClick={() => setSelectedHikeToJoin(hike)}
                                className="hover:underline hover:text-forest transition text-left text-gray-700 font-bold leading-tight"
                              >
                                {hike.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 pl-1">{t('hikes.noSchedule')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {selectedHikeToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="h-48 w-full bg-gray-200 relative shrink-0">
              <img
                src={selectedHikeToJoin.cover_image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop'}
                alt="Hike cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-heading font-extrabold text-2xl line-clamp-1">{selectedHikeToJoin.title}</h3>
                <p className="text-gray-200 text-sm mt-1">{selectedHikeToJoin.mountain_name}</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="font-bold text-gray-700 mb-2">{t('hikes.details')}</h4>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 min-h-[80px]">
                  {selectedHikeToJoin.description ? selectedHikeToJoin.description.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}<br /></span>
                  )) : t('hikes.noDetails')}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-gray-700 mb-2">{t('hikes.participants')}</h4>
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-400">{t('hikes.noParticipants')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center">
                        {p.role === 'organizer' && '👑 '}
                        {p.users?.nickname || t('hikes.unknown')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setSelectedHikeToJoin(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  {t('hikes.close')}
                </button>
                {selectedHikeToJoin.status === 'completed' || new Date(selectedHikeToJoin.hike_date) < new Date(new Date().setHours(0,0,0,0)) ? (
                  <button
                    onClick={() => {
                      setSelectedHikeToJoin(null)
                      if (onNavigateTab) onNavigateTab('diaries')
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                  >
                    {t('hikes.viewAlbum')}
                  </button>
                ) : selectedHikeToJoin.organizer_id === currentUserId ? (
                  <div className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 border border-gray-200 text-center flex items-center justify-center">
                    {t('hikes.hostedHike')}
                  </div>
                ) : joinedHikeIds.has(selectedHikeToJoin.id) ? (
                  <button
                    onClick={() => handleLeaveHike(selectedHikeToJoin.id)}
                    className="flex-1 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition shadow-sm"
                  >
                    {t('hikes.cancelJoin')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinHike(selectedHikeToJoin.id)}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-forest hover:bg-forest-light transition shadow-md"
                  >
                    {t('hikes.join')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
