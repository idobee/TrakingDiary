import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type ClubMemberRow = Database['public']['Tables']['club_members']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

export interface ExtendedClubMember extends ClubMemberRow {
  users?: {
    nickname: string
    email: string
    avatar_url: string | null
  } | null
}

export function useClubMembers(clubId: number | null) {
  const [members, setMembers] = useState<ExtendedClubMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchMembers = useCallback(async () => {
    if (!clubId) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from('club_members')
      .select('club_id, user_id, role, role_title, status, applied_at, approved_at, users!club_members_user_id_fkey(nickname, email, avatar_url)')
      .eq('club_id', clubId)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch club members:', error)
    } else if (data) {
      // Cast the result because Supabase types might not perfectly infer the join if Relationships is missing
      setMembers(data as any as ExtendedClubMember[])
    }
    setIsLoading(false)
  }, [clubId, supabase])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const updateMemberStatus = async (
    userId: string,
    newStatus: 'pending' | 'approved' | 'rejected',
    newRole?: 'owner' | 'admin' | 'regular' | 'guest',
    newRoleTitle?: string | null
  ) => {
    if (!clubId) return false

    const updateData: any = { status: newStatus }
    if (newRole) {
      updateData.role = newRole
      // If role_title isn't explicitly provided, infer it from the newRole if it's regular/guest
      if (newRoleTitle === undefined && (newRole === 'regular' || newRole === 'guest')) {
        updateData.role_title = newRole === 'guest' ? '게스트' : '정회원'
      }
    }
    if (newRoleTitle !== undefined) {
      updateData.role_title = newRoleTitle
    }
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/clubs/members/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          clubId,
          userId,
          updateData
        })
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        console.error('Failed to update member status:', result.error)
        alert(`권한 변경 실패: ${result.error || '권한이 없습니다.'}`)
        return false
      }
    } catch (error: any) {
      console.error('Failed to update member status:', error)
      alert(`권한 변경 중 오류가 발생했습니다.`)
      return false
    }

    await fetchMembers()
    return true
  }

  const removeMember = async (userId: string) => {
    if (!clubId) return false

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`/api/clubs/members/update?clubId=${clubId}&userId=${userId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        }
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        console.error('Failed to remove member:', result.error)
        alert(`멤버 강제 탈퇴 실패: ${result.error || '권한이 없습니다.'}`)
        return false
      }
    } catch (error: any) {
      console.error('Failed to remove member:', error)
      alert(`멤버 강제 탈퇴 중 오류가 발생했습니다.`)
      return false
    }

    await fetchMembers()
    return true
  }

  return {
    members,
    isLoading,
    fetchMembers,
    updateMemberStatus,
    removeMember,
  }
}
