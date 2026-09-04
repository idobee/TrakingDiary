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
    }
    if (newRoleTitle !== undefined) {
      updateData.role_title = newRoleTitle
    }
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }

    const { error } = await (supabase.from('club_members') as any)
      .update(updateData)
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to update member status:', error)
      return false
    }

    await fetchMembers()
    return true
  }

  const removeMember = async (userId: string) => {
    if (!clubId) return false

    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to remove member:', error)
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
