import React, { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useClubMembers } from '@/hooks/useClubMembers'

interface ClubsAdminPageProps {
  clubId: number
}

import { HikeNewForm } from '@/components/hikes/HikeNewForm'

export const ClubsAdminPage: React.FC<ClubsAdminPageProps> = ({ clubId }) => {
  const { t } = useTranslation()
  const { members, isLoading, updateMemberStatus, removeMember } = useClubMembers(clubId)
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'hikes_new'>('pending')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

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
          {isPending ? (
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
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-paper-high min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-3xl text-forest">동호회 관리 센터</h2>
          <p className="text-gray-500 text-sm mt-1">멤버를 초대하고 가입 신청을 관리하세요.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex space-x-2">
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
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap pb-2">
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
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 font-heading font-bold text-lg transition ${
            activeTab === 'approved'
              ? 'text-forest border-b-4 border-terracotta'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          가입회원 관리 <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{approvedMembers.length}</span>
        </button>
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
          </>
        )}
      </div>
    </div>
  )
}
