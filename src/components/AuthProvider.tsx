'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  // Get user profile data
  const getProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user ID:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      
      console.log('Profile fetched successfully:', data)
      return data as Profile
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  // Enhanced sign in function with better error handling
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalize email
        password,
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        
        // Handle specific Supabase error codes and messages
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials')) {
          return { error: { message: 'Invalid email or password. Please check your credentials.' } }
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Please check your email and click the confirmation link before signing in.' } }
        } else if (error.message.includes('Too many requests') || 
                   error.message.includes('rate limit')) {
          return { error: { message: 'Too many login attempts. Please wait a few minutes before trying again.' } }
        } else if (error.message.includes('User not found') || 
                   error.message.includes('Email not found')) {
          return { error: { message: 'No account found with this email address.' } }
        } else if (error.message.includes('signup_not_allowed')) {
          return { error: { message: 'Account registration is currently disabled.' } }
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address.' } }
        } else {
          // Return the original error message as fallback
          return { error: { message: error.message || 'Sign in failed. Please try again.' } }
        }
      }

      if (!data.user) {
        console.error('No user data returned from sign in')
        return { error: { message: 'Sign in failed. Please try again.' } }
      }

      console.log('Sign in successful for user:', data.user.id)
      return { error: null }
      
    } catch (error: any) {
      console.error('Unexpected sign in error:', error)
      
      // Handle network and other unexpected errors
      if (error.message && error.message.includes('NetworkError')) {
        return { error: { message: 'Network error. Please check your connection and try again.' } }
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { error: { message: 'Connection error. Please check your internet connection.' } }
      } else {
        return { error: { message: 'An unexpected error occurred. Please try again.' } }
      }
    }
  }

  // Enhanced sign up function with better error handling
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Attempting to sign up user:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), // Normalize email
        password,
        options: {
          data: {
            full_name: fullName || email,
          }
        }
      })
      
      if (error) {
        console.error('Supabase sign up error:', error)
        
        // Handle specific sign up errors
        if (error.message.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } }
        } else if (error.message.includes('Password should be at least')) {
          return { error: { message: 'Password must be at least 6 characters long.' } }
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address.' } }
        } else if (error.message.includes('signup_not_allowed')) {
          return { error: { message: 'Account registration is currently disabled.' } }
        } else {
          return { error: { message: error.message || 'Sign up failed. Please try again.' } }
        }
      }
      
      console.log('Sign up successful for user:', data.user?.id)
      return { error: null }
      
    } catch (error: any) {
      console.error('Unexpected sign up error:', error)
      return { error: { message: 'An unexpected error occurred during sign up. Please try again.' } }
    }
  }

  // Sign out function with error handling
  const signOut = async () => {
    try {
      console.log('Signing out user')
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      console.log('Sign out successful')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Still clear local state even if sign out fails
      setUser(null)
      setProfile(null)
    }
  }

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (session?.user) {
        setUser(session.user)
        const userProfile = await getProfile(session.user.id)
        setProfile(userProfile)
        
        if (!userProfile) {
          console.warn('User authenticated but no profile found. Profile may need to be created.')
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('Initial session found for user:', session.user.id)
          setUser(session.user)
          const userProfile = await getProfile(session.user.id)
          setProfile(userProfile)
          
          if (!userProfile) {
            console.warn('User session found but no profile exists. Profile may need to be created.')
          }
        } else {
          console.log('No initial session found')
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: profile?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}