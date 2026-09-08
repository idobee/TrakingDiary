import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useClubMembers } from '@/hooks/useClubMembers'

interface ClubsAdminPageProps {
  clubId: number
}

import { HikeNewForm } from '@/components/hikes/HikeNewForm'
import { createClient } from '@/lib/supabase/client'

import { useAuth } from '@/lib/auth'

export const ClubsAdminPage: React.FC<ClubsAdminPageProps> = ({ clubId }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { members, isLoading, updateMemberStatus, removeMember } = useClubMembers(clubId)
  
  const currentUserMember = members.find(m => m.user_id === user?.id)
  const isClubAdmin = user?.system_role === 'admin' || currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'hikes_new' | 'badges'>('approved')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const [customBadges, setCustomBadges] = useState<any[]>([])
  const [newBadgeName, setNewBadgeName] = useState('')
  const [newBadgeIcon, setNewBadgeIcon] = useState('🏆')
  const [newBadgeDesc, setNewBadgeDesc] = useState('')
  const [isCreatingBadge, setIsCreatingBadge] = useState(false)

  const [showDriveModal, setShowDriveModal] = useState(false)
  const [driveFolderId, setDriveFolderId] = useState('')
  const [driveJson, setDriveJson] = useState('')
  const [isSavingDrive, setIsSavingDrive] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCustomBadges()
  }, [clubId])

  const fetchCustomBadges = async () => {
    const { data } = await supabase.from('badges').select('*').eq('club_id', clubId)
    if (data) setCustomBadges(data)
  }

  const handleCreateBadge = async () => {
    if (!newBadgeName.trim() || !newBadgeIcon.trim()) return
    setIsCreatingBadge(true)
    try {
      const { error } = await supabase.from('badges').insert({
        club_id: clubId,
        name: newBadgeName,
        icon_name: newBadgeIcon,
        description: newBadgeDesc
      })
      if (error) throw error
      alert('뱃지가 생성되었습니다!')
      setNewBadgeName('')
      setNewBadgeDesc('')
      fetchCustomBadges()
    } catch (err: any) {
      alert('뱃지 생성 실패: ' + err.message)
    } finally {
      setIsCreatingBadge(false)
    }
  }
  
  const handleDeleteBadge = async (badgeId: number) => {
    if (!window.confirm('정말 이 뱃지를 삭제하시겠습니까?')) return
    try {
      const { error } = await supabase.from('badges').delete().eq('id', badgeId)
      if (error) throw error
      fetchCustomBadges()
    } catch (err: any) {
      alert('뱃지 삭제 실패: ' + err.message)
    }
  }

  const handleOpenDriveModal = async () => {
    setShowDriveModal(true)
    const { data } = await supabase.from('clubs').select('google_drive_folder_id, google_drive_credentials_json').eq('id', clubId).single()
    if (data) {
      setDriveFolderId((data as any).google_drive_folder_id || '')
      setDriveJson((data as any).google_drive_credentials_json || '')
    }
  }

  const handleSaveDriveSettings = async () => {
    // Only used if they want to manually unlink, but we'll repurpose this to clear the link if needed
    if (window.confirm("정말 드라이브 연동을 해제하시겠습니까?")) {
      setIsSavingDrive(true)
      try {
        const { error } = await (supabase as any).from('clubs').update({
          google_drive_folder_id: null,
          google_drive_credentials_json: null
        }).eq('id', clubId)
        if (error) throw error
        alert('해제되었습니다.')
        setDriveFolderId('')
        setDriveJson('')
      } catch (e: any) {
        alert('해제 실패: ' + e.message)
      } finally {
        setIsSavingDrive(false)
      }
    }
  }

  const handleOAuthLogin = () => {
    window.location.href = `/api/drive/auth?club_id=${clubId}`
  }

  const pendingMembers = members.filter(m => m.status === 'pending')
  const approvedMembers = members.filter(m => m.status === 'approved')

  const copyInviteLink = (role: 'regular' | 'guest') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/?invite_club_id=${clubId}&invite_role=${role}`
    navigator.clipboard.writeText(link).then(() => {
      setCopyFeedback(role === 'regular' ? '정회원 초대 링크가 복사되었습니다.' : '게스트 초대 링크가 복사되었습니다.')
      setTimeout(() => setCopyFeedback(null), 3000)
    })
  }

  const handlePromoteAdmin = (userId: string) => {
    const alias = window.prompt("부관리자의 별칭(예: 부회장, 총무)을 입력해주세요:")
    if (alias !== null) {
      updateMemberStatus(userId, 'approved', 'admin', alias)
    }
  }

  const handleDemoteAdmin = (userId: string) => {
    if (window.confirm("운영진 권한을 회수하시겠습니까?")) {
      updateMemberStatus(userId, 'approved', 'regular', null)
    }
  }

  const renderMemberRow = (member: any, isPending: boolean) => {
    const name = member.users?.nickname || 'Unknown'
    const email = member.users?.email || ''
    const avatar = member.users?.avatar_url || ''
    
    return (
      <div key={member.user_id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-3">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-forest text-white flex items-center justify-center font-bold text-xl">{name.charAt(0)}</div>}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-heading font-bold text-forest text-lg">{name}</h4>
              {member.role_title && (
                <span className="text-xs bg-forest-container text-forest-dark px-2 py-0.5 rounded-full font-bold">
                  {member.role_title}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{email}</p>
            {!isPending && (
              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full font-bold ${
                member.role === 'owner' ? 'bg-terracotta text-white' : 
                member.role === 'admin' ? 'bg-forest text-white' : 
                member.role === 'guest' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
              }`}>
                {member.role === 'owner' ? '모임장' : member.role === 'admin' ? '운영진' : member.role === 'guest' ? '게스트' : '정회원'}
              </span>
            )}
          </div>
        </div>
        
        
        <div className="flex space-x-2">
          {isClubAdmin && (
            isPending ? (
              <>
                <button onClick={() => updateMemberStatus(member.user_id, 'approved', 'regular')} className="bg-forest hover:bg-forest-light text-white text-xs font-bold py-2 px-3 rounded-lg transition">정회원 승인</button>
                <button onClick={() => updateMemberStatus(member.user_id, 'approved', 'guest')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-2 px-3 rounded-lg transition">게스트 승인</button>
                <button onClick={() => updateMemberStatus(member.user_id, 'rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-3 rounded-lg transition">거절</button>
              </>
            ) : (
              <>
                {member.role !== 'owner' && (
                  <>
                    {member.role === 'guest' && (
                      <button onClick={() => updateMemberStatus(member.user_id, 'approved', 'regular')} className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 px-3 rounded-lg transition">정회원으로 변경</button>
                    )}
                    {member.role === 'regular' && (
                      <>
                        <button onClick={() => handlePromoteAdmin(member.user_id)} className="bg-forest-container hover:bg-forest hover:text-white text-forest-dark text-xs font-bold py-2 px-3 rounded-lg transition">부관리자 임명</button>
                        <button onClick={() => updateMemberStatus(member.user_id, 'approved', 'guest')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition">게스트로 변경</button>
                      </>
                    )}
                    {member.role === 'admin' && (
                      <button onClick={() => handleDemoteAdmin(member.user_id)} className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold py-2 px-3 rounded-lg transition">권한 회수</button>
                    )}
                    <button onClick={() => removeMember(member.user_id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-3 rounded-lg transition">강제 탈퇴</button>
                  </>
                )}
              </>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-paper-high min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-3xl text-forest">{isClubAdmin ? '동호회 관리 센터' : '동호회 회원 명단'}</h2>
          <p className="text-gray-500 text-sm mt-1">{isClubAdmin ? '멤버를 초대하고 가입 신청을 관리하세요.' : '우리 동호회에 가입된 회원들을 확인해 보세요.'}</p>
        </div>
        
        {isClubAdmin && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex space-x-2">
              <button 
                onClick={handleOpenDriveModal}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition shadow-sm flex items-center space-x-2"
              >
                <span>📁</span>
                <span>구글 드라이브 연동</span>
              </button>
              <button 
                onClick={() => copyInviteLink('regular')}
                className="bg-forest-container hover:bg-forest text-white text-sm font-bold py-2 px-4 rounded-xl transition shadow-sm flex items-center space-x-2"
              >
                <span>🔗</span>
                <span>정회원 초대 링크 복사</span>
              </button>
              <button 
                onClick={() => copyInviteLink('guest')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded-xl transition shadow-sm flex items-center space-x-2"
              >
                <span>🔗</span>
                <span>게스트 초대 링크 복사</span>
              </button>
            </div>
            {copyFeedback && (
              <span className="text-xs text-terracotta font-bold animate-pulse">{copyFeedback}</span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        {isClubAdmin && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 font-heading font-bold text-lg transition ${
              activeTab === 'pending'
                ? 'text-forest border-b-4 border-terracotta'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            가입신청 대기 회원 <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{pendingMembers.length}</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 font-heading font-bold text-lg transition ${
            activeTab === 'approved'
              ? 'text-forest border-b-4 border-terracotta'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          가입회원 명단 <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{approvedMembers.length}</span>
        </button>
        {isClubAdmin && (
          <>
            <button
              onClick={() => setActiveTab('hikes_new')}
              className={`pb-3 font-heading font-bold text-lg transition ${
                activeTab === 'hikes_new'
                  ? 'text-forest border-b-4 border-terracotta'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ⛰️ 트레킹 일정 등록
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`pb-3 font-heading font-bold text-lg transition ${
                activeTab === 'badges'
                  ? 'text-forest border-b-4 border-terracotta'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🏅 커스텀 뱃지 관리
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="bg-paper rounded-2xl p-4 min-h-[300px]">
        {isLoading && activeTab !== 'hikes_new' ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400 animate-pulse font-bold">회원 목록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <div>
                {pendingMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-500 font-body">대기 중인 가입 신청이 없습니다.</p>
                  </div>
                ) : (
                  pendingMembers.map(m => renderMemberRow(m, true))
                )}
              </div>
            )}
            
            {activeTab === 'approved' && (
              <div>
                {approvedMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">👥</span>
                    <p className="text-gray-500 font-body">아직 가입한 회원이 없습니다.</p>
                  </div>
                ) : (
                  approvedMembers.map(m => renderMemberRow(m, false))
                )}
              </div>
            )}
            
            {activeTab === 'hikes_new' && (
              <HikeNewForm 
                clubId={clubId} 
                onSuccess={() => {
                  alert("일정이 성공적으로 등록되었습니다!");
                  // Optionally redirect or reset
                }} 
              />
            )}

            {activeTab === 'badges' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-heading font-bold text-lg text-forest mb-4">새 커스텀 뱃지 만들기</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24">
                      <label className="block text-xs font-bold text-gray-500 mb-1">아이콘(이모지)</label>
                      <input 
                        type="text" 
                        value={newBadgeIcon}
                        onChange={(e) => setNewBadgeIcon(e.target.value)}
                        className="w-full text-center text-2xl py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest outline-none"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">뱃지 이름</label>
                      <input 
                        type="text" 
                        value={newBadgeName}
                        onChange={(e) => setNewBadgeName(e.target.value)}
                        placeholder="예: 한라산 날다람쥐"
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl font-heading text-sm text-forest focus:ring-2 focus:ring-forest outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">빠른 선택</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['🏆', '⛰️', '🔥', '🦅', '👟', '🌲', '🎒', '🏅', '⭐', '🏃‍♂️', '💪', '👑', '🥇', '🍀', '🍎'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewBadgeIcon(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-200 transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">부여 조건 (선택)</label>
                    <input 
                      type="text" 
                      value={newBadgeDesc}
                      onChange={(e) => setNewBadgeDesc(e.target.value)}
                      placeholder="예: 한라산 등반 3회 완료 시 부여"
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl font-body text-sm text-gray-700 focus:ring-2 focus:ring-forest outline-none"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleCreateBadge}
                      disabled={isCreatingBadge || !newBadgeName.trim() || !newBadgeIcon.trim()}
                      className="bg-forest hover:bg-forest-light text-white font-bold py-2.5 px-6 rounded-xl transition disabled:opacity-50"
                    >
                      {isCreatingBadge ? '생성 중...' : '뱃지 만들기'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-forest mb-4">등록된 커스텀 뱃지</h3>
                  {customBadges.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-body text-sm">등록된 커스텀 뱃지가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {customBadges.map(badge => (
                        <div key={badge.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center relative group">
                          <button 
                            onClick={() => handleDeleteBadge(badge.id)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                          <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-2 shadow-inner border border-gray-100">
                            {badge.icon_name}
                          </div>
                          <h4 className="font-heading font-bold text-forest text-sm">{badge.name}</h4>
                          {badge.description && <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{badge.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6">
            <h3 className="font-heading font-extrabold text-2xl text-forest mb-4">구글 드라이브 연동 설정</h3>
            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mb-6">
              <p className="font-bold mb-1">ℹ️ 방법 안내</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>하단의 버튼을 눌러 본인의 구글 계정으로 로그인합니다.</li>
                <li>접근 권한(Drive)을 모두 허용해 주시면 즉시 연동됩니다.</li>
                <li>연동이 완료되면 앨범 사진들이 자동으로 해당 계정에 저장됩니다.</li>
              </ul>
            </div>

            <div className="space-y-4 text-center py-6">
              {driveFolderId ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200">
                  <div className="text-4xl mb-3">✅</div>
                  <h4 className="font-bold text-lg mb-2">구글 드라이브 연동 완료</h4>
                  <p className="text-sm opacity-90 mb-4 font-body leading-relaxed">
                    회원님의 구글 드라이브(내 드라이브) 최상단에 <br/>
                    <strong className="text-forest">TrackingDiary_동호회이름</strong> 폴더가 자동 생성되었습니다.<br/>
                    앞으로 업로드되는 사진들은 이곳에 저장됩니다!
                  </p>
                  <a 
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-white text-green-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-green-200 hover:bg-green-100 transition"
                  >
                    <span>📂</span>
                    <span>내 구글 드라이브 폴더 열기</span>
                  </a>
                  <p className="text-[10px] font-mono mt-5 opacity-40">Folder ID: {driveFolderId}</p>
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-800 p-6 rounded-2xl border border-gray-200">
                  <div className="text-4xl mb-3">🔒</div>
                  <h4 className="font-bold text-lg mb-1">연동 대기 중</h4>
                  <p className="text-xs opacity-80 mb-6">아래 버튼을 눌러 구글 계정으로 로그인해 주세요.</p>
                  <button 
                    onClick={handleOAuthLogin}
                    className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>🚀 구글 로그인으로 드라이브 1초 연동하기</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowDriveModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                닫기
              </button>
              {driveFolderId && (
                <button 
                  onClick={handleSaveDriveSettings}
                  disabled={isSavingDrive}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-terracotta hover:bg-red-700 transition shadow-md disabled:opacity-50"
                >
                  {isSavingDrive ? '처리 중...' : '연동 해제'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
