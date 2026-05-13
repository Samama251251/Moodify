'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { ChevronDown, LogOut, Bell, Flame, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/app/(auth)/actions'
import type { User } from '@supabase/supabase-js'

interface HeaderBarProps {
  user: User
  fullName: string
  streak?: number
}

function SignOutBtn({ className, iconClass, label }: { className: string; iconClass: string; label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className} aria-label="Sign out">
      {pending ? (
        <Loader2 className={`${iconClass} animate-spin`} />
      ) : (
        <LogOut className={iconClass} />
      )}
      {label && !pending && label}
      {label && pending && 'Signing out…'}
    </button>
  )
}

export function HeaderBar({ user, fullName, streak = 0 }: HeaderBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (
    user.user_metadata?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('') ??
    user.email?.[0] ??
    'U'
  ).toUpperCase().slice(0, 2)

  return (
    <header className="
      flex items-center justify-between
      pt-[env(safe-area-inset-top)]
      h-14 lg:h-16
      px-4 lg:px-8
      bg-[#fff9e9] lg:bg-transparent
      border-b border-[#f0e4c8] lg:border-[#ecddc4]
      sticky top-0 z-30 backdrop-blur-[6px]
    ">
      {/* Mobile brand — hidden on desktop where sidebar has it */}
      <span className="text-[20px] font-bold text-[#7d5700] tracking-[-0.8px] lg:hidden">
        Moodify
      </span>

      {/* Desktop left — empty, sidebar holds brand */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak pill — only show if streak > 0 */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-[6px] shadow-[0px_4px_12px_rgba(125,87,0,0.08)] px-3 py-1.5 rounded-full">
            <Flame className="size-4 text-[#e5a623]" />
            <span className="text-[13px] font-bold text-[#7d5700] whitespace-nowrap">
              {streak}-day streak
            </span>
          </div>
        )}

        {/* Notifications — desktop only */}
        <button className="hidden lg:flex items-center justify-center size-10 rounded-full hover:bg-[#f9f3e3] transition-colors relative">
          <Bell className="size-5 text-[#7d5700]" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#ba1a1a]" />
        </button>

        {/* Avatar + dropdown — desktop */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-white/60 border border-[#ecddc4] rounded-full py-1.5 pl-1.5 pr-3 hover:bg-white/80 transition-colors min-h-[44px]"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-[#f9f3e3] text-[#7d5700] text-[12px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-semibold text-[#504534] max-w-[80px] truncate">
              {fullName.split(' ')[0]}
            </span>
            <ChevronDown className="size-3.5 text-[#827562]" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#ecddc4] shadow-[0px_8px_24px_rgba(125,87,0,0.12)] py-1.5 min-w-[160px]">
                <form action={logout}>
                  <SignOutBtn
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-[#504534] hover:bg-[#fff9e9] transition-colors min-h-[44px] rounded-xl mx-0 disabled:opacity-60"
                    iconClass="size-4 text-[#827562]"
                    label="Sign Out"
                  />
                </form>
              </div>
            </>
          )}
        </div>

        {/* Sign-out icon — mobile only */}
        <form action={logout} className="lg:hidden">
          <SignOutBtn
            className="flex items-center justify-center size-10 rounded-full hover:bg-[#f9f3e3] transition-colors min-h-[44px] min-w-[44px] disabled:opacity-60"
            iconClass="size-5 text-[#7d5700]"
          />
        </form>
      </div>
    </header>
  )
}
