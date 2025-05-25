'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAccountInfo, setShowAccountInfo] = useState(false)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleMouseEnter = useCallback(() => setIsOpen(true), [])
  const handleMouseLeave = useCallback(() => setIsOpen(false), [])

  const handleAccountInfo = () => {
    setShowAccountInfo(true)
    setIsOpen(false)
  }

  const handleChangePassword = () => {
    alert('Change Password functionality - Coming soon!')
    setIsOpen(false)
  }

  const handleFavorites = () => {
    alert('Favorites functionality - Coming soon!')
    setIsOpen(false)
  }

  const handleReports = () => {
    alert('Reports functionality - Coming soon!')
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Error signing out')
    }
    setIsOpen(false)
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className="text-slate-800 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          Account
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
            <button
              onClick={handleAccountInfo}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Account Info
            </button>
            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={handleFavorites}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Favorites
            </button>
            <button
              onClick={handleReports}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Report List
            </button>
            <hr className="my-2 border-slate-200" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Account Info Modal */}
      {showAccountInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Name</h3>
                <p className="text-slate-600">{profile?.first_name} {profile?.last_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                <p className="text-slate-600">{user?.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Role</h3>
                <p className="text-slate-600 capitalize">{profile?.role}</p>
              </div>
              
              <button
                onClick={() => alert('Change password functionality - Coming soon!')}
                className="w-full px-4 py-2 bg-[#E5D3BC] text-slate-900 rounded-lg hover:bg-[#E5D3BC]/80 transition-colors"
              >
                Change Password
              </button>
            </div>
            
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setShowAccountInfo(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}