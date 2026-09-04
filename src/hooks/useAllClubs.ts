import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Club } from './useClubs'

export interface ExtendedClub extends Club {
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  contact_phone?: string | null
  applicant_id?: string | null
  applicant_name?: string | null
  users?: { nickname: string } | null
}

export function useAllClubs(isAdmin: boolean) {
  const [clubs, setClubs] = useState<ExtendedClub[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchClubs = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('clubs')
      .select('id, owner_id, name, category, description, logo_url, status, created_at, contact_phone, applicant_id, applicant_name, users!clubs_owner_id_fkey(nickname)')
      .order('created_at', { ascending: false })
      
    // 일반 유저는 승인된 클럽만 볼 수 있음 (RLS도 처리하지만 명시적으로 쿼리)
    if (!isAdmin) {
      query = query.eq('status', 'approved')
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch all clubs:', error)
    } else if (data) {
      setClubs(data as ExtendedClub[])
    }
    setIsLoading(false)
  }, [isAdmin, supabase])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  const updateClubStatus = async (clubId: number, newStatus: 'approved' | 'rejected') => {
    const { error } = await (supabase.from('clubs') as any)
      .update({ status: newStatus })
      .eq('id', clubId)

    if (!error) {
      // 승인된 경우 owner_id를 club_members에 추가
      if (newStatus === 'approved') {
        const clubToApprove = clubs.find(c => c.id === clubId)
        if (clubToApprove) {
          await (supabase.from('club_members') as any).upsert({
            club_id: clubId,
            user_id: clubToApprove.owner_id,
            role: 'owner',
            status: 'approved',
          }, { onConflict: 'club_id,user_id' })
        }
      }
      // 리스트 새로고침
      await fetchClubs()
    } else {
      console.error('Failed to update club status:', error)
      throw error
    }
  }

  return { clubs, isLoading, updateClubStatus, refetch: fetchClubs }
}
