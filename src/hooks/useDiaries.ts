import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Episode {
  id: number
  hike_id: number
  author_id: string
  title: string
  content: string
  photo_urls: string[] | null
  is_published: boolean
  created_at: string
}

export function useDiaries(clubId: number | undefined) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!clubId) {
      setEpisodes([])
      setIsLoading(false)
      return
    }

    const fetchEpisodes = async () => {
      setIsLoading(true)
      
      // club_id에 해당하는 hikes의 episodes를 가져옵니다. (Supabase RPC나 뷰가 좋지만 일단 Client join)
      // hikes 테이블과 episodes 테이블 조인
      const { data, error } = await supabase
        .from('hikes')
        .select(`
          id,
          episodes (
            id, hike_id, author_id, title, content, photo_urls, is_published, created_at
          )
        `)
        .eq('club_id', clubId)

      if (error) {
        console.error('Failed to fetch episodes:', error)
      } else    if (data) {
      const episodesMap = new Map<number, any>()
      const allEpisodes: Episode[] = []
      
      data.forEach((hike: any) => {
        const episodes = hike.episodes || []
        if (Array.isArray(episodes)) {
           allEpisodes.push(...episodes as Episode[])
        } else {
           allEpisodes.push(episodes as Episode)
        }
      })  
        // 최신순 정렬
        allEpisodes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setEpisodes(allEpisodes)
      }
      setIsLoading(false)
    }

    fetchEpisodes()
  }, [clubId])

  return { episodes, isLoading }
}
