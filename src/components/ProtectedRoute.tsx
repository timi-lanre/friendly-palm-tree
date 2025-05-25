'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // Authenticated but need admin access
      if (requireAdmin && !isAdmin) {
        // If user is not admin, redirect to dashboard
        router.push('/dashboard')
        return
      }
    }
  }, [user, profile, loading, isAdmin, requireAdmin, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render children until auth is confirmed
  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}