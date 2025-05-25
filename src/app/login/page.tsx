'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const { signIn, user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user && mounted) {
      if (isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, isAdmin, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials') ||
            error.message.includes('Email not confirmed')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not found') || 
                   error.message.includes('User not found')) {
          setError('No account found with this email address.')
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.')
        } else if (error.message.includes('Network') || 
                   error.message.includes('network')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          // Fallback to original error message
          setError(error.message || 'Sign in failed. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleHome = () => {
    router.push('/')
  }

  const handleAbout = () => {
    router.push('/about')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#E5D3BC]">
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          background-color: #E5D3BC !important;
          overscroll-behavior: none !important;
        }
        
        /* Fix input text colors */
        input[type="email"], 
        input[type="password"],
        input[type="text"] {
          color: #0f172a !important; /* slate-900 */
        }
        
        input[type="email"]::placeholder,
        input[type="password"]::placeholder,
        input[type="text"]::placeholder {
          color: #64748b !important; /* slate-500 */
        }
      `}</style>

      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-6">
        <div className="flex items-center">
          <Image
            src="/logo.png" 
            alt="Advisor Connect"
            width={268}
            height={100}
            className="object-contain cursor-pointer h-auto"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            priority
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleHome}
            className="text-slate-800 font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-0.5"
          >
            Home
          </button>
          <button
            onClick={handleAbout}
            className="text-slate-800 font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-0.5"
          >
            About
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Sign in to access your advisor network
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-xs sm:text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E5D3BC]/50 focus:border-[#E5D3BC] transition-all duration-200 bg-white/50 text-sm sm:text-base text-slate-900 placeholder-slate-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E5D3BC]/50 focus:border-[#E5D3BC] transition-all duration-200 bg-white/50 text-sm sm:text-base text-slate-900 placeholder-slate-500"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E5D3BC] hover:bg-[#E5D3BC]/80 text-slate-900 font-semibold py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-slate-900 mr-2"></div>
                    <span className="text-xs sm:text-base">
                      Signing In...
                    </span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-slate-700/80 text-xs sm:text-sm">
              Connecting financial professionals since 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}