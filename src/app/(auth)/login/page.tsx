'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { login, loginWithGoogle } from '../actions'
import { mp } from '@/lib/mixpanel'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      mp.track('login_failed', { method: 'email', error: result.error })
      setLoading(false)
    } else {
      mp.track('login_completed', { method: 'email' })
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    mp.track('login_started', { method: 'google' })
    const result = await loginWithGoogle()
    if (result?.error) {
      setError(result.error)
      mp.track('login_failed', { method: 'google', error: result.error })
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-[0px_4px_30px_rgba(236,216,201,0.6)] rounded-2xl overflow-hidden">
      <CardContent className="p-8 sm:p-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <Image
            src="/images/moodify-logo.png"
            alt="Moodify"
            width={40}
            height={37}
          />
          <span
            className="text-[28px] text-[#6d4c41] font-bold"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Moodify
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h2
            className="text-[28px] sm:text-[34px] leading-[32px] text-[#5d4037] font-bold"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Welcome Back
          </h2>
          <span className="text-[28px] sm:text-[32px]">👋</span>
        </div>
        <p
          className="text-[15px] sm:text-[16px] leading-[19.5px] text-[#786b62] font-bold mb-8"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Log in to continue your journey.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-[16px] text-[#8d6e63] font-bold"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              className="h-[44px] text-base bg-[rgba(248,222,178,0.7)] border-2 border-[rgba(215,173,114,0.3)] rounded-lg focus:border-[#d7ad72] focus:ring-[#d7ad72] placeholder:text-[#c4a882]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-[16px] text-[#8d6e63] font-bold"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="h-[44px] text-base bg-[rgba(248,222,178,0.7)] border-2 border-[rgba(215,173,114,0.3)] rounded-lg focus:border-[#d7ad72] focus:ring-[#d7ad72] pr-12 placeholder:text-[#c4a882]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89c93] hover:text-[#786b62] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" />
                ) : (
                  <Eye className="size-[18px]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] rounded-lg bg-gradient-to-b from-[#ffd36c] to-[#f7b432] text-white text-[16px] font-extrabold tracking-[0.4px] shadow-[0px_4px_6px_rgba(255,179,0,0.4)] hover:shadow-[0px_6px_12px_rgba(255,179,0,0.5)] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 min-h-[44px]"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center justify-center mt-5">
          <button
            type="button"
            className="text-[16px] text-[#8d6e63] font-bold hover:text-[#5d4037] transition-colors min-h-[44px]"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Forgot Password?
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[2px] bg-[#d7ad72] opacity-30" />
          <span
            className="text-[11px] text-[#786b62] font-bold"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            OR
          </span>
          <div className="flex-1 h-[2px] bg-[#d7ad72] opacity-30" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mx-auto flex items-center justify-center gap-3 h-[46px] px-6 bg-white border border-[#e0e0e0] rounded-lg shadow-[0px_4px_10px_#ecd8c9] hover:shadow-[0px_6px_14px_#ecd8c9] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 min-h-[44px]"
        >
          <Image
            src="/images/google-logo.png"
            alt="Google"
            width={23}
            height={23}
          />
          <span
            className="text-[14px] text-[#524439] font-bold"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Continue with Google
          </span>
        </button>

        <p
          className="text-center mt-6 text-[12px] tracking-[0.6px] font-extrabold text-[#786b62]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[13px] text-[#e19a3d] hover:text-[#d18a2d] tracking-normal transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
