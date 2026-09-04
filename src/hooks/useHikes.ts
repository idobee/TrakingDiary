import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Hike {
  id: number
  club_id: number
  organizer_id: string
  title: string
  mountain_name: string
  hike_date: string
  difficulty: string
  status: string
  description: string
}

export function useHikes(clubId: number | undefined) {
  const [hikes, setHikes] = useState<Hike[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!clubId) {
      setHikes([])
      setIsLoading(false)
      return
    }

    const fetchHikes = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('club_id', clubId)
        .order('hike_date', { ascending: false })

      if (error) {
        console.error('Failed to fetch hikes:', error)
      } else if (data) {
        setHikes(data as Hike[])
      }
      setIsLoading(false)
    }

    fetchHikes()
  }, [clubId])

  return { hikes, isLoading }
}
