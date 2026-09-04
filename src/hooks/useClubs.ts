import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Club {
  id: number
  owner_id: string
  name: string
  category: string
  description: string
  logo_url: string | null
}

export function useClubs(userId: string | undefined) {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setClubs([])
      setIsLoading(false)
      return
    }

    const fetchClubs = async () => {
      setIsLoading(true)
      
      // 사용자(userId)가 멤버로 속해있고 승인된(status='approved') 동호회를 모두 가져온다.
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          clubs ( id, owner_id, name, category, description, logo_url )
        `)
        .eq('user_id', userId)
        .eq('status', 'approved')

      if (error) {
        console.error('Failed to fetch clubs:', error)
      } else if (data) {
        // clubs 배열로 매핑
        const mappedClubs = data
          .map((member: any) => member.clubs)
          .filter((club: any): club is any => club !== null) as Club[]
        
        setClubs(mappedClubs)
      }
      setIsLoading(false)
    }

    fetchClubs()
  }, [userId])

  return { clubs, isLoading }
}
