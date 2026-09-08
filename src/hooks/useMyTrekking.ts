import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface Activity {
  id: number
  hikeId: number
  title: string
  mountainName: string
  hikeDate: string
  description: string
  earnedBadge?: {
    name: string
    grantedBy: string
  }
}

export interface BadgeItem {
  id: number
  name: string
  icon_name: string
  isLocked: boolean
  earnedAt?: string
  grantedBy?: string
  mountainName?: string
}

export interface MyEpisode {
  id: number
  title: string
  content: string
  createdAt: string
  photoUrl: string | null
  hikeName: string
}

export const useMyTrekking = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [episodes, setEpisodes] = useState<MyEpisode[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    if (!userId) return
    setIsLoading(true)
      try {
        // 1. Fetch Completed Activities (hike_members join hikes)
        const { data: hikeMembers } = await supabase
          .from('hike_members')
          .select(`
            hike_id,
            hikes (
              id, title, mountain_name, hike_date, description, club_id
            )
          `)
          .eq('user_id', userId)
          .in('status', ['approved', 'completed'])
        
        // 2. Fetch User Badges
        const { data: userBadgesData } = await supabase
          .from('user_badges')
          .select(`
            id, badge_id, hike_id, earned_at,
            badges ( id, name, icon_name, club_id ),
            granter:users!user_badges_granted_by_fkey ( nickname ),
            hikes ( mountain_name )
          `)
          .eq('user_id', userId)

        // Map activities
        const mappedActivities: Activity[] = (hikeMembers || []).map((hm: any) => {
          const hike = hm.hikes
          // Find if a badge was earned during this hike
          const earnedBadgeData = (userBadgesData || []).find((ub: any) => ub.hike_id === hike.id)
          
          return {
            id: hike.id,
            hikeId: hike.id,
            title: hike.title,
            mountainName: hike.mountain_name,
            hikeDate: hike.hike_date,
            description: hike.description || '',
            earnedBadge: earnedBadgeData ? {
              name: earnedBadgeData.badges.name,
              grantedBy: earnedBadgeData.granter?.nickname
            } : undefined
          }
        }).sort((a, b) => new Date(b.hikeDate).getTime() - new Date(a.hikeDate).getTime())

        setActivities(mappedActivities)

        // 3. Fetch all possible badges from clubs the user is in
        // Get user's clubs
        const { data: clubMembers } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', userId)
          .eq('status', 'approved')
        
        let mappedBadges: BadgeItem[] = []
        const clubIds = (clubMembers || []).map((cm: any) => cm.club_id)
        
        let badgeQuery = supabase.from('badges').select('*')
        if (clubIds.length > 0) {
          badgeQuery = badgeQuery.or(`club_id.is.null,club_id.in.(${clubIds.join(',')})`)
        } else {
          badgeQuery = badgeQuery.is('club_id', null)
        }
        
        const { data: allBadges } = await badgeQuery

        if (allBadges) {
          mappedBadges = allBadges.map((badge: any) => {
            const earned = (userBadgesData || []).find((ub: any) => ub.badge_id === badge.id)
            return {
              id: badge.id,
              name: badge.name,
              icon_name: badge.icon_name,
              isLocked: !earned,
              earnedAt: earned ? earned.earned_at : undefined,
              grantedBy: earned ? earned.granter?.nickname : undefined,
              mountainName: earned && earned.hikes ? earned.hikes.mountain_name : undefined
            }
          })
        }
        setBadges(mappedBadges)

        // 4. Fetch User's Written Episodes
        const { data: episodesData } = await supabase
          .from('episodes')
          .select(`
            id, title, content, created_at, photo_urls,
            hikes ( title )
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })

        const mappedEpisodes: MyEpisode[] = (episodesData || []).map((ep: any) => ({
          id: ep.id,
          title: ep.title,
          content: ep.content,
          createdAt: ep.created_at,
          photoUrl: ep.photo_urls && ep.photo_urls.length > 0 ? ep.photo_urls[0] : null,
          hikeName: ep.hikes?.title || ''
        }))
        setEpisodes(mappedEpisodes)

      } catch (error) {
        console.error('Error fetching My Trekking data', error)
      } finally {
        setIsLoading(false)
      }
  }

  return { activities, badges, episodes, isLoading, refetch: fetchData }
}
