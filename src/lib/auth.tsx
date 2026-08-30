'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'

export type ExtendedUser = User & {
  nickname?: string
  avatar_url?: string
}

interface AuthContextValue {
  user: ExtendedUser | null
  session: Session | null
  isLoading: boolean
  signInWithProvider: (provider: 'kakao' | 'google') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 1. Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        await fetchUserProfile(newSession.user)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('users')
        .select('nickname, avatar_url')
        .eq('id', authUser.id)
        .single()
        
      const profile = data as { nickname: string; avatar_url: string } | null

      setUser({
        ...authUser,
        nickname: profile?.nickname || authUser.user_metadata?.name || authUser.email?.split('@')[0],
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      })
    } catch (error) {
      console.error('Failed to fetch user profile', error)
      setUser(authUser)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'kakao' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({ user, session, isLoading, signInWithProvider, signOut }),
    [user, session, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
