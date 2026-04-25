'use client'

import { ChevronDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/app/(auth)/actions'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function HeaderBar({ user }: { user: User }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (
    user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') ??
    user.email?.[0] ??
    'U'
  ).toUpperCase()

  return (
    <header className="pt-[env(safe-area-inset-top)] hidden lg:flex items-center justify-end h-20 px-8 border-b border-[#ebd7b9]">
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 bg-white/50 border border-[#eaddc8] rounded-full py-1.5 pl-1.5 pr-4 hover:bg-white/70 transition-colors min-h-[44px]"
        >
          <Avatar className="size-9 bg-[#ffe082]">
            <AvatarFallback className="bg-[#ffe082] text-[#524439] text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="size-4 text-[#786b62]" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-[#ebd7b9] shadow-lg py-2 min-w-[160px]">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-[14px] text-[#786b62] hover:bg-[#fff8e1] transition-colors min-h-[44px]"
                  style={{ fontFamily: 'var(--font-nunito)' }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
