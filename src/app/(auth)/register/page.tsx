'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { register, loginWithGoogle } from '../actions'
import { mp } from '@/lib/mixpanel'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      mp.track('sign_up_failed', { method: 'email', error: result.error })
      setLoading(false)
    } else {
      mp.track('sign_up_completed', { method: 'email' })
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    mp.track('sign_up_started', { method: 'google' })
    const result = await loginWithGoogle()
    if (result?.error) {
      setError(result.error)
      mp.track('sign_up_failed', { method: 'google', error: result.error })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12 lg:py-28">
      {/* Outer card container */}
      <div className="w-full max-w-[1152px] bg-[#f9f3e3] rounded-3xl shadow-[0px_20px_60px_rgba(125,87,0,0.08)] overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:h-[800px]">
        {/* Left Panel: Illustration */}
        <div className="relative flex-1 bg-[#fff9e9] p-8 lg:p-16 flex flex-col items-center justify-center overflow-hidden">
          {/* Illustration circle */}
          <div className="relative w-full max-w-[420px] aspect-square rounded-full bg-[rgba(232,226,211,0.3)] backdrop-blur-[6px] shadow-[0px_20px_40px_rgba(125,87,0,0.06)] overflow-hidden">
            <Image
              src="/images/meditation-illustration.png"
              alt="Meditation illustration"
              fill
              className="object-cover mix-blend-multiply opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(249,243,227,0.8)] to-transparent mix-blend-screen" />
          </div>

          {/* Tagline below illustration */}
          <div className="mt-8 text-center lg:text-left lg:self-start">
            <p className="text-[16px] font-semibold leading-[17.6px] tracking-[-0.32px]">
              <span className="text-[#e5a623]">Track your mood.</span>
              <br />
              <span className="text-[#7d5700]">Understand yourself.</span>
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-[448px] bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(213,196,174,0.15)] rounded-[32px] shadow-[0px_20px_20px_rgba(125,87,0,0.06)] p-8 lg:p-12 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2 items-center">
              <h1 className="text-[36px] font-semibold text-[#1d1c12] tracking-[-0.9px] leading-[40px] text-center">
                Create Account
              </h1>
              <p className="text-[16px] text-[#504534] leading-[24px] text-center">
                Join us to start tracking your mood.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Form */}
            <form action={handleSubmit} className="flex flex-col gap-6 pt-4">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="text-[12px] text-[#504534] tracking-[1.2px] uppercase leading-[16px]">
                  FULL NAME
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827562]">
                    <User size={16} />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Samama"
                    className="w-full h-[52px] bg-[#f9f3e3] rounded-full pl-12 pr-4 text-base text-[#504534] placeholder:text-[#827562] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[12px] text-[#504534] tracking-[1.2px] uppercase leading-[16px]">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827562]">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    placeholder="samama@example.com"
                    className="w-full h-[52px] bg-[#f9f3e3] rounded-full pl-12 pr-4 text-base text-[#504534] placeholder:text-[#827562] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-[12px] text-[#504534] tracking-[1.2px] uppercase leading-[16px]">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827562]">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full h-[52px] bg-[#f9f3e3] rounded-full pl-12 pr-14 text-base text-[#504534] placeholder:text-[#827562] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#827562] hover:text-[#504534] min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] rounded-full bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white text-[18px] font-semibold leading-[28px] shadow-[0px_10px_20px_rgba(229,166,35,0.2)] hover:shadow-[0px_14px_28px_rgba(229,166,35,0.3)] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center min-h-[44px]"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex-1 h-px bg-[rgba(213,196,174,0.3)]" />
              <span className="text-[12px] text-[#827562] tracking-[1.2px] uppercase leading-[16px]">
                OR
              </span>
              <div className="flex-1 h-px bg-[rgba(213,196,174,0.3)]" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-[56px] bg-[#e8e2d3] rounded-full flex items-center justify-center gap-3 hover:bg-[#dfd8c7] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 min-h-[44px]"
            >
              <GoogleIcon />
              <span className="text-[16px] font-medium text-[#1d1c12] leading-[24px]">
                Continue with Google
              </span>
            </button>

            {/* Login Link */}
            <p className="text-center text-[16px] text-[#504534] leading-[24px] pt-2">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#7d5700] hover:underline transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
