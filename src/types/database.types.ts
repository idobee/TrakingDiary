export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string
          avatar_url: string | null
          provider: 'kakao' | 'google' | 'naver' | 'oauth'
          provider_id: string | null
          character_type: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nickname: string
          avatar_url?: string | null
          provider: 'kakao' | 'google' | 'naver' | 'oauth'
          provider_id?: string | null
          character_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string
          avatar_url?: string | null
          provider?: 'kakao' | 'google' | 'naver' | 'oauth'
          provider_id?: string | null
          character_type?: string
          created_at?: string
        }
      }
      clubs: {
        Row: {
          id: number
          owner_id: string
          name: string
          category: 'hiking' | 'running' | 'cycling' | 'tracking' | 'general'
          description: string | null
          logo_url: string | null
          google_drive_folder_id: string | null
          google_drive_credentials_json: string | null
          gemini_api_key: string | null
          created_at: string
        }
        Insert: {
          id?: number
          owner_id: string
          name: string
          category: 'hiking' | 'running' | 'cycling' | 'tracking' | 'general'
          description?: string | null
          logo_url?: string | null
          google_drive_folder_id?: string | null
          google_drive_credentials_json?: string | null
          gemini_api_key?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          owner_id?: string
          name?: string
          category?: 'hiking' | 'running' | 'cycling' | 'tracking' | 'general'
          description?: string | null
          logo_url?: string | null
          google_drive_folder_id?: string | null
          google_drive_credentials_json?: string | null
          gemini_api_key?: string | null
          created_at?: string
        }
      }
      club_members: {
        Row: {
          club_id: number
          user_id: string
          role: 'owner' | 'admin' | 'member'
          status: 'pending' | 'approved' | 'rejected'
          applied_at: string
          approved_at: string | null
        }
        Insert: {
          club_id: number
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          applied_at?: string
          approved_at?: string | null
        }
        Update: {
          club_id?: number
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          applied_at?: string
          approved_at?: string | null
        }
      }
      hikes: {
        Row: {
          id: number
          club_id: number | null
          organizer_id: string
          title: string
          mountain_name: string
          hike_date: string
          difficulty: 'easy' | 'medium' | 'hard' | 'expert' | null
          status: 'recruiting' | 'completed' | 'cancelled'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          club_id?: number | null
          organizer_id: string
          title: string
          mountain_name: string
          hike_date: string
          difficulty?: 'easy' | 'medium' | 'hard' | 'expert' | null
          status?: 'recruiting' | 'completed' | 'cancelled'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          club_id?: number | null
          organizer_id?: string
          title?: string
          mountain_name?: string
          hike_date?: string
          difficulty?: 'easy' | 'medium' | 'hard' | 'expert' | null
          status?: 'recruiting' | 'completed' | 'cancelled'
          description?: string | null
          created_at?: string
        }
      }
      hike_members: {
        Row: {
          hike_id: number
          user_id: string
          role: 'organizer' | 'member'
          status: 'applied' | 'approved' | 'rejected' | 'completed'
          joined_at: string
          completed_at: string | null
        }
        Insert: {
          hike_id: number
          user_id: string
          role?: 'organizer' | 'member'
          status?: 'applied' | 'approved' | 'rejected' | 'completed'
          joined_at?: string
          completed_at?: string | null
        }
        Update: {
          hike_id?: number
          user_id?: string
          role?: 'organizer' | 'member'
          status?: 'applied' | 'approved' | 'rejected' | 'completed'
          joined_at?: string
          completed_at?: string | null
        }
      }
      episodes: {
        Row: {
          id: number
          hike_id: number
          author_id: string
          title: string
          content: string
          photo_urls: string[] | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: number
          hike_id: number
          author_id: string
          title: string
          content: string
          photo_urls?: string[] | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          hike_id?: number
          author_id?: string
          title?: string
          content?: string
          photo_urls?: string[] | null
          is_published?: boolean
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: number
          hike_id: number
          episode_id: number | null
          uploader_id: string
          google_drive_file_id: string
          google_drive_web_link: string
          thumbnail_url: string | null
          is_bside: boolean
          created_at: string
        }
        Insert: {
          id?: number
          hike_id: number
          episode_id?: number | null
          uploader_id: string
          google_drive_file_id: string
          google_drive_web_link: string
          thumbnail_url?: string | null
          is_bside?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          hike_id?: number
          episode_id?: number | null
          uploader_id?: string
          google_drive_file_id?: string
          google_drive_web_link?: string
          thumbnail_url?: string | null
          is_bside?: boolean
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: number
          club_id: number | null
          name: string
          icon_name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          club_id?: number | null
          name: string
          icon_name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          club_id?: number | null
          name?: string
          icon_name?: string
          description?: string | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: number
          user_id: string
          badge_id: number
          hike_id: number | null
          granted_by: string | null
          earned_at: string
        }
        Insert: {
          id?: number
          user_id: string
          badge_id: number
          hike_id?: number | null
          granted_by?: string | null
          earned_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          badge_id?: number
          hike_id?: number | null
          granted_by?: string | null
          earned_at?: string
        }
      }
    }
  }
}
